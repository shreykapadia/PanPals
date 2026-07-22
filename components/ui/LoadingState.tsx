import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { colors } from '../../theme/tokens';

interface LoadingStateProps {
  message?: string;
  accessibilityLabel?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  accessibilityLabel,
}) => {
  return (
    <View
      accessibilityLabel={accessibilityLabel || message}
      accessibilityRole="progressbar"
      className="flex-1 items-center justify-center p-6 bg-surface"
    >
      <ActivityIndicator size="large" color={colors['primary-container']} />
      <Text className="text-sm font-satoshi text-muted-text mt-4 tracking-wide">{message}</Text>
    </View>
  );
};
