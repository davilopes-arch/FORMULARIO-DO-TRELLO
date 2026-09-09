/**
 * Utilitários para validação matemática de CPF e CNPJ (dígitos verificadores oficiais - Módulo 11)
 */

export function isValidCPF(cpf: string): boolean {
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return false;

  // Rejeita sequências conhecidas de dígitos iguais
  if (/^(\d)\1{10}$/.test(clean)) return false;

  // Primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean.charAt(i), 10) * (10 - i);
  }
  let rest = 11 - (sum % 11);
  let digit1 = rest >= 10 ? 0 : rest;
  if (digit1 !== parseInt(clean.charAt(9), 10)) return false;

  // Segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean.charAt(i), 10) * (11 - i);
  }
  rest = 11 - (sum % 11);
  let digit2 = rest >= 10 ? 0 : rest;
  return digit2 === parseInt(clean.charAt(10), 10);
}

export function isValidCNPJ(cnpj: string): boolean {
  const clean = cnpj.replace(/\D/g, '');
  if (clean.length !== 14) return false;

  // Rejeita sequências conhecidas de dígitos iguais
  if (/^(\d)\1{13}$/.test(clean)) return false;

  // Primeiro dígito
  let size = clean.length - 2;
  let numbers = clean.substring(0, size);
  let pos = size - 7;
  let sum = 0;

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i), 10) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(clean.charAt(12), 10)) return false;

  // Segundo dígito
  size = size + 1;
  numbers = clean.substring(0, size);
  pos = size - 7;
  sum = 0;

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i), 10) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return result === parseInt(clean.charAt(13), 10);
}

export type DocumentValidationResult = {
  isValid: boolean;
  type: 'cpf' | 'cnpj' | 'incompleto' | 'invalido' | 'vazio';
  message: string;
};

export function validateDocument(doc: string): DocumentValidationResult {
  const digits = doc.replace(/\D/g, '');

  if (!digits) {
    return {
      isValid: true, // Campo opcional
      type: 'vazio',
      message: 'Opcional — digite CPF ou CNPJ',
    };
  }

  if (digits.length < 11) {
    return {
      isValid: false,
      type: 'incompleto',
      message: `Digitando CPF (${digits.length}/11 dígitos)...`,
    };
  }

  if (digits.length === 11) {
    const valid = isValidCPF(digits);
    return {
      isValid: valid,
      type: valid ? 'cpf' : 'invalido',
      message: valid ? '✓ CPF válido (dígitos verificados)' : '⚠ CPF inválido (dígitos verificadores não conferem)',
    };
  }

  if (digits.length > 11 && digits.length < 14) {
    return {
      isValid: false,
      type: 'incompleto',
      message: `Digitando CNPJ (${digits.length}/14 dígitos)...`,
    };
  }

  if (digits.length === 14) {
    const valid = isValidCNPJ(digits);
    return {
      isValid: valid,
      type: valid ? 'cnpj' : 'invalido',
      message: valid ? '✓ CNPJ válido (dígitos verificados)' : '⚠ CNPJ inválido (dígitos verificadores não conferem)',
    };
  }

  return {
    isValid: false,
    type: 'invalido',
    message: 'Tamanho de documento inválido',
  };
}
