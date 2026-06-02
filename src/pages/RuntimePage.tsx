import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TaskOverlay } from '../components/TaskOverlay';
import type { TaskResult } from '../models/task';

const runtimeMessageSource = 'learning-task-runtime';

interface RuntimePageProps {
  activeTaskId?: string;
  bridgeError: string;
  onOpenTask: (taskId: string) => void;
  onCloseTask: () => void;
  onTaskCompleted: (result: TaskResult) => void;
}

export function RuntimePage({
  activeTaskId,
  bridgeError,
  onOpenTask,
  onCloseTask,
  onTaskCompleted,
}: RuntimePageProps) {
  const [searchParams] = useSearchParams();
  const routeTaskId = searchParams.get('taskId')?.trim() ?? '';

  useEffect(() => {
    if (routeTaskId) {
      onOpenTask(routeTaskId);
    }
  }, [onOpenTask, routeTaskId]);

  function sendRuntimeMessage(message: Record<string, unknown>) {
    if (!window.parent || window.parent === window) {
      return;
    }

    window.parent.postMessage(
      {
        source: runtimeMessageSource,
        ...message,
      },
      '*',
    );
  }

  function handleCloseTask() {
    sendRuntimeMessage({
      type: 'task-close',
      taskId: activeTaskId,
    });
    onCloseTask();
  }

  function handleTaskCompleted(result: TaskResult) {
    sendRuntimeMessage({
      type: 'task-result',
      result: {
        taskId: result.taskId,
        success: result.success,
        score: result.score,
        attempts: result.attempts,
      },
    });
    onTaskCompleted(result);
  }

  return (
    <section className="runtime-page" aria-label="Learning task runtime">
      {bridgeError && <p className="runtime-error">{bridgeError}</p>}
      {activeTaskId && (
        <TaskOverlay
          taskId={activeTaskId}
          onClose={handleCloseTask}
          onTaskCompleted={handleTaskCompleted}
        />
      )}
    </section>
  );
}
