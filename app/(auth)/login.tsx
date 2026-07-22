import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../lib/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('maya@panpals.app');
  const [password, setPassword] = useState('password');
  const { signIn } = useAuthStore();

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
          <View className="items-center mb-8">
            <Text className="text-3xl font-bold font-caslon text-dark-neutral text-center">
              PanPals
            </Text>
            <Text className="text-sm font-satoshi text-muted-text text-center mt-2">
              Finish what you own.
            </Text>
          </View>

          <Card className="p-6">
            <Text className="text-base font-bold font-satoshi text-dark-neutral mb-6 text-center">
              Sign In
            </Text>

            <Input
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
              autoCapitalize="none"
            />

            <Button label="Sign In" onPress={signIn} className="mt-4" />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
