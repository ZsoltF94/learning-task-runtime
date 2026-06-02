# Project Goal: Learning Task SDK for Unity Games

## 1. Product Vision

This project is a prototype for a platform that makes it easy to integrate learning tasks into Unity games.

The core idea is simple:

Developers create learning tasks in a web app.  
Unity games can then open these tasks by passing only a task ID.  
The task appears as a web-based overlay inside or above the game.  
After the player completes the task, the result is sent back to Unity so the game can react.

The Unity developer should not have to build task UI, answer validation, feedback handling, or task rendering manually.

## 2. Main Problem

Developers of educational games currently have to build their own systems for:

- task creation
- task UI
- answer validation
- feedback display
- scoring
- task storage
- Unity integration
- result communication between learning content and gameplay

This costs time and leads to duplicated work across projects.

This platform should solve that by providing a reusable task system that can be connected to Unity with minimal effort.

## 3. Core Product Idea

The platform consists of two main parts:

### Web App

The web app is used to:

- create learning tasks
- edit learning tasks
- test learning tasks
- choose task themes/layouts
- organize tasks
- export/import tasks
- later manage customer accounts and projects

### Unity Integration

Unity should only need to:

- call a task by ID
- open the task overlay
- receive task result events
- react to the result in gameplay

Example:

```text
Unity calls: StartTask("test_01")

Web app opens: TaskOverlay for "test_01"

Player solves task.

Web app sends result back:
{
  "taskId": "test_01",
  "success": true,
  "score": 100,
  "attempts": 1
}
```

Unity can then react, for example:

- open a door
- damage an enemy
- complete a quest
- continue dialogue
- give an item
- update score

## 4. Important Product Principle

Unity should not build the learning task UI.

The task UI belongs to the web app.

Unity only starts tasks and receives results.

This keeps the integration simple for developers and allows task design, layout, and logic to be maintained centrally in the web app.

## 5. Current MVP Goal

The current goal is not the full platform.

The current MVP should prove only this:

A Unity WebGL build can start a learning task by ID.  
The WebGL template opens the hosted task runtime as an in-game overlay.  
The runtime loads the task, shows the player UI, and creates a stable task result.  
The template forwards the result back to Unity so gameplay code can react.

The `/demo` route remains useful, but it is now a development wrapper. The
product path is the custom Unity WebGL template plus the standalone `/runtime`
player.

## 6. Current MVP Flow

The MVP flow should be:

```text
1. User creates a task in the web editor.
2. User saves the task locally.
3. User can view the task in the editor library.
4. User can test the task in the web player.
5. User can test the local wrapper flow on /demo.
6. Unity WebGL uses the custom WebGL template for the product flow.
7. Unity calls StartTask("task_id").
8. The template opens /runtime?taskId=task_id in an iframe overlay.
9. The runtime loads the task from local, remote, or later SaaS data.
10. Player solves the task.
11. TaskResult is created.
12. Runtime sends the result via postMessage.
13. Template forwards the result to Unity SendMessage.
```

## 7. Current MVP Scope

The MVP should include:

- React/Vite/TypeScript web app
- task editor
- task library
- multiple-choice task type
- localStorage persistence
- task player
- task overlay
- simple theme system
- JSON import/export
- task bundle import/export with manifest
- optional read-only remote task source
- Unity bridge preparation
- Unity WebGL iframe integration on `/demo`
- standalone task runtime on `/runtime`
- custom Unity WebGL template runtime overlay
- JavaScript bridge between Unity WebGL and React
- result object creation

## 8. Current Routes

The web app currently uses or should use these routes:

```text
/editor
/editor-library
/play/:taskId
/demo
/runtime
```

### /editor

Used to create new learning tasks.

### /editor-library

Used to view existing tasks, test tasks, delete custom tasks, and import/export task data.

### /play/:taskId

Used to open and test a task directly as a full page.

### /demo

Used as a local development wrapper to embed the Unity WebGL build and test the
game-to-task-overlay integration.

### /runtime

Used as the standalone task player surface. It has no editor navigation and can
be opened directly with:

```text
/runtime?taskId=test_01
```

This is the surface the Unity WebGL template loads inside its in-game iframe
overlay.

## 9. Current Technical State

The project already includes or should include:

- React/Vite/TypeScript app
- local task data model
- task service
- localStorage support
- multiple-choice task player
- task result model
- task themes
- reusable TaskOverlay component
- editor library
- task import/export
- task bundle export/import
- Unity bridge module in the web app
- Unity C# bridge scripts
- Unity WebGL build embedded in `/demo`
- Runtime route for hosted task playback
- Custom Unity WebGL template that opens the Runtime iframe overlay


## 10. Important Architecture Guideline

The current WebGL iframe integration is only the first integration mode.

Long term, this system should also work for real exported Unity games on platforms like:

- Windows
- macOS
- Android
- iOS

Those games will not run inside a React iframe.

For native Unity builds, the future solution will likely use an embedded WebView inside Unity.

Therefore:

- Do not hardcode all task logic to iframe behavior.
- Do not spread `window.parent` logic across UI components.
- Keep iframe/WebGL communication inside bridge code.
- Keep task player and task overlay reusable.
- Keep task data simple and JSON-friendly.
- Keep the task player usable as a standalone web player.
- Do not build WebView integration yet.
- Do not over-engineer future platform support now.

## 11. Future Integration Modes

The platform should eventually support multiple integration modes.

### Mode 1: Unity WebGL in Browser

```text
Unity WebGL Template
  - Unity canvas
  - Runtime iframe overlay above the game
  - postMessage result forwarding to unityInstance.SendMessage
```

This is the current product MVP mode. The `/demo` route is only a development
wrapper for local testing.

### Mode 2: Native Unity Build with WebView

```text
Unity Windows/Mobile App
  - Unity game
  - embedded WebView
    - Task Player / Overlay
```

This is a future mode.

### Mode 3: Offline Task Bundle

The task player and tasks can later be exported as static files:

```text
task-player/
  index.html
  app.js
  styles.css
  tasks.json
  assets/
```

Unity can load them locally.

### Mode 4: Online Task Updates

The game can later check if new task bundles are available, download them, and use them offline afterwards.

## 13. Long-Term Platform Features

These are future goals, not MVP tasks:

- user accounts
- customer logins
- project management
- multiple Unity projects per customer
- team access
- online task storage
- online task updates
- offline task bundles
- AI task generation
- analytics
- customer-specific task libraries
- more task types
- support for other game engines
- payment system

## 14. Not Part of the Current MVP

Do not build these yet unless explicitly requested:

- login
- authentication
- backend
- database
- payment
- AI generation
- analytics
- WebView integration
- complex role system
- multiplayer support
- advanced LMS integration
- large UI redesign
- new UI framework
- large refactoring

## 15. Development Rules

Before implementing larger changes:

1. Read this document.
2. Read `AGENTS.md`.
3. Analyze the current project state.
4. Identify the next smallest useful MVP step.
5. Explain the intended change briefly.
6. Implement only that step.
7. Do not change unrelated files.
8. Do not over-engineer.
9. Keep code readable and modular.
10. Keep code, variables, and comments in English.

## 16. Step-by-Step Workflow

Do not continue with the next implementation step automatically.

After completing one small step:

1. Summarize what changed.
2. Explain how to test it manually.
3. Mention any assumptions.
4. Mention anything that still needs manual testing.
5. Stop and wait for confirmation before continuing.

## 17. Next-Step Workflow for Codex

When asked what to do next, Codex should:

1. Inspect the current project.
2. Compare the current state with the MVP goal.
3. Identify the smallest missing step.
4. Propose the step before implementing if requested.
5. Implement only that step after confirmation.

## 18. Current Priority

The current priority is:

Use the Unity WebGL template as the product integration path. The template
opens the hosted learning-task runtime as an in-game iframe overlay, receives
task results via `postMessage`, and forwards them to Unity.

Completed MVP behavior:

```text
Unity StartTask("test_01")
-> JavaScript bridge receives taskId
-> React opens TaskOverlay
-> If task exists: task is playable
-> If task does not exist: show "Task not found"
-> After completion: create TaskResult
-> React sends TaskResult back to Unity
-> Unity receives result events and can react in gameplay
```

This completed milestone is covered by both the current `/demo` development
flow and the WebGL template runtime-overlay flow.

The reproducible WebGL build workflow is also covered:

```text
Unity WebGL rebuild
-> Custom WebGL template keeps window.unityInstance available
-> React still detects Unity communication
-> Task results still send back to Unity
```

The `/demo` route is a development wrapper for local integration testing. It is
not the long-term product path for external developers.

The Unity project should use the custom WebGL template:

```text
Assets/WebGLTemplates/ReactLearningTaskDemo
```

The active demo build should be exported to:

```text
public/unity-build
```

The active build files should use the `unity-build.*` filename prefix. Older
`ForgottenDemo_Build_42.*` files are legacy backup files.

The next critical MVP milestone is:

```text
Unity WebGL Template
-> Unity calls StartTask(taskId)
-> Template opens Runtime iframe overlay
-> Runtime loads task from VITE_REMOTE_TASKS_URL or later SaaS API
-> Runtime sends TaskResult via postMessage
-> Template forwards TaskResult to unityInstance.SendMessage
-> Unity receives result events and gameplay can react
```

The remote task source is read-only in this MVP. The local editor continues to
save tasks in localStorage. Local custom tasks should override remote tasks with
the same ID so local testing remains predictable.

For the MVP, the template uses the same origin Runtime by default:

```text
/runtime
```

For hosted builds, the template can be configured before startup with:

```text
window.LEARNING_TASK_RUNTIME_URL = "https://your-saas-domain.com/runtime"
```

Later this URL should become the SaaS-hosted runtime URL. The current local
fallback avoids hardcoding a specific dev-server port.

The temporary MVP hosting path for the Runtime is GitHub Pages. The deployment
workflow and manual setup steps are documented in:

```text
docs/GITHUB_PAGES_RUNTIME.md
```

## 19. Current Smoke Test Checklist

Use this checklist after changes that touch the editor, runtime, bridge, Unity
build folder, or WebGL template:

```text
1. Start Vite on http://127.0.0.1:5173.
2. Open /editor-library, edit a task, change answer text, and save.
3. Confirm the editor shows "Task updated successfully."
4. Open /runtime?taskId=test_01.
5. Confirm the task opens without editor navigation.
6. Open /unity-build/index.html.
7. Trigger Unity StartTask("test_01").
8. Confirm the Runtime iframe overlay opens over the Unity canvas.
9. Solve the task.
10. Confirm feedback remains visible after Check Answer.
11. Confirm Unity receives the TaskResult.
12. Close the overlay and confirm Unity input works again.
13. Test /runtime?taskId=missing_task and confirm "Task not found".
```
