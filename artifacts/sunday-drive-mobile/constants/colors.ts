/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    text: '#352d27',
    tint: '#405e50',
    background: '#f6f4ef',
    foreground: '#352d27',
    card: '#f9f8f5',
    cardForeground: '#352d27',
    primary: '#405e50',
    primaryForeground: '#f6f4ef',
    secondary: '#e6e2db',
    secondaryForeground: '#413830',
    muted: '#e7e4df',
    mutedForeground: '#80766b',
    accent: '#b3806b',
    accentForeground: '#f9f8f5',
    destructive: '#ab403b',
    destructiveForeground: '#f9f8f5',
    border: '#d9d3c9',
    input: '#d9d3c9',
  },
  dark: {
    text: '#eee9dc',
    tint: '#80a995',
    background: '#251f1b',
    foreground: '#eee9dc',
    card: '#2e2622',
    cardForeground: '#eee9dc',
    primary: '#80a995',
    primaryForeground: '#251f1b',
    secondary: '#403630',
    secondaryForeground: '#eee9dc',
    muted: '#403630',
    mutedForeground: '#aca194',
    accent: '#bd8d78',
    accentForeground: '#251f1b',
    destructive: '#c45752',
    destructiveForeground: '#eee9dc',
    border: '#514741',
    input: '#514741',
  },
  radius: 7,
};

export default colors;
