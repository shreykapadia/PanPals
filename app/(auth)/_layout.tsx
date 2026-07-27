import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '../../theme/tokens';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // A cream scene background stops the white flash between pushes, and
        // a fade keeps the onboarding reading as one continuous surface
        // rather than a stack of slides.
        animation: 'fade',
        contentStyle: { backgroundColor: colors.surface },
      }}
    />
  );
}
