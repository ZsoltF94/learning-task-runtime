import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TaskOverlay } from '../components/TaskOverlay';
import type { LearningTask, TaskResult } from '../models/task';
import {
  createTaskBundle,
  importTaskBundle,
} from '../services/taskBundleService';
import {
  deleteTask,
  getAllTasks,
  getCustomTasks,
  getDeletedTasksCount,
  importCustomTasks,
  restoreDeletedTasks,
} from '../services/taskService';

interface TopicGroup {
  topic: string;
  tasks: LearningTask[];
}

interface SubjectGroup {
  subject: string;
  topics: TopicGroup[];
}

interface ImportExportMessage {
  type: 'success' | 'error';
  text: string;
}

function createPlayPath(taskId: string): string {
  return `/play/${encodeURIComponent(taskId)}`;
}

function createEditPath(taskId: string): string {
  return `/editor/${encodeURIComponent(taskId)}/edit`;
}

function downloadJson(filename: string, value: unknown) {
  const jsonContent = JSON.stringify(value, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function compareByName(firstValue: string, secondValue: string): number {
  return firstValue.localeCompare(secondValue, undefined, {
    sensitivity: 'base',
  });
}

function getDisplayValue(value: string): string {
  return value || 'Uncategorized';
}

function taskExists(taskId: string, tasks: LearningTask[]): boolean {
  return tasks.some((task) => task.id === taskId);
}

function groupTasksBySubjectAndTopic(tasks: LearningTask[]): SubjectGroup[] {
  const subjectGroups = new Map<string, Map<string, LearningTask[]>>();

  for (const task of tasks) {
    const subject = getDisplayValue(task.subject);
    const topic = getDisplayValue(task.topic);

    if (!subjectGroups.has(subject)) {
      subjectGroups.set(subject, new Map<string, LearningTask[]>());
    }

    const topicGroups = subjectGroups.get(subject);

    if (!topicGroups) {
      continue;
    }

    const topicTasks = topicGroups.get(topic) ?? [];
    topicGroups.set(topic, [...topicTasks, task]);
  }

  return Array.from(subjectGroups.entries())
    .sort(([firstSubject], [secondSubject]) =>
      compareByName(firstSubject, secondSubject),
    )
    .map(([subject, topicGroups]) => ({
      subject,
      topics: Array.from(topicGroups.entries())
        .sort(([firstTopic], [secondTopic]) =>
          compareByName(firstTopic, secondTopic),
        )
        .map(([topic, topicTasks]) => ({
          topic,
          tasks: [...topicTasks].sort((firstTask, secondTask) =>
            compareByName(firstTask.title || firstTask.id, secondTask.title || secondTask.id),
          ),
        })),
    }));
}

function createImportResultMessage(
  label: string,
  importedCount: number,
  skippedCount: number,
): string {
  if (importedCount > 0 && skippedCount > 0) {
    return `${label} imported ${importedCount} tasks. Skipped ${skippedCount} existing or invalid tasks.`;
  }

  if (importedCount > 0) {
    return `${label} imported ${importedCount} tasks.`;
  }

  if (skippedCount === 0) {
    return `${label} found no tasks to import.`;
  }

  return `${label} imported no new tasks. Skipped ${skippedCount} existing or invalid tasks.`;
}

function TaskLibraryItem({
  task,
  onOpenOverlay,
  onDelete,
}: {
  task: LearningTask;
  onOpenOverlay: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}) {
  return (
    <article className="library-card">
      <div>
        <h2>{task.title || task.id}</h2>
        <dl className="library-metadata">
          <div>
            <dt>Id</dt>
            <dd>{task.id}</dd>
          </div>
          <div>
            <dt>Subject</dt>
            <dd>{task.subject}</dd>
          </div>
          <div>
            <dt>Topic</dt>
            <dd>{task.topic}</dd>
          </div>
          <div>
            <dt>Difficulty</dt>
            <dd>{task.difficulty}</dd>
          </div>
          <div>
            <dt>Theme</dt>
            <dd>{task.theme}</dd>
          </div>
        </dl>
      </div>
      <div className="library-actions">
        <Link className="secondary-button library-link" to={createPlayPath(task.id)}>
          Test Task
        </Link>
        <Link className="secondary-button library-link" to={createEditPath(task.id)}>
          Edit Task
        </Link>
        <button
          className="secondary-button"
          type="button"
          onClick={() => onOpenOverlay(task.id)}
        >
          Open Overlay
        </button>
        <button
          className="danger-button"
          type="button"
          onClick={() => onDelete(task.id)}
        >
          Delete
        </button>
      </div>
    </article>
  );
}

export function EditorLibraryPage() {
  const [customTasks, setCustomTasks] = useState<LearningTask[]>(getCustomTasks);
  const [selectedSubject, setSelectedSubject] = useState<string | undefined>();
  const [selectedTopic, setSelectedTopic] = useState<string | undefined>();
  const [idSearch, setIdSearch] = useState('');
  const [overlayTaskId, setOverlayTaskId] = useState<string | undefined>();
  const [lastTaskResult, setLastTaskResult] = useState<TaskResult | undefined>();
  const [importExportMessage, setImportExportMessage] =
    useState<ImportExportMessage | undefined>();
  const [deletedTasksCount, setDeletedTasksCount] = useState(getDeletedTasksCount);
  const allTasks = getAllTasks();
  const groupedTasks = groupTasksBySubjectAndTopic(allTasks);
  const normalizedSearch = idSearch.trim().toLowerCase();
  const searchedTasks = normalizedSearch
    ? allTasks.filter((task) => task.id.toLowerCase().includes(normalizedSearch))
    : [];
  const selectedSubjectGroup = groupedTasks.find(
    (subjectGroup) => subjectGroup.subject === selectedSubject,
  );
  const selectedTopicGroup = selectedSubjectGroup?.topics.find(
    (topicGroup) => topicGroup.topic === selectedTopic,
  );

  function refreshLibraryState() {
    const nextCustomTasks = getCustomTasks();
    const nextAllTasks = getAllTasks();
    const nextGroupedTasks = groupTasksBySubjectAndTopic(nextAllTasks);
    const nextSubjectGroup = selectedSubject
      ? nextGroupedTasks.find(
          (subjectGroup) => subjectGroup.subject === selectedSubject,
        )
      : undefined;

    setCustomTasks(nextCustomTasks);
    setDeletedTasksCount(getDeletedTasksCount());

    if (overlayTaskId && !taskExists(overlayTaskId, nextAllTasks)) {
      setOverlayTaskId(undefined);
    }

    if (lastTaskResult && !taskExists(lastTaskResult.taskId, nextAllTasks)) {
      setLastTaskResult(undefined);
    }

    if (selectedSubject && !nextSubjectGroup) {
      setSelectedSubject(undefined);
      setSelectedTopic(undefined);
      return;
    }

    if (
      selectedTopic &&
      !nextSubjectGroup?.topics.some(
        (topicGroup) => topicGroup.topic === selectedTopic,
      )
    ) {
      setSelectedTopic(undefined);
    }
  }

  function handleDelete(taskId: string) {
    deleteTask(taskId);
    refreshLibraryState();
    setImportExportMessage({
      type: 'success',
      text: `Task "${taskId}" deleted.`,
    });
  }

  function handleRestoreDeletedTasks() {
    restoreDeletedTasks();
    refreshLibraryState();
    setImportExportMessage({
      type: 'success',
      text: 'Deleted sample and remote tasks restored.',
    });
  }

  function handleOpenOverlay(taskId: string) {
    setOverlayTaskId(taskId);
  }

  function handleCloseOverlay() {
    setOverlayTaskId(undefined);
  }

  function handleExportCustomTasks() {
    downloadJson('custom-tasks.json', getCustomTasks());
    setImportExportMessage({
      type: 'success',
      text: 'Custom tasks exported as JSON.',
    });
  }

  function handleExportAllTasks() {
    downloadJson('all-tasks.json', getAllTasks());
    setImportExportMessage({
      type: 'success',
      text: 'All tasks exported as JSON.',
    });
  }

  function handleExportTaskBundle() {
    downloadJson('task-bundle.json', createTaskBundle(getAllTasks()));
    setImportExportMessage({
      type: 'success',
      text: 'Task bundle exported as JSON.',
    });
  }

  async function handleImportFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';

    if (!file) {
      return;
    }

    try {
      const fileContent = await file.text();
      const parsedContent = JSON.parse(fileContent);

      if (Array.isArray(parsedContent)) {
        const result = importCustomTasks(parsedContent);

        refreshLibraryState();
        setImportExportMessage({
          type: 'success',
          text: createImportResultMessage(
            'Task import',
            result.importedCount,
            result.skippedCount,
          ),
        });
        return;
      }

      const bundleImportResult = importTaskBundle(parsedContent);

      if (!bundleImportResult) {
        setImportExportMessage({
          type: 'error',
          text: 'Import failed. The JSON file must contain a task array or a task bundle.',
        });
        return;
      }

      refreshLibraryState();
      setImportExportMessage({
        type: 'success',
        text: createImportResultMessage(
          'Task bundle import',
          bundleImportResult.importedCount,
          bundleImportResult.skippedCount,
        ),
      });
    } catch {
      setImportExportMessage({
        type: 'error',
        text: 'Import failed. Please choose a valid JSON file.',
      });
    }
  }

  function handleSubjectSelect(subject: string) {
    setSelectedSubject(subject);
    setSelectedTopic(undefined);
  }

  function handleBackToSubjects() {
    setSelectedSubject(undefined);
    setSelectedTopic(undefined);
  }

  function handleBackToTopics() {
    setSelectedTopic(undefined);
  }

  return (
    <section className="page-panel">
      <h1>Editor Library</h1>

      {lastTaskResult && (
        <dl className="library-last-result">
          <div>
            <dt>Task ID</dt>
            <dd>{lastTaskResult.taskId}</dd>
          </div>
          <div>
            <dt>Success</dt>
            <dd>{String(lastTaskResult.success)}</dd>
          </div>
          <div>
            <dt>Score</dt>
            <dd>{lastTaskResult.score}</dd>
          </div>
          <div>
            <dt>Attempts</dt>
            <dd>{lastTaskResult.attempts}</dd>
          </div>
        </dl>
      )}

      {customTasks.length === 0 && (
        <p className="library-empty-message">No custom tasks created yet.</p>
      )}

      <section className="library-import-export">
        <h2>Import / Export</h2>
        <div className="library-import-export-actions">
          <button
            className="secondary-button"
            type="button"
            onClick={handleExportCustomTasks}
          >
            Export Custom Tasks
          </button>
          <button
            className="secondary-button"
            type="button"
            onClick={handleExportAllTasks}
          >
            Export All Tasks
          </button>
          <button
            className="secondary-button"
            type="button"
            onClick={handleExportTaskBundle}
          >
            Export Task Bundle
          </button>
          <label className="secondary-button library-import-button">
            Import Tasks
            <input accept="application/json,.json" type="file" onChange={handleImportFile} />
          </label>
          <button
            className="secondary-button"
            type="button"
            disabled={deletedTasksCount === 0}
            onClick={handleRestoreDeletedTasks}
          >
            Restore Deleted Tasks
          </button>
        </div>
        {importExportMessage && (
          <p className={`library-import-message ${importExportMessage.type}`}>
            {importExportMessage.text}
          </p>
        )}
      </section>

      <label className="library-search">
        Search by ID
        <input
          value={idSearch}
          onChange={(event) => setIdSearch(event.target.value)}
          placeholder="example-task"
        />
      </label>

      <div className="library-folder-tree">
        {allTasks.length === 0 && (
          <p className="library-empty-message">No tasks available.</p>
        )}

        {normalizedSearch && (
          <section className="library-folder-level">
            <h2>Search results</h2>
            {searchedTasks.length === 0 ? (
              <p className="library-empty-message">No tasks found for this ID.</p>
            ) : (
              <div className="library-list">
                {searchedTasks.map((task) => (
                  <TaskLibraryItem
                    key={task.id}
                    task={task}
                    onOpenOverlay={handleOpenOverlay}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {!normalizedSearch && !selectedSubject && (
          <section className="library-folder-level">
            <h2>Subjects</h2>
            <div className="library-folder-grid">
              {groupedTasks.map((subjectGroup) => (
                <button
                  className="library-folder-button"
                  key={subjectGroup.subject}
                  type="button"
                  onClick={() => handleSubjectSelect(subjectGroup.subject)}
                >
                  <span>{subjectGroup.subject}</span>
                  <small>{subjectGroup.topics.length} topics</small>
                </button>
              ))}
            </div>
          </section>
        )}

        {!normalizedSearch && selectedSubjectGroup && !selectedTopic && (
          <section className="library-folder-level">
            <button
              className="secondary-button library-back-button"
              type="button"
              onClick={handleBackToSubjects}
            >
              Back to subjects
            </button>
            <h2>{selectedSubjectGroup.subject}</h2>
            <div className="library-folder-grid">
              {selectedSubjectGroup.topics.map((topicGroup) => (
                <button
                  className="library-folder-button"
                  key={topicGroup.topic}
                  type="button"
                  onClick={() => setSelectedTopic(topicGroup.topic)}
                >
                  <span>{topicGroup.topic}</span>
                  <small>{topicGroup.tasks.length} tasks</small>
                </button>
              ))}
            </div>
          </section>
        )}

        {!normalizedSearch && selectedSubjectGroup && selectedTopicGroup && (
          <section className="library-folder-level">
            <div className="library-back-actions">
              <button
                className="secondary-button library-back-button"
                type="button"
                onClick={handleBackToSubjects}
              >
                Back to subjects
              </button>
              <button
                className="secondary-button library-back-button"
                type="button"
                onClick={handleBackToTopics}
              >
                Back to topics
              </button>
            </div>
            <h2>{selectedSubjectGroup.subject}</h2>
            <h3>{selectedTopicGroup.topic}</h3>
            <div className="library-list">
              {selectedTopicGroup.tasks.map((task) => (
                <TaskLibraryItem
                  key={task.id}
                  task={task}
                  onOpenOverlay={handleOpenOverlay}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {overlayTaskId && (
        <TaskOverlay
          taskId={overlayTaskId}
          onClose={handleCloseOverlay}
          onTaskCompleted={setLastTaskResult}
        />
      )}
    </section>
  );
}
