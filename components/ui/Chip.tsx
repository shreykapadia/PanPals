import React from 'react';
import { Pressable, Text } from 'react-native';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onPress,
  accessibilityLabel,
  className = '',
}) => {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={accessibilityLabel || label}
      className={`rounded-full px-4 py-2 border flex-row items-center justify-center ${
        selected
          ? 'bg-primary-container border-primary-container'
          : 'bg-card-surface border-border-warm'
      } ${className}`}
    >
      <Text
        className={`text-xs font-semibold font-satoshi ${
          selected ? 'text-dark-neutral' : 'text-muted-text'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
};
