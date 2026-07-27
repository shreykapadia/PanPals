import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import SignUpScreen from '../sign-up';

// The onboarding entrance animations settle on timers after render; flushing
// them inside act() keeps the suite free of "not wrapped in act" noise.
beforeEach(() => jest.useFakeTimers());
afterEach(() => {
  act(() => jest.runOnlyPendingTimers());
  jest.useRealTimers();
});

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), back: jest.fn() }),
}));

const mockSignUp = jest.fn();
jest.mock('../../../lib/auth/useAuth', () => ({
  useAuth: () => ({ signUp: mockSignUp }),
}));

describe('SignUpScreen', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockSignUp.mockReset();
  });

  it('blocks submission and explains why when the email is malformed', async () => {
    const { getByLabelText, findByText } = render(<SignUpScreen />);

    fireEvent.changeText(getByLabelText('Email address'), 'not-an-email');
    fireEvent.changeText(getByLabelText('Password'), 'password123');
    fireEvent.press(getByLabelText('Sign up'));

    await findByText('Enter a valid email address.');
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('routes to goal capture once the account exists', async () => {
    mockSignUp.mockResolvedValue({ needsEmailConfirmation: false });
    const { getByLabelText } = render(<SignUpScreen />);

    fireEvent.changeText(getByLabelText('Email address'), 'maya@panpals.app');
    fireEvent.changeText(getByLabelText('Password'), 'password123');
    fireEvent.press(getByLabelText('Sign up'));

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/(auth)/goal-capture'));
  });

  it('presents the email-confirmation step as a confirmation, not an error', async () => {
    mockSignUp.mockResolvedValue({ needsEmailConfirmation: true });
    const { getByLabelText, findByText, queryByText } = render(<SignUpScreen />);

    fireEvent.changeText(getByLabelText('Email address'), 'maya@panpals.app');
    fireEvent.changeText(getByLabelText('Password'), 'password123');
    fireEvent.press(getByLabelText('Sign up'));

    await findByText('Check your email');
    expect(queryByText("We couldn't create your account. Please try again.")).toBeNull();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('lets the password be revealed', () => {
    const { getByLabelText } = render(<SignUpScreen />);

    expect(getByLabelText('Password').props.secureTextEntry).toBe(true);
    fireEvent.press(getByLabelText('Show password'));
    expect(getByLabelText('Password').props.secureTextEntry).toBe(false);
  });
});
