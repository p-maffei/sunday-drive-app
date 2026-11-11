# Sunday Drive Phase 1 Architecture

**Status:** Planning recommendation; no providers are connected and no Phase 1 capabilities have been implemented.
**Research checked:** November 11, 2026. Provider pricing and terms change; verify them again before choosing a plan or sending production traffic.

## Phase 1 scope boundary

The Phase 1 user-facing product is the native iOS and Android mobile app. Do not build new web route-planning screens in this phase. Keep the existing web app and design the shared API so it can use the same route and scoring services without implementing a second copy of the product.

## Executive recommendation

Use MapLibre React Native for the native map and MapLibre GL JS for the existing React web app if/when it is wired to real map data. Both render the same GeoJSON route results and can use a compatible hosted vector-tile style. Keep the Phase 1 UI mobile-only, but expose one provider-independent, typed route API for both clients.

Make the shared Express API the only place that calls routing, geocoding, POI, traffic, or elevation services. Put route-candidate selection and drivability scoring in one TypeScript domain module used by the API—not separately in either client. Use the existing OpenAPI/Zod code-generation pattern for the API contract. Use PostgreSQL for versioned regional data and, when needed, route/POI persistence; clients never connect to the database directly.

For a first provider evaluation, compare:

- **Map rendering:** MapLibre React Native for iOS and Android, with a hosted vector-tile provider such as MapTiler. MapLibre is the renderer, not a source of map data. Keep visible map and data-source attribution.
- **Routing:** Evaluate TomTom Routing first as a hosted candidate because it supports traffic-aware driving and up to five alternative routes, with a “thrilling” route type. Benchmark it against GraphHopper for custom route models/round trips and Mapbox for traffic-aware alternatives before choosing; no provider guarantees that every requested route character will be available.
- **Location search and POIs:** Evaluate Geoapify as a single geocoding/POI candidate. Its Places API is based on OpenStreetMap data, offers broad categories, and documents storage of results; confirm the applicable plan and attribution.
- **Scenic and elevation signals:** Use Caltrans’ scenic-highway layer as one limited, named signal—not as a claim that all scenic roads are covered. Prototype elevation sampling against USGS 3DEP/EPQS. Do not score live traffic until a traffic source, SoCal coverage, terms, and cost are confirmed.

These are candidates for a small technical evaluation, not approved purchases. Since no traffic or budget estimate was supplied, do not select a paid tier or request credentials yet.

## What exists today

- The workspace contains a React web app and an Expo native app. The Phase 1 interface is mobile-only; the web app remains a compatible client of the shared API, not a separate route/scoring implementation.
- The Express API currently exposes only a health check.
- The database schema has no application tables.
- The mobile form and map are previews: there is no real geocoding, routing, POI data, or persistence.
- The workspace has no connected app-facing maps or routing API integration. A Google Maps Platform MCP connector is listed as available to connect, but is not connected and is not an application API integration.

The user-facing interface should continue to label preview-only parts clearly. Do not show invented routes, scores, traffic, or businesses as if they came from live geographic data.
The current illustrated map is only a design preview and does not satisfy this Phase 1 requirement. Replace it with an interactive, provider-backed map before presenting route discovery as implemented. Do not fall back to sample polylines or mock place pins when a provider fails; show an honest error or unavailable state.

## Proposed system shape

```text
Sunday Drive mobile app ─┐
                         ├─ generated typed API client ─ Express API ─ shared route + scoring engine
Sunday Drive web app ────┘                                  ├─ routing / geocoding / POI providers
                                                            ├─ traffic / elevation / regional data
                                                            └─ PostgreSQL repository
```

The mobile app and web app own presentation and temporary interaction state: form values, selected route, visible POI categories, and added or removed stops. Neither client contains provider secrets or provider-specific route logic. In Phase 1, implement the user-facing route flow only in the mobile app; the web client can later call the same API contract.

The API validates requests, calls provider adapters, normalizes responses into Sunday Drive's own types, and returns the same response shape to either client. Keep the scoring rules independent of providers so they can be tested and improved without changing map or API code.

### Suggested backend modules

- **Geocoding:** Convert a typed location search into selectable place results and coordinates.
- **Routing providers:** Request candidate routes and normalize geometry, distance, duration, road details, and traffic evidence when available.
- **Candidate builder:** Create alternative route candidates, remove near-duplicates, and keep alternatives meaningfully different.
- **Scoring:** Calculate preference-weighted factor scores from available evidence.
- **Places:** Find, categorize, and normalize POIs near or along a candidate route; calculate detour estimates only when the route provider can support them.
- **Data sources:** Load regional scenic-highway data and sample elevation only after those sources pass a coverage, license, and reliability check.

## One route engine shared by both apps

The route and score are server-side domain behavior. The mobile app and web app send the same versioned request and render the same normalized response; they do not run their own route algorithms. A small shared TypeScript package (for example, `lib/drive-domain`) should hold provider-neutral request/result types and pure scoring functions. Express orchestrates providers and persistence around that package. This keeps the scoring logic portable to an ordinary Node.js service outside Replit.

One request should follow this order:

1. Validate the origin, destination mode, duration, and preference weights.
2. Resolve locations to coordinates through the selected geocoder.
3. Ask the selected routing provider for drivable route candidates.
4. Normalize the returned road geometry and available road details; remove duplicate or nearly identical candidates.
5. Load permitted regional signals and real POIs, then calculate explainable factor scores.
6. Return alternatives, geometry, POIs, evidence, and warnings through the shared API.

PostgreSQL stores data and provenance; it does not calculate routes or scores. Keep provider adapters behind interfaces so a later switch from a hosted service to self-hosted Valhalla does not require rewriting either app. Do not store third-party content beyond its license or caching rules.

### Suggested persistent data

- **`scenic_corridors`** — versioned Caltrans/other regional source geometry, designation, source URL, import date, and attribution.
- **`scoring_profiles`** — versioned factor definitions and default weights, so an explanation can identify which scoring rules were used.
- **`route_sessions` / `route_alternatives`** — optional short-lived records only if session recovery or debugging requires them; attach expiry and provider provenance.
- **`poi_cache`** — only if the chosen POI provider permits storage; include external ID, category, source, attribution, last-checked time, and expiry.
- **Vehicle profiles** — keep on-device in Phase 1 unless the user decides to introduce accounts and server sync early.

Use standard PostgreSQL/Drizzle structures first. Store route lines as GeoJSON or encoded provider geometry with source metadata. Add PostGIS only if the selected database supports it and spatial query needs justify the extra setup. Never persist raw provider results by default.

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
| Map rendering | MapLibre React Native on mobile; MapLibre GL JS in the existing React web app; one MapLibre-compatible style/tile source | Both renderers support vector styles and GeoJSON route lines/POI layers. The clients share route data and a compatible style while keeping platform-specific map controls. The existing web placeholder can later be replaced with GL JS and call the same API. MapLibre is open-source and independent of the route provider. | They are separate rendering libraries, not one cross-platform UI component. The React Native package cannot run in Expo Go and needs a native development build. MapLibre does not include tiles; test the selected style on both renderers and keep required attribution visible. |
| Hosted map tiles | MapTiler Cloud (candidate) | Provides hosted vector tiles and styles compatible with MapLibre, avoiding tile-server operations at the start. | Its free plan is described for testing, proof-of-concept, personal, or non-commercial use. Commercial use and quotas require an appropriate plan. Estimate tile usage and check the current price before launch. |
| Routing lead | TomTom Routing API | Supports driving routes, real-time traffic-aware routing, and requests for up to five alternative routes. Its route types include `thrilling`, which is a useful candidate for enjoyable driving. | Fewer alternatives may be returned; routes are not guaranteed to match every Sunday Drive preference. `thrilling` is a provider behavior, not an explainable drivability score. Confirm SoCal coverage, route geometry/detail fields, terms, attribution, and current request limits. |
| Routing benchmark | GraphHopper Directions API | OpenStreetMap-based coverage; supports custom models, alternative routes, round trips, geometry, and optional elevation. Its alternative-route mode is designed to avoid overly similar choices. | Credit-based pricing. Current docs describe an extra credit for alternatives and a multiplier for round-trip requests. Custom models do not themselves guarantee a scenic route. Confirm SoCal road coverage and commercial terms with a small prototype. |
| Routing benchmark | Mapbox Directions API | Supports driving and traffic-aware driving; up to two alternatives may be returned. Traffic profile includes current and historic traffic where supported. | Alternatives may not exist and are described as significantly different but still close in time. Pricing is usage-based and differs by product. Confirm SoCal traffic coverage, account limits, and whether returned data may be shown/cached with a MapLibre-rendered map under current terms. |
| Routing alternative | Google Routes API | Can return up to three alternatives in addition to the default route. | Alternatives are only available without intermediate waypoints. Routes and Places use separate pay-as-you-go SKUs; the current global pricing table lists Routes Essentials with a 10,000-event free cap and a starting tier at $5 per 1,000 events, while traffic-aware Pro features have a different SKU and price. Review display, caching, and attribution requirements before combining Google content with MapLibre. |
| Road geometry and classification | OpenStreetMap-based road data through the routing provider | Route geometry supports a curvature measure derived by Sunday Drive; road-class details can help distinguish highways, local roads, and other classes. This makes road-derived features testable without a separate “scenic score” API. | OSM coverage and attribute completeness vary by road. Keep ODbL attribution and review share-alike implications for any derived database. Do not infer surface or road class when the provider does not return it. |
| Geocoding and POIs | Geoapify Geocoding + Places (candidate) | Places uses OpenStreetMap data, supports 400+ categories, and documents use with MapLibre. Categories can cover restaurants/cafés, viewpoints, historic places, parks, beaches, and attractions where mapped. | Current free plan is 3,000 credits/day; calls can consume different credit amounts based on result count/features. Free commercial use requires quota compliance and attribution. OSM-derived POI completeness and business hours/descriptions can be uneven. |
| Open geocoding fallback | Public Nominatim | Useful for learning and low-volume manual testing. | The public service has an absolute maximum of one request per second, no high-volume guarantee, requires identification/attribution, and requires apps to be able to switch providers. Do not make it a production dependency for autocomplete. |
| Open map tiles | OpenStreetMap standard tile server | Easy to understand and useful for a tiny local experiment. | OSM data is free; the public tile servers are not a free production CDN. They are best-effort, have no SLA, require attribution and caching, and may block unsuitable usage. Use a hosted tile provider or host tiles for real usage. |
| Scenic signal | Caltrans Scenic Highway GIS layer | Public layer distinguishes eligible and officially designated California scenic highways; relevant Southern California segments can ground one explainable factor. | This is not a complete scenic-road inventory and “eligible” is not the same as officially designated. Validate geometry freshness, feature license, route matching, and attribution before using it in scores. |
| Elevation | USGS 3DEP / Elevation Point Query Service | USGS describes 3DEP products as free and without use restrictions; EPQS returns elevation for a coordinate. Useful for elevation-change evidence. | Point queries along a long polyline need sampling, latency, caching, and service-limit tests. Elevation change is not the same as scenery. Do not promise coverage or freshness beyond the selected dataset’s documentation. |
| Live traffic | TomTom routing/traffic data; Mapbox traffic-aware routing as benchmark | Traffic-aware routing or traffic-flow data can support a real “low traffic” factor when the provider returns time-stamped evidence for the route. | Traffic data is time-sensitive and may cost more than basic routing. Validate SoCal coverage, freshness, terms, and request costs. If unavailable, mark the factor unavailable rather than substituting a fabricated value. |

### Cost and free-tier comparison

Provider prices and quotas below are a planning snapshot checked November 11, 2026, not a quote. Prices are USD where stated. Usage is per provider/service; map tiles, route calls, and POI calls are usually billed separately.

| Option | Free usage or price model | Main limitation |
|---|---|---|
| MapLibre | Open-source renderers; no per-map SDK fee. | Hosted tiles still cost money or need self-hosting. MapLibre React Native requires a native development build rather than Expo Go. |
| MapTiler tiles | Free tier is positioned for testing/prototypes/personal or non-commercial use; paid plans scale by usage. | Do not assume the free tier covers a commercial launch. Map viewing creates tile requests; estimate from real app behavior. |
| TomTom Routing and Maps | Pricing page currently lists 20,000 free monthly requests for the Routing API and separate free monthly allowances for other APIs; usage-based pricing beyond the free tier. | Confirm the exact SKU, traffic add-ons, and limits for the selected Orbis/Maps API version. Alternative routes and traffic change the response and may affect the billed product. |
| GraphHopper | Free plan available; paid plans use credits. A basic 2–10-location route is 1 credit; alternative-route adds 1 credit; round-trip requests multiply cost by 2. | More alternatives, route length, and traffic/elevation needs can change per-session cost. Check the current plan's daily limit and price per credit. |
| Mapbox | Usage-based pricing with free allowances that differ by Directions, Search, map tiles, and mobile MAU products. | Do not use one product's free allowance to estimate another. Read the current Directions and map pricing pages for the exact request volume and terms. |
| Google Routes / Places | Routes Essentials currently lists 10,000 monthly billable events free, then a starting global tier of $5 per 1,000 events; Pro/traffic features have different SKUs. Places and map usage are billed separately. | The requested fields determine the SKU. Alternative routes require no intermediate waypoints. Costs can rise when separate route, Places, and map services are combined. |
| Geoapify | Free tier currently lists 3,000 credits/day, with no credit card required; paid use is credit-based. Simple geocoding/route calls often cost 1 credit, while POI result counts/features may use more. | Show Geoapify and OpenStreetMap attribution where required. Estimate credits from actual result limits and map tile usage, not only user sessions. |
| USGS / Caltrans public data | 3DEP data is free; the Caltrans scenic-highway layer is public. | Public access is not the same as a production service guarantee. Budget engineering, caching/hosting, refresh, and quality checks. |
| Self-hosted Valhalla + OSM data | No per-request vendor charge for the open-source engine. Valhalla supports costing and alternate route generation. | Requires servers, map-data imports/updates, monitoring, and operational expertise. OSM attribution/license obligations remain. This is a later portability option, not the simplest first build. |

For a planning session, estimate the cost as:

`geocoding searches + routing request (including alternative count) + POI searches/details + map tile requests + optional traffic/elevation queries`

The scoring calculation itself runs in the shared API and has no per-score provider charge. Avoid autocomplete calls on every keystroke without debouncing, cap POI result counts, and set provider spending alerts. Since daily user volume and a monthly budget are unknown, do not commit to a paid API plan yet.

## Portability beyond Replit

Keep the domain rules in ordinary TypeScript, the service boundary as REST/OpenAPI, and persistence on standard PostgreSQL. The web and mobile apps should only need a configurable API base URL and generated client types. Provider keys should be ordinary server environment variables in development and production, never compiled into the clients. Use standard Expo/React Native build steps and MapLibre libraries; avoid depending on Replit-only route, storage, or database APIs. This allows the API and database to move to another Node.js host without rewriting route scoring or either UI.

## Vehicle profiles vs. Phase 2 accounts

The requirements ask for saved vehicle profiles in Phase 1 but defer accounts to Phase 2. Recommended compromise:

- Keep a small local collection of vehicle profiles on the user's iOS or Android device for Phase 1.
- Support year, make, model, optional trim/nickname/photo, editing, deletion, and selecting one vehicle for a request.
- Explain that profiles are local to that device and will not sync.
- Do not send vehicle details to a route provider or claim they affect recommendations until the product defines vehicle-sensitive routing rules.
- Move profiles to user-owned server storage when authentication and cross-device sync are implemented in Phase 2.

This avoids introducing authentication solely to save a profile. If cross-device access is required from the first release, that decision reverses the recommendation and brings authentication, database ownership, privacy, and account recovery into Phase 1.

## Persistence and database recommendation

Use PostgreSQL in Phase 1 for the versioned regional scenic-corridor dataset and versioned scoring configuration that must be consistent across clients. The route and scoring code still lives in the shared API/domain layer; database queries provide source data and configuration but do not independently calculate routes or scores.

Keep route responses ephemeral by default and vehicle profiles on the mobile device. Add short-lived route-session or POI cache tables only if there is a specific product need and the selected provider's terms permit the stored fields and retention period. Do not introduce user accounts just to make the database appear central.

Conceptual data types to keep clear even before database storage:

- `Place`: normalized name, coordinates, provider identifier, and attribution/source.
- `RouteRequest`: origin, destination mode, time budget, preference weights, and optional ordered stops.
- `RouteAlternative`: geometry, distance, duration, character, and factor evidence.
- `PointOfInterest`: category, coordinates, description/source, and detour information.
- `VehicleProfile`: the local-only mobile fields listed above.

The first three are API/domain objects even if they are not database rows. Persist regional data with its source, version, import date, and attribution. Never persist route/POI provider content until that provider's caching and storage rights are understood.

## Beginner-friendly implementation sequence

1. **Native map and provider spike:** First verify a MapLibre React Native development build on iOS and Android, then show a real map, hosted tile style, attribution, and one real geocoded point. Separately build a small server-side routing comparison for known Southern California journeys using TomTom, GraphHopper, and Mapbox; record candidate count, route differences, available metadata, response time, and cost per user action. No production claims.
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
- [TomTom Routing API: calculate route](https://developer.tomtom.com/routing-api/documentation/tomtom-maps/v1/calculate-route)
- [TomTom developer pricing](https://docs.tomtom.com/pricing)
- [Google Routes API: alternative routes](https://developers.google.com/maps/documentation/routes/alternative-routes)
- [Google Maps Platform pricing](https://developers.google.com/maps/billing-and-pricing/pricing)
- [GraphHopper route API](https://docs.graphhopper.com/openapi/routing/postroute)
- [GraphHopper pricing](https://www.graphhopper.com/pricing/)
- [MapLibre React Native: Expo setup](https://maplibre.org/maplibre-react-native/docs/setup/expo/)
- [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/)
- [MapTiler Cloud pricing](https://www.maptiler.com/cloud/pricing/)
- [Geoapify Places API](https://apidocs.geoapify.com/docs/places/places/)
- [Geoapify pricing](https://www.geoapify.com/pricing/)
- [OpenStreetMap Nominatim usage policy](https://operations.osmfoundation.org/policies/nominatim/)
- [OpenStreetMap tile usage policy](https://operations.osmfoundation.org/policies/tiles/)
- [Caltrans scenic-highway GIS layer](https://services1.arcgis.com/0MSEUqKaxRlEPj5g/ArcGIS/rest/services/CA_Scenic_Hwys/FeatureServer)
- [USGS Elevation Point Query Service documentation](https://epqs.nationalmap.gov/v1/docs)
- [Valhalla routing documentation](https://valhalla.github.io/valhalla/)

