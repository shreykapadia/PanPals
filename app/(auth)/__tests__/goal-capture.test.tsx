import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import GoalCaptureScreen from '../goal-capture';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn() }),
}));

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
});
