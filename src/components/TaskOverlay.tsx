import type { TaskResult } from '../models/task';
import { TaskPlayer } from './TaskPlayer';

interface TaskOverlayProps {
  taskId: string;
  displayMode?: 'page' | 'frame';
  onClose: () => void;
  onTaskCompleted: (result: TaskResult) => void;
}

export function TaskOverlay({
  taskId,
  displayMode = 'page',
  onClose,
  onTaskCompleted,
}: TaskOverlayProps) {
  const isFrameMode = displayMode === 'frame';

  return (
    <div
      className={
        isFrameMode
          ? 'task-overlay-backdrop task-overlay-backdrop-frame'
          : 'task-overlay-backdrop'
      }
    >
      <div
        className={
          isFrameMode
            ? 'task-overlay-panel task-overlay-panel-frame'
            : 'task-overlay-panel'
        }
      >
        <div className="task-overlay-actions">
          <button className="secondary-button" type="button" onClick={onClose}>
            Close
          </button>
        </div>
        <TaskPlayer taskId={taskId} onTaskCompleted={onTaskCompleted} />
      </div>
    </div>
  );
}
