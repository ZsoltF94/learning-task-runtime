import { Link, useParams } from 'react-router-dom';
import { TaskPlayer } from '../components/TaskPlayer';
import { getTaskById } from '../services/taskService';
import { decodeRouteParam } from '../utils/routeUtils';

function createEditPath(taskId: string): string {
  return `/editor/${encodeURIComponent(taskId)}/edit`;
}

export function TaskPlayerPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const resolvedTaskId = taskId ? decodeRouteParam(taskId) : undefined;
  const task = resolvedTaskId ? getTaskById(resolvedTaskId) : undefined;

  if (!resolvedTaskId || !task) {
    return (
      <section className="page-panel">
        <h1>Task not found</h1>
        <p>
          {resolvedTaskId
            ? `No task exists with id "${resolvedTaskId}".`
            : 'No task id was provided.'}
        </p>
        <Link className="secondary-button library-link" to="/editor-library">
          Go to Editor Library
        </Link>
      </section>
    );
  }

  return (
    <div className="task-player-page">
      <div className="developer-task-actions">
        <Link className="secondary-button library-link" to={createEditPath(resolvedTaskId)}>
          Edit
        </Link>
      </div>
      <TaskPlayer taskId={resolvedTaskId} />
    </div>
  );
}
