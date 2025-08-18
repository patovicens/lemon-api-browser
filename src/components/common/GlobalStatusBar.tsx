import React from 'react';
import { StatusBar } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

const GlobalStatusBar: React.FC = () => {
  const { theme } = useTheme();

  return (
    <StatusBar 
      barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} 
      backgroundColor="transparent"
      translucent={true}
    />
  );
};

export default GlobalStatusBar;
