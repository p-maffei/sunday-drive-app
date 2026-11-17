import type { TextStyle, ViewStyle } from 'react-native';
import {
  designTokens,
  displayFontFamily,
  interfaceFontFamily,
} from './designTokens';

export const theme = {
  colors: {
    background: designTokens.color.background,
    surface: designTokens.color.darkSurface,
    primaryText: designTokens.color.foreground,
    secondaryText: designTokens.color.mutedForeground,
    accent: designTokens.color.accent,
    readableAccent: '#E78377',
    border: designTokens.color.border,
    accentText: designTokens.color.accentForeground,
  },
  cards: {
    bordered: {
      borderWidth: 1,
      borderColor: designTokens.color.border,
      borderRadius: designTokens.radius.small,
      backgroundColor: designTokens.color.darkSurface,
    } satisfies ViewStyle,
  },
  text: {
    brandName: {
      color: designTokens.color.foreground,
      fontFamily: displayFontFamily,
      fontSize: 10,
      letterSpacing: 1.7,
    },
    brandSubtitle: {
      color: designTokens.color.mutedForeground,
      fontFamily: interfaceFontFamily,
      fontSize: designTokens.typography.size.label,
      letterSpacing: 1,
    },
    eyebrow: {
      color: designTokens.color.accent,
      fontFamily: displayFontFamily,
      fontSize: 10,
      letterSpacing: 1.2,
    },
    resultEyebrow: {
      color: '#E78377',
      fontFamily: displayFontFamily,
      fontSize: 10,
      letterSpacing: 1.2,
    },
    errorAccent: {
      color: '#E78377',
      fontFamily: interfaceFontFamily,
      fontSize: 12,
    },
    title: {
      color: designTokens.color.foreground,
      fontFamily: displayFontFamily,
      fontSize: 25,
      lineHeight: 34,
    },
    intro: {
      color: designTokens.color.mutedForeground,
      fontFamily: interfaceFontFamily,
      fontSize: designTokens.typography.size.body,
      lineHeight: 21,
    },
    sectionTitle: {
      color: designTokens.color.foreground,
      fontFamily: displayFontFamily,
      fontSize: designTokens.typography.size.section,
    },
    sectionIndex: {
      color: designTokens.color.mutedForeground,
      fontFamily: displayFontFamily,
      fontSize: 9,
      letterSpacing: 0.8,
    },
    error: {
      color: designTokens.color.foreground,
      fontFamily: interfaceFontFamily,
      fontSize: 13,
      lineHeight: 19,
    },
    button: {
      color: designTokens.color.accentForeground,
      fontFamily: interfaceFontFamily,
      fontSize: designTokens.typography.size.button,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    footer: {
      color: designTokens.color.mutedForeground,
      fontFamily: interfaceFontFamily,
      fontSize: 11,
      lineHeight: 15,
    },
    backButton: {
      color: designTokens.color.foreground,
      fontFamily: interfaceFontFamily,
      fontSize: 14,
    },
    scoreLabel: {
      color: designTokens.color.mutedForeground,
      fontFamily: displayFontFamily,
      fontSize: 9,
      letterSpacing: 0.6,
    },
    scoreValue: {
      color: designTokens.color.foreground,
      fontFamily: displayFontFamily,
      fontSize: 19,
    },
    breakdownTitle: {
      color: designTokens.color.foreground,
      fontFamily: displayFontFamily,
      fontSize: 12,
      letterSpacing: 0.5,
    },
    breakdownLabel: {
      color: designTokens.color.mutedForeground,
      fontFamily: interfaceFontFamily,
      fontSize: 13,
    },
    breakdownValue: {
      color: designTokens.color.foreground,
      fontFamily: interfaceFontFamily,
      fontSize: 13,
      fontWeight: '600',
    },
    emptyTitle: {
      color: designTokens.color.foreground,
      fontFamily: displayFontFamily,
      fontSize: 24,
    },
  } satisfies Record<string, TextStyle>,
} as const;
