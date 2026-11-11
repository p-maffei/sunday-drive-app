---
name: Sunday Drive Phase 1 scope
description: The platform scope for Sunday Drive's first product phase.
---

Phase 1's user-facing route-planning experience is native iOS and Android only. Keep the existing web app, and design the shared API so it can use the same route generation and scoring logic; do not build a separate web route-planning experience in Phase 1.

**Why:** The user specified a mobile-only Phase 1, then asked for the existing web app to reuse the same route and scoring services.

**How to apply:** Implement and validate Phase 1 screens on the Expo iOS/Android app. Keep route generation and scoring in the shared API/domain layer so the React web app can call the same contract later. Do not delete the existing web app.
