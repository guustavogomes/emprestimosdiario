/**
 * Tela de Solicitar Empréstimo
 * Formulário para solicitar novo empréstimo
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { colors, spacing } from '../theme';
import { Button, Input, Text, Card } from '../components';
import { createEmprestimo } from '../services/loanService';

export function NewLoanScreen() {
  const navigation = useNavigation();

  const [valorSolicitado, setValorSolicitado] = useState('');
  const [numeroParcelas, setNumeroParcelas] = useState('');
  const [loading, setLoading] = useState(false);

  // Taxas de exemplo (você pode ajustar conforme seu negócio)
  const TAXA_JUROS = 5; // 5% ao mês

  function formatCurrency(value: string): string {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');

    // Converte para número e divide por 100 para ter centavos
    const amount = Number(numbers) / 100;

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  }

  function handleValorChange(value: string) {
    setValorSolicitado(formatCurrency(value));
  }

  function getValorNumerico(formattedValue: string): number {
    const numbers = formattedValue.replace(/\D/g, '');
    return Number(numbers) / 100;
  }

  function calculateValues() {
    const valor = getValorNumerico(valorSolicitado);
    const parcelas = Number(numeroParcelas);

    if (!valor || !parcelas) {
      return null;
    }

    // Cálculo simples: valor total = valor + (valor * taxa * meses)
    const jurosMensal = valor * (TAXA_JUROS / 100);
    const valorTotal = valor + jurosMensal * parcelas;
    const valorParcela = valorTotal / parcelas;

    return {
      valor,
      valorTotal,
      valorParcela,
      jurosTotal: valorTotal - valor,
    };
  }

  const calculated = calculateValues();

  function validateForm(): boolean {
    const valor = getValorNumerico(valorSolicitado);
    const parcelas = Number(numeroParcelas);

    if (!valor || valor < 100) {
      Toast.show({
        type: 'error',
        text1: 'Valor inválido',
        text2: 'O valor mínimo é R$ 100,00',
      });
      return false;
    }

    if (!parcelas || parcelas < 1 || parcelas > 12) {
      Toast.show({
        type: 'error',
        text1: 'Parcelas inválidas',
        text2: 'Escolha entre 1 e 12 parcelas',
      });
      return false;
    }

    return true;
  }

  async function handleSubmit() {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const valor = getValorNumerico(valorSolicitado);
      const parcelas = Number(numeroParcelas);

      await createEmprestimo({
        valorSolicitado: valor,
        numeroParcelas: parcelas,
      });

      Toast.show({
        type: 'success',
        text1: 'Solicitação enviada!',
        text2: 'Seu empréstimo está em análise',
      });

      // Volta para a Home
      navigation.navigate('Home' as never);
    } catch (error: any) {
      console.error('Erro ao solicitar empréstimo:', error);

      const errorMessage =
        error.response?.data?.error || 'Erro ao solicitar empréstimo';

      Toast.show({
        type: 'error',
        text1: 'Erro na solicitação',
        text2: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="h2" style={styles.title}>
            Solicitar Empréstimo
          </Text>
          <Text variant="body" color={colors.text.secondary}>
            Preencha os dados abaixo para solicitar
          </Text>
        </View>

        {/* Formulário */}
        <Card style={styles.section}>
          <Text variant="h4" style={styles.sectionTitle}>
            Dados da Solicitação
          </Text>

          <Input
            label="Valor Solicitado *"
            value={valorSolicitado}
            onChangeText={handleValorChange}
            placeholder="R$ 0,00"
            keyboardType="numeric"
          />

          <Text variant="caption" color={colors.text.tertiary} style={styles.hint}>
            Valor mínimo: R$ 100,00
          </Text>

          <Input
            label="Número de Parcelas *"
            value={numeroParcelas}
            onChangeText={setNumeroParcelas}
            placeholder="1 a 12 parcelas"
            keyboardType="numeric"
            maxLength={2}
          />

          <Text variant="caption" color={colors.text.tertiary} style={styles.hint}>
            Taxa de juros: {TAXA_JUROS}% ao mês
          </Text>
        </Card>

        {/* Resumo */}
        {calculated && (
          <Card style={[styles.section, styles.summaryCard]}>
            <Text variant="h4" style={styles.sectionTitle}>
              Resumo da Solicitação
            </Text>

            <View style={styles.summaryRow}>
              <Text variant="body" color={colors.text.secondary}>
                Valor solicitado:
              </Text>
              <Text variant="body" style={styles.summaryValue}>
                {formatCurrency((calculated.valor * 100).toString())}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text variant="body" color={colors.text.secondary}>
                Juros total:
              </Text>
              <Text variant="body" color={colors.warning.DEFAULT}>
                {formatCurrency((calculated.jurosTotal * 100).toString())}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text variant="h4">Valor total:</Text>
              <Text variant="h4" color={colors.success.DEFAULT}>
                {formatCurrency((calculated.valorTotal * 100).toString())}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text variant="body" color={colors.text.secondary}>
                {numeroParcelas}x de:
              </Text>
              <Text variant="h4" color={colors.success.DEFAULT}>
                {formatCurrency((calculated.valorParcela * 100).toString())}
              </Text>
            </View>
          </Card>
        )}

        {/* Informações */}
        <Card style={[styles.section, styles.infoCard]}>
          <Text variant="h4" style={styles.sectionTitle}>
            ℹ️ Informações Importantes
          </Text>

          <Text variant="caption" color={colors.text.secondary} style={styles.infoText}>
            • Sua solicitação será analisada por nossa equipe
          </Text>
          <Text variant="caption" color={colors.text.secondary} style={styles.infoText}>
            • O prazo de análise é de até 24 horas
          </Text>
          <Text variant="caption" color={colors.text.secondary} style={styles.infoText}>
            • Você será notificado sobre a aprovação
          </Text>
          <Text variant="caption" color={colors.text.secondary} style={styles.infoText}>
            • Após aprovado, o dinheiro será liberado em até 1 dia útil
          </Text>
        </Card>

        {/* Botões */}
        <View style={styles.actions}>
          <Button
            title="Solicitar Empréstimo"
            onPress={handleSubmit}
            variant="success"
            size="lg"
            loading={loading}
            disabled={!calculated}
          />

          <Button
            title="Cancelar"
            onPress={() => navigation.goBack()}
            variant="outline"
            size="lg"
            style={styles.cancelButton}
          />
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
    padding: spacing.screen.horizontal,
    paddingTop: spacing.screen.vertical,
    paddingBottom: spacing['4xl'],
  },

  header: {
    marginBottom: spacing.xl,
  },

  title: {
    marginBottom: spacing.sm,
  },

  section: {
    marginBottom: spacing.lg,
  },

  sectionTitle: {
    marginBottom: spacing.base,
  },

  hint: {
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },

  summaryCard: {
    backgroundColor: `${colors.success.DEFAULT}05`,
    borderWidth: 1,
    borderColor: `${colors.success.DEFAULT}20`,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },

  summaryValue: {
    fontWeight: '600',
  },

  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing.base,
  },

  infoCard: {
    backgroundColor: `${colors.info.DEFAULT}05`,
    borderWidth: 1,
    borderColor: `${colors.info.DEFAULT}20`,
  },

  infoText: {
    marginBottom: spacing.xs,
    lineHeight: 18,
  },

  actions: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },

  cancelButton: {
    marginTop: spacing.sm,
  },
});
