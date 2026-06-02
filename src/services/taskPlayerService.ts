import type { LearningTask, TaskResult } from '../models/task';

export function isCorrectAnswer(
  task: LearningTask,
  selectedAnswerId: string,
): boolean {
  return task.correctAnswerId === selectedAnswerId;
}

export function createTaskResult(
  taskId: string,
  selectedAnswerId: string,
  success: boolean,
  attempts: number,
): TaskResult {
  return {
    taskId,
    success,
    score: success ? 100 : 0,
    attempts,
    selectedAnswerId,
  };
}
