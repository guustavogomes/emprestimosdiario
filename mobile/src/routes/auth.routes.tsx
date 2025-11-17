/**
 * Rotas de Autenticação
 * Stack Navigator para telas públicas (Login, Registro)
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SplashScreen, LoginScreen, RegisterScreen } from '../screens';

const Stack = createStackNavigator();

export function AuthRoutes() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#fff' },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}
