# Rotablo V2+ Recommendations And Speculative Backlog

**Status**: Speculative only. This is not current-state documentation.

Use this file for optional future directions after the V1 scaffold proves itself. It must not override:

- `docs/Rotablo_V1_Locked_Decisions.md`
- `docs/Rotablo_Application_Architecture_v0.md`
- `context-pack/current-task.md`
- `backend/prisma/schema.prisma`

## What Belongs Here

- V1.1 / V2 candidate features
- Scaling options after real usage appears
- Monetization experiments after core flows work
- Platform expansion ideas after the mobile MVP is stable

## Candidate Themes

- Content delivery improvements such as versioned content updates
- Weather enrichment for planning flows
- Collaborative trip planning
- Personalized recommendations
- Web surface and SEO work
- Monetization experiments
- Advanced scaling patterns such as CQRS, event-driven processing, or service splitting only after real load justifies them

## Guardrails

- Do not read anything here as "current architecture".
- Do not backport GPS/background tracking into V1 because it appeared in older exploratory material.
- Do not introduce more infrastructure before the single API + mobile scaffold proves insufficient.
- Keep future recommendations explicitly staged as `V1.1`, `V2`, or later.

## Historical Note

The earlier long-form exploratory draft was moved to `docs/archive/Rotablo_Additional_Recommendations_legacy.md`.
