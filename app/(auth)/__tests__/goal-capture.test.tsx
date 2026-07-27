import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import GoalCaptureScreen from '../goal-capture';
import { mockFrom, resetSupabaseMock, chainableResult } from '../../../lib/testUtils/supabaseMock';

const mockReplace = jest.fn();
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), back: mockBack }),
}));
// eslint-disable-next-line @typescript-eslint/no-require-imports
jest.mock('../../../lib/supabase', () => require('../../../lib/testUtils/supabaseMock'));

const renderWithClient = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <GoalCaptureScreen />
    </QueryClientProvider>,
  );
};

describe('GoalCaptureScreen', () => {
  beforeEach(() => {
    // Fake timers also hold the handoff beat's auto-advance still, so the
    // tests exercise the explicit skip rather than racing a 1.4s timeout.
    jest.useFakeTimers();
    mockReplace.mockClear();
    mockBack.mockClear();
    resetSupabaseMock();
    mockFrom.mockReturnValue(chainableResult({ data: { id: 'mock-user-123' }, error: null }));
  });

  afterEach(() => {
    act(() => jest.runOnlyPendingTimers());
    jest.useRealTimers();
  });

  it('keeps the name beat gated until a first name is entered', () => {
    const { getByLabelText, queryByText } = renderWithClient();

    const nextButton = getByLabelText('Next');
    expect(nextButton.props.accessibilityState?.disabled).toBe(true);

    fireEvent.press(nextButton);
    expect(queryByText('What brings you to PanPals?')).toBeNull();
  });

  it('keeps Continue disabled on the goals beat until a goal is chosen', () => {
    const { getByLabelText, getByText } = renderWithClient();

    fireEvent.changeText(getByLabelText('First name'), 'Maya');
    fireEvent.press(getByLabelText('Next'));

    getByText('What brings you to PanPals?');
    const continueButton = getByLabelText('Continue');
    expect(continueButton.props.accessibilityState?.disabled).toBe(true);

    fireEvent.press(continueButton);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('marks a goal as checked for assistive tech rather than by color alone', () => {
    const { getByLabelText } = renderWithClient();

    fireEvent.changeText(getByLabelText('First name'), 'Maya');
    fireEvent.press(getByLabelText('Next'));

    const goal = getByLabelText('Finish what I own');
    expect(goal.props.accessibilityState?.checked).toBe(false);

    fireEvent.press(goal);
    expect(getByLabelText('Finish what I own').props.accessibilityState?.checked).toBe(true);
  });

  it('completes goal capture and hands off to the tabs', async () => {
    const { getByLabelText, findByText } = renderWithClient();

    fireEvent.changeText(getByLabelText('First name'), 'Maya');
    fireEvent.press(getByLabelText('Next'));
    fireEvent.press(getByLabelText('Finish what I own'));

    const continueButton = getByLabelText('Continue');
    expect(continueButton.props.accessibilityState?.disabled).toBe(false);
    fireEvent.press(continueButton);

    // The handoff beat holds briefly and then auto-advances; tapping it skips
    // straight through, which is what we assert rather than waiting on a timer.
    await findByText('You’re all set, Maya.');
    fireEvent.press(getByLabelText('Continue to PanPals'));

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/(tabs)'));
  });

  it('shows an inline error and does not navigate when saving goals fails', async () => {
    mockFrom.mockReturnValue(chainableResult({ data: null, error: new Error('upsert failed') }));
    const { getByLabelText, findByText } = renderWithClient();

    fireEvent.changeText(getByLabelText('First name'), 'Maya');
    fireEvent.press(getByLabelText('Next'));
    fireEvent.press(getByLabelText('Finish what I own'));
    fireEvent.press(getByLabelText('Continue'));

    await findByText("We couldn't save your goals. Please try again.");
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
