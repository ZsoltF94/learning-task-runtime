import { useRef } from 'react';
import { TaskOverlay } from '../components/TaskOverlay';
import type { TaskResult } from '../models/task';
import type {
  TaskResultMessage,
  UnityBridgeSendResult,
} from '../services/unityBridge';

interface DemoPageProps {
  activeOverlayTaskId?: string;
  bridgeError: string;
  onCloseOverlay: () => void;
  onTaskCompleted: (result: TaskResult) => void;
  lastOpenedTaskId: string;
  lastBridgeResult?: TaskResultMessage;
  lastUnitySendResult?: UnityBridgeSendResult;
  unityCommunicationAvailable: boolean;
}

export function DemoPage({
  activeOverlayTaskId,
  bridgeError,
  onCloseOverlay,
  onTaskCompleted,
  lastOpenedTaskId,
  lastBridgeResult,
  lastUnitySendResult,
  unityCommunicationAvailable,
}: DemoPageProps) {
  const unityFrameRef = useRef<HTMLIFrameElement>(null);

  function focusUnityFrame() {
    const unityFrame = unityFrameRef.current;

    if (!unityFrame) {
      return;
    }

    unityFrame.focus();

    try {
      unityFrame.contentWindow?.focus();
      unityFrame.contentDocument
        ?.querySelector<HTMLCanvasElement>('#unity-canvas')
        ?.focus();
    } catch {
      // Future cross-origin Unity builds may not allow direct iframe inspection.
    }
  }

  function handleOpenTaskViaBridge() {
    if (!window.openLearningTask) {
      return;
    }

    window.openLearningTask('test_01');
  }

  function handleOpenMissingTaskViaBridge() {
    if (!window.openLearningTask) {
      return;
    }

    window.openLearningTask('missing_task');
  }

  function handleCloseOverlay() {
    onCloseOverlay();
    window.setTimeout(focusUnityFrame, 0);
  }

  function handleTaskCompleted(result: TaskResult) {
    onTaskCompleted(result);
    window.setTimeout(focusUnityFrame, 0);
  }

  return (
    <section className="page-panel">
      <h1>Demo Page</h1>
      <section className="demo-unity-section">
        <div>
          <h2>Unity WebGL Demo</h2>
          <p>
            Place the Unity WebGL build in public/unity-build to load it here.
          </p>
        </div>
        <div className="demo-unity-frame-wrapper">
          <iframe
            ref={unityFrameRef}
            className="demo-unity-frame"
            src="/unity-build/index.html"
            tabIndex={-1}
            title="Unity WebGL Demo"
          />
          {activeOverlayTaskId && (
            <TaskOverlay
              displayMode="frame"
              taskId={activeOverlayTaskId}
              onClose={handleCloseOverlay}
              onTaskCompleted={handleTaskCompleted}
            />
          )}
        </div>
      </section>
      <div className="demo-actions">
        <button
          className="secondary-button"
          type="button"
          onClick={handleOpenTaskViaBridge}
        >
          Open Task via Bridge
        </button>
        <button
          className="secondary-button"
          type="button"
          onClick={handleOpenMissingTaskViaBridge}
        >
          Open Missing Task
        </button>
      </div>
      {bridgeError && <p className="demo-bridge-error">{bridgeError}</p>}
      <section className="demo-bridge-debug">
        <h2>Unity Bridge Debug</h2>
        <dl className="demo-bridge-result">
          <div>
            <dt>Last opened taskId</dt>
            <dd>{lastOpenedTaskId || 'None'}</dd>
          </div>
          <div>
            <dt>Overlay status</dt>
            <dd>{activeOverlayTaskId ? 'Open' : 'Closed'}</dd>
          </div>
          <div>
            <dt>Overlay taskId</dt>
            <dd>{activeOverlayTaskId || 'None'}</dd>
          </div>
          <div>
            <dt>Unity communication</dt>
            <dd>{unityCommunicationAvailable ? 'Available' : 'Not available'}</dd>
          </div>
          <div>
            <dt>Last send status</dt>
            <dd>
              {lastUnitySendResult
                ? lastUnitySendResult.sent
                  ? 'Sent'
                  : 'Prepared'
                : 'None'}
            </dd>
          </div>
        </dl>
        {lastBridgeResult && (
          <div className="demo-bridge-json">
            <h3>Last TaskResult</h3>
            <pre>{JSON.stringify(lastBridgeResult, null, 2)}</pre>
          </div>
        )}
        {lastUnitySendResult && (
          <div className="demo-bridge-json">
            <h3>Last Unity Payload</h3>
            <pre>{lastUnitySendResult.payload}</pre>
          </div>
        )}
      </section>
      {lastBridgeResult && (
        <dl className="demo-bridge-result">
          <div>
            <dt>Task ID</dt>
            <dd>{lastBridgeResult.taskId}</dd>
          </div>
          <div>
            <dt>Success</dt>
            <dd>{String(lastBridgeResult.success)}</dd>
          </div>
          <div>
            <dt>Score</dt>
            <dd>{lastBridgeResult.score}</dd>
          </div>
          <div>
            <dt>Attempts</dt>
            <dd>{lastBridgeResult.attempts}</dd>
          </div>
        </dl>
      )}
    </section>
  );
}
