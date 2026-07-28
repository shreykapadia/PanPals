import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider, type Metrics } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import YouTab, { formatMemberSince, recordFootnote } from '../you';
import { youStrings } from '../../../features/you/strings';
import {
  mockFrom,
  mockRpc,
  resetSupabaseMock,
  chainableResult,
} from '../../../lib/testUtils/supabaseMock';

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

// The masthead sizes itself off the top inset, so the screen needs a provider —
// fixed metrics keep the band's height deterministic rather than device-dependent.
const METRICS: Metrics = {
  frame: { x: 0, y: 0, width: 393, height: 852 },
  insets: { top: 59, left: 0, right: 0, bottom: 34 },
};

const PROFILE = {
  id: 'mock-user-123',
  username: 'maya_panpals',
  avatar_url: null,
  selected_goals: ['Finish what I own'],
  reminders_enabled: false,
  current_streak: 5,
  longest_streak: 12,
  created_at: '2026-03-04T09:00:00.000Z',
};

const renderWithClient = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <SafeAreaProvider initialMetrics={METRICS}>
      <QueryClientProvider client={queryClient}>
        <YouTab />
      </QueryClientProvider>
    </SafeAreaProvider>,
  );
};

describe('YouTab', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockSignOut.mockClear();
    mockDeleteAccount.mockClear();
    resetSupabaseMock();
    mockFrom.mockReturnValue(chainableResult({ data: PROFILE, error: null }));
    // The You tab reads `status_counts.finished` off the shared dashboard RPC.
    mockRpc.mockResolvedValue({
      data: { status_counts: { in_rotation: 4, unopened: 2, finished: 3 } },
      error: null,
    });
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

  // The masthead and record panel each expose one composed label and hide their
  // parts, so a screen reader hears a sentence instead of spelling out a
  // composition. That also hides them from RNTL's default queries — hence the
  // explicit `includeHiddenElements` when checking what's drawn on screen.
  const SHOW_HIDDEN = { includeHiddenElements: true };

  it('shows the name and how long she has been panning in the masthead', async () => {
    const { findByLabelText, findByText } = renderWithClient();

    await findByLabelText('Your profile. maya_panpals. Panning since March 2026.');
    await findByText('maya_panpals', SHOW_HIDDEN);
    await findByText('Panning since March 2026', SHOW_HIDDEN);
  });

  it('reads each goal back with the icon copy she chose it by, not an uppercased pill', async () => {
    const { findByText } = renderWithClient();

    await findByText('Finish what I own');
    // The subtitle from GOAL_OPTIONS — the continuity with goal capture.
    await findByText('Use up what’s already yours');
  });

  it('shows streak, best run, and finished count in the record panel', async () => {
    const { findByText, findByLabelText } = renderWithClient();

    await findByLabelText(
      'Your record. Current streak, 5 days. Best run, 12 days. 3 products finished.',
    );
    await findByText(youStrings.recordCurrentStreak, SHOW_HIDDEN);
    await findByText(youStrings.recordBestStreak, SHOW_HIDDEN);
    await findByText(youStrings.recordFinished, SHOW_HIDDEN);
  });

  it('drops the finished figure rather than failing when the dashboard query errors', async () => {
    mockRpc.mockRejectedValue(new Error('rpc down'));
    const { findByLabelText, queryByText } = renderWithClient();

    await findByLabelText('Your record. Current streak, 5 days. Best run, 12 days.');
    expect(queryByText(youStrings.recordFinished, SHOW_HIDDEN)).toBeNull();
    // The rest of the page is unaffected.
    expect(queryByText(youStrings.recordCurrentStreak, SHOW_HIDDEN)).not.toBeNull();
  });

  it('offers a way in when no goals are selected yet', async () => {
    mockFrom.mockReturnValue(
      chainableResult({
        data: { ...PROFILE, selected_goals: [], current_streak: 0, longest_streak: 0 },
        error: null,
      }),
    );
    const { findByLabelText, findByText } = renderWithClient();

    await findByText(youStrings.noGoals);
    fireEvent.press(await findByLabelText(youStrings.chooseGoals));

    // Editing happens in place — the chip picker, not a modal.
    await findByText(youStrings.goalsEditHint);
    await findByLabelText('Cut impulse buys');
  });

  it('reflects the stored reminder preference instead of defaulting to off', async () => {
    mockFrom.mockReturnValue(
      chainableResult({ data: { ...PROFILE, reminders_enabled: true }, error: null }),
    );
    const { findByLabelText } = renderWithClient();

    const toggle = await findByLabelText(youStrings.remindersTitle);
    expect(toggle.props.value).toBe(true);
  });

  it('persists the reminder preference when toggled', async () => {
    const writeBuilder = chainableResult({
      data: { ...PROFILE, reminders_enabled: true },
      error: null,
    });
    // The mount-time profile read comes first; everything after it is the write.
    mockFrom
      .mockReturnValueOnce(chainableResult({ data: PROFILE, error: null }))
      .mockReturnValue(writeBuilder);

    const { findByLabelText } = renderWithClient();
    const toggle = await findByLabelText(youStrings.remindersTitle);
    expect(toggle.props.value).toBe(false);

    fireEvent(toggle, 'valueChange', true);

    // The switch moves immediately, and the write lands on `profiles`.
    await waitFor(() => expect(toggle.props.value).toBe(true));
    await waitFor(() =>
      expect(writeBuilder.update).toHaveBeenCalledWith({ reminders_enabled: true }),
    );
  });

  it('puts the reminder switch back and explains when the write fails', async () => {
    mockFrom
      .mockReturnValueOnce(chainableResult({ data: PROFILE, error: null }))
      .mockReturnValue(chainableResult({ data: null, error: { message: 'network error' } }));

    const { findByLabelText, findByText } = renderWithClient();
    const toggle = await findByLabelText(youStrings.remindersTitle);

    fireEvent(toggle, 'valueChange', true);

    await findByText(youStrings.errorReminders);
    // Reverted rather than left showing a preference that was never saved.
    expect(toggle.props.value).toBe(false);
  });
});

describe('formatMemberSince', () => {
  it('formats an ISO timestamp as a month and year', () => {
    expect(formatMemberSince('2026-03-04T09:00:00.000Z')).toBe('Panning since March 2026');
  });

  it('returns undefined for missing or unparseable dates', () => {
    expect(formatMemberSince(null)).toBeUndefined();
    expect(formatMemberSince(undefined)).toBeUndefined();
    expect(formatMemberSince('not a date')).toBeUndefined();
  });
});

describe('recordFootnote', () => {
  it('invites a first log when there is no history at all', () => {
    expect(recordFootnote(0, 0, 0)).toBe(youStrings.recordFirstLog);
    expect(recordFootnote(0, 0, undefined)).toBe(youStrings.recordFirstLog);
  });

  it('offers a restart, without judgement, when a run has lapsed', () => {
    expect(recordFootnote(0, 12, 3)).toBe(youStrings.recordNewRun);
  });

  it('names a personal best the numbers alone would not reveal', () => {
    expect(recordFootnote(9, 9, 3)).toBe(youStrings.recordPersonalBest);
  });

  it('stays silent rather than padding with encouragement', () => {
    expect(recordFootnote(5, 12, 3)).toBeUndefined();
    // A 1-day streak equals a 1-day best, but calling that a personal best
    // would be hollow on day one.
    expect(recordFootnote(1, 1, 0)).toBeUndefined();
  });
});
