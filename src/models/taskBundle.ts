import type { LearningTask, TaskTheme } from './task';

export type TaskBundleTaskType = 'multiple_choice';

export interface TaskBundleManifest {
  bundleId: string;
  version: string;
  createdAt: string;
  tasksCount: number;
  supportedTaskTypes: TaskBundleTaskType[];
  supportedThemes: TaskTheme[];
}

export interface TaskBundle {
  manifest: TaskBundleManifest;
  tasks: LearningTask[];
}
