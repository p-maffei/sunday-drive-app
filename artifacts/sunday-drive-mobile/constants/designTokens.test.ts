import { describe, expect, it } from '@jest/globals';
import { getInterfaceFontFamily } from './designTokens';

describe('interface font by platform', () => {
  it('uses Helvetica Neue on iOS', () => {
    expect(getInterfaceFontFamily('ios')).toBe('Helvetica Neue');
  });

  it('uses the native sans-serif fallback on Android', () => {
    expect(getInterfaceFontFamily('android')).toBe('sans-serif');
  });
});
