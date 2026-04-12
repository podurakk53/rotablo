# Rotablo AI Execution Protocol v1

## Why This Exists

Rotablo is being built by non-coder founders with AI assistance.

The biggest risk is not slow delivery. The biggest risk is fast implementation on top of the wrong context.

## Roles

- **Founders**: define intent, approve direction, make final product calls
- **Codex**: primary orchestrator, critic, implementer, and consistency guard
- **Other AI tools**: bounded helpers only

## Source-Of-Truth Rule

- Only docs inside this repo are canonical.
- Use `docs/` in this repo plus `context-pack/current-task.md`.
- Ignore `../docs-archive/` unless historical comparison is explicitly requested.
- Ignore `docs/archive/` unless historical comparison is explicitly requested.
- If code and docs disagree, planning follows the canonical docs first.

## Hard Rules

- one bounded task at a time
- no feature build from ambiguous prompts
- no silent architecture pivot
- if product behavior changes, docs are updated in the same cycle
- if a task depends on thresholds, enums, or lifecycle rules, those must be locked before implementation

## Task Template

Every implementation task should answer these four questions:

1. Which admin or public user behavior is being added?
2. Which canonical doc controls that behavior?
3. What is explicitly out of scope?
4. What are the acceptance criteria?

## Good Task Example

"Implement published route detail using the canonical `route`, `stage`, and `sideQuest` fields. Editing, route warnings, and completion are out of scope. Acceptance: route name, summary, ordered stage list, and side quest list render from mock data."

## Bad Task Example

"Build the planner."

## Working Loop

1. Founders state intent.
2. Codex pressure-tests ambiguity.
3. If needed, canonical docs are updated.
4. A bounded task is written.
5. Implementation happens.
6. Behavior is verified.
7. Docs are re-synced if the behavior changed.
