/**
 * Design System - Tipografia
 * Hierarquia tipográfica profissional
 */

export const typography = {
  // Tamanhos de fonte
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },

  // Pesos
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // Altura de linha
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Estilos pré-definidos
  styles: {
    // Títulos
    h1: {
      fontSize: 30,
      fontWeight: '700' as const,
      lineHeight: 36,
    },
    h2: {
      fontSize: 24,
      fontWeight: '700' as const,
      lineHeight: 30,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 26,
    },
    h4: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 24,
    },

    // Corpo de texto
    bodyLarge: {
      fontSize: 18,
      fontWeight: '400' as const,
      lineHeight: 27,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 21,
    },

    // Legendas
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 18,
    },

    // Botões
    button: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
    buttonSmall: {
      fontSize: 14,
      fontWeight: '600' as const,
      lineHeight: 20,
    },

    // Labels
    label: {
      fontSize: 14,
      fontWeight: '500' as const,
      lineHeight: 20,
    },
  },
};
