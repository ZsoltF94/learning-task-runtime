using UnityEngine;

/// <summary>
/// Small MVP display that proves Unity received a task result from the WebApp.
/// Attach this to a scene object and assign the LearningTaskBridge reference.
/// </summary>
public class LearningTaskResultDemoDisplay : MonoBehaviour
{
    [SerializeField]
    private LearningTaskBridge learningTaskBridge;

    [SerializeField]
    private Renderer statusRenderer;

    [SerializeField]
    private Color waitingColor = Color.gray;

    [SerializeField]
    private Color solvedColor = Color.green;

    [SerializeField]
    private Color failedColor = Color.red;

    private LearningTaskResult latestResult;
    private string activeTaskId = "";
    private string resultStatus = "Waiting for task result";

    private void OnEnable()
    {
        if (learningTaskBridge == null)
        {
            learningTaskBridge = FindObjectOfType<LearningTaskBridge>();
        }

        if (learningTaskBridge == null)
        {
            Debug.LogWarning("LearningTaskResultDemoDisplay needs a LearningTaskBridge reference.");
            return;
        }

        learningTaskBridge.OnTaskStarted.AddListener(HandleTaskStarted);
        learningTaskBridge.OnTaskCompleted.AddListener(HandleTaskCompleted);
        learningTaskBridge.OnTaskSolved.AddListener(HandleTaskSolved);
        learningTaskBridge.OnTaskFailed.AddListener(HandleTaskFailed);

        SetStatusColor(waitingColor);
    }

    private void OnDisable()
    {
        if (learningTaskBridge == null)
        {
            return;
        }

        learningTaskBridge.OnTaskStarted.RemoveListener(HandleTaskStarted);
        learningTaskBridge.OnTaskCompleted.RemoveListener(HandleTaskCompleted);
        learningTaskBridge.OnTaskSolved.RemoveListener(HandleTaskSolved);
        learningTaskBridge.OnTaskFailed.RemoveListener(HandleTaskFailed);
    }

    private void HandleTaskStarted(string taskId)
    {
        activeTaskId = taskId;
        latestResult = null;
        resultStatus = "Task Open";
        SetStatusColor(waitingColor);
    }

    private void HandleTaskCompleted(LearningTaskResult result)
    {
        latestResult = result;
        activeTaskId = result.taskId;

        Debug.Log(
            "LearningTaskResultDemoDisplay received result. " +
            $"taskId={result.taskId}, success={result.success}, score={result.score}, attempts={result.attempts}"
        );
    }

    private void HandleTaskSolved(LearningTaskResult result)
    {
        latestResult = result;
        resultStatus = "Solved";
        SetStatusColor(solvedColor);
    }

    private void HandleTaskFailed(LearningTaskResult result)
    {
        latestResult = result;
        resultStatus = "Failed";
        SetStatusColor(failedColor);
    }

    private void OnGUI()
    {
        const int panelWidth = 420;
        const int panelHeight = 150;
        const int padding = 20;

        Rect panelRect = new Rect(padding, padding, panelWidth, panelHeight);
        GUI.Box(panelRect, "Learning Task Result");

        GUILayout.BeginArea(new Rect(padding + 16, padding + 32, panelWidth - 32, panelHeight - 48));
        GUILayout.Label($"Status: {resultStatus}");

        if (latestResult == null)
        {
            if (!string.IsNullOrWhiteSpace(activeTaskId))
            {
                GUILayout.Label($"Task ID: {activeTaskId}");
            }

            GUILayout.Label("No result received yet.");
            GUILayout.EndArea();
            return;
        }

        GUILayout.Label($"Task ID: {latestResult.taskId}");
        GUILayout.Label($"Success: {latestResult.success}");
        GUILayout.Label($"Score: {latestResult.score}");
        GUILayout.Label($"Attempts: {latestResult.attempts}");
        GUILayout.EndArea();
    }

    private void SetStatusColor(Color color)
    {
        if (statusRenderer == null)
        {
            return;
        }

        statusRenderer.material.color = color;
    }
}
