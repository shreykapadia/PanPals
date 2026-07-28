import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Icon } from '../../components/ui/Icon';
import { OnboardingScaffold } from '../../components/onboarding/OnboardingScaffold';
import { Reveal } from '../../components/onboarding/Reveal';
import { useAuth } from '../../lib/auth/useAuth';
import { colors } from '../../theme/tokens';
import { authStrings } from '../../features/auth/strings';

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
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = () => {
    const next = EMAIL_PATTERN.test(email.trim()) ? undefined : s.errorEmail;
    setEmailError(next);
    return next;
  };

  const validatePassword = () => {
    const next = password.length >= 6 ? undefined : s.errorPassword;
    setPasswordError(next);
    return next;
  };

  const handleSubmit = async () => {
    const nextEmailError = validateEmail();
    const nextPasswordError = validatePassword();
    setFormError(undefined);
    if (nextEmailError || nextPasswordError) return;

    setIsSubmitting(true);
    try {
      const { needsEmailConfirmation } = await signUp(email.trim(), password);
      if (needsEmailConfirmation) {
        // A confirmation link is a success, not a failure — it gets the sage
        // panel below, never the error red (DESIGN-TOKENS §4).
        setConfirmationSent(true);
        return;
      }
      router.replace('/(auth)/goal-capture');
    } catch {
      setFormError(s.errorGeneric);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OnboardingScaffold
      onBack={() => router.back()}
      step={{ current: 1, total: 3, accessibilityLabel: s.stepLabel }}
      footer={
        <>
          <Text className="text-sm font-satoshi text-muted-text text-center px-4">{s.legal}</Text>
          <Pressable
            onPress={() => router.push('/(auth)/sign-in')}
            accessibilityRole="button"
            accessibilityLabel={`${s.switchPrompt} ${s.switchAction}`}
            className="items-center py-3"
          >
            <Text className="text-sm font-satoshi text-muted-text">
              {s.switchPrompt}{' '}
              <Text className="text-dark-neutral font-satoshi-medium">{s.switchAction}</Text>
            </Text>
          </Pressable>
        </>
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
          onBlur={() => password.length > 0 && validatePassword()}
          placeholder={s.passwordPlaceholder}
          hint={s.passwordHint}
          secureToggle
          autoCapitalize="none"
          autoComplete="new-password"
          error={passwordError}
          accessibilityLabel={s.passwordLabel}
        />

        {confirmationSent && (
          <View
            accessibilityRole="alert"
            className="flex-row items-start rounded-xl bg-secondary-container p-4 mb-4"
          >
            <Icon name="check" size={18} color={colors['on-secondary-container']} strokeWidth={2} />
            <View className="flex-1 ml-3">
              <Text className="text-base font-satoshi-medium text-on-secondary-container">
                {s.confirmEmailTitle}
              </Text>
              <Text className="text-sm font-satoshi text-on-secondary-container mt-1">
                {s.confirmEmail}
              </Text>
            </View>
          </View>
        )}

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
