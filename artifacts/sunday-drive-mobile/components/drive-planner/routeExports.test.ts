import { describe, expect, it } from '@jest/globals';
import {
  buildGpxExportRequest,
  buildMapsExportRequest,
  getExportErrorDetail,
  hasExportableEdges,
} from './routeExports';

describe('route export request builders', () => {
  it('builds the Google Maps export POST body', () => {
    expect(buildMapsExportRequest(['edge-a', 23])).toEqual({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ edge_ids: ['edge-a', 23] }),
    });
  });

  it('builds the GPX export POST body with the route duration', () => {
    expect(buildGpxExportRequest(['edge-a', 'edge-b'], 49)).toEqual({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/gpx+xml, application/octet-stream',
      },
      body: JSON.stringify({
        edge_ids: ['edge-a', 'edge-b'],
        name: 'Sunday Drive 49 min',
      }),
    });
  });
});

describe('route export button visibility', () => {
  it('shows export buttons only for a non-empty edge list', () => {
    expect(hasExportableEdges(['edge-a'])).toBe(true);
    expect(hasExportableEdges([])).toBe(false);
    expect(hasExportableEdges(null)).toBe(false);
    expect(hasExportableEdges(undefined)).toBe(false);
  });
});

describe('export error detail', () => {
  it('returns server detail text when present', () => {
    expect(getExportErrorDetail({ detail: 'Try another route.' })).toBe(
      'Try another route.',
    );
    expect(getExportErrorDetail({ message: 'Not the API detail' })).toBeNull();
  });
});
