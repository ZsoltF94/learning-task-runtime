export type TaskDifficulty = 'easy' | 'medium' | 'hard';

export type TaskTheme = 'minimal' | 'fantasy';

export type TaskType = 'multiple-choice';

export interface AnswerOption {
  id: string;
  text: string;
}

export interface LearningTask {
  id: string;
  title: string;
  subject: string;
  topic: string;
  difficulty: TaskDifficulty;
  type: TaskType;
  question: string;
  answers: AnswerOption[];
  correctAnswerId: string;
  feedbackCorrect: string;
  feedbackWrong: string;
  theme: TaskTheme;
}

export interface TaskResult {
  taskId: string;
  success: boolean;
  score: number;
  attempts: number;
  selectedAnswerId?: string;
}
