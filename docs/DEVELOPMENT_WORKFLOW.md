# Block Quest — Development Workflow

Mandatory for every new chat and every task.

## Steps

1. **Inspect** the current project and its actual files.
2. **Read** the permanent rule (`.cursor/rules/00-block-quest-core.mdc`) and relevant docs.
3. **Read** `docs/CURRENT_STATUS.md` and `docs/DEVELOPMENT_ROADMAP.md`.
4. **Identify** current phase, completed/incomplete tasks, bugs, dependencies, next logical task.
5. **Explain briefly** what will change before implementing.
6. **Implement** only the requested task or next approved milestone.
7. **Run** relevant tests or checks.
8. **Inspect** changes for regressions and unnecessary modifications.
9. **Update** `CURRENT_STATUS.md`, `CHANGELOG.md`, `DEVELOPMENT_ROADMAP.md`, and `DECISIONS.md` when needed.
10. **Provide** a completion report (see below).

## Completion Report Format

1. What was implemented
2. Files created
3. Files modified
4. Tests executed
5. Actual test results
6. Known bugs or limitations
7. Anything requiring a product decision
8. The exact next development task

## Rules

- Never mark a phase complete unless acceptance criteria are satisfied.
- Never invent test results or claim unverified success.
- Local `npm` / Vitest / Vite commands are allowed.
- Never push, publish, store-submit, or purchase services.
- Prefer small, reviewable commits only when the user requests commits.
