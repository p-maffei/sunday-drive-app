import type { FeatureCollection, Geometry } from 'geojson';
import type {
  FastestRoute,
  RouteBreakdown,
  WanderOption,
  WanderWaypoint,
} from './RouteResultContext';

export interface WanderResponse {
  fastest: {
    duration_min: number;
    distance_km: number;
    scores: RouteBreakdown;
  };
  extra_min: number;
  budget_min: number;
  style: string[];
  style_defaulted: boolean;
  note: string | null;
  options: WanderOption[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFeatureCollection(
  value: unknown,
): value is FeatureCollection<Geometry> {
  return (
    isRecord(value) &&
    value.type === 'FeatureCollection' &&
    Array.isArray(value.features)
  );
}

function isWaypoint(value: unknown): value is WanderWaypoint | null {
  return (
    value === null ||
    (isRecord(value) &&
      typeof value.lon === 'number' &&
      typeof value.lat === 'number')
  );
}

function isScoreRecord(value: unknown): value is RouteBreakdown {
  return (
    isRecord(value) &&
    Object.values(value).every((score) => typeof score === 'number')
  );
}

function isFastestSummary(
  value: unknown,
): value is WanderResponse['fastest'] {
  return (
    isRecord(value) &&
    typeof value.duration_min === 'number' &&
    typeof value.distance_km === 'number' &&
    isScoreRecord(value.scores)
  );
}

function isWanderOption(value: unknown): value is WanderOption {
  return (
    isRecord(value) &&
    typeof value.rank === 'number' &&
    isWaypoint(value.waypoint) &&
    typeof value.extra_min === 'number' &&
    typeof value.distance_km === 'number' &&
    typeof value.duration_min === 'number' &&
    (value.match_pct === null || typeof value.match_pct === 'number') &&
    isScoreRecord(value.breakdown) &&
    typeof value.fun_km === 'number' &&
    typeof value.reused_km === 'number' &&
    isFeatureCollection(value.geojson)
  );
}

export function parseFastestResponse(payload: unknown): FastestRoute {
  if (
    !isRecord(payload) ||
    typeof payload.fastest_min !== 'number' ||
    typeof payload.distance_km !== 'number' ||
    !isScoreRecord(payload.scores) ||
    !isFeatureCollection(payload.geojson)
  ) {
    throw new Error('The route service returned an incomplete fastest route.');
  }

  return {
    duration_min: payload.fastest_min,
    distance_km: payload.distance_km,
    breakdown: payload.scores,
    match_pct: null,
    geojson: payload.geojson,
  };
}

export function parseWanderResponse(payload: unknown): WanderResponse {
  if (
    !isRecord(payload) ||
    !isFastestSummary(payload.fastest) ||
    typeof payload.extra_min !== 'number' ||
    typeof payload.budget_min !== 'number' ||
    !Array.isArray(payload.style) ||
    !payload.style.every((item) => typeof item === 'string') ||
    typeof payload.style_defaulted !== 'boolean' ||
    (payload.note !== null && typeof payload.note !== 'string') ||
    !Array.isArray(payload.options) ||
    payload.options.length < 1 ||
    payload.options.length > 3 ||
    !payload.options.every(isWanderOption)
  ) {
    throw new Error('The route service returned an incomplete route. Please try again.');
  }

  return payload as unknown as WanderResponse;
}
