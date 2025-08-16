
export const colors = {
  // Lemon theme colors
  lemon: '#FFC107',
  lemonLight: 'rgba(255, 193, 7, 0.2)',
  lemonDark: '#E6A800',
  lemonGradient: 'rgba(255, 193, 7, 0.1)',
  lemonGradientLight: 'rgba(255, 193, 7, 0.05)',
  
  // Dark theme colors
  darkBackground: '#1a1a1a',
  darkSurface: '#2a2a2a',
  darkSurfaceLight: '#333333',
  darkText: '#FFFFFF',
  darkTextSecondary: '#CCCCCC',
  darkTextTertiary: '#999999',
  darkBorder: '#404040',
  darkBorderLight: '#333333',
  
  // Light theme colors (original)
  lightBackground: '#f5f5f5',
  lightSurface: '#ffffff',
  lightSurfaceLight: '#fafafa',
  lightText: '#333333',
  lightTextSecondary: '#666666',
  lightTextTertiary: '#999999',
  lightBorder: '#e0e0e0',
  lightBorderLight: '#f0f0f0',

  
  success: '#22c55e',
  error: '#ef4444',
  errorLight: '#fef2f2',
  errorDark: '#991b1b',
  warning: '#f59e0b',
  warningLight: '#fef3c7',
  warningDark: '#92400e',
  info: '#3b82f6',
  
  border: '#e0e0e0',
  borderLight: '#f0f0f0',
  
  searchBackground: '#f5f5f5',
  searchActive: '#e3f2fd',
  searchBorder: '#2196f3',
  
  statusBarLight: '#ffffff',
  statusBarDark: '#000000',
  
  opacityBlack: 'rgba(0, 0, 0, 0.5)',
} as const;

export type ColorKey = keyof typeof colors;

export const getColor = (key: ColorKey) => colors[key];
