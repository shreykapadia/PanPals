import React, { useCallback } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { setStatusBarStyle } from 'expo-status-bar';
import { useFocusEffect, useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { FocusPotHero } from '../../components/onboarding/FocusPotHero';
import { StashWall } from '../../components/onboarding/StashWall';
import { Reveal } from '../../components/onboarding/Reveal';
import { colors } from '../../theme/tokens';
import { authStrings, WELCOME_HERO_ITEMS, WELCOME_VALUE_PROPS } from './strings';

/** Photographic band below the status bar: masthead plus ~100pt of pattern. */
const WALL_HEIGHT = 156;
/** How far the focus tiles climb into the wall's cream fade. */
const WALL_OVERLAP = 40;

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { wordmark, headline, tagline, heroLabel, createAccount, signIn } = authStrings.welcome;

  // This is the only screen with a dark surface under the status bar, and the
  // rest of onboarding is cream — so the light glyphs have to unwind on blur.
  // A rendered <StatusBar> would not: welcome stays mounted underneath sign-up
  // and its entry would keep winning, hiding the clock on the next screen.
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light', true);
      return () => setStatusBarStyle('dark', true);
    }, []),
  );

  return (
    // Only the bottom edge is inset — the wall bleeds under the status bar and
    // pads for it itself, so the pattern starts at the very top of the screen.
    <SafeAreaView edges={['bottom']} className="flex-1 bg-surface">
      <Reveal distance={0} duration={420}>
        <StashWall height={insets.top + WALL_HEIGHT}>
          <View className="items-center" style={{ paddingTop: insets.top + 6 }}>
            <Text className="text-2xl font-caslon-bold text-on-primary">{wordmark}</Text>
          </View>
        </StashWall>
      </Reveal>

      <View className="flex-1 px-6 justify-between" style={{ marginTop: -WALL_OVERLAP }}>
        <FocusPotHero items={WELCOME_HERO_ITEMS} accessibilityLabel={heroLabel} />

        <Reveal delay={240} className="items-center">
          <Text
            className="text-3xl font-caslon-bold text-dark-neutral text-center leading-9"
            style={{ maxWidth: 300 }}
          >
            {headline}
          </Text>
          <Text
            className="text-base font-satoshi text-muted-text text-center mt-3"
            style={{ maxWidth: 280 }}
          >
            {tagline}
          </Text>
        </Reveal>

        <Reveal delay={320} className="flex-row justify-center gap-3 mb-4">
          {WELCOME_VALUE_PROPS.map((prop) => (
            <View
              key={prop.label}
              accessible
              className="flex-1 items-center rounded-2xl border border-border-warm bg-card-surface px-3 py-4"
            >
              <View className="h-11 w-11 rounded-full bg-surface-container-low items-center justify-center">
                <Icon
                  name={prop.icon}
                  size={20}
                  color={colors['on-primary-container']}
                  strokeWidth={1.75}
                />
              </View>
              <Text className="text-sm font-satoshi-bold text-dark-neutral mt-2">{prop.label}</Text>
              <Text className="text-xs font-satoshi text-muted-text text-center mt-1">
                {prop.description}
              </Text>
            </View>
          ))}
        </Reveal>
      </View>

      <Reveal delay={400} className="px-6 pb-6">
        <Button
          label={createAccount}
          onPress={() => router.push('/(auth)/sign-up')}
          accessibilityLabel={createAccount}
        />
        <Button
          label={signIn}
          onPress={() => router.push('/(auth)/sign-in')}
          variant="secondary"
          className="mt-3"
          accessibilityLabel={signIn}
        />
      </Reveal>
    </SafeAreaView>
  );
}
