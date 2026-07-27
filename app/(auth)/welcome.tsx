import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { FocusPotHero } from '../../components/onboarding/FocusPotHero';
import { Reveal } from '../../components/onboarding/Reveal';
import { colors } from '../../theme/tokens';
import { authStrings, WELCOME_HERO_ITEMS, WELCOME_VALUE_PROPS } from './strings';

export default function WelcomeScreen() {
  const router = useRouter();
  const { wordmark, headline, tagline, heroLabel, createAccount, signIn } = authStrings.welcome;

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="items-center pt-2 pb-1">
        <Text className="text-2xl font-caslon-bold text-dark-neutral">{wordmark}</Text>
      </View>

      <View className="flex-1 px-6 justify-between">
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
