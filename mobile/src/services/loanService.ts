/**
 * Serviço de Empréstimos
 * Gerencia solicitações e dados de empréstimos
 */

import { api } from './api';

export enum EmprestimoStatus {
  PENDENTE = 'PENDENTE',
  EM_ANALISE = 'EM_ANALISE',
  APROVADO = 'APROVADO',
  REPROVADO = 'REPROVADO',
  ATIVO = 'ATIVO',
  QUITADO = 'QUITADO',
  ATRASADO = 'ATRASADO',
  CANCELADO = 'CANCELADO',
}

export interface Emprestimo {
  id: string;
  clienteId: string;
  valorSolicitado: number;
  valorAprovado?: number;
  valorTotal?: number;
  taxaJuros: number;
  numeroParcelas: number;
  valorParcela?: number;
  dataLiberacao?: string;
  dataPrimeiroVencimento?: string;
  status: EmprestimoStatus;
  motivoReprovacao?: string;
  documentos?: any;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmprestimoDTO {
  valorSolicitado: number;
  numeroParcelas: number;
  documentos?: string[]; // Array de URLs de documentos
}

/**
 * Cria uma nova solicitação de empréstimo
 */
export async function createEmprestimo(data: CreateEmprestimoDTO): Promise<Emprestimo> {
  const response = await api.post<Emprestimo>('/api/emprestimos', data);
  return response.data;
}

/**
 * Busca todos os empréstimos do cliente autenticado
 */
export async function getMyLoans(): Promise<Emprestimo[]> {
  const response = await api.get<Emprestimo[]>('/api/emprestimos/me');
  return response.data;
}

/**
 * Busca um empréstimo específico
 */
export async function getLoanById(id: string): Promise<Emprestimo> {
  const response = await api.get<Emprestimo>(`/api/emprestimos/${id}`);
  return response.data;
}

/**
 * Busca empréstimos ativos do cliente
 */
export async function getActiveLoans(): Promise<Emprestimo[]> {
  const response = await api.get<Emprestimo[]>('/api/emprestimos/me/active');
  return response.data;
}

/**
 * Retorna label em português para o status
 */
export function getStatusLabel(status: EmprestimoStatus): string {
  const labels: Record<EmprestimoStatus, string> = {
    [EmprestimoStatus.PENDENTE]: 'Pendente',
    [EmprestimoStatus.EM_ANALISE]: 'Em Análise',
    [EmprestimoStatus.APROVADO]: 'Aprovado',
    [EmprestimoStatus.REPROVADO]: 'Reprovado',
    [EmprestimoStatus.ATIVO]: 'Ativo',
    [EmprestimoStatus.QUITADO]: 'Quitado',
    [EmprestimoStatus.ATRASADO]: 'Atrasado',
    [EmprestimoStatus.CANCELADO]: 'Cancelado',
  };

  return labels[status] || status;
}

/**
 * Retorna cor para o status
 */
export function getStatusColor(status: EmprestimoStatus): string {
  const colors: Record<EmprestimoStatus, string> = {
    [EmprestimoStatus.PENDENTE]: '#f59e0b', // amber
    [EmprestimoStatus.EM_ANALISE]: '#3b82f6', // blue
    [EmprestimoStatus.APROVADO]: '#10b981', // green
    [EmprestimoStatus.REPROVADO]: '#ef4444', // red
    [EmprestimoStatus.ATIVO]: '#059669', // emerald
    [EmprestimoStatus.QUITADO]: '#6b7280', // gray
    [EmprestimoStatus.ATRASADO]: '#dc2626', // red
    [EmprestimoStatus.CANCELADO]: '#9ca3af', // gray
  };

  return colors[status] || '#6b7280';
}
