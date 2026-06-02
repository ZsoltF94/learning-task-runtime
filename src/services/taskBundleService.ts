import type {
  TaskBundle,
  TaskBundleManifest,
  TaskBundleTaskType,
} from '../models/taskBundle';
import type { LearningTask, TaskTheme, TaskType } from '../models/task';
import { importCustomTasks, type ImportTasksResult } from './taskService';

const DEFAULT_BUNDLE_ID = 'default-task-bundle';
const DEFAULT_BUNDLE_VERSION = '1.0.0';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getUniqueValues<TValue extends string>(values: TValue[]): TValue[] {
  return Array.from(new Set(values));
}

function mapTaskTypeToBundleTaskType(taskType: TaskType): TaskBundleTaskType {
  switch (taskType) {
    case 'multiple-choice':
      return 'multiple_choice';
  }
}

function isSupportedBundleTaskType(
  value: unknown,
): value is TaskBundleTaskType {
  return value === 'multiple_choice';
}

function isSupportedTheme(value: unknown): value is TaskTheme {
  return value === 'minimal' || value === 'fantasy';
}

function isTaskBundleManifest(value: unknown): value is TaskBundleManifest {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.bundleId === 'string' &&
    typeof value.version === 'string' &&
    typeof value.createdAt === 'string' &&
    typeof value.tasksCount === 'number' &&
    Array.isArray(value.supportedTaskTypes) &&
    value.supportedTaskTypes.every(isSupportedBundleTaskType) &&
    Array.isArray(value.supportedThemes) &&
    value.supportedThemes.every(isSupportedTheme)
  );
}

function isTaskBundle(value: unknown): value is TaskBundle {
  if (!isRecord(value) || !isTaskBundleManifest(value.manifest)) {
    return false;
  }

  return Array.isArray(value.tasks);
}

export function createTaskBundle(tasks: LearningTask[]): TaskBundle {
  return {
    manifest: {
      bundleId: DEFAULT_BUNDLE_ID,
      version: DEFAULT_BUNDLE_VERSION,
      createdAt: new Date().toISOString(),
      tasksCount: tasks.length,
      supportedTaskTypes: getUniqueValues<TaskBundleTaskType>(
        tasks.map((task) => mapTaskTypeToBundleTaskType(task.type)),
      ),
      supportedThemes: getUniqueValues<TaskTheme>(
        tasks.map((task) => task.theme),
      ),
    },
    tasks,
  };
}

export function importTaskBundle(value: unknown): ImportTasksResult | undefined {
  if (!isTaskBundle(value)) {
    return undefined;
  }

  return importCustomTasks(value.tasks);
}
