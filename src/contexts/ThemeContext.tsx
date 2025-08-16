import React, { createContext, useContext, useState, ReactNode } from 'react';
import { colors } from '../theme';

type ThemeMode = 'dark' | 'light';

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  colors: typeof colors & {
    themeBackground: string;
    themeSurface: string;
    themeSurfaceLight: string;
    themeText: string;
    themeTextSecondary: string;
    themeTextTertiary: string;
    themeBorder: string;
    themeBorderLight: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>('dark');

  const toggleTheme = () => {
    setThemeState(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  const themeColors = {
    ...colors,
    themeBackground: theme === 'dark' ? colors.darkBackground : colors.lightBackground,
    themeSurface: theme === 'dark' ? colors.darkSurface : colors.lightSurface,
    themeSurfaceLight: theme === 'dark' ? colors.darkSurfaceLight : colors.lightSurfaceLight,
    themeText: theme === 'dark' ? colors.darkText : colors.lightText,
    themeTextSecondary: theme === 'dark' ? colors.darkTextSecondary : colors.lightTextSecondary,
    themeTextTertiary: theme === 'dark' ? colors.darkTextTertiary : colors.lightTextTertiary,
    themeBorder: theme === 'dark' ? colors.darkBorder : colors.lightBorder,
    themeBorderLight: theme === 'dark' ? colors.darkBorderLight : colors.lightBorderLight,
  };

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    setTheme,
    colors: themeColors,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
