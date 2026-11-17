import { describe, expect, it } from '@jest/globals';
import { formatRouteSummary } from './routeSummary';

describe('formatRouteSummary', () => {
  it.each([
    [39, '23.8 km · 39 min'],
    [60, '23.8 km · 1 h'],
    [65, '23.8 km · 1 h 5 min'],
    [120, '23.8 km · 2 h'],
  ])('formats %i minutes for people', (durationMin, expected) => {
    expect(formatRouteSummary(23.8, durationMin)).toBe(expected);
  });

  it('shows distance only when duration is missing', () => {
    expect(formatRouteSummary(23.8)).toBe('23.8 km');
  });
});
