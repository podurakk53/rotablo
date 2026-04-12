# Rotablo

Rotablo is an editorial route publishing platform and passive driving companion for car enthusiasts.

V1 is not:

- a turn-by-turn navigation app
- a freeform user route builder
- a background GPS or live-tracking product

V1 is:

- a team-authored route publishing system
- a published-route browsing and route-session experience
- a deterministic advisory warning system built from vehicle profile + static route warning traits

## Canonical Docs

- Product definition: `docs/Rotablo_Product_Definition_v0.md`
- V1 locked decisions: `docs/Rotablo_V1_Locked_Decisions.md`
- Architecture direction: `docs/Rotablo_Application_Architecture_v0.md`
- Canonical data model: `docs/Rotablo_Canonical_Data_Model_v0.md`
- Terminology: `docs/Rotablo_Terminology_Standard_v1.md`
- Editorial workflow: `docs/Rotablo_Editorial_Workflow_v1.md`
- Route warnings system: `docs/Rotablo_Route_Warnings_System_v1.md`
- Cost minimization plan: `docs/Rotablo_Cost_Minimization_Plan_v1.md`
- AI execution protocol: `docs/Rotablo_AI_Execution_Protocol_v1.md`
- Implementation task list: `docs/Rotablo_Implementation_Task_List_v1.md`
- Current work context: `context-pack/current-task.md`

## Canonical Scope Notes

- Only the docs inside this repo are canonical.
- Workspace-level historical docs were moved to `../docs-archive/` to avoid context drift.
- `backend/` is exploratory Fastify + Prisma scaffold, not the active architecture direction.
- `scripts/` is exploratory Excel tooling, not the main product driver.
- V1 cost discipline is `free-first`, `single-project-first`, and `no paid expansion before pilot value is proven`.

## Runtime Model In One Sentence

The team publishes curated routes, the user picks a vehicle, starts or resumes a `routeSession`, optionally plans sideQuests, and the app shows deterministic advisory warnings for that session.
