import React from 'react';
import { Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '../../components/ui/Icon';
import { colors } from '../../theme/tokens';
import { homeStrings } from './strings';

interface ProfileButtonProps {
  username?: string;
}

export function ProfileButton({ username }: ProfileButtonProps) {
  const router = useRouter();
  const initial = username?.trim().charAt(0).toUpperCase();

  return (
    <Pressable
      onPress={() => router.push('/you')}
      accessibilityRole="button"
      accessibilityLabel={homeStrings.profileButtonAccessibilityLabel}
      hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
      className="h-10 w-10 items-center justify-center rounded-full border border-border-warm bg-surface-container"
    >
      {initial ? (
        <Text className="text-base font-satoshi-bold text-dark-neutral">{initial}</Text>
      ) : (
        <Icon name="you" size={20} color={colors['dark-neutral']} />
      )}
    </Pressable>
  );
}
