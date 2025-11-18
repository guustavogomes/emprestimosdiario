/**
 * Tela de Cadastro de Cliente
 * Auto-cadastro para novos clientes
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { colors, spacing } from '../theme';
import { Button, Input, Text, Card } from '../components';
import { createCliente } from '../services/clientService';
import { buscarCep } from '../services/viaCepService';
import {
  cpfMask,
  phoneMask,
  cepMask,
  dateMask,
  removeCpfMask,
  removePhoneMask,
  removeCepMask,
  removeDateMask,
  isValidCpf,
  isValidDate,
  isValidEmail,
  isValidPhone,
} from '../utils/masks';

export function RegisterScreen() {
  const navigation = useNavigation();

  // Dados pessoais
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');

  // Endereço
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');

  // Contatos de emergência
  const [nomeEmergencia1, setNomeEmergencia1] = useState('');
  const [telefoneEmergencia1, setTelefoneEmergencia1] = useState('');

  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);

  // Rastreia quais campos foram tocados (para mostrar erros apenas depois que o usuário editou)
  const [touched, setTouched] = useState({
    nome: false,
    cpf: false,
    telefone: false,
    whatsapp: false,
    email: false,
    senha: false,
    confirmarSenha: false,
    dataNascimento: false,
  });

  // Marca um campo como tocado
  const handleBlur = (field: keyof typeof touched) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Validações individuais
  const getFieldError = (field: keyof typeof touched): string | undefined => {
    if (!touched[field]) return undefined;

    switch (field) {
      case 'nome':
        return nome.trim() ? undefined : 'Nome é obrigatório';
      case 'cpf':
        if (!cpf.trim()) return 'CPF é obrigatório';
        return isValidCpf(cpf) ? undefined : 'CPF inválido';
      case 'telefone':
        if (!telefone.trim()) return 'Telefone é obrigatório';
        return isValidPhone(telefone) ? undefined : 'Telefone incompleto';
      case 'whatsapp':
        if (!whatsapp.trim()) return 'WhatsApp é obrigatório';
        return isValidPhone(whatsapp) ? undefined : 'WhatsApp incompleto';
      case 'email':
        if (!email) return undefined; // Email continua opcional
        return isValidEmail(email) ? undefined : 'Email inválido';
      case 'senha':
        if (!senha.trim()) return 'Senha é obrigatória';
        return senha.length >= 6 ? undefined : 'Mínimo 6 caracteres';
      case 'confirmarSenha':
        if (!confirmarSenha.trim()) return 'Confirme a senha';
        if (confirmarSenha.length < 6) return 'Mínimo 6 caracteres';
        return senha === confirmarSenha ? undefined : 'Senhas não coincidem';
      case 'dataNascimento':
        if (!dataNascimento) return 'Data de nascimento é obrigatória'; // Agora obrigatório
        return isValidDate(dataNascimento) ? undefined : 'Data inválida';
      default:
        return undefined;
    }
  };

  // Verifica se um campo está válido (para mostrar check verde)
  const isFieldValid = (field: keyof typeof touched): boolean => {
    switch (field) {
      case 'nome':
        return !!nome.trim();
      case 'cpf':
        return !!cpf.trim() && isValidCpf(cpf);
      case 'telefone':
        return !!telefone.trim() && isValidPhone(telefone);
      case 'whatsapp':
        return !!whatsapp.trim() && isValidPhone(whatsapp);
      case 'email':
        return !!email && isValidEmail(email); // Só verde se preenchido e válido
      case 'senha':
        return senha.length >= 6;
      case 'confirmarSenha':
        return confirmarSenha.length >= 6 && senha === confirmarSenha;
      case 'dataNascimento':
        return !!dataNascimento && isValidDate(dataNascimento); // Obrigatório agora
      default:
        return false;
    }
  };

  // Verifica se todos os campos obrigatórios estão preenchidos e válidos
  const isFormValid = () => {
    return (
      nome.trim().length > 0 &&
      cpf.trim().length > 0 &&
      isValidCpf(cpf) &&
      telefone.trim().length > 0 &&
      isValidPhone(telefone) &&
      whatsapp.trim().length > 0 &&
      isValidPhone(whatsapp) &&
      senha.trim().length >= 6 &&
      confirmarSenha.trim().length >= 6 &&
      senha === confirmarSenha &&
      (!email || isValidEmail(email)) && // Email é opcional, mas se preenchido deve ser válido
      dataNascimento.trim().length > 0 && // Data agora é obrigatória
      isValidDate(dataNascimento)
    );
  };

  async function handleCepChange(value: string) {
    const cepFormatado = cepMask(value);
    setCep(cepFormatado);

    // Remove máscara para verificar se tem 8 dígitos
    const cepLimpo = value.replace(/\D/g, '');

    // Busca automaticamente quando tiver 8 dígitos
    if (cepLimpo.length === 8) {
      setLoadingCep(true);

      const dadosCep = await buscarCep(cepLimpo);

      setLoadingCep(false);

      if (dadosCep) {
        // Preenche os campos automaticamente
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

  function validateForm(): boolean {
    if (!nome.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Nome obrigatório',
        text2: 'Por favor, preencha seu nome completo',
      });
      return false;
    }

    if (!cpf.trim()) {
      Toast.show({
        type: 'error',
        text1: 'CPF obrigatório',
        text2: 'Por favor, preencha seu CPF',
      });
      return false;
    }

    if (!isValidCpf(cpf)) {
      Toast.show({
        type: 'error',
        text1: 'CPF inválido',
        text2: 'Por favor, verifique o CPF digitado',
      });
      return false;
    }

    if (!telefone.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Telefone obrigatório',
        text2: 'Por favor, preencha seu telefone',
      });
      return false;
    }

    if (!isValidPhone(telefone)) {
      Toast.show({
        type: 'error',
        text1: 'Telefone incompleto',
        text2: 'Digite o telefone completo (10 ou 11 dígitos)',
      });
      return false;
    }

    if (!whatsapp.trim()) {
      Toast.show({
        type: 'error',
        text1: 'WhatsApp obrigatório',
        text2: 'Necessário para recuperação de senha',
      });
      return false;
    }

    if (!isValidPhone(whatsapp)) {
      Toast.show({
        type: 'error',
        text1: 'WhatsApp incompleto',
        text2: 'Digite o WhatsApp completo (10 ou 11 dígitos)',
      });
      return false;
    }

    if (!isValidEmail(email)) {
      Toast.show({
        type: 'error',
        text1: 'Email inválido',
        text2: 'Por favor, insira um email válido',
      });
      return false;
    }

    if (dataNascimento && !isValidDate(dataNascimento)) {
      Toast.show({
        type: 'error',
        text1: 'Data de nascimento inválida',
        text2: 'Use o formato DD/MM/AAAA com data válida',
      });
      return false;
    }

    if (!senha.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Senha obrigatória',
        text2: 'Por favor, crie uma senha',
      });
      return false;
    }

    if (senha.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Senha muito curta',
        text2: 'A senha deve ter no mínimo 6 caracteres',
      });
      return false;
    }

    if (senha !== confirmarSenha) {
      Toast.show({
        type: 'error',
        text1: 'Senhas não coincidem',
        text2: 'Por favor, verifique as senhas digitadas',
      });
      return false;
    }

    return true;
  }

  async function handleRegister() {
    if (!validateForm()) return;

    try {
      setLoading(true);

      await createCliente({
        nome,
        cpf: removeCpfMask(cpf),
        telefone: removePhoneMask(telefone),
        whatsapp: removePhoneMask(whatsapp),
        email: email || null,
        senha,
        dataNascimento: dataNascimento || null,
        cep: cep ? removeCepMask(cep) : null,
        endereco: endereco || null,
        numero: numero || null,
        complemento: complemento || null,
        bairro: bairro || null,
        cidade: cidade || null,
        nomeEmergencia1: nomeEmergencia1 || null,
        telefoneEmergencia1: telefoneEmergencia1
          ? removePhoneMask(telefoneEmergencia1)
          : null,
      });

      Toast.show({
        type: 'success',
        text1: 'Cadastro realizado!',
        text2: 'Aguarde aprovação do administrador',
      });

      // Volta para a tela de login
      navigation.goBack();
    } catch (error: any) {
      console.error('Erro ao cadastrar:', error);

      const errorMessage =
        error.response?.data?.error || 'Erro ao realizar cadastro';

      Toast.show({
        type: 'error',
        text1: 'Erro no cadastro',
        text2: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }

  function navigateToLogin() {
    navigation.goBack();
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
            Cadastro de Cliente
          </Text>
          <Text variant="body" color={colors.text.secondary} style={styles.subtitle}>
            Preencha seus dados para se cadastrar
          </Text>
        </View>

        {/* Dados Pessoais */}
        <Card style={styles.section}>
          <Text variant="h4" style={styles.sectionTitle}>
            Dados Pessoais
          </Text>

          <Input
            label="Nome Completo *"
            value={nome}
            onChangeText={setNome}
            onBlur={() => handleBlur('nome')}
            placeholder="Seu nome completo"
            autoCapitalize="words"
            error={getFieldError('nome')}
            success={isFieldValid('nome')}
          />

          <Input
            label="CPF *"
            value={cpf}
            onChangeText={setCpf}
            onBlur={() => handleBlur('cpf')}
            mask={cpfMask}
            placeholder="000.000.000-00"
            keyboardType="numeric"
            maxLength={14}
            error={getFieldError('cpf')}
            success={isFieldValid('cpf')}
          />

          <Input
            label="Telefone *"
            value={telefone}
            onChangeText={setTelefone}
            onBlur={() => handleBlur('telefone')}
            mask={phoneMask}
            placeholder="(00) 00000-0000"
            keyboardType="phone-pad"
            maxLength={15}
            error={getFieldError('telefone')}
            success={isFieldValid('telefone')}
          />

          <Input
            label="WhatsApp * 📱"
            value={whatsapp}
            onChangeText={setWhatsapp}
            onBlur={() => handleBlur('whatsapp')}
            mask={phoneMask}
            placeholder="(00) 00000-0000"
            keyboardType="phone-pad"
            maxLength={15}
            error={getFieldError('whatsapp')}
            success={isFieldValid('whatsapp')}
          />

          <Input
            label="Email (opcional)"
            value={email}
            onChangeText={setEmail}
            onBlur={() => handleBlur('email')}
            placeholder="seu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            error={getFieldError('email')}
            success={isFieldValid('email')}
          />

          <Input
            label="Data de Nascimento *"
            value={dataNascimento}
            onChangeText={setDataNascimento}
            onBlur={() => handleBlur('dataNascimento')}
            mask={dateMask}
            placeholder="DD/MM/AAAA"
            keyboardType="numeric"
            maxLength={10}
            error={getFieldError('dataNascimento')}
            success={isFieldValid('dataNascimento')}
          />
        </Card>

        {/* Segurança */}
        <Card style={styles.section}>
          <Text variant="h4" style={styles.sectionTitle}>
            Crie sua Senha 🔐
          </Text>

          <Input
            label="Senha *"
            value={senha}
            onChangeText={setSenha}
            onBlur={() => handleBlur('senha')}
            placeholder="Mínimo 6 caracteres"
            secureTextEntry
            autoCapitalize="none"
            error={getFieldError('senha')}
            success={isFieldValid('senha')}
          />

          <Input
            label="Confirmar Senha *"
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            onBlur={() => handleBlur('confirmarSenha')}
            placeholder="Digite a senha novamente"
            secureTextEntry
            autoCapitalize="none"
            error={getFieldError('confirmarSenha')}
            success={isFieldValid('confirmarSenha')}
          />

          <Text variant="caption" color={colors.text.tertiary} style={styles.passwordHint}>
            💡 Você usará CPF e senha para fazer login
          </Text>
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
                <Text variant="caption" color={colors.text.secondary} style={styles.cepLoadingText}>
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
              label="Complemento"
              value={complemento}
              onChangeText={setComplemento}
              placeholder="Apto, Sala, Bloco"
              containerStyle={styles.halfInput}
            />
          </View>

          <Input
            label="Bairro"
            value={bairro}
            onChangeText={setBairro}
            placeholder="Bairro"
          />
        </Card>

        {/* Contato de Emergência */}
        <Card style={styles.section}>
          <Text variant="h4" style={styles.sectionTitle}>
            Contato de Emergência
          </Text>

          <Input
            label="Nome"
            value={nomeEmergencia1}
            onChangeText={setNomeEmergencia1}
            placeholder="Nome do contato"
            autoCapitalize="words"
          />

          <Input
            label="Telefone"
            value={telefoneEmergencia1}
            onChangeText={setTelefoneEmergencia1}
            mask={phoneMask}
            placeholder="(00) 00000-0000"
            keyboardType="phone-pad"
            maxLength={15}
          />
        </Card>

        {/* Botões */}
        <View style={styles.actions}>
          <Button
            title="Cadastrar"
            onPress={handleRegister}
            variant="success"
            size="lg"
            loading={loading}
            disabled={!isFormValid()}
          />

          <Button
            title="Voltar"
            onPress={navigateToLogin}
            variant="outline"
            size="lg"
            style={styles.backButton}
          />
        </View>

        {/* Nota */}
        <View style={styles.note}>
          <Text variant="caption" color={colors.text.secondary} style={styles.noteText}>
            * Campos obrigatórios
          </Text>
          <Text variant="caption" color={colors.text.secondary} style={styles.noteText}>
            Após o cadastro, aguarde a aprovação do administrador para acessar o sistema.
          </Text>
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

  subtitle: {
    marginBottom: spacing.md,
  },

  section: {
    marginBottom: spacing.lg,
  },

  sectionTitle: {
    marginBottom: spacing.base,
  },

  passwordHint: {
    marginTop: spacing.sm,
    textAlign: 'center',
  },

  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  halfInput: {
    flex: 1,
  },

  actions: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },

  backButton: {
    marginTop: spacing.sm,
  },

  note: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },

  noteText: {
    textAlign: 'center',
    marginBottom: spacing.xs,
  },

  cepLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },

  cepLoadingText: {
    marginLeft: spacing.xs,
  },
});
