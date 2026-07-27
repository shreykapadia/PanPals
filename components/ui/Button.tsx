import React from 'react';
import { Pressable, Text, ActivityIndicator } from 'react-native';
import { colors } from '../../theme/tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  accessibilityLabel,
  className = '',
}) => {
  // `ghost` drops the pill chrome so a screen can offer a secondary path
  // without a second full-width pill competing with the primary CTA.
  const baseStyles = `h-12 w-full flex flex-row items-center justify-center px-6 ${
    variant === 'ghost' ? '' : 'rounded-full'
  }`;

  const variantStyles =
    variant === 'primary'
      ? 'bg-primary-container active:bg-primary'
      : variant === 'secondary'
        ? 'bg-card-surface border border-border-warm active:bg-surface-container'
        : 'active:opacity-60';

  // Satoshi ships Regular/Medium/Bold in assets/fonts — there is no Semibold
  // face, so the documented weight-600 button label uses the Medium family
  // rather than a fontWeight only iOS can fake (DESIGN-TOKENS §2).
  const textStyles = 'text-dark-neutral text-base tracking-wide font-satoshi-medium';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityState={{ disabled }}
      className={`${baseStyles} ${variantStyles} ${disabled ? 'opacity-50' : ''} ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={colors['dark-neutral']} size="small" />
      ) : (
        <Text className={textStyles}>{label}</Text>
      )}
    </Pressable>
  );
};
