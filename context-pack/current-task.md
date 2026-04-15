# Current Task Context

**Phase:** Core V1 companion loop implemented, hardening next

**Active Goal:** Harden the now-working pilot loop, keep docs aligned, and decide the next persistence / cleanup / push slice.

## Current Reality

- Canonical planning docs now live only under `docs/` in this repo.
- Workspace-root historical docs were moved to `../docs-archive/`.
- `mobile/` remains a useful early client scaffold.
- `backend/` and `scripts/` remain exploratory and are not the active source of truth.
- Cost discipline is `free-first` and `single-project-first` until pilot value is proven.

## Immediate Priorities

1. Keep the canonical docs and task list aligned before writing new code.
2. Keep `R01` as the reference dataset for routeSession planning, warning derivation, and vehicle compatibility.
3. Keep the new Garage flow on the locked path: curated vehicle reference dataset plus manual fallback.
4. Decide which local runtime pieces should move to Supabase persistence next.
5. Add editorial timestamps and small validation tightenings in parallel, not as blockers.
6. Document stale session array cleanup and generalize the route import pipeline before Route 2.
7. Keep the warning system deterministic and tied only to the locked hazard trait set.
8. Keep the implementation on the cost-minimizing path: one Supabase project, Studio-first admin, minimal media.

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
