import React, { useState } from 'react';
import { Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { OnboardingScaffold } from '../../components/onboarding/OnboardingScaffold';
import { Reveal } from '../../components/onboarding/Reveal';
import { useAuth } from '../../lib/auth/useAuth';
import { authStrings } from '../../features/auth/strings';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignInScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const s = authStrings.signIn;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = () => {
    const next = EMAIL_PATTERN.test(email.trim()) ? undefined : s.errorEmail;
    setEmailError(next);
    return next;
  };

  const handleSubmit = async () => {
    const nextEmailError = validateEmail();
    const nextPasswordError = password.length > 0 ? undefined : s.errorPassword;
    setPasswordError(nextPasswordError);
    setFormError(undefined);
    if (nextEmailError || nextPasswordError) return;

    setIsSubmitting(true);
    try {
      await signIn(email.trim(), password);
      router.replace('/(tabs)');
    } catch {
      setFormError(s.errorGeneric);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OnboardingScaffold
      onBack={() => router.back()}
      footer={
        <Pressable
          onPress={() => router.push('/(auth)/sign-up')}
          accessibilityRole="button"
          accessibilityLabel={`${s.switchPrompt} ${s.switchAction}`}
          className="items-center py-3"
        >
          <Text className="text-sm font-satoshi text-muted-text">
            {s.switchPrompt}{' '}
            <Text className="text-dark-neutral font-satoshi-medium">{s.switchAction}</Text>
          </Text>
        </Pressable>
      }
    >
      <Reveal className="pt-4">
        <Text className="text-2xl font-caslon-bold text-dark-neutral leading-8">{s.title}</Text>
        <Text className="text-base font-satoshi text-muted-text mt-2 mb-8">{s.subtitle}</Text>
      </Reveal>

      <Reveal delay={80}>
        <Input
          label={s.emailLabel}
          value={email}
          onChangeText={(next) => {
            setEmail(next);
            if (emailError) setEmailError(undefined);
          }}
          onBlur={() => email.length > 0 && validateEmail()}
          placeholder={s.emailPlaceholder}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          error={emailError}
          accessibilityLabel={s.emailLabel}
        />

        <Input
          label={s.passwordLabel}
          value={password}
          onChangeText={(next) => {
            setPassword(next);
            if (passwordError) setPasswordError(undefined);
          }}
          placeholder={s.passwordPlaceholder}
          secureToggle
          autoCapitalize="none"
          autoComplete="current-password"
          error={passwordError}
          accessibilityLabel={s.passwordLabel}
        />

        {formError && (
          <Text accessibilityRole="alert" className="text-sm text-error font-satoshi mb-3 px-2">
            {formError}
          </Text>
        )}

        <Button
          label={s.submit}
          onPress={handleSubmit}
          loading={isSubmitting}
          className="mt-2"
          accessibilityLabel={s.submit}
        />
      </Reveal>
    </OnboardingScaffold>
  );
}
