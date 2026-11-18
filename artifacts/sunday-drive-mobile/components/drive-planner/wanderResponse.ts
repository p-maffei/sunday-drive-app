import type { FeatureCollection, Geometry } from 'geojson';
import type {
  RouteBreakdown,
  WanderOption,
  WanderWaypoint,
} from './RouteResultContext';

export interface WanderResponse {
  budget_min: number;
  note: string | null;
  options: WanderOption[];
}

export function clampWanderBudget(minutes: number) {
  return Math.max(15, Math.min(300, minutes));
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

function isWanderOption(value: unknown): value is WanderOption {
  return (
    isRecord(value) &&
    typeof value.rank === 'number' &&
    isWaypoint(value.waypoint) &&
    typeof value.distance_km === 'number' &&
    typeof value.duration_min === 'number' &&
    (value.match_pct === null || typeof value.match_pct === 'number') &&
    isRecord(value.breakdown) &&
    typeof value.fun_km === 'number' &&
    typeof value.reused_km === 'number' &&
    isFeatureCollection(value.geojson)
  );
}

export function parseWanderResponse(payload: unknown): WanderResponse {
  if (
    !isRecord(payload) ||
    typeof payload.budget_min !== 'number' ||
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
