/**
 * Serviço de Clientes
 * Gerencia cadastro e dados de clientes
 */

import { api } from './api';

export interface Cliente {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  dataNascimento?: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  nomeEmergencia1?: string;
  telefoneEmergencia1?: string;
  nomeEmergencia2?: string;
  telefoneEmergencia2?: string;
  chavePix?: string;
  etiqueta?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClienteDTO {
  nome: string;
  cpf: string;
  telefone: string;
  whatsapp: string;
  email?: string | null;
  senha: string;
  dataNascimento?: string | null;
  cep?: string | null;
  endereco?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  nomeEmergencia1?: string | null;
  telefoneEmergencia1?: string | null;
  nomeEmergencia2?: string | null;
  telefoneEmergencia2?: string | null;
  chavePix?: string | null;
  etiqueta?: string | null;
}

/**
 * Cria um novo cliente (auto-cadastro)
 */
export async function createCliente(data: CreateClienteDTO): Promise<Cliente> {
  const response = await api.post<Cliente>('/api/clientes', data);
  return response.data;
}

/**
 * Busca informações do cliente autenticado
 */
export async function getMyProfile(): Promise<Cliente> {
  const response = await api.get<Cliente>('/api/clientes/me');
  return response.data;
}

/**
 * Atualiza informações do cliente autenticado
 */
export async function updateMyProfile(data: Partial<CreateClienteDTO>): Promise<Cliente> {
  const response = await api.put<Cliente>('/api/clientes/me', data);
  return response.data;
}
