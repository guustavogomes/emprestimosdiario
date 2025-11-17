/**
 * Navegação Principal
 * Alterna entre rotas de autenticação e rotas do app
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import { SplashScreen } from '../screens';
import { AuthRoutes } from './auth.routes';
import { AppRoutes } from './app.routes';

const Stack = createStackNavigator();

export function Routes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      {user ? <AppRoutes /> : <AuthRoutes />}
    </NavigationContainer>
  );
}
