/**
 * Tela de Splash
 * Exibida ao iniciar o app enquanto carrega dados
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { colors } from '../theme';
import { Text } from '../components';

export function SplashScreen() {
  return (
    <View style={styles.container}>
      <Image source={require('../../assets/logo.png')} style={styles.logo} />

      <View style={styles.content}>
        <Text variant="h1" color={colors.white} style={styles.title}>
          Empréstimo Diário
        </Text>

        <ActivityIndicator
          size="large"
          color={colors.white}
          style={styles.loader}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
  },

  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },

  content: {
    alignItems: 'center',
  },

  title: {
    marginBottom: 32,
    textAlign: 'center',
  },

  loader: {
    marginTop: 16,
  },
});
