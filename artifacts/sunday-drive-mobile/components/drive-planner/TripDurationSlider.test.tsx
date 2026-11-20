import { describe, expect, it } from '@jest/globals';
import { formatExtraTime } from './TripDurationSlider';

describe('formatExtraTime', () => {
  it.each([
    [0, 'No detour'],
    [15, '+15 min'],
    [45, '+45 min'],
    [60, '+1 h'],
    [75, '+1 h 15 min'],
    [120, '+2 h'],
    [300, '+5 h'],
  ])('formats %i minutes as %s', (minutes, expected) => {
    expect(formatExtraTime(minutes)).toBe(expected);
  });
});
