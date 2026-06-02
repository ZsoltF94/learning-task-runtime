import { sampleTasks } from '../data/sampleTasks';
import type {
  AnswerOption,
  LearningTask,
  TaskDifficulty,
  TaskTheme,
} from '../models/task';
import { validateTaskForImport } from './taskValidationService';

const LOCAL_TASKS_STORAGE_KEY = 'learning-tasks';
const DELETED_TASK_IDS_STORAGE_KEY = 'learning-task-deleted-ids';
const REMOTE_TASKS_URL = import.meta.env.VITE_REMOTE_TASKS_URL?.trim() ?? '';

export interface ImportTasksResult {
  importedCount: number;
  skippedCount: number;
}

export interface RemoteTasksLoadResult {
  status: 'disabled' | 'loaded' | 'failed';
  url: string;
  loadedCount: number;
  skippedCount: number;
  errorMessage?: string;
}

let remoteTasks: LearningTask[] = [];

function canUseLocalStorage(): boolean {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

function getStoredTasks(): LearningTask[] {
  if (!canUseLocalStorage()) {
    return [];
  }

  const storedValue = window.localStorage.getItem(LOCAL_TASKS_STORAGE_KEY);

  if (!storedValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(storedValue);
    return Array.isArray(parsedValue) ? (parsedValue as LearningTask[]) : [];
  } catch {
    return [];
  }
}

function saveStoredTasks(tasks: LearningTask[]) {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.setItem(LOCAL_TASKS_STORAGE_KEY, JSON.stringify(tasks));
}

function getDeletedTaskIds(): string[] {
  if (!canUseLocalStorage()) {
    return [];
  }

  const storedValue = window.localStorage.getItem(DELETED_TASK_IDS_STORAGE_KEY);

  if (!storedValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(storedValue);

    return Array.isArray(parsedValue)
      ? parsedValue.filter((taskId): taskId is string => typeof taskId === 'string')
      : [];
  } catch {
    return [];
  }
}

function saveDeletedTaskIds(taskIds: string[]) {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.setItem(
    DELETED_TASK_IDS_STORAGE_KEY,
    JSON.stringify(Array.from(new Set(taskIds))),
  );
}

function markTaskAsDeleted(taskId: string) {
  saveDeletedTaskIds([...getDeletedTaskIds(), taskId]);
}

function restoreTaskId(taskId: string) {
  const remainingTaskIds = getDeletedTaskIds().filter(
    (deletedTaskId) => deletedTaskId !== taskId,
  );

  saveDeletedTaskIds(remainingTaskIds);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isValidDifficulty(value: unknown): value is TaskDifficulty {
  return value === 'easy' || value === 'medium' || value === 'hard';
}

function isValidTheme(value: unknown): value is TaskTheme {
  return value === 'minimal' || value === 'fantasy';
}

function normalizeAnswerOptions(value: unknown): AnswerOption[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const answers = value.filter(isRecord).map((answer) => ({
    id: typeof answer.id === 'string' ? answer.id.trim() : '',
    text: typeof answer.text === 'string' ? answer.text.trim() : '',
  }));

  if (answers.length === 0 || answers.some((answer) => !answer.id || !answer.text)) {
    return undefined;
  }

  return answers;
}

export function normalizeImportedTask(value: unknown): LearningTask | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const answers = normalizeAnswerOptions(value.answers);
  const id = typeof value.id === 'string' ? value.id.trim() : '';
  const title = typeof value.title === 'string' ? value.title.trim() : '';
  const question =
    typeof value.question === 'string' ? value.question.trim() : '';
  const correctAnswerId =
    typeof value.correctAnswerId === 'string' ? value.correctAnswerId.trim() : '';
  const type = typeof value.type === 'string' ? value.type : '';

  if (!answers || type !== 'multiple-choice') {
    return undefined;
  }

  const task: LearningTask = {
    id,
    title,
    subject: typeof value.subject === 'string' ? value.subject.trim() : '',
    topic: typeof value.topic === 'string' ? value.topic.trim() : '',
    difficulty: isValidDifficulty(value.difficulty) ? value.difficulty : 'easy',
    type: 'multiple-choice',
    question,
    answers,
    correctAnswerId,
    feedbackCorrect:
      typeof value.feedbackCorrect === 'string' ? value.feedbackCorrect.trim() : '',
    feedbackWrong:
      typeof value.feedbackWrong === 'string' ? value.feedbackWrong.trim() : '',
    theme: isValidTheme(value.theme) ? value.theme : 'minimal',
  };

  return validateTaskForImport(task).length === 0 ? task : undefined;
}

export function getSampleTasks(): LearningTask[] {
  return [...sampleTasks];
}

export function getRemoteTasksUrl(): string {
  return REMOTE_TASKS_URL;
}

export async function loadRemoteTasks(): Promise<RemoteTasksLoadResult> {
  if (!REMOTE_TASKS_URL) {
    remoteTasks = [];

    return {
      status: 'disabled',
      url: '',
      loadedCount: 0,
      skippedCount: 0,
    };
  }

  try {
    const response = await fetch(REMOTE_TASKS_URL, { cache: 'no-cache' });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const parsedValue: unknown = await response.json();

    if (!Array.isArray(parsedValue)) {
      throw new Error('Remote tasks JSON must be an array.');
    }

    const nextRemoteTasks: LearningTask[] = [];
    let skippedCount = 0;

    for (const taskValue of parsedValue) {
      const task = normalizeImportedTask(taskValue);

      if (!task) {
        skippedCount += 1;
        continue;
      }

      nextRemoteTasks.push(task);
    }

    remoteTasks = nextRemoteTasks;

    console.info('Remote tasks loaded:', {
      url: REMOTE_TASKS_URL,
      loadedCount: remoteTasks.length,
      skippedCount,
    });

    return {
      status: 'loaded',
      url: REMOTE_TASKS_URL,
      loadedCount: remoteTasks.length,
      skippedCount,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown remote task load error.';

    remoteTasks = [];

    console.warn('Remote tasks could not be loaded. Local tasks remain available.', {
      url: REMOTE_TASKS_URL,
      errorMessage,
    });

    return {
      status: 'failed',
      url: REMOTE_TASKS_URL,
      loadedCount: 0,
      skippedCount: 0,
      errorMessage,
    };
  }
}

export function getCustomTasks(): LearningTask[] {
  const deletedTaskIds = new Set(getDeletedTaskIds());

  return getStoredTasks().filter((task) => !deletedTaskIds.has(task.id));
}

export function getAllTasks(): LearningTask[] {
  const tasksById = new Map<string, LearningTask>();
  const deletedTaskIds = new Set(getDeletedTaskIds());

  for (const task of sampleTasks) {
    tasksById.set(task.id, task);
  }

  for (const task of remoteTasks) {
    tasksById.set(task.id, task);
  }

  for (const task of getStoredTasks()) {
    tasksById.set(task.id, task);
  }

  return Array.from(tasksById.values()).filter(
    (task) => !deletedTaskIds.has(task.id),
  );
}

export function getTaskById(taskId: string): LearningTask | undefined {
  return getAllTasks().find((task) => task.id === taskId);
}

export function saveTask(task: LearningTask) {
  const storedTasks = getStoredTasks();
  const existingTaskIndex = storedTasks.findIndex(
    (storedTask) => storedTask.id === task.id,
  );

  if (existingTaskIndex >= 0) {
    storedTasks[existingTaskIndex] = task;
  } else {
    storedTasks.push(task);
  }

  saveStoredTasks(storedTasks);
  restoreTaskId(task.id);
}

export function deleteCustomTask(taskId: string) {
  const storedTasks = getStoredTasks();
  const remainingTasks = storedTasks.filter((task) => task.id !== taskId);

  saveStoredTasks(remainingTasks);
}

export function deleteTask(taskId: string) {
  deleteCustomTask(taskId);
  markTaskAsDeleted(taskId);
}

export function getDeletedTasksCount(): number {
  return getDeletedTaskIds().length;
}

export function restoreDeletedTasks() {
  saveDeletedTaskIds([]);
}

export function importCustomTasks(tasksToImport: unknown[]): ImportTasksResult {
  const storedTasks = getStoredTasks();
  const existingTaskIds = new Set(getAllTasks().map((task) => task.id));
  const tasksToStore = [...storedTasks];
  let importedCount = 0;
  let skippedCount = 0;

  for (const taskToImport of tasksToImport) {
    const task = normalizeImportedTask(taskToImport);

    if (!task || existingTaskIds.has(task.id)) {
      skippedCount += 1;
      continue;
    }

    tasksToStore.push(task);
    restoreTaskId(task.id);
    existingTaskIds.add(task.id);
    importedCount += 1;
  }

  saveStoredTasks(tasksToStore);

  return {
    importedCount,
    skippedCount,
  };
}
