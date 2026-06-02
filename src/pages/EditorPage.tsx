import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type {
  AnswerOption,
  LearningTask,
  TaskDifficulty,
  TaskTheme,
} from '../models/task';
import { getTaskById, saveTask } from '../services/taskService';
import { validateTaskForEditor } from '../services/taskValidationService';
import { decodeRouteParam } from '../utils/routeUtils';

const difficultyOptions: TaskDifficulty[] = ['easy', 'medium', 'hard'];
const themeOptions: TaskTheme[] = ['minimal', 'fantasy'];

const initialAnswers: AnswerOption[] = [
  { id: 'answer-1', text: '' },
  { id: 'answer-2', text: '' },
];

export function EditorPage() {
  const { taskId: routeTaskId } = useParams<{ taskId: string }>();
  const editTaskId = routeTaskId ? decodeRouteParam(routeTaskId) : undefined;
  const isEditMode = Boolean(editTaskId);
  const [editTask, setEditTask] = useState<LearningTask | undefined>(() =>
    editTaskId ? getTaskById(editTaskId) : undefined,
  );
  const [taskId, setTaskId] = useState('');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<TaskDifficulty>('easy');
  const [question, setQuestion] = useState('');
  const [answers, setAnswers] = useState<AnswerOption[]>(initialAnswers);
  const [correctAnswerId, setCorrectAnswerId] = useState(initialAnswers[0].id);
  const [feedbackCorrect, setFeedbackCorrect] = useState('');
  const [feedbackWrong, setFeedbackWrong] = useState('');
  const [theme, setTheme] = useState<TaskTheme>('minimal');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [savedTaskId, setSavedTaskId] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (!editTaskId) {
      setEditTask(undefined);
      return;
    }

    const nextEditTask = getTaskById(editTaskId);
    setEditTask(nextEditTask);

    if (!nextEditTask) {
      return;
    }

    setTaskId(nextEditTask.id);
    setTitle(nextEditTask.title);
    setSubject(nextEditTask.subject);
    setTopic(nextEditTask.topic);
    setDifficulty(nextEditTask.difficulty);
    setQuestion(nextEditTask.question);
    setAnswers(nextEditTask.answers);
    setCorrectAnswerId(nextEditTask.correctAnswerId);
    setFeedbackCorrect(nextEditTask.feedbackCorrect);
    setFeedbackWrong(nextEditTask.feedbackWrong);
    setTheme(nextEditTask.theme);
    setValidationErrors([]);
    setSavedTaskId('');
  }, [editTaskId]);

  function updateAnswerText(answerId: string, text: string) {
    setAnswers((currentAnswers) =>
      currentAnswers.map((answer) =>
        answer.id === answerId ? { ...answer, text } : answer,
      ),
    );
  }

  function addAnswer() {
    const nextAnswerNumber =
      Math.max(
        ...answers.map((answer) => Number(answer.id.replace('answer-', ''))),
      ) + 1;
    setAnswers((currentAnswers) => [
      ...currentAnswers,
      { id: `answer-${nextAnswerNumber}`, text: '' },
    ]);
  }

  function removeAnswer(answerId: string) {
    if (answers.length <= 2) {
      return;
    }

    const remainingAnswers = answers.filter((answer) => answer.id !== answerId);
    setAnswers(remainingAnswers);

    if (correctAnswerId === answerId) {
      setCorrectAnswerId(remainingAnswers[0].id);
    }
  }

  function buildTask(): LearningTask {
    return {
      id: taskId.trim(),
      title: title.trim(),
      subject: subject.trim(),
      topic: topic.trim(),
      difficulty,
      type: 'multiple-choice',
      question: question.trim(),
      answers: answers.map((answer) => ({
        id: answer.id,
        text: answer.text.trim(),
      })),
      correctAnswerId,
      feedbackCorrect: feedbackCorrect.trim(),
      feedbackWrong: feedbackWrong.trim(),
      theme,
    };
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const task = buildTask();
    const errors = validateTaskForEditor(task);

    if (errors.length > 0) {
      setValidationErrors(errors);
      setSavedTaskId('');
      return;
    }

    saveTask(task);
    setEditTask(task);
    setValidationErrors([]);
    setSavedTaskId(task.id);
  }

  if (isEditMode && !editTask) {
    return (
      <section className="page-panel">
        <h1>Task not found</h1>
        <p>{`No task exists with id "${editTaskId ?? 'unknown'}".`}</p>
        <Link className="secondary-button library-link" to="/editor-library">
          Go to Editor Library
        </Link>
      </section>
    );
  }

  if (!isEditMode && !showCreateForm) {
    return (
      <section className="page-panel">
        <h1>Editor Page</h1>
        <div className="editor-start-panel">
          <button
            className="check-answer-button"
            type="button"
            onClick={() => setShowCreateForm(true)}
          >
            Create New Exercise
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="page-panel">
      <h1>{isEditMode ? 'Edit Task' : 'Editor Page'}</h1>
      <form className="editor-form" onSubmit={handleSubmit}>
        <label>
          Id
          <input
            value={taskId}
            onChange={(event) => setTaskId(event.target.value)}
            placeholder="my-task-id"
            disabled={isEditMode}
          />
        </label>

        <label>
          Title
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Task title"
          />
        </label>

        <label>
          Subject
          <input
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="Mathematics"
          />
        </label>

        <label>
          Topic
          <input
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            placeholder="Addition"
          />
        </label>

        <label>
          Difficulty
          <select
            value={difficulty}
            onChange={(event) =>
              setDifficulty(event.target.value as TaskDifficulty)
            }
          >
            {difficultyOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label>
          Theme
          <select
            value={theme}
            onChange={(event) => setTheme(event.target.value as TaskTheme)}
          >
            {themeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="editor-form-full">
          Question
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="What is 2 + 3?"
            rows={3}
          />
        </label>

        <fieldset className="editor-form-full answer-editor">
          <legend>Answer options</legend>
          {answers.map((answer, index) => (
            <div className="answer-editor-row" key={answer.id}>
              <label className="correct-answer-control">
                <input
                  checked={correctAnswerId === answer.id}
                  name="correctAnswerId"
                  type="radio"
                  onChange={() => setCorrectAnswerId(answer.id)}
                />
                Correct
              </label>
              <label>
                Answer {index + 1}
                <input
                  value={answer.text}
                  onChange={(event) =>
                    updateAnswerText(answer.id, event.target.value)
                  }
                  placeholder={`Answer ${index + 1}`}
                />
              </label>
              <button
                className="secondary-button"
                type="button"
                disabled={answers.length <= 2}
                onClick={() => removeAnswer(answer.id)}
              >
                Remove
              </button>
            </div>
          ))}
          <button className="secondary-button" type="button" onClick={addAnswer}>
            Add answer option
          </button>
        </fieldset>

        <label className="editor-form-full">
          Feedback correct
          <textarea
            value={feedbackCorrect}
            onChange={(event) => setFeedbackCorrect(event.target.value)}
            placeholder="Correct feedback"
            rows={2}
          />
        </label>

        <label className="editor-form-full">
          Feedback wrong
          <textarea
            value={feedbackWrong}
            onChange={(event) => setFeedbackWrong(event.target.value)}
            placeholder="Wrong feedback"
            rows={2}
          />
        </label>

        {validationErrors.length > 0 && (
          <div className="editor-message error">
            <p>Please fix these fields:</p>
            <ul>
              {validationErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {savedTaskId && (
          <div className="editor-message success">
            <p>{isEditMode ? 'Task updated successfully.' : 'Task saved successfully.'}</p>
            <Link to={`/play/${encodeURIComponent(savedTaskId)}`}>
              Test Task
            </Link>
            <Link to="/editor-library">Go to Editor Library</Link>
          </div>
        )}

        <button className="check-answer-button editor-submit" type="submit">
          {isEditMode ? 'Save Changes' : 'Save Task'}
        </button>
      </form>
    </section>
  );
}
