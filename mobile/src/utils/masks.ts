/**
 * Máscaras de Formatação
 * Funções para formatar inputs (CPF, telefone, CEP)
 */

/**
 * Máscara de CPF: 000.000.000-00
 */
export function cpfMask(value: string): string {
  if (!value) return '';

  const numbers = value.replace(/\D/g, '');
  const limited = numbers.slice(0, 11);

  return limited
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2');
}

/**
 * Máscara de Telefone: (00) 00000-0000 ou (00) 0000-0000
 */
export function phoneMask(value: string): string {
  if (!value) return '';

  const numbers = value.replace(/\D/g, '');
  const limited = numbers.slice(0, 11);

  if (limited.length <= 10) {
    // Telefone fixo: (00) 0000-0000
    return limited
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  } else {
    // Celular: (00) 00000-0000
    return limited
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  }
}

/**
 * Máscara de CEP: 00000-000
 */
export function cepMask(value: string): string {
  if (!value) return '';

  const numbers = value.replace(/\D/g, '');
  const limited = numbers.slice(0, 8);

  return limited.replace(/(\d{5})(\d)/, '$1-$2');
}

/**
 * Remove máscara do CPF
 */
export function removeCpfMask(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Remove máscara do telefone
 */
export function removePhoneMask(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Remove máscara do CEP
 */
export function removeCepMask(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Máscara de Data: DD/MM/AAAA
 */
export function dateMask(value: string): string {
  if (!value) return '';

  const numbers = value.replace(/\D/g, '');
  const limited = numbers.slice(0, 8);

  if (limited.length <= 2) {
    return limited;
  } else if (limited.length <= 4) {
    return limited.replace(/(\d{2})(\d)/, '$1/$2');
  } else {
    return limited.replace(/(\d{2})(\d{2})(\d)/, '$1/$2/$3');
  }
}

/**
 * Remove máscara da data
 */
export function removeDateMask(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Valida CPF
 */
export function isValidCpf(cpf: string): boolean {
  const cleanCpf = cpf.replace(/\D/g, '');

  if (cleanCpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleanCpf)) return false;

  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCpf.substring(i - 1, i)) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCpf.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCpf.substring(i - 1, i)) * (12 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCpf.substring(10, 11))) return false;

  return true;
}

/**
 * Valida Data no formato DD/MM/AAAA
 */
export function isValidDate(date: string): boolean {
  const numbers = date.replace(/\D/g, '');

  if (numbers.length !== 8) return false;

  const day = parseInt(numbers.substring(0, 2));
  const month = parseInt(numbers.substring(2, 4));
  const year = parseInt(numbers.substring(4, 8));

  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  if (year < 1900 || year > new Date().getFullYear()) return false;

  // Valida dias por mês
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  // Ano bissexto
  if (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) {
    daysInMonth[1] = 29;
  }

  if (day > daysInMonth[month - 1]) return false;

  return true;
}

/**
 * Valida Email
 */
export function isValidEmail(email: string): boolean {
  if (!email) return true; // Email é opcional

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida Telefone (completo)
 */
export function isValidPhone(phone: string): boolean {
  const numbers = phone.replace(/\D/g, '');
  // Telefone deve ter 10 dígitos (fixo) ou 11 (celular)
  return numbers.length === 10 || numbers.length === 11;
}
