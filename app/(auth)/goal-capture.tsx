import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Chip } from '../../components/ui/Chip';
import { useUpdateProfile } from '../../lib/api';
import { track } from '../../lib/analytics';
import { authStrings, GOAL_OPTIONS, AGE_RANGE_OPTIONS } from './strings';

export default function GoalCaptureScreen() {
  const router = useRouter();
  const { mutateAsync: updateProfile } = useUpdateProfile();
  const s = authStrings.goalCapture;

  const [firstName, setFirstName] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [ageRange, setAgeRange] = useState<string | undefined>();
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | undefined>();

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal],
    );
  };

  const canContinue = firstName.trim().length > 0 && selectedGoals.length > 0;

  const handleContinue = async () => {
    if (!canContinue) return;
    setIsSubmitting(true);
    setFormError(undefined);
    try {
      await updateProfile({
        username: firstName.trim(),
        selected_goals: selectedGoals,
        age_range: ageRange ?? null,
        location: location.trim() || null,
      });
      track('account_completed');
      router.replace('/(tabs)');
    } catch {
      setFormError(s.errorSubmit);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
        <Text className="text-2xl font-bold font-caslon text-dark-neutral mb-6">{s.title}</Text>

        <Card className="mb-4">
          <Input
            label={s.firstNameLabel}
            value={firstName}
            onChangeText={setFirstName}
            placeholder={s.firstNamePlaceholder}
            accessibilityLabel={s.firstNameLabel}
          />
          <Text className="text-xs font-satoshi text-muted-text mt-2 px-2">{s.errorName}</Text>
        </Card>

        <Card className="mb-4">
          <Text className="text-xs font-semibold text-muted-text font-satoshi mb-3 px-2 uppercase tracking-wider">
            {s.goalsLabel}
          </Text>
          <View className="flex-row flex-wrap gap-2 px-2">
            {GOAL_OPTIONS.map((goal) => (
              <Chip
                key={goal}
                label={goal}
                selected={selectedGoals.includes(goal)}
                onPress={() => toggleGoal(goal)}
                accessibilityLabel={`${goal}${selectedGoals.includes(goal) ? ', selected' : ''}`}
              />
            ))}
          </View>
          <Text className="text-xs font-satoshi text-muted-text mt-3 px-2">{s.errorGoals}</Text>
        </Card>

        <Card className="mb-6">
          <Text className="text-xs font-semibold text-muted-text font-satoshi mb-3 px-2 uppercase tracking-wider">
            {s.optionalTitle}
          </Text>

          <Text className="text-xs font-semibold text-muted-text font-satoshi mb-2 px-2">
            {s.ageRangeLabel}
          </Text>
          <View className="flex-row flex-wrap gap-2 px-2 mb-4">
            {AGE_RANGE_OPTIONS.map((range) => (
              <Chip
                key={range}
                label={range}
                selected={ageRange === range}
                onPress={() => setAgeRange((prev) => (prev === range ? undefined : range))}
                accessibilityLabel={`Age range ${range}${ageRange === range ? ', selected' : ''}`}
              />
            ))}
          </View>

          <Input
            label={s.locationLabel}
            value={location}
            onChangeText={setLocation}
            placeholder={s.locationPlaceholder}
            accessibilityLabel={s.locationLabel}
          />

          <Pressable
            onPress={handleContinue}
            accessibilityRole="button"
            accessibilityLabel={s.skip}
            className="items-center py-2"
          >
            <Text className="text-xs font-semibold font-satoshi text-muted-text underline">
              {s.skip}
            </Text>
          </Pressable>
        </Card>

        {formError && (
          <Text accessibilityRole="alert" className="text-xs text-error font-satoshi mb-2 px-2">
            {formError}
          </Text>
        )}

        <Button
          label={s.continueLabel}
          onPress={handleContinue}
          disabled={!canContinue}
          loading={isSubmitting}
          accessibilityLabel={s.continueLabel}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
