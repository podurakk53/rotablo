# Rotablo Data Model Quick Context

Use `../docs/Rotablo_Canonical_Data_Model_v0.md` as the canonical source.

## Quick Summary

- Editorial content: `route`, `stage`, `sideQuest`, `hazardProfile`
- Runtime core: `vehicleProfile`, `routeSession`, `budgetScenario`, `stageCompletion`
- Runtime session model: `routeSession` only
- Route warnings are derived from hazard traits and selected vehicle profile; they are not driven by live weather data
- Old `tripPlan`, `tripSelection`, `savedRoute`, and XP-ledger-style runtime models are not canonical

## Implementation Guardrails

- `route.status` = `draft` | `published` | `archived`
- `routeSession.status` = `active` | `incomplete` | `completed`
- `completionSource` = `manual`
- V1 allows at most one open `active` or `incomplete` session per `userId + routeId`
- `plannedSideQuestIds` is a planning helper, not a binding inclusion rule
