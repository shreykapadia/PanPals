import React, { useState } from 'react';
import { View, Text, ScrollView, Switch, Modal, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Chip } from '../../components/ui/Chip';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Reveal } from '../../components/onboarding/Reveal';
import { GoalRail } from '../../components/you/GoalRail';
import { ProfileMasthead } from '../../components/you/ProfileMasthead';
import { RecordPanel } from '../../components/you/RecordPanel';
import { useAuth } from '../../lib/auth/useAuth';
import { useProfile, useUpdateProfile, useDashboard } from '../../lib/api';
import { colors } from '../../theme/tokens';
import { GOAL_OPTIONS } from '../../features/auth/strings';
import { youStrings as s, MONTHS } from '../../features/you/strings';

/** Entrance stagger, matching the onboarding surfaces' 80ms rhythm. */
const STAGGER = 80;

/**
 * `profiles.created_at` is typed non-null, but a row written before the column
 * existed — or any fixture that omits it — must not blank the masthead.
 */
export function formatMemberSince(createdAt: string | null | undefined): string | undefined {
  if (!createdAt) return undefined;
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return undefined;
  return s.memberSince(MONTHS[date.getMonth()], date.getFullYear());
}

/**
 * The record panel's footnote earns its place or doesn't appear. Restating "5" as
 * "you're on a 5 day streak" is the kind of filler that made the old screen feel
 * padded; a run she's just lost, or a personal best she can't see from the
 * numbers alone, is worth a line.
 */
export function recordFootnote(
  current: number,
  best: number,
  finished?: number,
): string | undefined {
  if (current === 0 && best === 0 && (finished ?? 0) === 0) return s.recordFirstLog;
  if (current === 0 && best > 0) return s.recordNewRun;
  if (current > 1 && current === best) return s.recordPersonalBest;
  return undefined;
}

export default function YouTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signOut, deleteAccount } = useAuth();
  const { data: profile, isLoading, isError, refetch } = useProfile();
  const { mutateAsync: updateProfile, isPending: isSavingGoals } = useUpdateProfile();
  // Secondary, and deliberately unguarded: the same query Home and Progress
  // already run, so it's usually cache-warm and free here. If it fails, the
  // "Finished" figure drops out and the rest of the page is unaffected — the
  // profile query alone decides whether this screen can render at all.
  const { data: dashboard } = useDashboard();
  // A second mutation instance on purpose: sharing one with the goals editor
  // would put the goals Save button into its loading state every time the
  // reminder switch is flipped.
  const { mutateAsync: updateReminders } = useUpdateProfile();

  // The switch's own optimistic position, held only while it disagrees with the
  // server. `undefined` means "trust the profile" — which is what makes the
  // preference survive leaving the tab, the thing the old useState(false) broke.
  const [remindersDraft, setRemindersDraft] = useState<boolean | undefined>();
  const [remindersError, setRemindersError] = useState<string | undefined>();
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

  // Optimistic: the switch moves on touch, then reconciles. A consent control
  // that lags behind the finger reads as "did that work?", which is the wrong
  // feeling for the one setting on this screen that is about being in control.
  const handleToggleReminders = async (next: boolean) => {
    setRemindersDraft(next);
    setRemindersError(undefined);
    try {
      await updateReminders({ reminders_enabled: next });
      // Drop the draft only once the refetched profile is the source of truth.
      setRemindersDraft(undefined);
    } catch {
      setRemindersDraft(undefined);
      setRemindersError(s.errorReminders);
    }
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
        <View className="gap-2 px-6 pb-6">
          {signOutError && (
            <Text
              accessibilityRole="alert"
              className="px-2 text-center text-sm font-satoshi text-error"
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

  const memberSince = formatMemberSince(profile.created_at);
  const finishedCount = dashboard?.status_counts?.finished;
  const remindersEnabled = remindersDraft ?? profile.reminders_enabled;
  const figures = [
    { value: profile.current_streak, label: s.recordCurrentStreak },
    { value: profile.longest_streak, label: s.recordBestStreak },
    ...(finishedCount === undefined ? [] : [{ value: finishedCount, label: s.recordFinished }]),
  ];

  return (
    // Only the bottom edge is inset — the masthead bleeds under the status bar
    // and pads for it itself. Its tones are pale, so the app's default dark
    // status-bar glyphs stay legible with no per-screen override.
    <SafeAreaView edges={['bottom']} className="flex-1 bg-surface">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }}>
        <Reveal distance={0} duration={420}>
          <ProfileMasthead
            username={profile.username}
            avatarUrl={profile.avatar_url}
            eyebrow={s.mastheadEyebrow}
            memberSince={memberSince}
            accessibilityLabel={s.mastheadAccessibilityLabel(profile.username, memberSince)}
            topInset={insets.top}
          />
        </Reveal>

        <View className="px-6">
          <Reveal delay={STAGGER}>
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="flex-1 pr-3 text-lg font-caslon-bold text-dark-neutral">
                {s.goalsTitle}
              </Text>
              {!isEditingGoals && profile.selected_goals.length > 0 && (
                <Pressable
                  onPress={openEditGoals}
                  accessibilityRole="button"
                  accessibilityLabel={s.editGoalsAccessibilityLabel}
                  // hitSlop rather than padding: a 44pt box would stretch the
                  // heading row and pull the serif title off its baseline.
                  hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
                >
                  <Text className="text-base font-satoshi-medium text-primary underline">
                    {s.editGoals}
                  </Text>
                </Pressable>
              )}
            </View>

            {isEditingGoals ? (
              // Edited in place. A modal here would hide the goals she's
              // comparing against behind the sheet that changes them.
              <View>
                <Text className="mb-3 text-sm font-satoshi text-muted-text">{s.goalsEditHint}</Text>
                <View className="mb-4 flex-row flex-wrap gap-2">
                  {GOAL_OPTIONS.map((goal) => (
                    <Chip
                      key={goal.value}
                      label={goal.title}
                      selected={draftGoals.includes(goal.value)}
                      onPress={() => toggleDraftGoal(goal.value)}
                      accessibilityLabel={`${goal.title}${
                        draftGoals.includes(goal.value) ? ', selected' : ''
                      }`}
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
            ) : profile.selected_goals.length === 0 ? (
              <View>
                <Text className="mb-4 text-base font-satoshi text-muted-text">{s.noGoals}</Text>
                <Button
                  label={s.chooseGoals}
                  onPress={openEditGoals}
                  accessibilityLabel={s.chooseGoals}
                />
              </View>
            ) : (
              <GoalRail selected={profile.selected_goals} options={GOAL_OPTIONS} />
            )}
          </Reveal>

          <Reveal delay={STAGGER * 2} className="mt-10">
            <Text className="mb-4 text-lg font-caslon-bold text-dark-neutral">{s.recordTitle}</Text>
            <RecordPanel
              figures={figures}
              footnote={recordFootnote(
                profile.current_streak,
                profile.longest_streak,
                finishedCount,
              )}
              accessibilityLabel={s.recordAccessibilityLabel(
                profile.current_streak,
                profile.longest_streak,
                finishedCount,
              )}
            />
          </Reveal>

          {/* The only white card left on the page, so it reads as a control
              rather than as more content to read. */}
          <Reveal delay={STAGGER * 3} className="mt-8">
            <Card>
              <View className="flex-row items-center justify-between">
                <View className="flex-1 pr-4">
                  <Text className="text-base font-satoshi-bold text-dark-neutral">
                    {s.remindersTitle}
                  </Text>
                  <Text className="mt-1 text-sm font-satoshi text-muted-text">
                    {s.remindersDescription}
                  </Text>
                </View>
                <Switch
                  value={remindersEnabled}
                  onValueChange={handleToggleReminders}
                  trackColor={{ false: colors['border-warm'], true: colors['primary-container'] }}
                  thumbColor={colors['card-surface']}
                  // iOS ignores trackColor.false and shows the system grey
                  // without this, which is why the off state used to sit
                  // outside the palette on the platform we demo on.
                  ios_backgroundColor={colors['border-warm']}
                  accessibilityLabel={s.remindersTitle}
                  accessibilityRole="switch"
                />
              </View>
              {remindersError && (
                <Text
                  accessibilityRole="alert"
                  className="mt-3 border-t border-border-warm pt-3 text-sm font-satoshi text-error"
                >
                  {remindersError}
                </Text>
              )}
            </Card>
          </Reveal>

          {/* Recessed: these were the heaviest controls on the screen — a
              full-width pill and red text under it — which put the two
              destructive actions above the content the tab exists for. */}
          <Reveal delay={STAGGER * 4} className="mt-12 border-t border-border-warm pt-6">
            <Text className="mb-1 text-xs uppercase tracking-wider font-satoshi-medium text-muted-text">
              {s.accountTitle}
            </Text>
            {signOutError && (
              <Text accessibilityRole="alert" className="mt-2 text-sm font-satoshi text-error">
                {signOutError}
              </Text>
            )}
            <Pressable
              onPress={handleSignOut}
              accessibilityRole="button"
              accessibilityLabel={s.signOut}
              className="min-h-[48px] justify-center"
            >
              <Text className="text-base font-satoshi-medium text-dark-neutral">{s.signOut}</Text>
            </Pressable>
            <Pressable
              onPress={() => setIsDeleteModalOpen(true)}
              accessibilityRole="button"
              accessibilityLabel={s.deleteAccount}
              className="min-h-[48px] justify-center border-t border-border-warm"
            >
              <Text className="text-base font-satoshi-medium text-error">{s.deleteAccount}</Text>
            </Pressable>
          </Reveal>
        </View>
      </ScrollView>

      <Modal
        visible={isDeleteModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDeleteModalOpen(false)}
      >
        {/* `inverse-surface`, not black — there is no pure black in the palette
            (DESIGN-TOKENS §1). */}
        <View className="flex-1 items-center justify-center bg-inverse-surface/50 px-6">
          <Card className="w-full max-w-[360px] p-6">
            <Text className="mb-2 text-lg font-caslon-bold text-dark-neutral">{s.deleteTitle}</Text>
            <Text className="mb-4 text-sm font-satoshi leading-relaxed text-muted-text">
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
              <Text accessibilityRole="alert" className="mt-2 px-2 text-sm font-satoshi text-error">
                {deleteError}
              </Text>
            )}
            <View className="mt-2 flex-row gap-3">
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
