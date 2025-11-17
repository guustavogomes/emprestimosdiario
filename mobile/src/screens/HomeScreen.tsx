/**
 * Tela Home
 * Dashboard principal do cliente
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing } from '../theme';
import { Button, Text, Card } from '../components';
import { useAuth } from '../contexts/AuthContext';
import {
  getMyLoans,
  Emprestimo,
  getStatusLabel,
  getStatusColor,
  EmprestimoStatus,
} from '../services/loanService';

export function HomeScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();

  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
          clienteId: user?.id || '',
          valorSolicitado: 1000,
          valorAprovado: 1000,
          valorTotal: 1150,
          taxaJuros: 5,
          numeroParcelas: 6,
          valorParcela: 191.67,
          status: EmprestimoStatus.ATIVO,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          clienteId: user?.id || '',
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
          clienteId: user?.id || '',
          valorSolicitado: 2000,
          valorTotal: 2000,
          taxaJuros: 5,
          numeroParcelas: 12,
          status: EmprestimoStatus.QUITADO,
          createdAt: new Date(Date.now() - 2592000000).toISOString(),
          updatedAt: new Date(Date.now() - 2592000000).toISOString(),
        },
      ];

      setEmprestimos(mockData);
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

  // Filtra empréstimos ativos
  const emprestimosAtivos = emprestimos.filter(
    (e) => e.status === EmprestimoStatus.ATIVO || e.status === EmprestimoStatus.ATRASADO
  );

  // Calcula total devido
  const totalDevido = emprestimosAtivos.reduce(
    (acc, e) => acc + Number(e.valorTotal || 0),
    0
  );

  function handleNewLoan() {
    // TODO: Navegar para tela de solicitar empréstimo
    navigation.navigate('NewLoan' as never);
  }

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

  function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Saudação */}
      <View style={styles.header}>
        <Text variant="h2" style={styles.greeting}>
          {getGreeting()}, {user?.nome?.split(' ')[0]}!
        </Text>
        <Text variant="body" color={colors.text.secondary}>
          Aqui está seu resumo financeiro
        </Text>
      </View>

      {/* Resumo */}
      <View style={styles.summary}>
        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text variant="caption" color={colors.text.secondary}>
                Empréstimos Ativos
              </Text>
              <Text variant="h2" color={colors.success.DEFAULT}>
                {emprestimosAtivos.length}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryItem}>
              <Text variant="caption" color={colors.text.secondary}>
                Total Devido
              </Text>
              <Text variant="h3" color={colors.error.DEFAULT}>
                {formatCurrency(totalDevido)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Botão Solicitar Empréstimo */}
        <Button
          title="Solicitar Novo Empréstimo"
          onPress={handleNewLoan}
          variant="success"
          size="lg"
          style={styles.newLoanButton}
        />
      </View>

      {/* Lista de Empréstimos */}
      <View style={styles.section}>
        <Text variant="h3" style={styles.sectionTitle}>
          Meus Empréstimos
        </Text>

        {loading ? (
          <Card style={styles.emptyCard}>
            <Text variant="body" color={colors.text.secondary}>
              Carregando...
            </Text>
          </Card>
        ) : emprestimos.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text variant="body" color={colors.text.secondary}>
              Você ainda não possui empréstimos
            </Text>
            <Text variant="caption" color={colors.text.tertiary} style={styles.emptyHint}>
              Toque no botão acima para solicitar seu primeiro empréstimo
            </Text>
          </Card>
        ) : (
          emprestimos.slice(0, 5).map((emprestimo) => (
            <TouchableOpacity
              key={emprestimo.id}
              onPress={() => {
                // TODO: Navegar para detalhes do empréstimo
              }}
              activeOpacity={0.7}
            >
              <Card style={styles.loanCard}>
                <View style={styles.loanHeader}>
                  <View>
                    <Text variant="body" style={styles.loanValue}>
                      {formatCurrency(Number(emprestimo.valorAprovado || emprestimo.valorSolicitado))}
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

                <View style={styles.loanFooter}>
                  <Text variant="caption" color={colors.text.tertiary}>
                    Solicitado em {formatDate(emprestimo.createdAt)}
                  </Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}

        {emprestimos.length > 5 && (
          <TouchableOpacity
            onPress={() => navigation.navigate('History' as never)}
            style={styles.viewAllButton}
          >
            <Text variant="body" color={colors.success.DEFAULT}>
              Ver todos os empréstimos →
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.DEFAULT,
  },

  scrollContent: {
    padding: spacing.screen.horizontal,
    paddingBottom: spacing['4xl'],
  },

  header: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },

  greeting: {
    marginBottom: spacing.xs,
  },

  summary: {
    marginBottom: spacing['2xl'],
  },

  summaryCard: {
    marginBottom: spacing.lg,
  },

  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },

  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },

  divider: {
    width: 1,
    height: 60,
    backgroundColor: colors.border.light,
  },

  newLoanButton: {
    shadowColor: colors.success.DEFAULT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  section: {
    marginBottom: spacing.xl,
  },

  sectionTitle: {
    marginBottom: spacing.base,
  },

  emptyCard: {
    alignItems: 'center',
    padding: spacing.xl,
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

  loanValue: {
    fontWeight: '700',
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

  loanFooter: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },

  viewAllButton: {
    alignItems: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.md,
  },
});
