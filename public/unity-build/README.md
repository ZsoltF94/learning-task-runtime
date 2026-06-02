# Unity WebGL Build

This folder contains the active Unity WebGL build used for local WebGL product
path testing.

There are two WebGL test paths:

- `/demo` embeds this build inside the React app as a development wrapper.
- `/unity-build/index.html` runs the Unity build directly and uses the custom
  WebGL template to open the Runtime iframe overlay.

Build the Unity project to:

```text
C:\Users\zsolt\source\Exercise builder web app\public\unity-build
```

Expected output structure:

```text
public/unity-build/
  index.html
  Build/
  TemplateData/
```

The active MVP build uses files named:

```text
Build/unity-build.loader.js
Build/unity-build.data
Build/unity-build.framework.js
Build/unity-build.wasm
```

The older `ForgottenDemo_Build_42.*` files are legacy backup files and are not
the active demo build.

The Unity project uses the custom WebGL template
`Assets/WebGLTemplates/ReactLearningTaskDemo`. That template contains the
learning-task bridge setup:

- `window.unityInstance = unityInstance`
- `learningTaskUnityInstanceReady` is dispatched to `window.parent`
- `window.openLearningTask(taskId)` opens the Runtime iframe overlay when the
  WebGL build runs without a React wrapper
- Runtime `postMessage` task results are forwarded to
  `LearningTaskBridge.ReceiveTaskResult`

These lines allow the Runtime to send task results back to Unity after each
build.

For the current itch.io MVP test, the template Runtime URL defaults to:

```text
https://zsoltf94.github.io/learning-task-runtime/
```

That hosted Runtime loads task data from:

```text
https://zsoltf94.github.io/learning-task-data/tasks.json
```

For pure local development, override the template before startup:

```text
window.LEARNING_TASK_RUNTIME_URL = "/runtime"
```

For future hosted SaaS builds, set this before the template opens tasks:

```html
<script>
  window.LEARNING_TASK_RUNTIME_URL = "https://your-saas-domain.com/runtime";
</script>
```

Later this should point to the SaaS-hosted Runtime URL.

For local testing, use a Unity WebGL build with compression disabled unless the
dev server is configured to serve `.br` or `.gz` files with the correct
`Content-Encoding` headers.

After rebuilding Unity, hard reload both relevant local test pages:

```text
http://127.0.0.1:5173/demo
http://127.0.0.1:5173/unity-build/index.html
```

Smoke test checklist:

```text
1. Start Vite on http://127.0.0.1:5173.
2. Open /runtime?taskId=test_01 and confirm the local Runtime opens.
3. Open /unity-build/index.html.
4. Trigger Unity StartTask("test_01").
5. Confirm the hosted Runtime iframe overlay opens above the Unity canvas.
6. Click Check Answer.
7. Confirm feedback remains visible.
8. Confirm Unity receives the TaskResult.
9. Close the overlay and confirm Unity input works again.
10. Test missing_task and confirm "Task not found".
```
