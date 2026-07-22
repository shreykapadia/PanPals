import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import GoalCaptureScreen from '../goal-capture';
import { mockFrom, resetSupabaseMock, chainableResult } from '../../../lib/testUtils/supabaseMock';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn() }),
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
    mockReplace.mockClear();
    resetSupabaseMock();
    mockFrom.mockReturnValue(chainableResult({ data: { id: 'mock-user-123' }, error: null }));
  });

  it('keeps Continue disabled until a name and at least one goal are chosen', () => {
    const { getByLabelText } = renderWithClient();

    const continueButton = getByLabelText('Continue');
    expect(continueButton.props.accessibilityState?.disabled).toBe(true);

    fireEvent.press(continueButton);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('enables Continue and completes goal capture once a name and a goal are set', async () => {
    const { getByLabelText } = renderWithClient();

    fireEvent.changeText(getByLabelText('First name'), 'Maya');
    fireEvent.press(getByLabelText('Finish what I own'));

    const continueButton = getByLabelText('Continue');
    expect(continueButton.props.accessibilityState?.disabled).toBe(false);

    fireEvent.press(continueButton);

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/(tabs)'));
  });

  it('shows an inline error and does not navigate when saving goals fails', async () => {
    mockFrom.mockReturnValue(chainableResult({ data: null, error: new Error('upsert failed') }));
    const { getByLabelText, findByText } = renderWithClient();

    fireEvent.changeText(getByLabelText('First name'), 'Maya');
    fireEvent.press(getByLabelText('Finish what I own'));
    fireEvent.press(getByLabelText('Continue'));

    await findByText("We couldn't save your goals. Please try again.");
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
