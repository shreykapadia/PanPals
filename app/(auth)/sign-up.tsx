import React, { useState } from 'react';
import { Text, KeyboardAvoidingView, Platform, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../lib/auth/useAuth';
import { authStrings } from './strings';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const s = authStrings.signUp;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const nextEmailError = EMAIL_PATTERN.test(email.trim()) ? undefined : s.errorEmail;
    const nextPasswordError = password.length >= 6 ? undefined : s.errorPassword;
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    setFormError(undefined);
    if (nextEmailError || nextPasswordError) return;

    setIsSubmitting(true);
    try {
      await signUp(email.trim(), password);
      router.replace('/(auth)/goal-capture');
    } catch {
      setFormError(s.errorGeneric);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
          <Card className="p-6">
            <Text className="text-base font-bold font-satoshi text-dark-neutral mb-6 text-center">
              {s.title}
            </Text>

            <Input
              label={s.emailLabel}
              value={email}
              onChangeText={setEmail}
              placeholder={s.emailPlaceholder}
              keyboardType="email-address"
              autoCapitalize="none"
              error={emailError}
              accessibilityLabel={s.emailLabel}
            />

            <Input
              label={s.passwordLabel}
              value={password}
              onChangeText={setPassword}
              placeholder={s.passwordPlaceholder}
              secureTextEntry
              autoCapitalize="none"
              error={passwordError}
              accessibilityLabel={s.passwordLabel}
            />

            {formError && (
              <Text accessibilityRole="alert" className="text-xs text-error font-satoshi mb-2 px-2">
                {formError}
              </Text>
            )}

            <Button
              label={s.submit}
              onPress={handleSubmit}
              loading={isSubmitting}
              className="mt-4"
              accessibilityLabel={s.submit}
            />

            <Pressable
              onPress={() => router.push('/(auth)/sign-in')}
              accessibilityRole="button"
              accessibilityLabel={`${s.switchPrompt} ${s.switchAction}`}
              className="items-center py-4"
            >
              <Text className="text-xs font-satoshi text-muted-text">
                {s.switchPrompt}{' '}
                <Text className="text-dark-neutral font-semibold">{s.switchAction}</Text>
              </Text>
            </Pressable>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
