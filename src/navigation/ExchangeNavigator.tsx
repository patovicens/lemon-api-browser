import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ExchangeStackParamList } from './types';
import ExchangeScreen from '../screens/ExchangeScreen';

const ExchangeStack = createStackNavigator<ExchangeStackParamList>();

const ExchangeNavigator = () => {
  return (
    <ExchangeStack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
      <ExchangeStack.Screen name="ExchangeMain" component={ExchangeScreen} />
    </ExchangeStack.Navigator>
  );
};

export default ExchangeNavigator;
