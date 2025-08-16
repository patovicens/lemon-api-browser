import React from 'react';
import { StatusBar } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

const GlobalStatusBar: React.FC = () => {
  const { theme, colors } = useTheme();

  return (
    <StatusBar 
      barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} 
      backgroundColor={colors.themeBackground}
      translucent={false}
    />
  );
};

export default GlobalStatusBar;
