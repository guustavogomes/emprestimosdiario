/**
 * Configuração do cliente HTTP
 * Axios com interceptors para autenticação
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuração da API
// Para emulador Android: use 10.0.2.2
// Para dispositivo físico: use o IP da sua máquina na rede local (192.168.15.8)
const BASE_URL = 'http://192.168.15.8:3000';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('@emprestimodiario:token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas de erro
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Se o token expirou ou é inválido, limpa o storage
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove([
        '@emprestimodiario:token',
        '@emprestimodiario:user',
      ]);
    }

    return Promise.reject(error);
  }
);
