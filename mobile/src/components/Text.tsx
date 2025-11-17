import React, { ReactNode } from 'react';
import { Text as RNText, StyleSheet, TextStyle } from 'react-native';
import { colors, typography } from '../theme';

type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'bodyLarge' | 'body' | 'bodySmall' | 'caption' | 'label';

interface TextProps {
  children: ReactNode;
  variant?: TextVariant;
  color?: string;
  style?: TextStyle;
  numberOfLines?: number;
}

export function Text({
  children,
  variant = 'body',
  color = colors.text.primary,
  style,
  numberOfLines,
}: TextProps) {
  return (
    <RNText
      style={[
        styles[variant],
        { color },
        style,
      ]}
      numberOfLines={numberOfLines}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  h1: typography.styles.h1,
  h2: typography.styles.h2,
  h3: typography.styles.h3,
  h4: typography.styles.h4,
  bodyLarge: typography.styles.bodyLarge,
  body: typography.styles.body,
  bodySmall: typography.styles.bodySmall,
  caption: typography.styles.caption,
  label: typography.styles.label,
});
