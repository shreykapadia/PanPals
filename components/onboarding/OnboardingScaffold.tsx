import React from 'react';
import { View, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../ui/Icon';
import { colors } from '../../theme/tokens';
import { StepRail } from './StepRail';

interface OnboardingScaffoldProps {
  onBack?: () => void;
  backAccessibilityLabel?: string;
  step?: { current: number; total: number; accessibilityLabel: string };
  /** Pinned to the bottom, outside the scroll area. */
  footer?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Shared chrome for every onboarding screen: a cream surface, an optional back
 * affordance, an optional step rail, a keyboard-aware scrolling body, and a
 * footer that stays put. Having one scaffold is what stops sign-in and sign-up
 * from drifting into two different layouts.
 */
export const OnboardingScaffold: React.FC<OnboardingScaffoldProps> = ({
  onBack,
  backAccessibilityLabel = 'Go back',
  step,
  footer,
  children,
}) => (
  <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
    <View className="h-14 flex-row items-center px-2">
      {onBack ? (
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel={backAccessibilityLabel}
          hitSlop={8}
          className="h-11 w-11 items-center justify-center rounded-full active:bg-surface-container"
        >
          <Icon name="arrow-left" size={22} color={colors['dark-neutral']} strokeWidth={1.75} />
        </Pressable>
      ) : (
        <View className="h-11 w-11" />
      )}
      {step && (
        <View className="flex-1 px-3">
          <StepRail
            current={step.current}
            total={step.total}
            accessibilityLabel={step.accessibilityLabel}
          />
        </View>
      )}
      <View className="h-11 w-11" />
    </View>

    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
      {footer && <View className="px-6 pb-6 pt-2">{footer}</View>}
    </KeyboardAvoidingView>
  </SafeAreaView>
);
