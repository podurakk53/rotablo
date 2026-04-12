# Rotablo Project Context

This is the short canonical brief for the repo.

When documents or code disagree, use the current canonical docs first. The existing codebase still contains exploratory scaffolds from an older architecture direction.

## Source Of Truth

- `docs/Rotablo_Product_Definition_v0.md`
- `docs/Rotablo_V1_Locked_Decisions.md`
- `docs/Rotablo_Application_Architecture_v0.md`
- `docs/Rotablo_Canonical_Data_Model_v0.md`
- `docs/Rotablo_Terminology_Standard_v1.md`
- `docs/Rotablo_Editorial_Workflow_v1.md`
- `docs/Rotablo_Route_Warnings_System_v1.md`
- `docs/Rotablo_Cost_Minimization_Plan_v1.md`
- `docs/Rotablo_AI_Execution_Protocol_v1.md`
- `docs/Rotablo_Implementation_Task_List_v1.md`
- `context-pack/current-task.md`

## Product Core

Rotablo is an editorial route publishing platform and passive driving companion.

The team creates curated routes. Users discover those routes, choose a vehicle profile, create a `routeSession`, review static advisory warnings, and manually track completion.

## Locked V1 Direction

- Admin-authored routes, not freeform user route building
- `routeSession` as the only active/incomplete/completed runtime model
- optional sideQuest planning with static map visibility and external navigation handoff
- Passive companion, not active GPS navigator
- Deterministic warnings, not opaque smart AI advice
- Static route warnings, not live weather tracking
- Supabase-first architecture, not custom backend-first
- Free-first and single-project-first cost discipline
- Turkey-first content scope

## Reality Check

- `backend/` is exploratory and not the canonical architecture direction.
- `scripts/` is exploratory and Excel is a reference source, not the main product driver.
- Workspace-level historical docs were moved to `../docs-archive/` to avoid context drift.
