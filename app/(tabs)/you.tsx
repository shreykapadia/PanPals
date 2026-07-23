import React, { useState } from 'react';
import { View, Text, ScrollView, Switch, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Chip } from '../../components/ui/Chip';
import { Icon } from '../../components/ui/Icon';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { useAuth } from '../../lib/auth/useAuth';
import { useProfile, useUpdateProfile } from '../../lib/api';
import { colors } from '../../theme/tokens';
import { GOAL_OPTIONS } from '../(auth)/strings';
import { youStrings as s } from './you.strings';

export default function YouTab() {
  const router = useRouter();
  const { signOut, deleteAccount } = useAuth();
  const { data: profile, isLoading, isError, refetch } = useProfile();
  const { mutateAsync: updateProfile, isPending: isSavingGoals } = useUpdateProfile();

  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [draftGoals, setDraftGoals] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [signOutError, setSignOutError] = useState<string | undefined>();
  const [deleteError, setDeleteError] = useState<string | undefined>();

  const handleSignOut = async () => {
    setSignOutError(undefined);
    try {
      await signOut();
      router.replace('/(auth)/welcome');
    } catch {
      setSignOutError(s.errorSignOut);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError(undefined);
    try {
      await deleteAccount();
      setIsDeleteModalOpen(false);
      router.replace('/(auth)/welcome');
    } catch {
      setDeleteError(s.errorDelete);
    }
  };

  const openEditGoals = () => {
    setDraftGoals(profile?.selected_goals ?? []);
    setIsEditingGoals(true);
  };

  const toggleDraftGoal = (goal: string) => {
    setDraftGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal],
    );
  };

  const saveGoals = async () => {
    if (draftGoals.length === 0) return;
    await updateProfile({ selected_goals: draftGoals });
    setIsEditingGoals(false);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-surface">
        <LoadingState message={s.loadingProfile} />
      </SafeAreaView>
    );
  }

  if (isError || !profile) {
    return (
      <SafeAreaView className="flex-1 bg-surface">
        <ErrorState message={s.errorProfile} onRetry={() => refetch()} />
        <View className="px-6 pb-6 gap-2">
          {signOutError && (
            <Text
              accessibilityRole="alert"
              className="text-xs text-error font-satoshi text-center px-2"
            >
              {signOutError}
            </Text>
          )}
          <Button
            label={s.signOut}
            onPress={handleSignOut}
            variant="secondary"
            accessibilityLabel={s.signOut}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="h-14 border-b border-border-warm flex-row items-center justify-between px-4 bg-surface">
        <Text className="text-xl font-bold font-caslon text-dark-neutral">{s.header}</Text>
        <Icon name="you" color={colors['dark-neutral']} size={24} />
      </View>
      <ScrollView className="flex-1 px-4 py-6" contentContainerStyle={{ paddingBottom: 100 }}>
        <Card className="mb-6 items-center">
          <View className="w-16 h-16 rounded-full bg-primary-container items-center justify-center mb-4 border border-border-warm">
            <Text className="text-xl font-bold font-caslon text-dark-neutral">
              {profile.username.substring(0, 1).toUpperCase()}
            </Text>
          </View>
          <Text className="text-base font-bold font-satoshi text-dark-neutral">
            {profile.username}
          </Text>
        </Card>

        <Card className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm font-semibold font-satoshi text-dark-neutral uppercase tracking-wider">
              {s.goalsTitle}
            </Text>
            {!isEditingGoals && (
              <Pressable
                onPress={openEditGoals}
                accessibilityRole="button"
                accessibilityLabel={s.editGoals}
                className="py-2 px-1"
              >
                <Text className="text-xs font-semibold font-satoshi text-primary underline">
                  {s.editGoals}
                </Text>
              </Pressable>
            )}
          </View>

          {isEditingGoals ? (
            <View>
              <View className="flex-row flex-wrap gap-2 mb-4">
                {GOAL_OPTIONS.map((goal) => (
                  <Chip
                    key={goal}
                    label={goal}
                    selected={draftGoals.includes(goal)}
                    onPress={() => toggleDraftGoal(goal)}
                    accessibilityLabel={`${goal}${draftGoals.includes(goal) ? ', selected' : ''}`}
                  />
                ))}
              </View>
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Button
                    label={s.cancelGoals}
                    variant="secondary"
                    onPress={() => setIsEditingGoals(false)}
                    accessibilityLabel={s.cancelGoals}
                  />
                </View>
                <View className="flex-1">
                  <Button
                    label={s.saveGoals}
                    onPress={saveGoals}
                    disabled={draftGoals.length === 0}
                    loading={isSavingGoals}
                    accessibilityLabel={s.saveGoals}
                  />
                </View>
              </View>
            </View>
          ) : (
            <View className="flex-row flex-wrap gap-2">
              {profile.selected_goals.length === 0 ? (
                <Text className="text-xs font-satoshi text-muted-text">{s.noGoals}</Text>
              ) : (
                profile.selected_goals.map((goal) => (
                  <Badge key={goal} label={goal} variant="success" />
                ))
              )}
            </View>
          )}
        </Card>

        <Card className="mb-6">
          <Text className="text-sm font-semibold font-satoshi text-dark-neutral uppercase tracking-wider mb-4">
            {s.streakTitle}
          </Text>
          <View className="flex-row justify-around py-2">
            <View className="items-center">
              <Text className="text-2xl font-bold font-caslon text-primary-container">
                {profile.current_streak}
              </Text>
              <Text className="text-[10px] font-semibold font-satoshi text-muted-text uppercase tracking-wider mt-1">
                {s.activeStreak}
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold font-caslon text-eco-sage">
                {profile.longest_streak}
              </Text>
              <Text className="text-[10px] font-semibold font-satoshi text-muted-text uppercase tracking-wider mt-1">
                {s.longestStreak}
              </Text>
            </View>
          </View>
        </Card>

        <Card className="mb-6">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-sm font-semibold font-satoshi text-dark-neutral mb-1">
                {s.remindersTitle}
              </Text>
              <Text className="text-xs font-satoshi text-muted-text">{s.remindersDescription}</Text>
            </View>
            <Switch
              value={remindersEnabled}
              onValueChange={setRemindersEnabled}
              trackColor={{ false: colors['border-warm'], true: colors['primary-container'] }}
              thumbColor={colors['card-surface']}
              accessibilityLabel={s.remindersTitle}
              accessibilityRole="switch"
            />
          </View>
        </Card>

        <View className="gap-3">
          {signOutError && (
            <Text
              accessibilityRole="alert"
              className="text-xs text-error font-satoshi text-center px-2"
            >
              {signOutError}
            </Text>
          )}
          <Button
            label={s.signOut}
            onPress={handleSignOut}
            variant="secondary"
            accessibilityLabel={s.signOut}
          />
          <Pressable
            onPress={() => setIsDeleteModalOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={s.deleteAccount}
            className="items-center py-3"
          >
            <Text className="text-sm font-semibold font-satoshi text-error">{s.deleteAccount}</Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal
        visible={isDeleteModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDeleteModalOpen(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/40 px-6">
          <Card className="w-full p-6">
            <Text className="text-lg font-bold font-caslon text-dark-neutral mb-2">
              {s.deleteTitle}
            </Text>
            <Text className="text-sm font-satoshi text-muted-text mb-4 leading-relaxed">
              {s.deleteDescription}
            </Text>
            <Input
              label={s.deleteConfirmLabel}
              value={deleteConfirmText}
              onChangeText={setDeleteConfirmText}
              placeholder={s.deleteConfirmPlaceholder}
              autoCapitalize="characters"
              accessibilityLabel={s.deleteConfirmLabel}
            />
            {deleteError && (
              <Text accessibilityRole="alert" className="text-xs text-error font-satoshi mt-2 px-2">
                {deleteError}
              </Text>
            )}
            <View className="flex-row gap-3 mt-2">
              <View className="flex-1">
                <Button
                  label={s.deleteCancel}
                  variant="secondary"
                  onPress={() => {
                    setIsDeleteModalOpen(false);
                    setDeleteConfirmText('');
                    setDeleteError(undefined);
                  }}
                  accessibilityLabel={s.deleteCancel}
                />
              </View>
              <View className="flex-1">
                <Button
                  label={s.deleteConfirmAction}
                  onPress={handleDeleteAccount}
                  disabled={deleteConfirmText !== s.deleteConfirmWord}
                  accessibilityLabel={s.deleteConfirmAction}
                />
              </View>
            </View>
          </Card>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
