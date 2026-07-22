import React from 'react';
import { TextInput, View, Text, TextInputProps } from 'react-native';
import { colors } from '../../theme/tokens';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  className?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <View className="w-full mb-4">
      {label && (
        <Text className="text-xs font-semibold text-muted-text font-satoshi mb-2 px-2 uppercase tracking-wider">
          {label}
        </Text>
      )}
      <TextInput
        placeholderTextColor={colors['inactive-gray']}
        className={`h-12 w-full rounded-full border border-border-warm bg-card-surface px-6 text-sm text-dark-neutral font-satoshi ${
          error ? 'border-error' : ''
        } ${className}`}
        {...props}
      />
      {error && <Text className="text-xs text-error font-satoshi mt-1 px-4">{error}</Text>}
    </View>
  );
};
