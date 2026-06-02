using UnityEngine;

/// <summary>
/// Simple test trigger for starting a learning task from gameplay or keyboard input.
/// </summary>
public class LearningTaskTrigger : MonoBehaviour
{
    [SerializeField]
    private LearningTaskBridge learningTaskBridge;

    [SerializeField]
    private string taskId = "test_01";

    [SerializeField]
    private bool triggerWithTKey = true;

    private void Update()
    {
        if (!triggerWithTKey)
        {
            return;
        }

        if (Input.GetKeyDown(KeyCode.T))
        {
            TriggerTask();
        }
    }

    public void TriggerTask()
    {
        if (learningTaskBridge == null)
        {
            Debug.LogWarning("LearningTaskTrigger needs a LearningTaskBridge reference.");
            return;
        }

        learningTaskBridge.StartTask(taskId);
    }
}
