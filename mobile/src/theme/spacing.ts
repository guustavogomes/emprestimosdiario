/**
 * Design System - Espaçamento
 * Sistema de espaçamento em escala de 4px
 */

export const spacing = {
  // Espaçamentos base (múltiplos de 4)
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,

  // Atalhos comuns
  screen: {
    horizontal: 20, // Padding horizontal padrão das telas
    vertical: 24, // Padding vertical padrão das telas
  },

  card: {
    padding: 16, // Padding interno dos cards
    gap: 12, // Espaço entre elementos dentro do card
  },

  form: {
    gap: 16, // Espaço entre campos do formulário
    labelGap: 6, // Espaço entre label e input
  },
};
