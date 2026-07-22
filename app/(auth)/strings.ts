export const GOAL_OPTIONS = [
  'Finish what I own',
  'Cut impulse buys',
  'Reduce waste',
  'Build a routine',
] as const;

export const AGE_RANGE_OPTIONS = ['18-24', '25-34', '35-44', '45-54', '55+'] as const;

export const authStrings = {
  welcome: {
    wordmark: 'PanPals',
    tagline: 'Finish what you own before you buy more.',
    createAccount: 'Create account',
    signIn: 'Sign in',
  },
  signUp: {
    title: 'Create your account',
    emailLabel: 'Email address',
    emailPlaceholder: 'Enter your email',
    passwordLabel: 'Password',
    passwordPlaceholder: 'At least 6 characters',
    submit: 'Create account',
    switchPrompt: 'Already have an account?',
    switchAction: 'Sign in',
    errorEmail: 'Enter a valid email address.',
    errorPassword: 'Your password needs at least 6 characters.',
    errorGeneric: "We couldn't create your account. Please try again.",
    errorConfirmEmail: "We've sent a confirmation link to your email. Confirm it, then sign in.",
  },
  signIn: {
    title: 'Welcome back',
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
    title: 'What brings you to PanPals?',
    firstNameLabel: 'First name',
    firstNamePlaceholder: 'What should we call you?',
    goalsLabel: 'Pick at least one goal',
    optionalTitle: 'A couple optional details',
    ageRangeLabel: 'Age range',
    locationLabel: 'Location',
    locationPlaceholder: 'City, state (optional)',
    skip: 'Skip for now',
    continueLabel: 'Continue',
    errorGoals: 'Choose at least one goal to continue.',
    errorName: 'Let us know what to call you.',
    errorSubmit: "We couldn't save your goals. Please try again.",
  },
};
