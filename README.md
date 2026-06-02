# Exercise Builder Web App

Local-first MVP for creating, testing, importing, exporting, and playing simple learning tasks. The current app is prepared for a later Unity integration through a browser-side bridge and Unity-friendly task bundle JSON.

## Current Capabilities

- Create and edit multiple-choice learning tasks.
- Browse tasks in the Editor Library by subject and topic.
- Play tasks directly or in an overlay.
- Import and export plain task JSON files.
- Export and import offline task bundles with a manifest and all tasks.
- Optionally load read-only tasks from a remote JSON URL.
- Open a task through the demo Unity bridge with `window.openLearningTask("example-task")`.
- Run a lightweight task runtime without editor UI at `/runtime`.
- Test the WebGL product path through the custom Unity WebGL template at `/unity-build/index.html`.

## Local Development

```bash
npm install
npm run dev
```

Build the production bundle:

```bash
npm run build
```

Build the hosted Runtime bundle for GitHub Pages:

```bash
npm run build:runtime
```

Optional remote task source:

```bash
VITE_REMOTE_TASKS_URL=https://your-name.github.io/learning-task-data/tasks.json npm run dev
```

On Windows PowerShell:

```powershell
$env:VITE_REMOTE_TASKS_URL="https://your-name.github.io/learning-task-data/tasks.json"
npm run dev
```

Remote tasks use the same JSON shape as exported task arrays. They are loaded
as read-only data at app start. Local editor tasks still stay in `localStorage`
and override remote tasks with the same ID for local testing.

## Routes

- `/editor` - create a new task.
- `/editor/:taskId/edit` - edit an existing task.
- `/editor-library` - browse, test, delete, import, and export tasks.
- `/play/:taskId` - play a task directly.
- `/demo` - test the Unity bridge overlay flow in a React development wrapper.
- `/runtime` - isolated task runtime for SaaS-hosted player testing.
- `/unity-build/index.html` - direct Unity WebGL template test path.

## App Roles

The editor/admin routes are used to create and manage tasks. The `/demo` route
is a local Unity WebGL integration test with an embedded Unity iframe. The
`/runtime` route is the small player surface intended to become the hosted SaaS
runtime: it has no editor navigation and can be tested directly with:

```text
/runtime?taskId=test_01
```

The runtime still uses the same bridge contract as the demo. Unity opens tasks
with `window.openLearningTask(taskId)`, and completed results use the same
Unity-friendly JSON shape.

Runtime deployment to GitHub Pages is documented in
[docs/GITHUB_PAGES_RUNTIME.md](docs/GITHUB_PAGES_RUNTIME.md).

The direct WebGL product-path test is:

```text
/unity-build/index.html
```

In that path, Unity is not wrapped by the React demo page. The custom Unity
WebGL template opens `/runtime?taskId=...` inside an iframe overlay and forwards
Runtime `postMessage` results to `unityInstance.SendMessage`.

## Unity Bridge Interface

Unity or browser JavaScript can open a task through the global function:

```ts
window.openLearningTask(taskId: string)
```

Example:

```js
window.openLearningTask("example-task");
```

When the task is completed, the bridge prepares this JSON-compatible result:

```ts
interface TaskResultMessage {
  taskId: string;
  success: boolean;
  score: number;
  attempts: number;
}
```

The bridge serializes the result with `JSON.stringify(result)`. If `window.unityInstance.SendMessage` is available, the prepared payload is sent to:

```text
GameObject: LearningTaskBridge
Method: ReceiveTaskResult
Payload: {"taskId":"example-task","success":true,"score":100,"attempts":1}
```

If no Unity instance is available, the same payload is logged in the browser console for MVP testing.

## MVP Workflow

1. Open `/editor` and create a task.
2. Go to `/editor-library` to browse and test tasks.
3. Use `Export Custom Tasks` or `Export All Tasks` for plain JSON.
4. Use `Export Task Bundle` to create an offline bundle with a manifest and all tasks.
5. Use `Import Tasks` to import either a plain task array or a task bundle.
6. Open `/runtime?taskId=test_01` to test the standalone Runtime.
7. Open `/demo` to test the local React wrapper flow.
8. Open `/unity-build/index.html` to test the custom Unity WebGL template flow.
