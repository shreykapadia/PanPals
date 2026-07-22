import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';
import { useAuth } from '../../lib/auth/useAuth';
import { colors } from '../../theme/tokens';

export default function YouTab() {
  const { session, signOut } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="h-14 border-b border-border-warm flex-row items-center justify-between px-4 bg-surface">
        <Text className="text-xl font-bold font-caslon text-dark-neutral">PanPal Profile</Text>
        <Icon name="you" color={colors['dark-neutral']} size={24} />
      </View>
      <ScrollView className="flex-1 px-4 py-6" contentContainerStyle={{ paddingBottom: 100 }}>
        <Card className="mb-6 items-center">
          <View className="w-16 h-16 rounded-full bg-primary-container items-center justify-center mb-4 border border-border-warm">
            <Text className="text-xl font-bold font-caslon text-dark-neutral">
              {session?.user.email.substring(0, 1).toUpperCase() || 'M'}
            </Text>
          </View>
          <Text className="text-base font-bold font-satoshi text-dark-neutral">
            {session?.user.email === 'maya@panpals.app' ? 'Maya' : 'PanPal User'}
          </Text>
          <Text className="text-xs font-satoshi text-muted-text mt-1">{session?.user.email}</Text>
        </Card>

        <Card className="mb-6">
          <Text className="text-sm font-semibold font-satoshi text-dark-neutral uppercase tracking-wider mb-4">
            Streak Statistics
          </Text>
          <View className="flex-row justify-around py-2">
            <View className="items-center">
              <Text className="text-2xl font-bold font-caslon text-primary-container">5</Text>
              <Text className="text-[10px] font-semibold font-satoshi text-muted-text uppercase tracking-wider mt-1">
                Active Streak
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold font-caslon text-eco-sage">12</Text>
              <Text className="text-[10px] font-semibold font-satoshi text-muted-text uppercase tracking-wider mt-1">
                Total finished
              </Text>
            </View>
          </View>
        </Card>

        <View className="mt-4">
          <Button label="Sign Out" onPress={signOut} variant="secondary" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
