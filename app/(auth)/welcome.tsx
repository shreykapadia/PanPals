import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { authStrings } from './strings';

export default function WelcomeScreen() {
  const router = useRouter();
  const { wordmark, tagline, createAccount, signIn } = authStrings.welcome;

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-4xl font-bold font-caslon text-dark-neutral text-center">
          {wordmark}
        </Text>
        <Text className="text-sm font-satoshi text-muted-text text-center mt-3 max-w-[260px]">
          {tagline}
        </Text>
      </View>
      <View className="px-8 pb-8 gap-3">
        <Button
          label={createAccount}
          onPress={() => router.push('/(auth)/sign-up')}
          accessibilityLabel={createAccount}
        />
        <Button
          label={signIn}
          onPress={() => router.push('/(auth)/sign-in')}
          variant="secondary"
          accessibilityLabel={signIn}
        />
      </View>
    </SafeAreaView>
  );
}
