using UnityEditor;
using UnityEngine;

[CustomEditor(typeof(LearningTaskBridgeTester))]
public class LearningTaskBridgeTesterEditor : Editor
{
    public override void OnInspectorGUI()
    {
        DrawDefaultInspector();

        EditorGUILayout.Space();
        EditorGUILayout.LabelField("Manual Bridge Tests", EditorStyles.boldLabel);

        LearningTaskBridgeTester tester = (LearningTaskBridgeTester)target;

        if (GUILayout.Button("Test Start Task"))
        {
            tester.TestStartTask();
        }

        if (GUILayout.Button("Test Receive Success Result"))
        {
            tester.TestReceiveSuccessResult();
        }

        if (GUILayout.Button("Test Receive Failed Result"))
        {
            tester.TestReceiveFailedResult();
        }
    }
}
