import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import YouTab from '../you';
import { mockFrom, resetSupabaseMock, chainableResult } from '../../../lib/testUtils/supabaseMock';

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
// eslint-disable-next-line @typescript-eslint/no-require-imports
jest.mock('../../../lib/supabase', () => require('../../../lib/testUtils/supabaseMock'));

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
    resetSupabaseMock();
    mockFrom.mockReturnValue(
      chainableResult({
        data: {
          id: 'mock-user-123',
          username: 'maya_panpals',
          selected_goals: ['Finish what I own'],
          current_streak: 5,
          longest_streak: 12,
        },
        error: null,
      }),
    );
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

  it('shows an inline error and stays signed in when sign-out fails', async () => {
    mockSignOut.mockRejectedValueOnce(new Error('network error'));
    const { getByLabelText, findByText } = renderWithClient();
    await waitFor(() => expect(getByLabelText('Sign out')).toBeTruthy());

    fireEvent.press(getByLabelText('Sign out'));

    await findByText("We couldn't sign you out. Please try again.");
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('shows an inline error and keeps the modal open when delete-account fails', async () => {
    mockDeleteAccount.mockRejectedValueOnce(new Error('network error'));
    const { getByLabelText, findByText } = renderWithClient();
    await waitFor(() => expect(getByLabelText('Delete account')).toBeTruthy());

    fireEvent.press(getByLabelText('Delete account'));
    const confirmButton = await waitFor(() => getByLabelText('Delete my account'));
    fireEvent.changeText(getByLabelText('Type DELETE to confirm'), 'DELETE');
    fireEvent.press(confirmButton);

    await findByText("We couldn't delete your account. Please try again.");
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
