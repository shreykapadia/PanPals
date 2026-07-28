import React from 'react';
import { Image } from 'react-native';
import { render, fireEvent, act } from '@testing-library/react-native';
import { SafeAreaProvider, type Metrics } from 'react-native-safe-area-context';
import { setStatusBarStyle } from 'expo-status-bar';
import WelcomeScreen from '../welcome';

// The masthead sizes itself off the top inset, so the screen needs a provider —
// fixed metrics keep the band's height deterministic rather than device-dependent.
const METRICS: Metrics = {
  frame: { x: 0, y: 0, width: 393, height: 852 },
  insets: { top: 59, left: 0, right: 0, bottom: 34 },
};

const renderWelcome = () =>
  render(
    <SafeAreaProvider initialMetrics={METRICS}>
      <WelcomeScreen />
    </SafeAreaProvider>,
  );

// The onboarding entrance animations settle on timers after render; flushing
// them inside act() keeps the suite free of "not wrapped in act" noise.
beforeEach(() => jest.useFakeTimers());
afterEach(() => {
  act(() => jest.runOnlyPendingTimers());
  jest.useRealTimers();
});

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), back: jest.fn() }),
  // Focus and mount coincide for a single rendered screen, so a plain effect is
  // a faithful stand-in — and its cleanup still stands for the blur.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  useFocusEffect: (effect: React.EffectCallback) => require('react').useEffect(effect, [effect]),
}));

jest.mock('expo-status-bar', () => ({
  ...jest.requireActual('expo-status-bar'),
  setStatusBarStyle: jest.fn(),
}));

describe('WelcomeScreen', () => {
  beforeEach(() => {
    mockPush.mockClear();
    jest.mocked(setStatusBarStyle).mockClear();
  });

  it('offers both entry paths and routes them to the right screens', () => {
    const { getByLabelText } = renderWelcome();

    fireEvent.press(getByLabelText('Create account'));
    expect(mockPush).toHaveBeenCalledWith('/(auth)/sign-up');

    fireEvent.press(getByLabelText('I already have an account'));
    expect(mockPush).toHaveBeenCalledWith('/(auth)/sign-in');
  });

  it('describes the decorative hero honestly instead of claiming an illustration', () => {
    const { getByLabelText } = renderWelcome();

    getByLabelText('Three of your products, part-way finished: 28, 57 and 92 percent used.');
  });

  it('keeps the masthead photograph out of the accessibility tree', () => {
    const { UNSAFE_getByType } = renderWelcome();

    // The lipstick wall is pure art direction — the wordmark over it carries
    // the meaning, so a screen reader must never announce the image.
    const art = UNSAFE_getByType(Image);
    expect(art.props.accessible).toBe(false);
    expect(art.props.importantForAccessibility).toBe('no-hide-descendants');
  });

  it('lights the status bar for the dark masthead and hands it back on the way out', () => {
    const { unmount } = renderWelcome();
    expect(setStatusBarStyle).toHaveBeenCalledWith('light', true);

    // Every other onboarding screen is cream. Leaving the glyphs light would
    // hide the clock on sign-up, which is exactly what shipped once already.
    unmount();
    expect(setStatusBarStyle).toHaveBeenLastCalledWith('dark', true);
  });
});
