import React from 'react';
import { View, Text } from 'react-native';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'default', className = '' }) => {
  const getStyles = () => {
    switch (variant) {
      case 'success':
        return {
          bg: 'bg-secondary-container',
          text: 'text-secondary',
        };
      case 'warning':
        return {
          bg: 'bg-warning-peach',
          text: 'text-on-primary-container',
        };
      case 'error':
        return {
          bg: 'bg-error-container',
          text: 'text-error',
        };
      case 'default':
      default:
        return {
          bg: 'bg-surface-container',
          text: 'text-on-surface-variant',
        };
    }
  };

  const { bg, text } = getStyles();

  return (
    <View
      className={`rounded-full px-3 py-1 flex-row items-center justify-center ${bg} ${className}`}
    >
      <Text className={`text-[11px] font-semibold uppercase tracking-wider font-satoshi ${text}`}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
};
