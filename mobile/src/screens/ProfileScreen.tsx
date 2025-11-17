/**
 * Tela de Perfil
 * Editar dados pessoais do cliente
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { colors, spacing } from '../theme';
import { Button, Input, Text, Card } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { getMyProfile, updateMyProfile, Cliente } from '../services/clientService';
import { buscarCep } from '../services/viaCepService';
import {
  phoneMask,
  cepMask,
  removePhoneMask,
  removeCepMask,
} from '../utils/masks';

export function ProfileScreen() {
  const { user, signOut } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);

  // Dados pessoais
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');

  // Endereço
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');

  // Contatos de emergência
  const [nomeEmergencia1, setNomeEmergencia1] = useState('');
  const [telefoneEmergencia1, setTelefoneEmergencia1] = useState('');
  const [nomeEmergencia2, setNomeEmergencia2] = useState('');
  const [telefoneEmergencia2, setTelefoneEmergencia2] = useState('');

  // Informações adicionais
  const [chavePix, setChavePix] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);

      // TODO: Buscar dados reais da API quando estiver pronta
      // const data = await getMyProfile();

      // Por enquanto, usar dados mockados do usuário logado
      if (user) {
        setNome(user.nome || '');
        setCpf(user.cpf || '');

        // Dados mockados para demonstração
        setTelefone(phoneMask('11987654321'));
        setDataNascimento('15/05/1990');
        setCep(cepMask('01310100'));
        setEndereco('Av. Paulista');
        setNumero('1000');
        setBairro('Bela Vista');
        setCidade('São Paulo');
        setNomeEmergencia1('Maria Silva');
        setTelefoneEmergencia1(phoneMask('11912345678'));
        setNomeEmergencia2('João Santos');
        setTelefoneEmergencia2(phoneMask('11998765432'));
        setChavePix(user.cpf || '');
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro ao carregar perfil',
        text2: 'Não foi possível carregar seus dados',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleCepChange(value: string) {
    const cepFormatado = cepMask(value);
    setCep(cepFormatado);

    const cepLimpo = value.replace(/\D/g, '');

    if (cepLimpo.length === 8) {
      setLoadingCep(true);

      const dadosCep = await buscarCep(cepLimpo);

      setLoadingCep(false);

      if (dadosCep) {
        setEndereco(dadosCep.logradouro);
        setBairro(dadosCep.bairro);
        setCidade(dadosCep.localidade);

        Toast.show({
          type: 'success',
          text1: 'CEP encontrado!',
          text2: 'Endereço preenchido automaticamente',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'CEP não encontrado',
          text2: 'Preencha o endereço manualmente',
        });
      }
    }
  }

  async function handleSave() {
    if (!telefone.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Telefone obrigatório',
        text2: 'Por favor, preencha seu telefone',
      });
      return;
    }

    try {
      setSaving(true);

      await updateMyProfile({
        telefone: removePhoneMask(telefone),
        cep: cep ? removeCepMask(cep) : null,
        endereco: endereco || null,
        numero: numero || null,
        bairro: bairro || null,
        cidade: cidade || null,
        nomeEmergencia1: nomeEmergencia1 || null,
        telefoneEmergencia1: telefoneEmergencia1
          ? removePhoneMask(telefoneEmergencia1)
          : null,
        nomeEmergencia2: nomeEmergencia2 || null,
        telefoneEmergencia2: telefoneEmergencia2
          ? removePhoneMask(telefoneEmergencia2)
          : null,
        chavePix: chavePix || null,
      });

      Toast.show({
        type: 'success',
        text1: 'Perfil atualizado!',
        text2: 'Seus dados foram salvos com sucesso',
      });
    } catch (error: any) {
      console.error('Erro ao salvar perfil:', error);

      const errorMessage =
        error.response?.data?.error || 'Erro ao salvar dados';

      Toast.show({
        type: 'error',
        text1: 'Erro ao salvar',
        text2: errorMessage,
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.success.DEFAULT} />
        <Text variant="body" color={colors.text.secondary} style={styles.loadingText}>
          Carregando perfil...
        </Text>
      </View>
    );
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
        {/* Dados Pessoais */}
        <Card style={styles.section}>
          <Text variant="h4" style={styles.sectionTitle}>
            Dados Pessoais
          </Text>

          <Input
            label="Nome Completo"
            value={nome}
            onChangeText={setNome}
            placeholder="Seu nome completo"
            editable={false}
          />

          <Input
            label="CPF"
            value={cpf}
            onChangeText={setCpf}
            placeholder="000.000.000-00"
            editable={false}
          />

          <Input
            label="Telefone *"
            value={telefone}
            onChangeText={setTelefone}
            mask={phoneMask}
            placeholder="(00) 00000-0000"
            keyboardType="phone-pad"
            maxLength={15}
          />
        </Card>

        {/* Endereço */}
        <Card style={styles.section}>
          <Text variant="h4" style={styles.sectionTitle}>
            Endereço
          </Text>

          <View>
            <Input
              label="CEP"
              value={cep}
              onChangeText={handleCepChange}
              placeholder="00000-000"
              keyboardType="numeric"
              maxLength={9}
            />
            {loadingCep && (
              <View style={styles.cepLoading}>
                <ActivityIndicator size="small" color={colors.success.DEFAULT} />
                <Text variant="caption" color={colors.text.secondary}>
                  Buscando CEP...
                </Text>
              </View>
            )}
          </View>

          <Input
            label="Cidade"
            value={cidade}
            onChangeText={setCidade}
            placeholder="Sua cidade"
          />

          <Input
            label="Endereço"
            value={endereco}
            onChangeText={setEndereco}
            placeholder="Rua, Avenida, etc"
          />

          <View style={styles.row}>
            <Input
              label="Número"
              value={numero}
              onChangeText={setNumero}
              placeholder="Nº"
              containerStyle={styles.halfInput}
              keyboardType="numeric"
            />

            <Input
              label="Bairro"
              value={bairro}
              onChangeText={setBairro}
              placeholder="Bairro"
              containerStyle={styles.halfInput}
            />
          </View>
        </Card>

        {/* Contatos de Emergência */}
        <Card style={styles.section}>
          <Text variant="h4" style={styles.sectionTitle}>
            Contatos de Emergência
          </Text>

          <Input
            label="Nome do Contato 1"
            value={nomeEmergencia1}
            onChangeText={setNomeEmergencia1}
            placeholder="Nome completo"
          />

          <Input
            label="Telefone do Contato 1"
            value={telefoneEmergencia1}
            onChangeText={setTelefoneEmergencia1}
            mask={phoneMask}
            placeholder="(00) 00000-0000"
            keyboardType="phone-pad"
            maxLength={15}
          />

          <View style={styles.divider} />

          <Input
            label="Nome do Contato 2"
            value={nomeEmergencia2}
            onChangeText={setNomeEmergencia2}
            placeholder="Nome completo"
          />

          <Input
            label="Telefone do Contato 2"
            value={telefoneEmergencia2}
            onChangeText={setTelefoneEmergencia2}
            mask={phoneMask}
            placeholder="(00) 00000-0000"
            keyboardType="phone-pad"
            maxLength={15}
          />
        </Card>

        {/* Informações Adicionais */}
        <Card style={styles.section}>
          <Text variant="h4" style={styles.sectionTitle}>
            Informações Adicionais
          </Text>

          <Input
            label="Chave PIX"
            value={chavePix}
            onChangeText={setChavePix}
            placeholder="CPF, telefone, email ou chave aleatória"
          />
        </Card>

        {/* Botões */}
        <Button
          title="Salvar Alterações"
          onPress={handleSave}
          variant="success"
          size="lg"
          loading={saving}
          style={styles.saveButton}
        />

        <Button
          title="Sair da Conta"
          onPress={signOut}
          variant="danger"
          size="md"
          style={styles.logoutButton}
        />

        <Text variant="caption" color={colors.text.tertiary} style={styles.note}>
          * Campos obrigatórios
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
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

  scrollContent: {
    padding: spacing.screen.horizontal,
    paddingTop: spacing.screen.vertical,
    paddingBottom: spacing['4xl'],
  },

  section: {
    marginBottom: spacing.lg,
  },

  sectionTitle: {
    marginBottom: spacing.base,
  },

  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  halfInput: {
    flex: 1,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing.base,
  },

  cepLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },

  saveButton: {
    marginTop: spacing.lg,
  },

  logoutButton: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },

  note: {
    textAlign: 'center',
  },
});
