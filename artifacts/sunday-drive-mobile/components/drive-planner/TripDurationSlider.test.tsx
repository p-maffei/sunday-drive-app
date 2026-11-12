import { describe, expect, it } from '@jest/globals';
import { formatDuration } from './TripDurationSlider';

describe('formatDuration', () => {
  it.each([
    [0, '0 minutes'],
    [30, '30 minutes'],
    [60, '1 hour'],
    [90, '1 hour 30 minutes'],
    [120, '2 hours'],
    [135, '2 hours 15 minutes'],
    [300, '5 hours'],
  ])('formats %i minutes as %s', (minutes, expected) => {
    expect(formatDuration(minutes)).toBe(expected);
  });
});
