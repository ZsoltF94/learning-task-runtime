import { useEffect, useState } from 'react';
import type { TaskResult } from '../models/task';
import {
  createTaskResult,
  isCorrectAnswer,
} from '../services/taskPlayerService';
import { getTaskById } from '../services/taskService';
import { getTaskThemeConfig } from '../themes/taskThemes';

interface TaskPlayerProps {
  taskId: string;
  onTaskCompleted?: (result: TaskResult) => void;
}

export function TaskPlayer({ taskId, onTaskCompleted }: TaskPlayerProps) {
  const task = getTaskById(taskId);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | undefined>();
  const [attempts, setAttempts] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [selectionError, setSelectionError] = useState('');
  const [taskResult, setTaskResult] = useState<TaskResult | undefined>();

  useEffect(() => {
    setSelectedAnswerId(undefined);
    setAttempts(0);
    setFeedbackMessage('');
    setSelectionError('');
    setTaskResult(undefined);
  }, [taskId]);

  function handleAnswerSelect(answerId: string) {
    setSelectedAnswerId(answerId);
    setSelectionError('');
    setFeedbackMessage('');
    setTaskResult(undefined);
  }

  function handleCheckAnswer() {
    if (!task || !selectedAnswerId) {
      setSelectionError('Please select an answer first.');
      return;
    }

    const nextAttempts = attempts + 1;
    const success = isCorrectAnswer(task, selectedAnswerId);
    const result = createTaskResult(
      task.id,
      selectedAnswerId,
      success,
      nextAttempts,
    );

    setAttempts(nextAttempts);
    setFeedbackMessage(success ? task.feedbackCorrect : task.feedbackWrong);
    setSelectionError('');
    setTaskResult(result);
    onTaskCompleted?.(result);
  }

  if (!task) {
    return (
      <section className="page-panel">
        <h1>Task not found</h1>
        <p>{`No task exists with id "${taskId}".`}</p>
      </section>
    );
  }

  const themeConfig = getTaskThemeConfig(task.theme);

  return (
    <section className={themeConfig.shellClassName}>
      <div className={themeConfig.panelClassName}>
        <h1 className={themeConfig.titleClassName}>{task.title}</h1>
        <dl className={themeConfig.metadataClassName}>
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
        </dl>
        <p className={themeConfig.questionClassName}>{task.question}</p>
        <ul className={themeConfig.answerListClassName}>
          {task.answers.map((answer) => (
            <li key={answer.id}>
              <button
                className={
                  selectedAnswerId === answer.id
                    ? themeConfig.selectedAnswerButtonClassName
                    : themeConfig.answerButtonClassName
                }
                type="button"
                aria-pressed={selectedAnswerId === answer.id}
                onClick={() => handleAnswerSelect(answer.id)}
              >
                {answer.text}
              </button>
            </li>
          ))}
        </ul>
        <button
          className={themeConfig.checkButtonClassName}
          type="button"
          onClick={handleCheckAnswer}
        >
          Check Answer
        </button>
        {selectionError && (
          <p className={themeConfig.errorMessageClassName}>{selectionError}</p>
        )}
        {feedbackMessage && (
          <p className={themeConfig.messageClassName}>{feedbackMessage}</p>
        )}
        {taskResult && (
          <dl className={themeConfig.resultClassName}>
            <div>
              <dt>Success</dt>
              <dd>{String(taskResult.success)}</dd>
            </div>
            <div>
              <dt>Score</dt>
              <dd>{taskResult.score}</dd>
            </div>
            <div>
              <dt>Attempts</dt>
              <dd>{taskResult.attempts}</dd>
            </div>
          </dl>
        )}
      </div>
    </section>
  );
}
