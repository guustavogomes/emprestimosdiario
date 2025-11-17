import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { colors, typography, spacing } from '../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  mask?: (value: string) => string;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  mask,
  value,
  onChangeText,
  containerStyle,
  style,
  editable = true,
  ...rest
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleChangeText = (text: string) => {
    const maskedText = mask ? mask(text) : text;
    onChangeText?.(maskedText);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          {!editable && (
            <Text style={styles.lockIcon}>🔒</Text>
          )}
        </View>
      )}

      <TextInput
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          error && styles.inputError,
          !editable && styles.inputDisabled,
          style,
        ]}
        value={value}
        onChangeText={handleChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholderTextColor={colors.text.tertiary}
        editable={editable}
        {...rest}
      />

      {error && <Text style={styles.errorText}>{error}</Text>}
      {!editable && (
        <Text style={styles.disabledHint}>
          Este campo não pode ser alterado
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.form.gap,
  },

  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.form.labelGap,
  },

  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },

  lockIcon: {
    fontSize: typography.fontSize.xs,
    marginLeft: spacing.xs,
  },

  input: {
    height: 48,
    borderWidth: 1.5,
    borderColor: colors.border.DEFAULT,
    borderRadius: 12,
    paddingHorizontal: spacing.base,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    backgroundColor: colors.white,
  },

  inputFocused: {
    borderColor: colors.primary[600],
  },

  inputError: {
    borderColor: colors.error.DEFAULT,
  },

  inputDisabled: {
    backgroundColor: colors.gray[100],
    borderColor: colors.border.light,
    color: colors.text.secondary,
  },

  errorText: {
    fontSize: typography.fontSize.xs,
    color: colors.error.DEFAULT,
    marginTop: spacing.xs,
  },

  disabledHint: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
});
