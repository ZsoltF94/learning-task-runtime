import type { TaskResult } from '../models/task';

export interface OpenTaskRequest {
  taskId: string;
  context?: Record<string, unknown>;
}

export interface TaskResultMessage {
  taskId: string;
  success: boolean;
  score: number;
  attempts: number;
}

export interface UnityBridgeSendResult {
  unityAvailable: boolean;
  sent: boolean;
  payload: string;
  targetObjectName: string;
  targetMethodName: string;
  errorMessage?: string;
}

type OpenLearningTaskHandler = (request: OpenTaskRequest) => void;

interface UnityWebGlInstance {
  SendMessage: (
    targetObjectName: string,
    targetMethodName: string,
    payload: string,
  ) => void;
}

const UNITY_RESULT_TARGET_OBJECT = 'LearningTaskBridge';
const UNITY_RESULT_TARGET_METHOD = 'ReceiveTaskResult';
const UNITY_INSTANCE_READY_EVENT = 'learningTaskUnityInstanceReady';

declare global {
  interface Window {
    openLearningTask?: (taskId: string) => void;
    unityInstance?: UnityWebGlInstance;
  }
}

function getUnityInstance(): UnityWebGlInstance | undefined {
  const currentWindowUnityInstance = getUnityInstanceFromWindow(window);

  if (currentWindowUnityInstance) {
    return currentWindowUnityInstance;
  }

  return getUnityInstanceFromIframe();
}

function getUnityInstanceFromWindow(
  targetWindow: Window,
): UnityWebGlInstance | undefined {
  if (
    targetWindow.unityInstance &&
    typeof targetWindow.unityInstance.SendMessage === 'function'
  ) {
    return targetWindow.unityInstance;
  }

  return undefined;
}

function getUnityInstanceFromIframe(): UnityWebGlInstance | undefined {
  const unityIframes = Array.from(document.querySelectorAll('iframe'));

  for (const unityIframe of unityIframes) {
    try {
      const iframeWindow = unityIframe.contentWindow;

      if (!iframeWindow) {
        continue;
      }

      const unityInstance = getUnityInstanceFromWindow(iframeWindow);

      if (unityInstance) {
        return unityInstance;
      }
    } catch {
      // Cross-origin frames cannot be inspected. Future WebView support should use a separate bridge.
    }
  }

  return undefined;
}

export function isUnityCommunicationAvailable(): boolean {
  return Boolean(getUnityInstance());
}

export function getUnityInstanceReadyEventName(): string {
  return UNITY_INSTANCE_READY_EVENT;
}

export function registerOpenLearningTaskHandler(
  handler: OpenLearningTaskHandler,
): () => void {
  const openLearningTask = (taskId: string) => {
    handler({ taskId });
  };

  window.openLearningTask = openLearningTask;

  return () => {
    if (window.openLearningTask === openLearningTask) {
      window.openLearningTask = undefined;
    }
  };
}

export function createTaskResultMessage(
  result: TaskResult,
): TaskResultMessage {
  return {
    taskId: result.taskId,
    success: result.success,
    score: result.score,
    attempts: result.attempts,
  };
}

export function sendTaskResultToUnity(
  result: TaskResultMessage,
): UnityBridgeSendResult {
  const payload = JSON.stringify(result);
  const unityInstance = getUnityInstance();
  const baseSendResult = {
    payload,
    targetObjectName: UNITY_RESULT_TARGET_OBJECT,
    targetMethodName: UNITY_RESULT_TARGET_METHOD,
  };

  if (!unityInstance) {
    console.info('Unity bridge task result payload prepared:', {
      ...baseSendResult,
      unityAvailable: false,
      result,
    });

    return {
      ...baseSendResult,
      unityAvailable: false,
      sent: false,
    };
  }

  try {
    unityInstance.SendMessage(
      UNITY_RESULT_TARGET_OBJECT,
      UNITY_RESULT_TARGET_METHOD,
      payload,
    );

    console.info('Unity bridge task result sent:', {
      ...baseSendResult,
      unityAvailable: true,
      result,
    });

    return {
      ...baseSendResult,
      unityAvailable: true,
      sent: true,
    };
  } catch {
    const errorMessage = 'Unity bridge failed to send the task result.';
    console.error(errorMessage, {
      ...baseSendResult,
      result,
    });

    return {
      ...baseSendResult,
      unityAvailable: true,
      sent: false,
      errorMessage,
    };
  }
}
