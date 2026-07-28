import type { IconName } from '../../components/ui/Icon';
import type { FocusPotHeroItem } from '../../components/onboarding/FocusPotHero';

/**
 * Blended goal set: keeps the plan-anchored concepts (AI-CONTEXT / Phase 0-E) —
 * finishing, impulse control, waste, routine — with the benefit-forward card
 * phrasing from the Stitch "Select Your Goals" screen. `value` is what we persist
 * to profiles.selected_goals; title/subtitle/icon are display only.
 *
 * `value` is load-bearing: it round-trips through the You tab's goal editor and
 * is stored verbatim in `profiles.selected_goals`. Changing a string here
 * orphans every profile already saved with the old one.
 */
export const GOAL_OPTIONS: {
  value: string;
  title: string;
  subtitle: string;
  icon: IconName;
}[] = [
  {
    value: 'Finish what I own',
    title: 'Finish what I own',
    subtitle: 'Use up what’s already yours',
    icon: 'empties',
  },
  {
    value: 'Cut impulse buys',
    title: 'Cut impulse buys',
    subtitle: 'Pause before the next purchase',
    icon: 'cooling',
  },
  {
    value: 'Reduce waste',
    title: 'Reduce waste',
    subtitle: 'Get every last use',
    icon: 'leaf',
  },
  {
    value: 'Build a routine',
    title: 'Build a routine',
    subtitle: 'Small, steady habits',
    icon: 'routine',
  },
];

export const AGE_RANGE_OPTIONS = ['18-24', '25-34', '35-44', '45-54', '55+'] as const;

/**
 * The welcome hero's three tiles. Categories, not brands — this previews the
 * real Today's Focus row without inventing products the user doesn't own.
 * `badge` is pre-formatted per item (rather than derived from `percent` inside
 * the component) so the "Hit pan!" copy stays a string-table concern, not
 * component logic; `highlight` picks the badge's accent treatment.
 */
export const WELCOME_HERO_ITEMS: readonly FocusPotHeroItem[] = [
  { percent: 28, category: 'Serum', badge: '28% used', highlight: false },
  { percent: 57, category: 'Lip balm', badge: '57% used', highlight: false },
  { percent: 92, category: 'Cream', badge: 'Hit pan!', highlight: true },
];

/** The three-up value row on welcome — seen before the sign-up commitment. */
export const WELCOME_VALUE_PROPS: { icon: IconName; label: string; description: string }[] = [
  { icon: 'inventory', label: 'Track', description: 'Log what you own in seconds' },
  { icon: 'cooling', label: 'Pause', description: 'A 14-day breather before you buy' },
  { icon: 'empties', label: 'Celebrate', description: 'Watch every pan hit zero' },
];

export const authStrings = {
  welcome: {
    wordmark: 'PanPals',
    headline: 'Shop your stash, spend with intention.',
    tagline: 'Build intentional beauty habits, without the friction.',
    heroLabel: 'Three of your products, part-way finished: 28, 57 and 92 percent used.',
    createAccount: 'Create account',
    signIn: 'I already have an account',
  },
  signUp: {
    title: 'Create your account',
    subtitle: 'Track what you own, and finish it before buying more.',
    stepLabel: 'Step 1 of 3: create your account',
    emailLabel: 'Email address',
    emailPlaceholder: 'Enter your email',
    passwordLabel: 'Password',
    passwordPlaceholder: 'At least 6 characters',
    passwordHint: 'At least 6 characters.',
    submit: 'Sign up',
    legal: 'By signing up, you agree to our Terms of Service and Privacy Policy.',
    switchPrompt: 'Already have an account?',
    switchAction: 'Sign in',
    errorEmail: 'Enter a valid email address.',
    errorPassword: 'Your password needs at least 6 characters.',
    errorGeneric: "We couldn't create your account. Please try again.",
    confirmEmailTitle: 'Check your email',
    confirmEmail: "We've sent you a confirmation link. Confirm it, then sign in.",
  },
  signIn: {
    title: 'Welcome back',
    subtitle: 'Pick up where you left off.',
    emailLabel: 'Email address',
    emailPlaceholder: 'Enter your email',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter your password',
    submit: 'Sign in',
    switchPrompt: "Don't have an account?",
    switchAction: 'Create one',
    errorEmail: 'Enter a valid email address.',
    errorPassword: 'Enter your password.',
    errorGeneric: "We couldn't sign you in. Please try again.",
  },
  goalCapture: {
    nameStepLabel: 'Step 2 of 3: your name',
    nameTitle: 'What should we call you?',
    nameSubtitle: 'Just a first name — it’s only ever shown to you.',
    firstNameLabel: 'First name',
    firstNamePlaceholder: 'Maya',
    next: 'Next',

    goalsStepLabel: 'Step 3 of 3: your goals',
    goalsTitle: 'What brings you to PanPals?',
    goalsSubtitle: 'Pick as many as you like. You can change these any time.',

    optionalToggle: 'Add a few optional details',
    optionalHint: 'Helps us understand who PanPals is for. Skip it if you’d rather not.',
    ageRangeLabel: 'Age range',
    locationLabel: 'Location',
    locationPlaceholder: 'City or country',

    continueLabel: 'Continue',
    errorGoals: 'Choose at least one goal to continue.',
    errorName: 'Let us know what to call you.',
    errorSubmit: "We couldn't save your goals. Please try again.",

    handoffTitle: (firstName: string) => `You’re all set, ${firstName}.`,
    handoffSubtitle: 'Let’s log your first product.',
    handoffSkip: 'Continue to PanPals',
  },
};
