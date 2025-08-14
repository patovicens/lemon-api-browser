import React from 'react';
import {
  View,
  StatusBar,
  Platform,
  StyleSheet,
} from 'react-native';

interface MyStatusBarProps {
  backgroundColor: string;
  barStyle?: 'default' | 'light-content' | 'dark-content';
  translucent?: boolean;
}

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 64 : StatusBar.currentHeight || 0;

// TODO: This is a workaround to get the status bar height on iOS.
// Works as expected (check Android and improve this)
const MyStatusBar: React.FC<MyStatusBarProps> = ({ 
  backgroundColor, 
  barStyle = 'dark-content',
  translucent = true 
}) => (
  <View style={[styles.statusBar, { backgroundColor }]}>
    <StatusBar 
      translucent={translucent} 
      backgroundColor={backgroundColor} 
      barStyle={barStyle} 
    />
  </View>
);

const styles = StyleSheet.create({
  statusBar: {
    height: STATUSBAR_HEIGHT,
  },
});

export default MyStatusBar;
