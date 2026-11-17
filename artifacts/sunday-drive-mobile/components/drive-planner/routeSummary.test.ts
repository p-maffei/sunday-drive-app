import { describe, expect, it } from '@jest/globals';
import { formatDistance, formatRouteSummary } from './routeSummary';

describe('formatDistance', () => {
  it.each([
    [0, '0.0 mi'],
    [1.609344, '1.0 mi'],
    [23.5, '14.6 mi'],
  ])('formats %s kilometers as miles', (distanceKm, expected) => {
    expect(formatDistance(distanceKm)).toBe(expected);
  });

  it('supports kilometers when explicitly requested', () => {
    expect(formatDistance(23.5, 'km')).toBe('23.5 km');
  });

  it('returns nothing when the distance is missing', () => {
    expect(formatDistance()).toBe('');
  });
});

describe('formatRouteSummary', () => {
  it.each([
    [39, '14.6 mi · 39 min'],
    [60, '14.6 mi · 1 h'],
    [65, '14.6 mi · 1 h 5 min'],
    [120, '14.6 mi · 2 h'],
  ])('formats %i minutes for people', (durationMin, expected) => {
    expect(formatRouteSummary(23.5, durationMin)).toBe(expected);
  });

  it('shows distance only when duration is missing', () => {
    expect(formatRouteSummary(23.5)).toBe('14.6 mi');
  });

  it('shows the time if distance is missing', () => {
    expect(formatRouteSummary(undefined, 39)).toBe('39 min');
  });
});
