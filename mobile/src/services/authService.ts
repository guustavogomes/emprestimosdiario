/**
 * Serviço de Autenticação
 * Gerencia login, logout e informações do usuário
 */

import { api } from './api';

export interface LoginCredentials {
  cpf: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  usuario: {
    id: string;
    nome: string;
    cpf: string;
    email: string | null;
    tipo: string;
  };
}

export interface UserInfo {
  id: string;
  nome: string;
  cpf: string;
  email: string | null;
  tipo: string;
  permissions: Array<{
    resource: string;
    action: string;
  }>;
}

/**
 * Realiza login do usuário
 */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/api/auth/login', credentials);
  return response.data;
}

/**
 * Busca informações do usuário autenticado
 */
export async function getMe(): Promise<UserInfo> {
  const response = await api.get<UserInfo>('/api/auth/me');
  return response.data;
}

/**
 * Valida se o token ainda é válido
 */
export async function validateToken(): Promise<boolean> {
  try {
    await getMe();
    return true;
  } catch (error) {
    return false;
  }
}
