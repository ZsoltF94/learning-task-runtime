# GitHub Pages Runtime Deployment

This guide deploys only the learning-task Runtime to GitHub Pages.

The Runtime is the hosted page that Unity WebGL opens inside the in-game
iframe overlay:

```text
Unity WebGL on itch.io
-> opens hosted Runtime iframe
-> Runtime loads remote tasks.json
-> Runtime sends TaskResult back with postMessage
```

The current remote task source is:

```text
https://zsoltf94.github.io/learning-task-data/tasks.json
```

## Recommended Repository

Create a new GitHub repository for the hosted Runtime, for example:

```text
learning-task-runtime
```

If the repository is named `learning-task-runtime`, the Runtime URL will be:

```text
https://zsoltf94.github.io/learning-task-runtime/?taskId=test_01
```

## GitHub Pages Setup

In the GitHub repository:

1. Open `Settings`.
2. Open `Pages`.
3. Under `Build and deployment`, set `Source` to `GitHub Actions`.
4. Push this project to the repository.
5. Open the `Actions` tab and wait for `Deploy Runtime to GitHub Pages`.
6. Open the deployed Runtime URL.

The workflow builds with:

```text
VITE_REMOTE_TASKS_URL=https://zsoltf94.github.io/learning-task-data/tasks.json
```

It also sets the correct Vite base path automatically:

```text
/learning-task-runtime/
```

If the repository name is different, the base path is adjusted to that
repository name.

## Local Runtime Build Test

Before pushing, test the Runtime build locally:

```powershell
npm.cmd run build:runtime
```

The output is:

```text
dist-runtime/
```

The Runtime build does not include `public/unity-build`. It only contains the
hosted React Runtime app.

## Unity Template Runtime URL

After GitHub Pages is online, configure the Unity WebGL template or build
config to use the hosted Runtime:

```js
window.LEARNING_TASK_RUNTIME_URL =
  "https://zsoltf94.github.io/learning-task-runtime/";
```

Then the Unity WebGL template can open:

```text
https://zsoltf94.github.io/learning-task-runtime/?taskId=test_01
```

Use the root URL with `?taskId=...` on GitHub Pages. This avoids the direct
`/runtime` request returning a 404 before the SPA fallback loads.

## Smoke Test

Use this order before uploading to itch.io:

```text
1. Open the hosted Runtime URL with taskId=test_01.
2. Confirm the GitHub Pages Runtime shows the remote task.
3. Configure the local Unity WebGL build to use the hosted Runtime URL.
4. Open http://127.0.0.1:5173/unity-build/index.html.
5. Trigger Unity StartTask("test_01").
6. Confirm the hosted Runtime opens inside the Unity overlay.
7. Solve the task.
8. Confirm Unity receives the TaskResult.
9. Only then package and upload the Unity WebGL build to itch.io.
```
