---
name: Sunday Drive Phase 1 scope
description: The platform scope for Sunday Drive's first product phase.
---

Phase 1's user-facing experience is native iOS and Android only. The immediate milestone is a drive-planner page: collect locations, trip options, duration, road preferences, vehicle details, and explain the future preference-match score. Page 1 must not show or load a map. Route discovery is a later separate page; defer maps, routes, and POI data until that milestone. Keep the existing web app and the shared API architecture plan as references for future reuse; do not build a separate web route-planning experience.

**Why:** The user changed the immediate development focus to a planner-first mobile experience and explicitly deferred the map and route-discovery functionality.

**How to apply:** Build the planner UI and basic navigation in the Expo iOS/Android app first. Keep controls interactive with local React state; do not add external services, persistence, or route generation. Preserve the architecture document for a later route-discovery milestone and do not delete the existing web app.
