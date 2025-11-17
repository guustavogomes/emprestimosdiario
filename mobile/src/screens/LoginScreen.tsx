/**
 * Tela de Login
 * Login para funcionários e administradores
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing } from '../theme';
import { Button, Input, Text } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { cpfMask, removeCpfMask } from '../utils/masks';

export function LoginScreen() {
  const navigation = useNavigation();
  const { signIn } = useAuth();

  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!cpf || !senha) {
      return;
    }

    try {
      setLoading(true);

      await signIn({
        cpf: removeCpfMask(cpf),
        senha,
      });
    } catch (error) {
      // Erro já tratado no AuthContext com toast
    } finally {
      setLoading(false);
    }
  }

  function navigateToRegister() {
    navigation.navigate('Register' as never);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header com Logo */}
        <View style={styles.header}>
          <Image source={require('../../assets/logo.png')} style={styles.logo} />

          <Text variant="h1" style={styles.title}>
            Empréstimo Diário
          </Text>

          <Text variant="body" color={colors.text.secondary} style={styles.subtitle}>
            Faça login para acessar o sistema
          </Text>
        </View>

        {/* Formulário */}
        <View style={styles.form}>
          <Input
            label="CPF"
            value={cpf}
            onChangeText={setCpf}
            mask={cpfMask}
            placeholder="000.000.000-00"
            keyboardType="numeric"
            autoCapitalize="none"
            maxLength={14}
          />

          <Input
            label="Senha"
            value={senha}
            onChangeText={setSenha}
            placeholder="Digite sua senha"
            secureTextEntry
            autoCapitalize="none"
          />

          <Button
            title="Entrar"
            onPress={handleLogin}
            variant="success"
            size="lg"
            loading={loading}
            disabled={!cpf.trim() || !senha.trim()}
            style={styles.loginButton}
          />
        </View>

        {/* Link para cadastro de cliente */}
        <View style={styles.footer}>
          <Text variant="body" color={colors.text.secondary}>
            É cliente?{' '}
          </Text>
          <TouchableOpacity onPress={navigateToRegister}>
            <Text variant="body" color={colors.success.DEFAULT} style={styles.link}>
              Cadastre-se aqui
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.DEFAULT,
  },

  scrollContent: {
    flexGrow: 1,
    padding: spacing.screen.horizontal,
    justifyContent: 'center',
  },

  header: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },

  logo: {
    width: 100,
    height: 100,
    marginBottom: spacing.lg,
  },

  title: {
    marginBottom: spacing.sm,
    textAlign: 'center',
  },

  subtitle: {
    textAlign: 'center',
  },

  form: {
    marginBottom: spacing.xl,
  },

  loginButton: {
    marginTop: spacing.md,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  link: {
    fontWeight: '600',
  },
});
