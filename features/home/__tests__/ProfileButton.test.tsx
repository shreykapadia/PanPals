import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { ProfileButton } from '../ProfileButton';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('ProfileButton', () => {
  beforeEach(() => {
    mockPush.mockReset();
  });

  it('navigates to /you by route path when pressed', () => {
    const { getByLabelText } = render(<ProfileButton username="maya" />);

    fireEvent.press(getByLabelText('Your profile and settings'));

    expect(mockPush).toHaveBeenCalledWith('/you');
  });

  it('shows the first letter of the username, uppercased', () => {
    const { getByText } = render(<ProfileButton username="maya" />);

    expect(getByText('M')).toBeTruthy();
  });

  it('falls back to the profile icon when no username is available', () => {
    const { queryByText, getByLabelText } = render(<ProfileButton />);

    expect(queryByText(/./)).toBeNull();
    expect(getByLabelText('Your profile and settings')).toBeTruthy();
  });
});
