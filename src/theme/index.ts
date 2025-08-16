import { colors } from './colors';

export { colors, getColor, type ColorKey } from './colors';

export type ThemeColors = typeof colors & {
  themeBackground: string;
  themeSurface: string;
  themeSurfaceLight: string;
  themeText: string;
  themeTextSecondary: string;
  themeTextTertiary: string;
  themeBorder: string;
  themeBorderLight: string;
};

// You can add more theme exports here later:
// export { spacing } from './spacing';
// export { typography } from './typography';
// export { shadows } from './shadows';
