# Current Task Context

**Phase:** Pilot route imported, publish validation next

**Active Goal:** Use imported Route 1 as the canonical pilot dataset, lock publish validation on top of real content, then build the public/mobile flow against that dataset.

## Current Reality

- Canonical planning docs now live only under `docs/` in this repo.
- Workspace-root historical docs were moved to `../docs-archive/`.
- `mobile/` remains a useful early client scaffold.
- `backend/` and `scripts/` remain exploratory and are not the active source of truth.
- Cost discipline is `free-first` and `single-project-first` until pilot value is proven.

## Immediate Priorities

1. Keep the canonical docs and task list aligned before writing new code.
2. Lock T5 publish validation against the imported `R01` pilot route.
3. Keep `R01` as the reference dataset for route detail, map markers, warning derivation, and vehicle compatibility.
4. Build public route browsing after publish validation rules are in place.
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
