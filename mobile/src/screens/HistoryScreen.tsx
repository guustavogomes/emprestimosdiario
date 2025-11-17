/**
 * Tela de Histórico
 * Histórico completo de empréstimos do cliente
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing } from '../theme';
import { Text, Card } from '../components';
import {
  getMyLoans,
  Emprestimo,
  getStatusLabel,
  getStatusColor,
  EmprestimoStatus,
} from '../services/loanService';

export function HistoryScreen() {
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'ALL' | EmprestimoStatus>('ALL');

  useEffect(() => {
    loadEmprestimos();
  }, []);

  async function loadEmprestimos() {
    try {
      setLoading(true);

      // TODO: Substituir por API real quando estiver pronta
      // const data = await getMyLoans();

      // Dados mockados para demonstração
      const mockData: Emprestimo[] = [
        {
          id: '1',
          clienteId: '',
          valorSolicitado: 1000,
          valorAprovado: 1000,
          valorTotal: 1150,
          taxaJuros: 5,
          numeroParcelas: 6,
          valorParcela: 191.67,
          dataLiberacao: new Date(Date.now() - 604800000).toISOString(),
          status: EmprestimoStatus.ATIVO,
          createdAt: new Date(Date.now() - 1209600000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          clienteId: '',
          valorSolicitado: 500,
          valorAprovado: 500,
          valorTotal: 575,
          taxaJuros: 5,
          numeroParcelas: 3,
          valorParcela: 191.67,
          status: EmprestimoStatus.PENDENTE,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: '3',
          clienteId: '',
          valorSolicitado: 2000,
          valorAprovado: 2000,
          valorTotal: 2000,
          taxaJuros: 5,
          numeroParcelas: 12,
          dataLiberacao: new Date(Date.now() - 7776000000).toISOString(),
          status: EmprestimoStatus.QUITADO,
          createdAt: new Date(Date.now() - 7776000000).toISOString(),
          updatedAt: new Date(Date.now() - 5184000000).toISOString(),
        },
        {
          id: '4',
          clienteId: '',
          valorSolicitado: 1500,
          taxaJuros: 5,
          numeroParcelas: 10,
          status: EmprestimoStatus.REPROVADO,
          motivoReprovacao: 'Score de crédito insuficiente',
          createdAt: new Date(Date.now() - 2592000000).toISOString(),
          updatedAt: new Date(Date.now() - 2592000000).toISOString(),
        },
        {
          id: '5',
          clienteId: '',
          valorSolicitado: 800,
          valorAprovado: 800,
          valorTotal: 920,
          taxaJuros: 5,
          numeroParcelas: 4,
          valorParcela: 230,
          dataLiberacao: new Date(Date.now() - 10368000000).toISOString(),
          status: EmprestimoStatus.ATRASADO,
          createdAt: new Date(Date.now() - 10368000000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      // Ordena por data de criação (mais recente primeiro)
      const sorted = mockData.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setEmprestimos(sorted);
    } catch (error) {
      console.error('Erro ao carregar empréstimos:', error);
    } finally {
      setLoading(false);
    }
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadEmprestimos();
    setRefreshing(false);
  }, []);

  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }

  // Filtra empréstimos
  const emprestimosFiltrados =
    filter === 'ALL'
      ? emprestimos
      : emprestimos.filter((e) => e.status === filter);

  // Estatísticas
  const stats = {
    total: emprestimos.length,
    ativos: emprestimos.filter(
      (e) => e.status === EmprestimoStatus.ATIVO || e.status === EmprestimoStatus.ATRASADO
    ).length,
    quitados: emprestimos.filter((e) => e.status === EmprestimoStatus.QUITADO).length,
    pendentes: emprestimos.filter(
      (e) =>
        e.status === EmprestimoStatus.PENDENTE ||
        e.status === EmprestimoStatus.EM_ANALISE
    ).length,
  };

  const filters: Array<{ label: string; value: 'ALL' | EmprestimoStatus }> = [
    { label: 'Todos', value: 'ALL' },
    { label: 'Ativos', value: EmprestimoStatus.ATIVO },
    { label: 'Quitados', value: EmprestimoStatus.QUITADO },
    { label: 'Pendentes', value: EmprestimoStatus.PENDENTE },
    { label: 'Reprovados', value: EmprestimoStatus.REPROVADO },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.success.DEFAULT} />
        <Text variant="body" color={colors.text.secondary} style={styles.loadingText}>
          Carregando histórico...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Estatísticas */}
      <View style={styles.statsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsScroll}
        >
          <Card style={styles.statCard}>
            <Text variant="h3" color={colors.success.DEFAULT}>
              {stats.total}
            </Text>
            <Text variant="caption" color={colors.text.secondary}>
              Total
            </Text>
          </Card>

          <Card style={styles.statCard}>
            <Text variant="h3" color={colors.info.DEFAULT}>
              {stats.ativos}
            </Text>
            <Text variant="caption" color={colors.text.secondary}>
              Ativos
            </Text>
          </Card>

          <Card style={styles.statCard}>
            <Text variant="h3" color={colors.gray[600]}>
              {stats.quitados}
            </Text>
            <Text variant="caption" color={colors.text.secondary}>
              Quitados
            </Text>
          </Card>

          <Card style={styles.statCard}>
            <Text variant="h3" color={colors.warning.DEFAULT}>
              {stats.pendentes}
            </Text>
            <Text variant="caption" color={colors.text.secondary}>
              Pendentes
            </Text>
          </Card>
        </ScrollView>
      </View>

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
        >
          {filters.map((f) => (
            <TouchableOpacity
              key={f.value}
              onPress={() => setFilter(f.value)}
              style={[
                styles.filterButton,
                filter === f.value && styles.filterButtonActive,
              ]}
              activeOpacity={0.7}
            >
              <Text
                variant="caption"
                color={filter === f.value ? colors.white : colors.text.primary}
                style={styles.filterText}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Lista de Empréstimos */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {emprestimosFiltrados.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text variant="body" color={colors.text.secondary}>
              Nenhum empréstimo encontrado
            </Text>
            <Text variant="caption" color={colors.text.tertiary} style={styles.emptyHint}>
              {filter === 'ALL'
                ? 'Você ainda não possui empréstimos'
                : `Você não possui empréstimos ${getStatusLabel(filter as EmprestimoStatus).toLowerCase()}`}
            </Text>
          </Card>
        ) : (
          emprestimosFiltrados.map((emprestimo) => (
            <TouchableOpacity
              key={emprestimo.id}
              onPress={() => {
                // TODO: Navegar para detalhes do empréstimo
              }}
              activeOpacity={0.7}
            >
              <Card style={styles.loanCard}>
                {/* Header */}
                <View style={styles.loanHeader}>
                  <View style={styles.loanHeaderLeft}>
                    <Text variant="body" style={styles.loanValue}>
                      {formatCurrency(
                        Number(emprestimo.valorAprovado || emprestimo.valorSolicitado)
                      )}
                    </Text>
                    <Text variant="caption" color={colors.text.secondary}>
                      {emprestimo.numeroParcelas}x de{' '}
                      {emprestimo.valorParcela
                        ? formatCurrency(Number(emprestimo.valorParcela))
                        : '---'}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: `${getStatusColor(emprestimo.status)}20` },
                    ]}
                  >
                    <Text
                      variant="caption"
                      color={getStatusColor(emprestimo.status)}
                      style={styles.statusText}
                    >
                      {getStatusLabel(emprestimo.status)}
                    </Text>
                  </View>
                </View>

                {/* Info */}
                <View style={styles.loanInfo}>
                  <View style={styles.loanInfoRow}>
                    <Text variant="caption" color={colors.text.tertiary}>
                      Solicitado em:
                    </Text>
                    <Text variant="caption" color={colors.text.secondary}>
                      {formatDate(emprestimo.createdAt)}
                    </Text>
                  </View>

                  {emprestimo.valorTotal && (
                    <View style={styles.loanInfoRow}>
                      <Text variant="caption" color={colors.text.tertiary}>
                        Valor Total:
                      </Text>
                      <Text variant="caption" color={colors.text.secondary}>
                        {formatCurrency(Number(emprestimo.valorTotal))}
                      </Text>
                    </View>
                  )}

                  {emprestimo.dataLiberacao && (
                    <View style={styles.loanInfoRow}>
                      <Text variant="caption" color={colors.text.tertiary}>
                        Liberado em:
                      </Text>
                      <Text variant="caption" color={colors.text.secondary}>
                        {formatDate(emprestimo.dataLiberacao)}
                      </Text>
                    </View>
                  )}

                  {emprestimo.motivoReprovacao && (
                    <View style={styles.motivoContainer}>
                      <Text variant="caption" color={colors.error.DEFAULT}>
                        Motivo: {emprestimo.motivoReprovacao}
                      </Text>
                    </View>
                  )}
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.DEFAULT,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.DEFAULT,
  },

  loadingText: {
    marginTop: spacing.base,
  },

  statsContainer: {
    paddingVertical: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },

  statsScroll: {
    paddingHorizontal: spacing.screen.horizontal,
    gap: spacing.md,
  },

  statCard: {
    minWidth: 80,
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
  },

  filtersContainer: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },

  filtersScroll: {
    paddingHorizontal: spacing.screen.horizontal,
    gap: spacing.sm,
  },

  filterButton: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
  },

  filterButtonActive: {
    backgroundColor: colors.success.DEFAULT,
  },

  filterText: {
    fontWeight: '600',
  },

  list: {
    flex: 1,
  },

  listContent: {
    padding: spacing.screen.horizontal,
    paddingBottom: spacing['3xl'],
  },

  emptyCard: {
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.xl,
  },

  emptyHint: {
    marginTop: spacing.sm,
    textAlign: 'center',
  },

  loanCard: {
    marginBottom: spacing.md,
  },

  loanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },

  loanHeaderLeft: {
    flex: 1,
  },

  loanValue: {
    fontWeight: '700',
    fontSize: 18,
    marginBottom: spacing.xs,
  },

  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },

  statusText: {
    fontWeight: '600',
  },

  loanInfo: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    gap: spacing.xs,
  },

  loanInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  motivoContainer: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: `${colors.error.DEFAULT}10`,
    borderRadius: 8,
  },
});
