/**
 * You-tab copy. Calm, non-judgmental, second person (AI-CONTEXT §5).
 *
 * Months live here rather than going through `Intl` — Hermes ships without full
 * ICU on Android, so `toLocaleDateString` would quietly give a different format
 * on one platform than the other.
 */
export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

const days = (count: number) => `${count} ${count === 1 ? 'day' : 'days'}`;
const products = (count: number) => `${count} ${count === 1 ? 'product' : 'products'}`;

export const youStrings = {
  // ── Masthead ────────────────────────────────────────────────────────────────
  // "Project pan" is the community's own phrase (PERSONAS.md, Maya) — she called
  // it that long before she called it tracking.
  mastheadEyebrow: 'Your project pan',
  memberSince: (month: string, year: number) => `Panning since ${month} ${year}`,
  mastheadAccessibilityLabel: (username: string, memberSince?: string) =>
    memberSince ? `Your profile. ${username}. ${memberSince}.` : `Your profile. ${username}.`,

  // ── Goals ───────────────────────────────────────────────────────────────────
  goalsTitle: 'What you’re working toward',
  editGoals: 'Edit',
  editGoalsAccessibilityLabel: 'Edit your goals',
  goalsEditHint: 'Pick at least one. You can change these any time.',
  saveGoals: 'Save',
  cancelGoals: 'Cancel',
  noGoals: 'You haven’t picked a focus yet.',
  chooseGoals: 'Choose your goals',

  // ── Record ──────────────────────────────────────────────────────────────────
  recordTitle: 'Your record',
  recordCurrentStreak: 'Day streak',
  recordBestStreak: 'Best run',
  recordFinished: 'Finished',
  recordAccessibilityLabel: (current: number, best: number, finished?: number) =>
    [
      'Your record.',
      `Current streak, ${days(current)}.`,
      `Best run, ${days(best)}.`,
      finished === undefined ? undefined : `${products(finished)} finished.`,
    ]
      .filter(Boolean)
      .join(' '),
  /** Shown only when it adds something the three figures don't already say. */
  recordFirstLog: 'Your record starts with your first log.',
  recordNewRun: 'Log a product today to start a new run.',
  recordPersonalBest: 'That’s the longest run you’ve had.',

  // ── Reminders ───────────────────────────────────────────────────────────────
  remindersTitle: 'In-app reminders',
  remindersDescription:
    'Gentle nudges inside the app about products you’re low on. Off by default — you’re always in control.',
  errorReminders: "We couldn't save that preference. Please try again.",

  // ── Account ─────────────────────────────────────────────────────────────────
  accountTitle: 'Account',
  signOut: 'Sign out',
  deleteAccount: 'Delete account',
  deleteTitle: 'Delete your account?',
  deleteDescription:
    'This permanently removes your profile, inventory, wishlist, and empties archive. This can’t be undone.',
  deleteConfirmLabel: 'Type DELETE to confirm',
  deleteConfirmPlaceholder: 'DELETE',
  deleteConfirmWord: 'DELETE',
  deleteCancel: 'Cancel',
  deleteConfirmAction: 'Delete my account',

  // ── States ──────────────────────────────────────────────────────────────────
  loadingProfile: 'Loading your profile...',
  errorProfile: "We couldn't load your profile.",
  errorSignOut: "We couldn't sign you out. Please try again.",
  errorDelete: "We couldn't delete your account. Please try again.",
};
