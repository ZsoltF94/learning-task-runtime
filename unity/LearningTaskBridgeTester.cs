using UnityEngine;

/// <summary>
/// Editor-friendly tester for manually exercising LearningTaskBridge without WebGL or the WebApp.
/// </summary>
public class LearningTaskBridgeTester : MonoBehaviour
{
    [SerializeField]
    private LearningTaskBridge bridge;

    private const string DemoTaskId = "test_01";

    [ContextMenu("Test Start Task")]
    public void TestStartTask()
    {
        if (!TryGetBridge(out LearningTaskBridge learningTaskBridge))
        {
            return;
        }

        learningTaskBridge.StartTask(DemoTaskId);
    }

    [ContextMenu("Test Receive Success Result")]
    public void TestReceiveSuccessResult()
    {
        if (!TryGetBridge(out LearningTaskBridge learningTaskBridge))
        {
            return;
        }

        learningTaskBridge.ReceiveTaskResult(
            "{\"taskId\":\"test_01\",\"success\":true,\"score\":100,\"attempts\":1}"
        );
    }

    [ContextMenu("Test Receive Failed Result")]
    public void TestReceiveFailedResult()
    {
        if (!TryGetBridge(out LearningTaskBridge learningTaskBridge))
        {
            return;
        }

        learningTaskBridge.ReceiveTaskResult(
            "{\"taskId\":\"test_01\",\"success\":false,\"score\":0,\"attempts\":2}"
        );
    }

    private bool TryGetBridge(out LearningTaskBridge learningTaskBridge)
    {
        learningTaskBridge = bridge;

        if (learningTaskBridge != null)
        {
            return true;
        }

        Debug.LogWarning("LearningTaskBridgeTester needs a LearningTaskBridge reference.");
        return false;
    }
}
