import { Platform } from 'react-native';

export const designTokens = {
  color: {
    background: '#202322',
    foreground: '#FFFFFF',
    surface: '#E6E8E5',
    surfaceForeground: '#202322',
    accent: '#C64B3F',
    accentForeground: '#FFFFFF',
    darkSurface: '#292E2C',
    border: '#4B514F',
    mutedForeground: '#B8BFBB',
  },
  typography: {
    interface: 'Helvetica Neue',
    interfaceFallback: 'sans-serif',
    display: 'Michroma_400Regular',
    size: {
      label: 10,
      body: 14,
      button: 13,
      section: 20,
      wordmark: 30,
    },
  },
  spacing: {
    xsmall: 4,
    small: 8,
    medium: 16,
    large: 24,
    xlarge: 32,
    section: 40,
  },
  radius: {
    small: 4,
    medium: 8,
    pill: 24,
  },
  component: {
    buttonHeight: 50,
    inputHeight: 48,
    cardPadding: 16,
    chipHeight: 34,
  },
} as const;

export function getInterfaceFontFamily(platform: typeof Platform.OS): string {
  switch (platform) {
    case 'ios':
      return designTokens.typography.interface;
    case 'android':
      return designTokens.typography.interfaceFallback;
    case 'web':
      return '"Helvetica Neue", Helvetica, Arial, sans-serif';
    default:
      return designTokens.typography.interfaceFallback;
  }
}

export const interfaceFontFamily = getInterfaceFontFamily(Platform.OS);

export const displayFontFamily = designTokens.typography.display;
