using System;
using System.Runtime.InteropServices;
using UnityEngine;
using UnityEngine.Events;

[Serializable]
public class LearningTaskResult
{
    public string taskId;
    public bool success;
    public int score;
    public int attempts;
}

[Serializable]
public class TaskStartedEvent : UnityEvent<string>
{
}

[Serializable]
public class TaskResultEvent : UnityEvent<LearningTaskResult>
{
}

/// <summary>
/// Central Unity-side bridge for starting WebApp learning tasks and receiving task results.
/// Gameplay systems should subscribe to the events instead of adding gameplay logic here.
/// </summary>
public class LearningTaskBridge : MonoBehaviour
{
    private const string WebGlTargetObjectName = "LearningTaskBridge";

#if UNITY_WEBGL && !UNITY_EDITOR
    [DllImport("__Internal")]
    private static extern void OpenLearningTask(string taskId);
#endif

    [Header("Events")]
    public TaskStartedEvent OnTaskStarted = new TaskStartedEvent();
    public TaskResultEvent OnTaskCompleted = new TaskResultEvent();
    public TaskResultEvent OnTaskSolved = new TaskResultEvent();
    public TaskResultEvent OnTaskFailed = new TaskResultEvent();

    public event Action<string> TaskStarted;
    public event Action<LearningTaskResult> TaskCompleted;
    public event Action<LearningTaskResult> TaskSolved;
    public event Action<LearningTaskResult> TaskFailed;

    private void Awake()
    {
        Application.runInBackground = true;

        if (gameObject.name == WebGlTargetObjectName)
        {
            return;
        }

        Debug.LogWarning(
            $"LearningTaskBridge is attached to GameObject \"{gameObject.name}\". " +
            $"Unity WebGL SendMessage requires this GameObject to be named \"{WebGlTargetObjectName}\"."
        );
    }

    public void StartTask(string taskId)
    {
        if (string.IsNullOrWhiteSpace(taskId))
        {
            Debug.LogWarning("LearningTaskBridge.StartTask was called with an empty taskId.");
            return;
        }

        Debug.Log($"LearningTaskBridge starting task: {taskId}");
        OnTaskStarted.Invoke(taskId);
        TaskStarted?.Invoke(taskId);

        OpenLearningTaskInBrowser(taskId);
    }

    public void ReceiveTaskResult(string resultJson)
    {
        if (string.IsNullOrWhiteSpace(resultJson))
        {
            Debug.LogWarning("LearningTaskBridge.ReceiveTaskResult was called with empty JSON.");
            return;
        }

        LearningTaskResult result;

        try
        {
            result = JsonUtility.FromJson<LearningTaskResult>(resultJson);
        }
        catch (Exception exception)
        {
            Debug.LogError($"LearningTaskBridge failed to parse task result JSON. Error: {exception.Message}");
            return;
        }

        if (result == null || string.IsNullOrWhiteSpace(result.taskId))
        {
            Debug.LogError($"LearningTaskBridge received an invalid task result: {resultJson}");
            return;
        }

        Debug.Log(
            $"LearningTaskBridge received task result. " +
            $"taskId={result.taskId}, success={result.success}, score={result.score}, attempts={result.attempts}"
        );

        if (result.success)
        {
            OnTaskSolved.Invoke(result);
            TaskSolved?.Invoke(result);
        }
        else
        {
            OnTaskFailed.Invoke(result);
            TaskFailed?.Invoke(result);
        }

        OnTaskCompleted.Invoke(result);
        TaskCompleted?.Invoke(result);
    }

    private void OpenLearningTaskInBrowser(string taskId)
    {
#if UNITY_WEBGL && !UNITY_EDITOR
        OpenLearningTask(taskId);
#else
        Debug.Log($"LearningTaskBridge mock start in Editor or non-WebGL build for taskId: {taskId}");
#endif
    }
}
