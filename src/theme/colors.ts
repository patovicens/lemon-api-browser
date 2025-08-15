
export const colors = {
  primary: '#4285F4',
  primaryLight: '#e3f2fd',
  primaryDark: '#1976d2',
  
  background: '#f5f5f5',
  surface: '#ffffff',
  
  textPrimary: '#333333',
  textSecondary: '#666666',
  textTertiary: '#999999',
  
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
