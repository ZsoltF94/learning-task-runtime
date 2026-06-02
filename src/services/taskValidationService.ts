import type { LearningTask } from '../models/task';

export const taskIdPattern = /^[a-zA-Z0-9_-]+$/;

export function isValidTaskId(taskId: string): boolean {
  return taskIdPattern.test(taskId);
}

function getAnswerValidationErrors(task: LearningTask): string[] {
  const errors: string[] = [];
  const correctAnswerCount = task.answers.filter(
    (answer) => answer.id === task.correctAnswerId,
  ).length;

  if (task.answers.length < 2) {
    errors.push('At least 2 answer options are required.');
  }

  if (correctAnswerCount !== 1) {
    errors.push('Exactly one correct answer must be selected.');
  }

  if (task.answers.some((answer) => !answer.text)) {
    errors.push('Answer texts cannot be empty.');
  }

  return errors;
}

export function validateTaskForEditor(task: LearningTask): string[] {
  const errors: string[] = [];

  if (!task.id) {
    errors.push('Id is required.');
  }

  if (task.id && !isValidTaskId(task.id)) {
    errors.push('Id can only contain letters, numbers, hyphens, and underscores.');
  }

  if (!task.question) {
    errors.push('Question is required.');
  }

  return [...errors, ...getAnswerValidationErrors(task)];
}

export function validateTaskForImport(task: LearningTask): string[] {
  const errors = validateTaskForEditor(task);

  if (!task.title) {
    errors.push('Title is required.');
  }

  return errors;
}
