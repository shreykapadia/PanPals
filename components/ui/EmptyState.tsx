import React from 'react';
import { View, Text } from 'react-native';
import { Icon, IconName } from './Icon';
import { Button } from './Button';
import { colors } from '../../theme/tokens';

interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  accessibilityLabel?: string;
  icon?: IconName;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  actionLabel,
  onAction,
  accessibilityLabel,
  icon = 'info',
}) => {
  return (
    <View
      accessibilityLabel={accessibilityLabel || `${title}. ${message}`}
      className="flex-1 items-center justify-center p-6 bg-surface"
    >
      <View className="bg-white rounded-full p-4 mb-4 border border-border-warm shadow-sm">
        <Icon name={icon} size={32} color={colors['primary-container']} />
      </View>
      <Text className="text-lg font-bold font-caslon text-dark-neutral text-center mb-2">
        {title}
      </Text>
      <Text className="text-sm font-satoshi text-muted-text text-center mb-6 max-w-[260px] leading-relaxed">
        {message}
      </Text>
      {actionLabel && onAction && (
        <Button label={actionLabel} onPress={onAction} className="max-w-[200px]" />
      )}
    </View>
  );
};
