import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import WelcomeScreen from '../welcome';

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
}));

describe('WelcomeScreen', () => {
  beforeEach(() => mockPush.mockClear());

  it('offers both entry paths and routes them to the right screens', () => {
    const { getByLabelText } = render(<WelcomeScreen />);

    fireEvent.press(getByLabelText('Create account'));
    expect(mockPush).toHaveBeenCalledWith('/(auth)/sign-up');

    fireEvent.press(getByLabelText('I already have an account'));
    expect(mockPush).toHaveBeenCalledWith('/(auth)/sign-in');
  });

  it('describes the decorative hero honestly instead of claiming an illustration', () => {
    const { getByLabelText } = render(<WelcomeScreen />);

    getByLabelText('Three of your products, part-way finished: 28, 57 and 92 percent used.');
  });
});
