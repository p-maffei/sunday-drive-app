import { describe, expect, it } from '@jest/globals';
import {
  parseFastestResponse,
  parseWanderResponse,
} from './wanderResponse';

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
  fastest: {
    duration_min: 100,
    distance_km: 20,
    scores: { curvy: 31, backroads: 40, urban: 12 },
  },
  extra_min: 20,
  budget_min: 120,
  style: ['curvy', 'backroads'],
  style_defaulted: false,
  note: 'A little extra time for the hills.',
  options: [{
    rank: 1,
    waypoint: { lon: -118.63, lat: 34.05 },
    distance_km: 24,
    duration_min: 120,
    extra_min: 20,
    match_pct: 82,
    breakdown: { curvy: 82 },
    fun_km: 16,
    reused_km: 8,
    geojson: routeGeoJSON,
  }],
};

describe('parseWanderResponse', () => {
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
      match_pct: null,
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

describe('parseFastestResponse', () => {
  it('converts the fastest endpoint payload to a route result', () => {
    expect(parseFastestResponse({
      fastest_min: 28,
      distance_km: 28,
      scores: { curvy: 31, backroads: 40, urban: 12 },
      geojson: routeGeoJSON,
    })).toEqual({
      duration_min: 28,
      distance_km: 28,
      breakdown: { curvy: 31, backroads: 40, urban: 12 },
      match_pct: null,
      geojson: routeGeoJSON,
    });
  });

  it('rejects incomplete fastest-route responses', () => {
    expect(() => parseFastestResponse({ fastest_min: 28 })).toThrow(
      'incomplete fastest route',
    );
  });
});
