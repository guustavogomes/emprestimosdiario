/**
 * Context de Autenticação
 * Gerencia estado global de autenticação do app
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import {
  login as apiLogin,
  getMe,
  validateToken,
  LoginCredentials,
  UserInfo,
} from '../services/authService';

interface AuthContextData {
  user: UserInfo | null;
  token: string | null;
  loading: boolean;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Carrega dados do usuário do AsyncStorage ao iniciar o app
   */
  useEffect(() => {
    loadStorageData();
  }, []);

  async function loadStorageData() {
    try {
      const storedToken = await AsyncStorage.getItem('@emprestimodiario:token');
      const storedUser = await AsyncStorage.getItem('@emprestimodiario:user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));

        // Valida se o token ainda é válido
        const isValid = await validateToken();

        if (!isValid) {
          // Token expirado, limpa tudo
          await signOut();
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados do storage:', error);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Realiza login
   */
  async function signIn(credentials: LoginCredentials) {
    try {
      setLoading(true);

      // Faz login e recebe o token
      const { token: receivedToken, usuario } = await apiLogin(credentials);

      // Salva o token no axios e no storage
      await AsyncStorage.setItem('@emprestimodiario:token', receivedToken);
      setToken(receivedToken);

      // Busca informações completas do usuário (com permissões)
      const userInfo = await getMe();

      // Salva no storage e no state
      await AsyncStorage.setItem('@emprestimodiario:user', JSON.stringify(userInfo));
      setUser(userInfo);

      Toast.show({
        type: 'success',
        text1: 'Login realizado!',
        text2: `Bem-vindo, ${userInfo.nome}!`,
      });
    } catch (error: any) {
      console.error('Erro ao fazer login:', error);

      const errorMessage =
        error.response?.data?.error || 'Erro ao fazer login. Verifique suas credenciais.';

      Toast.show({
        type: 'error',
        text1: 'Erro no login',
        text2: errorMessage,
      });

      throw error;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Realiza logout
   */
  async function signOut() {
    try {
      await AsyncStorage.multiRemove([
        '@emprestimodiario:token',
        '@emprestimodiario:user',
      ]);

      setToken(null);
      setUser(null);

      Toast.show({
        type: 'info',
        text1: 'Logout realizado',
        text2: 'Até logo!',
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }

  /**
   * Recarrega informações do usuário
   */
  async function refreshUser() {
    try {
      const userInfo = await getMe();
      await AsyncStorage.setItem('@emprestimodiario:user', JSON.stringify(userInfo));
      setUser(userInfo);
    } catch (error) {
      console.error('Erro ao recarregar usuário:', error);
      throw error;
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        signIn,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook para usar o contexto de autenticação
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  return context;
}
