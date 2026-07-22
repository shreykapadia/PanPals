import React from 'react';
import { View, Text } from 'react-native';
import { Icon } from './Icon';
import { Button } from './Button';
import { colors } from '../../theme/tokens';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  accessibilityLabel?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  accessibilityLabel,
}) => {
  return (
    <View
      accessibilityLabel={accessibilityLabel || `${title}. ${message}`}
      className="flex-1 items-center justify-center p-6 bg-surface"
    >
      <View className="bg-error-container rounded-full p-4 mb-4 border border-error/10">
        <Icon name="alert" size={32} color={colors.error} />
      </View>
      <Text className="text-lg font-bold font-caslon text-error text-center mb-2">{title}</Text>
      <Text className="text-sm font-satoshi text-muted-text text-center mb-6 max-w-[260px] leading-relaxed">
        {message}
      </Text>
      {onRetry && (
        <Button label="Try Again" onPress={onRetry} variant="secondary" className="max-w-[200px]" />
      )}
    </View>
  );
};
