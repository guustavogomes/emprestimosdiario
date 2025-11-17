import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, typography, spacing } from '../theme';

type ButtonVariant = 'default' | 'success' | 'cancel' | 'danger' | 'search' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'default',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[`${variant}Container`],
        styles[`${size}Container`],
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? colors.primary[600] : colors.white}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.text,
            styles[`${variant}Text`],
            styles[`${size}Text`],
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },

  // Tamanhos
  smContainer: {
    height: 40,
    paddingHorizontal: spacing.base,
  },
  mdContainer: {
    height: 48,
    paddingHorizontal: spacing.lg,
  },
  lgContainer: {
    height: 56,
    paddingHorizontal: spacing.xl,
  },

  // Variantes de container
  defaultContainer: {
    backgroundColor: colors.primary[600],
  },
  successContainer: {
    backgroundColor: colors.primary[600],
  },
  cancelContainer: {
    backgroundColor: colors.gray[500],
  },
  dangerContainer: {
    backgroundColor: colors.error.DEFAULT,
  },
  searchContainer: {
    backgroundColor: colors.info.DEFAULT,
  },
  outlineContainer: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border.DEFAULT,
  },

  // Estado disabled
  disabled: {
    opacity: 0.5,
  },

  // Texto base
  text: {
    fontWeight: typography.fontWeight.semibold,
  },

  // Tamanhos de texto
  smText: {
    fontSize: typography.fontSize.sm,
  },
  mdText: {
    fontSize: typography.fontSize.base,
  },
  lgText: {
    fontSize: typography.fontSize.lg,
  },

  // Variantes de texto
  defaultText: {
    color: colors.white,
  },
  successText: {
    color: colors.white,
  },
  cancelText: {
    color: colors.white,
  },
  dangerText: {
    color: colors.white,
  },
  searchText: {
    color: colors.white,
  },
  outlineText: {
    color: colors.text.primary,
  },
});
