import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import YouTab from '../you';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn() }),
}));

const mockSignOut = jest.fn().mockResolvedValue(undefined);
const mockDeleteAccount = jest.fn().mockResolvedValue(undefined);
jest.mock('../../../lib/auth/useAuth', () => ({
  useAuth: () => ({
    session: { user: { id: 'mock-user-123', email: 'maya@panpals.app' } },
    user: { id: 'mock-user-123', email: 'maya@panpals.app' },
    isLoading: false,
    signOut: mockSignOut,
    deleteAccount: mockDeleteAccount,
  }),
}));

const renderWithClient = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <YouTab />
    </QueryClientProvider>,
  );
};

describe('YouTab', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockSignOut.mockClear();
    mockDeleteAccount.mockClear();
  });

  it('signs out and routes to welcome', async () => {
    const { getByLabelText } = renderWithClient();
    await waitFor(() => expect(getByLabelText('Sign out')).toBeTruthy());

    fireEvent.press(getByLabelText('Sign out'));

    await waitFor(() => expect(mockSignOut).toHaveBeenCalled());
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/(auth)/welcome'));
  });

  it('requires typing DELETE before the delete-account action is enabled', async () => {
    const { getByLabelText } = renderWithClient();
    await waitFor(() => expect(getByLabelText('Delete account')).toBeTruthy());

    fireEvent.press(getByLabelText('Delete account'));

    const confirmButton = await waitFor(() => getByLabelText('Delete my account'));
    expect(confirmButton.props.accessibilityState?.disabled).toBe(true);

    fireEvent.press(confirmButton);
    expect(mockDeleteAccount).not.toHaveBeenCalled();

    fireEvent.changeText(getByLabelText('Type DELETE to confirm'), 'DELETE');
    expect(confirmButton.props.accessibilityState?.disabled).toBe(false);

    fireEvent.press(confirmButton);
    await waitFor(() => expect(mockDeleteAccount).toHaveBeenCalled());
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/(auth)/welcome'));
  });
});
