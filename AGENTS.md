# Project Coding Rules

## Main Goal

Build a clean, simple, scalable web app that can later communicate with Unity.
Prioritize readable, maintainable code over clever or overly abstract solutions.

## General Principles

- Write code that is easy to understand for a junior developer.
- Prefer simple, explicit code over complex abstractions.
- Avoid unnecessary dependencies.
- Keep files small and focused.
- Do not mix UI logic, business logic, API logic, and data storage logic.
- Every change must fit into the existing project structure.
- Do not rewrite large parts of the project unless explicitly asked.

## Architecture

- Use a modular structure.
- Separate the project into clear layers:
  - UI / components
  - API / server routes
  - services / business logic
  - data models / DTOs
  - utilities / helpers
- Business logic must not depend directly on the UI.
- Shared logic should be reusable by future systems, including Unity.
- Keep Unity compatibility in mind:
  - Prefer simple JSON data structures.
  - Avoid frontend-only assumptions in core logic.
  - Keep API responses predictable and documented.
  - Use clear request and response models.

## Dependencies

- Add new dependencies only when clearly necessary.
- Before adding a dependency, explain why it is needed.
- Prefer built-in language/framework features.
- Avoid large libraries for small tasks.
- Do not add dependencies that make the project harder to deploy or understand.

## Naming

- Use clear, descriptive English names.
- Avoid vague names like `data`, `thing`, `stuff`, `manager` unless truly appropriate.
- Functions should describe what they do.
- Components, services, and models should have consistent names.

## Functions

- Functions should do one clear thing.
- Keep functions short where possible.
- Avoid deeply nested code.
- Prefer early returns over large if/else blocks.
- Do not duplicate logic. Extract reusable logic into helpers or services.

## Comments

- Comment why something exists, not what obvious code does.
- Add comments for:
  - non-obvious logic
  - temporary decisions
  - API contracts
  - Unity compatibility decisions
  - important edge cases
- Do not over-comment simple code.
- Keep comments short, useful, and up to date.

## Error Handling

- Handle expected errors explicitly.
- Do not silently ignore errors.
- Return clear error messages from APIs.
- Never expose sensitive internal error details to the frontend.
- Use consistent error response formats.

## API Design

- APIs should be simple and predictable.
- Use clear endpoint names.
- Use JSON for requests and responses.
- Keep response structures stable.
- Document request and response shapes with comments or types.
- Design APIs so Unity can call them later without needing browser-specific behavior.

## Scalability

- Structure the app so features can be added without rewriting existing code.
- Avoid hardcoding values that are likely to change.
- Put configurable values in one clear place.
- Keep domain logic independent from the current UI.
- Do not optimize prematurely, but avoid obviously inefficient solutions.

## Testing and Validation

- Validate user input before processing it.
- Add small tests or testable functions when practical.
- For every feature, consider:
  - empty input
  - invalid input
  - missing data
  - unexpected API failure
- After changes, check that the app still starts and the affected feature works.

## Codex Workflow

Before implementing:
- Briefly explain the intended change.
- Identify the files that likely need changes.
- Keep the implementation as small as possible.

During implementation:
- Make focused changes.
- Do not change unrelated files.
- Do not rename or restructure files unless necessary.
- Preserve existing behavior unless explicitly asked to change it.

After implementation:
- Summarize what changed.
- Mention any assumptions.
- Mention anything that still needs manual testing.
- Mention any technical debt created.

For the MVP, prefer local-first development:
- Use local JSON files and localStorage before adding a backend.
- Do not introduce a server/API until the feature clearly requires it.
- Keep the task player independent, so it can later run both online and offline inside Unity.
- The task result format must stay stable and Unity-friendly.