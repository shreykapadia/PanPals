import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Chip } from '../../components/ui/Chip';
import { Icon } from '../../components/ui/Icon';
import { RingMark } from '../../components/ui/RingMark';
import { OnboardingScaffold } from '../../components/onboarding/OnboardingScaffold';
import { GoalCard } from '../../components/onboarding/GoalCard';
import { Reveal } from '../../components/onboarding/Reveal';
import { useUpdateProfile } from '../../lib/api';
import { track } from '../../lib/analytics';
import { colors } from '../../theme/tokens';
import { authStrings, GOAL_OPTIONS, AGE_RANGE_OPTIONS } from './strings';

type Beat = 'name' | 'goals' | 'handoff';

const HANDOFF_DURATION = 1400;

export default function GoalCaptureScreen() {
  const router = useRouter();
  const { mutateAsync: updateProfile } = useUpdateProfile();
  const s = authStrings.goalCapture;

  const [beat, setBeat] = useState<Beat>('name');
  const [firstName, setFirstName] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [ageRange, setAgeRange] = useState<string | undefined>();
  const [location, setLocation] = useState('');
  const [optionalOpen, setOptionalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameError, setNameError] = useState<string | undefined>();
  const [goalsError, setGoalsError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | undefined>();

  const trimmedName = firstName.trim();

  const toggleGoal = (goal: string) => {
    setGoalsError(undefined);
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal],
    );
  };

  const handleNext = () => {
    if (trimmedName.length === 0) {
      setNameError(s.errorName);
      return;
    }
    setNameError(undefined);
    setBeat('goals');
  };

  const handleContinue = async () => {
    if (selectedGoals.length === 0) {
      setGoalsError(s.errorGoals);
      return;
    }

    setIsSubmitting(true);
    setFormError(undefined);
    try {
      await updateProfile({
        username: trimmedName,
        selected_goals: selectedGoals,
        age_range: ageRange ?? null,
        location: location.trim() || null,
      });
      track('account_completed');
      setBeat('handoff');
    } catch {
      setFormError(s.errorSubmit);
    } finally {
      setIsSubmitting(false);
    }
  };

  // The handoff beat is a held moment, not a gate: it auto-advances, and a tap
  // anywhere skips it. The profile write has already succeeded by this point.
  useEffect(() => {
    if (beat !== 'handoff') return;
    const timer = setTimeout(() => router.replace('/(tabs)'), HANDOFF_DURATION);
    return () => clearTimeout(timer);
  }, [beat, router]);

  if (beat === 'handoff') {
    return (
      <SafeAreaView className="flex-1 bg-surface">
        <Pressable
          onPress={() => router.replace('/(tabs)')}
          accessibilityRole="button"
          accessibilityLabel={s.handoffSkip}
          className="flex-1 items-center justify-center px-8"
        >
          <RingMark percent={100} size={120} strokeWidth={10} duration={700}>
            <Icon name="check" size={40} color={colors['on-primary-container']} strokeWidth={2} />
          </RingMark>
          <Reveal delay={300} className="items-center">
            <Text className="text-2xl font-caslon-bold text-dark-neutral text-center mt-8">
              {s.handoffTitle(trimmedName)}
            </Text>
            <Text className="text-base font-satoshi text-muted-text text-center mt-2">
              {s.handoffSubtitle}
            </Text>
          </Reveal>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (beat === 'name') {
    return (
      <OnboardingScaffold
        onBack={() => router.back()}
        step={{ current: 2, total: 3, accessibilityLabel: s.nameStepLabel }}
        footer={
          <Button
            label={s.next}
            onPress={handleNext}
            disabled={trimmedName.length === 0}
            accessibilityLabel={s.next}
          />
        }
      >
        <Reveal className="pt-6">
          <Text className="text-2xl font-caslon-bold text-dark-neutral leading-8">
            {s.nameTitle}
          </Text>
          <Text className="text-base font-satoshi text-muted-text mt-2 mb-8">{s.nameSubtitle}</Text>
        </Reveal>

        <Reveal delay={80}>
          <Input
            label={s.firstNameLabel}
            value={firstName}
            onChangeText={(next) => {
              setFirstName(next);
              if (nameError) setNameError(undefined);
            }}
            placeholder={s.firstNamePlaceholder}
            autoCapitalize="words"
            autoComplete="given-name"
            returnKeyType="next"
            onSubmitEditing={handleNext}
            error={nameError}
            accessibilityLabel={s.firstNameLabel}
          />
        </Reveal>
      </OnboardingScaffold>
    );
  }

  return (
    <OnboardingScaffold
      onBack={() => setBeat('name')}
      step={{ current: 3, total: 3, accessibilityLabel: s.goalsStepLabel }}
      footer={
        <>
          {formError && (
            <Text accessibilityRole="alert" className="text-sm text-error font-satoshi mb-3 px-2">
              {formError}
            </Text>
          )}
          <Button
            label={s.continueLabel}
            onPress={handleContinue}
            disabled={selectedGoals.length === 0}
            loading={isSubmitting}
            accessibilityLabel={s.continueLabel}
          />
        </>
      }
    >
      <Reveal className="pt-6">
        <Text className="text-2xl font-caslon-bold text-dark-neutral leading-8">
          {s.goalsTitle}
        </Text>
        <Text className="text-base font-satoshi text-muted-text mt-2 mb-6">{s.goalsSubtitle}</Text>
      </Reveal>

      <Reveal delay={80}>
        <View className="flex-row flex-wrap justify-between gap-y-3">
          {GOAL_OPTIONS.map((goal) => (
            <GoalCard
              key={goal.value}
              icon={goal.icon}
              title={goal.title}
              subtitle={goal.subtitle}
              selected={selectedGoals.includes(goal.value)}
              onPress={() => toggleGoal(goal.value)}
              accessibilityLabel={goal.title}
            />
          ))}
        </View>

        {goalsError && (
          <Text accessibilityRole="alert" className="text-sm text-error font-satoshi mt-3 px-1">
            {goalsError}
          </Text>
        )}
      </Reveal>

      <Reveal delay={160} className="mt-8">
        <Pressable
          onPress={() => setOptionalOpen((prev) => !prev)}
          accessibilityRole="button"
          accessibilityState={{ expanded: optionalOpen }}
          accessibilityLabel={s.optionalToggle}
          className="flex-row items-center justify-between min-h-[44px] px-1"
        >
          <Text className="text-base font-satoshi-medium text-dark-neutral">
            {s.optionalToggle}
          </Text>
          <Icon
            name={optionalOpen ? 'chevron-down' : 'chevron-right'}
            size={20}
            color={colors['muted-text']}
            strokeWidth={1.75}
          />
        </Pressable>

        {optionalOpen && (
          <Reveal className="mt-3 rounded-xl bg-surface-container-low p-4">
            <Text className="text-sm font-satoshi text-muted-text mb-4">{s.optionalHint}</Text>

            <Text className="text-xs text-muted-text font-satoshi-medium mb-2 px-1 uppercase tracking-wider">
              {s.ageRangeLabel}
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {AGE_RANGE_OPTIONS.map((range) => (
                <Chip
                  key={range}
                  label={range}
                  selected={ageRange === range}
                  onPress={() => setAgeRange((prev) => (prev === range ? undefined : range))}
                  accessibilityLabel={`Age range ${range}`}
                />
              ))}
            </View>

            <Input
              label={s.locationLabel}
              value={location}
              onChangeText={setLocation}
              placeholder={s.locationPlaceholder}
              accessibilityLabel={s.locationLabel}
              className="bg-card-surface"
            />
          </Reveal>
        )}
      </Reveal>
    </OnboardingScaffold>
  );
}
