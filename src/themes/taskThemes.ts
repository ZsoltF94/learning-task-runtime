import type { TaskTheme } from '../models/task';

interface TaskThemeConfig {
  shellClassName: string;
  panelClassName: string;
  titleClassName: string;
  metadataClassName: string;
  questionClassName: string;
  answerListClassName: string;
  answerButtonClassName: string;
  selectedAnswerButtonClassName: string;
  checkButtonClassName: string;
  messageClassName: string;
  errorMessageClassName: string;
  resultClassName: string;
}

const taskThemeConfigs: Record<TaskTheme, TaskThemeConfig> = {
  minimal: {
    shellClassName: 'player-theme player-theme-minimal',
    panelClassName: 'player-panel player-panel-minimal',
    titleClassName: 'player-title player-title-minimal',
    metadataClassName: 'player-metadata player-metadata-minimal',
    questionClassName: 'player-question player-question-minimal',
    answerListClassName: 'player-answer-list',
    answerButtonClassName: 'player-answer-button player-answer-button-minimal',
    selectedAnswerButtonClassName:
      'player-answer-button player-answer-button-minimal selected',
    checkButtonClassName: 'player-check-button player-check-button-minimal',
    messageClassName: 'player-message player-message-minimal',
    errorMessageClassName: 'player-message player-message-minimal error',
    resultClassName: 'player-result player-result-minimal',
  },
  fantasy: {
    shellClassName: 'player-theme player-theme-fantasy',
    panelClassName: 'player-panel player-panel-fantasy',
    titleClassName: 'player-title player-title-fantasy',
    metadataClassName: 'player-metadata player-metadata-fantasy',
    questionClassName: 'player-question player-question-fantasy',
    answerListClassName: 'player-answer-list',
    answerButtonClassName: 'player-answer-button player-answer-button-fantasy',
    selectedAnswerButtonClassName:
      'player-answer-button player-answer-button-fantasy selected',
    checkButtonClassName: 'player-check-button player-check-button-fantasy',
    messageClassName: 'player-message player-message-fantasy',
    errorMessageClassName: 'player-message player-message-fantasy error',
    resultClassName: 'player-result player-result-fantasy',
  },
};

export function getTaskThemeConfig(theme: TaskTheme): TaskThemeConfig {
  return taskThemeConfigs[theme] ?? taskThemeConfigs.minimal;
}
