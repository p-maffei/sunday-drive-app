# Sunday Drive Phase 1 Architecture

**Status:** Planning recommendation; no providers are connected and no Phase 1 capabilities have been implemented.
**Research checked:** November 11, 2026. Provider pricing and terms change; verify them again before choosing a plan or sending production traffic.

## Phase 1 scope boundary

Phase 1 is a native iOS and Android mobile app only. Do not build or extend a web version for Phase 1. The existing web artifact is an earlier prototype; leave it in place but outside this phase rather than deleting it.

## Executive recommendation

Use the existing Expo native app as the only Phase 1 client, and make the shared Express API the only place that calls route, geocoding, and points-of-interest providers. Use the existing OpenAPI/Zod code-generation pattern for a typed contract between the mobile app and API.

For a first provider evaluation, compare:

- **Map rendering:** MapLibre React Native for iOS and Android, with a hosted vector-tile provider such as MapTiler. MapLibre is the renderer, not a source of map data. Keep visible map and data-source attribution.
- **Routing:** Test GraphHopper first because its API documents custom route models, alternative routes, and round trips. Benchmark it against Mapbox Directions before choosing: Mapbox offers traffic-aware driving and up to two alternatives, but alternatives are not guaranteed to be distinctive.
- **Location search and POIs:** Evaluate Geoapify as a single geocoding/POI candidate. Its Places API is based on OpenStreetMap data, offers broad categories, and documents storage of results; confirm the applicable plan and attribution.
- **Scenic and elevation signals:** Use Caltrans’ scenic-highway layer as one limited, named signal—not as a claim that all scenic roads are covered. Prototype elevation sampling against USGS 3DEP/EPQS. Do not score live traffic until a traffic source, SoCal coverage, terms, and cost are confirmed.

These are candidates for a small technical evaluation, not approved purchases. Since no traffic or budget estimate was supplied, do not select a paid tier or request credentials yet.

## What exists today

- The workspace contains an earlier web prototype and an Expo native app. Only the native iOS and Android app is in Phase 1 scope.
- The Express API currently exposes only a health check.
- The database schema has no application tables.
- The mobile form and map are previews: there is no real geocoding, routing, POI data, or persistence.
- The workspace has no connected app-facing maps or routing API integration. A Google Maps Platform MCP connector is listed as available to connect, but is not connected and is not an application API integration.

The user-facing interface should continue to label preview-only parts clearly. Do not show invented routes, scores, traffic, or businesses as if they came from live geographic data.

## Proposed system shape

```text
Sunday Drive mobile app ─ generated typed API client ─ Express API
                                                     ├─ location provider adapter
                                                     ├─ route provider adapter
                                                     ├─ candidate selection + scoring
                                                     ├─ POI provider adapter
                                                     └─ scenic/elevation data adapters
```

The mobile app should own presentation and temporary interaction state: form values, selected route, visible POI categories, and added or removed stops. It should not contain provider secrets or provider-specific route logic.

The API should validate requests at its boundary, call provider adapters, and normalize provider responses into Sunday Drive's own types before returning them to the mobile app. Keep scoring rules independent of any provider so they can be unit tested and improved without changing map or API code.

### Suggested backend modules

- **Geocoding:** Convert a typed location search into selectable place results and coordinates.
- **Routing providers:** Request candidate routes and normalize geometry, distance, duration, road details, and traffic evidence when available.
- **Candidate builder:** Create alternative route candidates, remove near-duplicates, and keep alternatives meaningfully different.
- **Scoring:** Calculate preference-weighted factor scores from available evidence.
- **Places:** Find, categorize, and normalize POIs near or along a candidate route; calculate detour estimates only when the route provider can support them.
- **Data sources:** Load regional scenic-highway data and sample elevation only after those sources pass a coverage, license, and reliability check.

## Phase 1 request and response contract

Use these as conceptual types first; generate the exact TypeScript/Zod types from the API specification when implementation begins.

### Route request

`POST /routes/preview`

- `origin`: selected place label and coordinates.
- `destinationMode`: `destination`, `round_trip`, or `anywhere`.
- `destination`: required only for `destination` mode.
- `durationMinutes`: requested driving-time budget.
- `preferences`: a map of supported preference keys to weights, such as 0–1.
- `stops`: optional ordered POI coordinates added by the user.

Resolve an ambiguous typed place to coordinates before route generation. Do not send raw text to a directions endpoint and silently accept whichever road it snaps to.

### Route response

- `status`: `complete`, `partial`, or a clear error.
- `alternatives`: zero to three normalized candidates, each with:
  - stable response-local `id`, short route character, and GeoJSON `LineString`;
  - `distanceMeters`, `durationSeconds`, and whether it fits the requested time budget;
  - an overall 0–100 drivability score;
  - factor scores, selected weights, evidence/source, and an unavailable state where data is missing;
  - route-linked POIs with category, source, coordinates, and a detour estimate when known.
- `warnings`: any limitations, such as traffic data unavailable, too few distinct alternatives, or a destination outside the supported service area.

The client should be able to select an alternative and add/remove stops. If a stop changes the actual route, send the ordered stops back through the route endpoint; do not merely draw a marker and imply the route was recalculated.

### Location search

`GET /places/suggest?q=...` should return a short list of provider-normalized suggestions. Debounce requests in the clients. The API owns provider credentials and applies sensible rate limits.

## Preference scoring and alternatives

Normalize each usable factor to 0–100. For the selected preferences, calculate:

`overall = sum(factorScore × selectedWeight) / sum(selectedWeight)`

Only include factors with reliable evidence and a positive selected weight. A missing traffic feed is **unavailable**, not a traffic score of zero. An urban-cruise request must not lose points because it has few curves. Show the factor name, score, and a plain-language evidence note so the number is explainable.

Initial factor candidates:

- **Curvature:** derive from route geometry, with careful smoothing so GPS noise does not look like a winding road.
- **Scenic corridors:** proximity or overlap with an authoritative scenic-road dataset; label the dataset and its limits.
- **Road mix:** road classifications and variety, if returned consistently by the chosen routing data source.
- **Elevation change:** sampled elevation gain/loss, not a claim about views.
- **Traffic:** only from a real, time-aware source; say when the feed was checked.
- **Stops:** useful POIs and detour time, based on real provider results.

“Scenic,” “coastal,” “mountain/canyon,” “historic,” and “adventure” are not all directly measurable by a directions API. Treat them as combinations of documented signals and future curated data, not as labels the router magically understands.

Route alternatives from providers are usually alternatives to a fastest or generally optimal route, not guaranteed examples of “coastal,” “winding,” and “backroad” personalities. The application should score and compare candidates, reject near-identical geometry, and return fewer than three when it cannot find genuinely distinct choices. If a provider returns only one route, do not duplicate it under different names.

## Geographic data/provider comparison

| Capability | Candidate | Strengths for Sunday Drive | Limits and cost/terms to check |
|---|---|---|---|
| Native mobile map | MapLibre React Native + hosted vector tiles such as MapTiler | Native iOS and Android rendering; draws route GeoJSON and POI layers while honoring the MapLibre preference. | MapLibre does not include tiles. The official Expo setup says it cannot run in Expo Go; it requires native configuration and a development build. MapTiler’s free plan is described for testing, proof-of-concept, personal, or non-commercial use; commercial plans and request quotas need review. Display required attribution and test the development build early. |
| Routing lead | GraphHopper Directions API | OpenStreetMap-based coverage; supports per-request custom models, alternative routes, round trips, geometry, and optional elevation. Its alternative-route mode is explicitly intended to return routes that are not too similar. | Credit-based pricing. Current docs describe an extra credit for alternatives and a multiplier for round-trip requests; calculate cost from the actual request design and plan. Custom models are flexible but do not themselves guarantee a “scenic” route. Confirm response fields, SoCal road coverage, and commercial terms in a prototype. |
| Routing benchmark | Mapbox Directions API | Supports driving and traffic-aware driving; up to two alternatives may be returned. Traffic profile includes current and historic traffic where supported. | Alternatives may not exist and are described as significantly different but still close in time. Pricing is usage-based and differs by product. Confirm SoCal traffic coverage, account limits, and whether returned data may be shown/cached with a MapLibre-rendered map under current terms. |
| Routing alternative | Google Routes API | Can return up to three alternatives in addition to the default route; strong place and directions ecosystem. | Alternatives are only available without intermediate waypoints. Routes and Places use separate pay-as-you-go SKUs; the current global pricing table lists Routes Essentials with a 10,000-event free cap and a starting tier at $5 per 1,000 events, while traffic-aware Pro features have a different SKU and price. Google map rendering adds separate considerations; review current display, caching, and attribution requirements before combining Google content with MapLibre. |
| Geocoding and POIs | Geoapify Geocoding + Places | Places uses OpenStreetMap data, supports 400+ categories, and documents use with MapLibre. Its current docs describe up to 3,000 Places requests/day on the free plan; the free plan can be used commercially within quota and attribution rules. | Requires a Geoapify key and visible Geoapify/OpenStreetMap attribution where required. Review the credit calculator, feature limits, and current plan before launch. OSM-derived data is subject to its license and provider terms. |
| Open geocoding fallback | Public Nominatim | Useful for learning and low-volume manual testing. | The public service has an absolute maximum of one request per second, no high-volume guarantee, requires identification/attribution, and requires apps to be able to switch providers. Do not make it a production dependency for autocomplete. |
| Open map tiles | OpenStreetMap standard tile server | Easy to understand and useful for a tiny local experiment. | OSM data is free; the public tile servers are not a free production CDN. They are best-effort, have no SLA, require attribution and caching, and may block unsuitable usage. Use a hosted tile provider or host tiles for real usage. |
| Scenic signal | Caltrans Scenic Highway GIS layer | Public layer distinguishes eligible and officially designated California scenic highways; relevant Southern California segments can ground one explainable factor. | This is not a complete scenic-road inventory and “eligible” is not the same as officially designated. Validate geometry freshness, feature license, route matching, and attribution before using it in scores. |
| Elevation | USGS 3DEP / Elevation Point Query Service | USGS describes 3DEP products as free and without use restrictions; EPQS returns elevation for a coordinate. Useful for elevation-change evidence. | Point queries along a long polyline need sampling, latency, caching, and service-limit tests. Elevation change is not the same as scenery. Do not promise coverage or freshness beyond the selected dataset’s documentation. |
| Live traffic | Mapbox traffic-aware routing as first candidate | Could make “low traffic” a real preference and provide congestion evidence. | Validate Southern California coverage, freshness, cost, and terms first. If it is unavailable, show the preference as unavailable or leave it out of the score; never substitute a fabricated value. |

Pricing models above are not a project cost estimate. Before choosing a paid tier, estimate: map sessions and tile requests per user, location-suggestion requests, route-generation requests (including retries and alternatives), POI queries per route, and traffic/elevation calls. Set usage caps and error handling before opening a paid provider account.

## Vehicle profiles vs. Phase 2 accounts

The requirements ask for saved vehicle profiles in Phase 1 but defer accounts to Phase 2. Recommended compromise:

- Keep a small local collection of vehicle profiles on the user's iOS or Android device for Phase 1.
- Support year, make, model, optional trim/nickname/photo, editing, deletion, and selecting one vehicle for a request.
- Explain that profiles are local to that device and will not sync.
- Do not send vehicle details to a route provider or claim they affect recommendations until the product defines vehicle-sensitive routing rules.
- Move profiles to user-owned server storage when authentication and cross-device sync are implemented in Phase 2.

This avoids introducing authentication solely to save a profile. If cross-device access is required from the first release, that decision reverses the recommendation and brings authentication, database ownership, privacy, and account recovery into Phase 1.

## Persistence and database recommendation

Do not add database tables just because PostgreSQL is present in the workspace. The first route response can be ephemeral, and a user's Phase 1 vehicle profiles can be device-local. A database becomes useful when the product needs accounts, synced vehicles, saved routes, user-added content, or an explicitly permitted provider cache.

Conceptual data types to keep clear even before database storage:

- `Place`: normalized name, coordinates, provider identifier, and attribution/source.
- `RouteRequest`: origin, destination mode, time budget, preference weights, and optional ordered stops.
- `RouteAlternative`: geometry, distance, duration, character, and factor evidence.
- `PointOfInterest`: category, coordinates, description/source, and detour information.
- `VehicleProfile`: the local-only fields listed above.

Do not persist route/POI provider content until the chosen provider's caching and storage rights are understood. If a database is added later, model provider provenance and attribution alongside sourced records.

## Beginner-friendly implementation sequence

1. **Native map and provider spike:** First verify a MapLibre React Native development build on iOS and Android, then show a real map, hosted tile style, attribution, and one real geocoded point. Separately build a small server-side routing comparison for known Southern California journeys using GraphHopper and Mapbox; record candidate count, route differences, available metadata, response time, and cost per user action. No production claims.
2. **One real mobile route end-to-end:** Pick one routing provider, submit a real origin/destination from the native app through the API, and draw the returned route on the native map. Include loading, no-route, provider failure, and unsupported-area states.
3. **Route alternatives and scoring:** Add multiple preferences, candidate normalization/diversity filtering, and independently tested score weighting. Use fixtures for cases such as “urban cruise should not be penalized for low curvature” and “missing traffic is unavailable, not zero.”
4. **POIs and stops:** Add category filters, real place descriptions, detour estimates, and route recalculation when stops change.
5. **Vehicle profiles:** Add local profile storage on iOS and Android and vehicle selection. Keep profiles device-local and explain that they do not sync until the account phase.
6. **Regional scoring signals:** Add Caltrans scenic-highway overlap and USGS elevation only after data freshness, attribution, performance, and scoring behavior are validated. Integrate traffic only after provider selection and cost checks.

For each increment, keep the app explicit about which data is live, which factors are unavailable, and which features are not yet implemented.

## Decisions to confirm before implementation

1. **Provider cost ceiling:** What monthly prototype/launch budget is acceptable, and roughly how many route requests per day should the design handle?
2. **“I’ll Go Anywhere” behavior:** Should this make a random-feeling loop that returns to the start, or select a destination and stop somewhere else?
3. **Duration meaning:** Is the selected duration a hard maximum, a target for a round trip, or a flexible range? How should a fixed destination that exceeds it behave?
4. **Vehicle profile portability:** Is device-local storage acceptable until accounts arrive, or is cross-device sync required in Phase 1?
5. **Map workflow:** Is a native development build acceptable for MapLibre, knowing it cannot be tested in Expo Go?

## Sources

Official provider and data documentation reviewed November 11, 2026:

- [Sunday Drive product requirements](../attached_assets/Pasted--Sunday-Drive-Product-Requirements-Product-Overview-Sun_1794435104068.txt)
- [Mapbox Directions API](https://docs.mapbox.com/api/navigation/directions/)
- [Mapbox pricing](https://www.mapbox.com/pricing)
- [Google Routes API: alternative routes](https://developers.google.com/maps/documentation/routes/alternative-routes)
- [Google Maps Platform pricing](https://developers.google.com/maps/billing-and-pricing/pricing)
- [GraphHopper route API](https://docs.graphhopper.com/openapi/routing/postroute)
- [GraphHopper pricing](https://www.graphhopper.com/pricing/)
- [MapLibre React Native: Expo setup](https://maplibre.org/maplibre-react-native/docs/setup/expo/)
- [MapTiler Cloud pricing](https://www.maptiler.com/cloud/pricing/)
- [Geoapify Places API](https://apidocs.geoapify.com/docs/places/places/)
- [Geoapify pricing](https://www.geoapify.com/pricing/)
- [OpenStreetMap Nominatim usage policy](https://operations.osmfoundation.org/policies/nominatim/)
- [OpenStreetMap tile usage policy](https://operations.osmfoundation.org/policies/tiles/)
- [Caltrans scenic-highway GIS layer](https://services1.arcgis.com/0MSEUqKaxRlEPj5g/ArcGIS/rest/services/CA_Scenic_Hwys/FeatureServer)
- [USGS Elevation Point Query Service documentation](https://epqs.nationalmap.gov/v1/docs)

