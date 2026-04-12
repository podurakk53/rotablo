# Current Task Context

**Phase:** Auth and RLS completed, editorial bootstrap next

**Active Goal:** Move from platform setup into real editorial bootstrap: enter the first pilot route, validate publish readiness, then build the public/mobile flow on top of the locked Supabase boundary.

## Current Reality

- Canonical planning docs now live only under `docs/` in this repo.
- Workspace-root historical docs were moved to `../docs-archive/`.
- `mobile/` remains a useful early client scaffold.
- `backend/` and `scripts/` remain exploratory and are not the active source of truth.
- Cost discipline is `free-first` and `single-project-first` until pilot value is proven.

## Immediate Priorities

1. Keep the canonical docs and task list aligned before writing new code.
2. Bootstrap editorial data entry next: `route`, `stage`, `sideQuest`, `hazardProfile`.
3. Prove that one real pilot route can be entered and kept publish-ready in Supabase Studio.
   Use `docs/Rotablo_Pilot_Content_Entry_Runbook_v1.md` as the operational entry order.
4. Build public route browsing after editorial data entry works.
5. Build `routeSession` start / resume / planning flow before warning implementation.
6. Build the static route warning system only with the locked trait set and compatibility rules.
7. Keep the implementation on the cost-minimizing path: one Supabase project, Studio-first admin, minimal media.

## Do Not Reintroduce

- old `tripPlan` / `tripSelection` model
- separate `savedRoute` runtime object
- user-generated route builder as a V1 core feature
- GPS tracking, geofence, or background weather polling
- Fastify-first or microservice-first architecture
- Excel-first product thinking

## Canonical Docs

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
