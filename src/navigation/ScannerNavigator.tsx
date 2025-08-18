import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ScannerStackParamList } from './types';
import ScannerScreen from '../screens/ScannerScreen';
import ScanResultSummary from '../components/scanner/ScanResultSummary';
import ScanHistory from '../components/scanner/ScanHistory';

const ScannerStack = createStackNavigator<ScannerStackParamList>();

const ScannerNavigator = () => {
  return (
    <ScannerStack.Navigator 
      id={undefined} 
      screenOptions={{ 
        headerShown: false
      }}
    >
      <ScannerStack.Screen name="ScannerMain" component={ScannerScreen} />
      <ScannerStack.Screen name="ScanResult" component={ScanResultSummary} />
      <ScannerStack.Screen name="ScanHistory" component={ScanHistory} />
    </ScannerStack.Navigator>
  );
};

export default ScannerNavigator;
