import { useCallback, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppNavigation } from './components/AppNavigation';
import { TaskOverlay } from './components/TaskOverlay';
import type { TaskResult } from './models/task';
import { DemoPage } from './pages/DemoPage';
import { EditorLibraryPage } from './pages/EditorLibraryPage';
import { EditorPage } from './pages/EditorPage';
import { RuntimePage } from './pages/RuntimePage';
import { TaskPlayerPage } from './pages/TaskPlayerPage';
import { loadRemoteTasks } from './services/taskService';
import {
  createTaskResultMessage,
  getUnityInstanceReadyEventName,
  isUnityCommunicationAvailable,
  registerOpenLearningTaskHandler,
  sendTaskResultToUnity,
  type OpenTaskRequest,
  type TaskResultMessage,
  type UnityBridgeSendResult,
} from './services/unityBridge';

function App() {
  const location = useLocation();
  const [bridgeTaskId, setBridgeTaskId] = useState<string | undefined>();
  const [bridgeError, setBridgeError] = useState('');
  const [lastOpenedBridgeTaskId, setLastOpenedBridgeTaskId] = useState('');
  const [lastBridgeResult, setLastBridgeResult] =
    useState<TaskResultMessage | undefined>();
  const [lastUnitySendResult, setLastUnitySendResult] =
    useState<UnityBridgeSendResult | undefined>();
  const [, setTaskCatalogVersion] = useState(0);
  const [unityCommunicationAvailable, setUnityCommunicationAvailable] =
    useState(isUnityCommunicationAvailable());
  const rootTaskId =
    new URLSearchParams(location.search).get('taskId')?.trim() ?? '';
  const isDemoRoute = location.pathname === '/demo';
  const isRootRuntimeRoute = location.pathname === '/' && Boolean(rootTaskId);
  const isRuntimeRoute = location.pathname === '/runtime' || isRootRuntimeRoute;

  const handleOpenLearningTask = useCallback((request: OpenTaskRequest) => {
    const taskId = request.taskId.trim();

    if (!taskId) {
      setBridgeTaskId(undefined);
      setBridgeError('Bridge error: taskId is required.');
      return;
    }

    setBridgeError('');
    setBridgeTaskId(taskId);
    setLastOpenedBridgeTaskId(taskId);
  }, []);

  useEffect(() => {
    return registerOpenLearningTaskHandler(handleOpenLearningTask);
  }, [handleOpenLearningTask]);

  useEffect(() => {
    let isCurrent = true;

    loadRemoteTasks().then(() => {
      if (isCurrent) {
        setTaskCatalogVersion((version) => version + 1);
      }
    });

    return () => {
      isCurrent = false;
    };
  }, []);

  useEffect(() => {
    function updateUnityCommunicationStatus() {
      setUnityCommunicationAvailable(isUnityCommunicationAvailable());
    }

    const intervalId = window.setInterval(updateUnityCommunicationStatus, 1000);

    window.addEventListener(
      getUnityInstanceReadyEventName(),
      updateUnityCommunicationStatus,
    );
    updateUnityCommunicationStatus();

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener(
        getUnityInstanceReadyEventName(),
        updateUnityCommunicationStatus,
      );
    };
  }, []);

  function handleCloseBridgeOverlay() {
    setBridgeTaskId(undefined);
  }

  const handleRuntimeOpenTask = useCallback(
    (taskId: string) => {
      handleOpenLearningTask({ taskId });
    },
    [handleOpenLearningTask],
  );

  function handleBridgeTaskCompleted(result: TaskResult) {
    const resultMessage = createTaskResultMessage(result);
    const unitySendResult = sendTaskResultToUnity(resultMessage);

    setLastBridgeResult(resultMessage);
    setLastUnitySendResult(unitySendResult);
    setUnityCommunicationAvailable(unitySendResult.unityAvailable);
  }

  const runtimePage = (
    <RuntimePage
      activeTaskId={bridgeTaskId}
      bridgeError={bridgeError}
      onOpenTask={handleRuntimeOpenTask}
      onCloseTask={handleCloseBridgeOverlay}
      onTaskCompleted={handleBridgeTaskCompleted}
    />
  );

  return (
    <div className="app-shell">
      {!isRuntimeRoute && <AppNavigation />}
      <main className={isRuntimeRoute ? 'runtime-content' : 'page-content'}>
        <Routes>
          <Route
            path="/"
            element={
              isRootRuntimeRoute ? runtimePage : <Navigate to="/editor" replace />
            }
          />
          <Route path="/editor" element={<EditorPage />} />
          <Route path="/editor/:taskId/edit" element={<EditorPage />} />
          <Route path="/editor-library" element={<EditorLibraryPage />} />
          <Route path="/play/:taskId" element={<TaskPlayerPage />} />
          <Route
            path="/runtime"
            element={runtimePage}
          />
          <Route
            path="/demo"
            element={
              <DemoPage
                activeOverlayTaskId={bridgeTaskId}
                bridgeError={bridgeError}
                onCloseOverlay={handleCloseBridgeOverlay}
                onTaskCompleted={handleBridgeTaskCompleted}
                lastOpenedTaskId={lastOpenedBridgeTaskId}
                lastBridgeResult={lastBridgeResult}
                lastUnitySendResult={lastUnitySendResult}
                unityCommunicationAvailable={unityCommunicationAvailable}
              />
            }
          />
        </Routes>
      </main>
      {bridgeTaskId && !isDemoRoute && !isRuntimeRoute && (
        <TaskOverlay
          taskId={bridgeTaskId}
          onClose={handleCloseBridgeOverlay}
          onTaskCompleted={handleBridgeTaskCompleted}
        />
      )}
    </div>
  );
}

export default App;
