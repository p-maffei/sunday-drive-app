import { describe, expect, it } from '@jest/globals';
import { clampWanderBudget, parseWanderResponse } from './wanderResponse';

const routeGeoJSON = {
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: [[-118.67, 34.03], [-118.60, 34.08]],
    },
  }],
};

const validResponse = {
  budget_min: 120,
  note: 'A little extra time for the hills.',
  options: [{
    rank: 1,
    waypoint: { lon: -118.63, lat: 34.05 },
    distance_km: 24,
    duration_min: 120,
    match_pct: 82,
    breakdown: { curvy: 82 },
    fun_km: 16,
    reused_km: 8,
    geojson: routeGeoJSON,
  }],
};

describe('parseWanderResponse', () => {
  it('clamps time budgets to the API-supported range', () => {
    expect(clampWanderBudget(0)).toBe(15);
    expect(clampWanderBudget(120)).toBe(120);
    expect(clampWanderBudget(420)).toBe(300);
  });

  it('accepts a valid wander response with a waypoint and route GeoJSON', () => {
    expect(parseWanderResponse(validResponse)).toEqual(validResponse);
  });

  it('accepts null waypoint and up to three options', () => {
    const response = {
      ...validResponse,
      note: null,
      options: [1, 2, 3].map((rank) => ({
        ...validResponse.options[0],
        rank,
        waypoint: null,
      })),
    };

    expect(parseWanderResponse(response).options).toHaveLength(3);
  });

  it('rejects missing, empty, or too many options', () => {
    for (const options of [undefined, [], [1, 2, 3, 4].map((rank) => ({
      ...validResponse.options[0],
      rank,
    }))]) {
      expect(() => parseWanderResponse({ ...validResponse, options })).toThrow(
        'incomplete route',
      );
    }
  });

  it('rejects an option without GeoJSON or numeric route values', () => {
    const invalidOption = {
      ...validResponse.options[0],
      duration_min: '120',
      geojson: null,
    };
    expect(() =>
      parseWanderResponse({ ...validResponse, options: [invalidOption] }),
    ).toThrow('incomplete route');
  });
});
