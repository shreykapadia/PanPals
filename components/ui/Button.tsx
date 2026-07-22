import React from 'react';
import { Pressable, Text, ActivityIndicator } from 'react-native';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
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
  const baseStyles = 'h-12 w-full rounded-full flex flex-row items-center justify-center px-6';

  const variantStyles =
    variant === 'primary'
      ? 'bg-primary-container active:bg-primary'
      : 'bg-card-surface border border-border-warm active:bg-surface-container';

  const textStyles =
    variant === 'primary'
      ? 'text-dark-neutral font-semibold text-sm tracking-wide font-satoshi'
      : 'text-dark-neutral font-semibold text-sm tracking-wide font-satoshi';

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
        <ActivityIndicator color="#333333" size="small" />
      ) : (
        <Text className={textStyles}>{label}</Text>
      )}
    </Pressable>
  );
};
