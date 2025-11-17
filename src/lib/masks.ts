/**
 * Funções de máscara para formatação de inputs
 */

/**
 * Máscara de CPF: 000.000.000-00
 */
export function cpfMask(value: string): string {
  if (!value) return "";

  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, "");

  // Limita a 11 dígitos
  const limited = numbers.slice(0, 11);

  // Aplica a máscara
  return limited
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2");
}

/**
 * Remove máscara do CPF
 */
export function removeCpfMask(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Máscara de Telefone: (00) 00000-0000 ou (00) 0000-0000
 */
export function phoneMask(value: string): string {
  if (!value) return "";

  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, "");

  // Limita a 11 dígitos
  const limited = numbers.slice(0, 11);

  // Aplica a máscara
  if (limited.length <= 10) {
    // Telefone fixo: (00) 0000-0000
    return limited
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  } else {
    // Celular: (00) 00000-0000
    return limited
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2");
  }
}

/**
 * Remove máscara do telefone
 */
export function removePhoneMask(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Máscara de CEP: 00000-000
 */
export function cepMask(value: string): string {
  if (!value) return "";

  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, "");

  // Limita a 8 dígitos
  const limited = numbers.slice(0, 8);

  // Aplica a máscara
  return limited.replace(/(\d{5})(\d)/, "$1-$2");
}

/**
 * Remove máscara do CEP
 */
export function removeCepMask(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Máscara de Data: 00/00/0000
 */
export function dateMask(value: string): string {
  if (!value) return "";

  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, "");

  // Limita a 8 dígitos
  const limited = numbers.slice(0, 8);

  // Aplica a máscara
  return limited
    .replace(/(\d{2})(\d)/, "$1/$2")
    .replace(/(\d{2})(\d)/, "$1/$2");
}

/**
 * Máscara de Moeda: R$ 0.000,00
 */
export function currencyMask(value: string): string {
  if (!value) return "";

  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, "");

  // Converte para número
  const amount = parseInt(numbers) / 100;

  // Formata como moeda brasileira
  return amount.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/**
 * Remove máscara de moeda e retorna número
 */
export function removeCurrencyMask(value: string): number {
  const numbers = value.replace(/\D/g, "");
  return parseInt(numbers) / 100;
}
