import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Animated } from 'react-native';
import { LogTabButton } from '../LogTabButton';
import { useReducedMotion } from '../../../lib/useReducedMotion';

jest.mock('../../../lib/useReducedMotion', () => ({
  useReducedMotion: jest.fn(),
}));

describe('LogTabButton', () => {
  const mockUseReducedMotion = useReducedMotion as jest.MockedFunction<typeof useReducedMotion>;

  beforeEach(() => {
    mockUseReducedMotion.mockReturnValue(false);
    jest.clearAllMocks();
  });

  it('renders with default accessibilityLabel and accessibilityRole="button"', () => {
    const { getByLabelText } = render(<LogTabButton onPress={() => {}} />);
    const btn = getByLabelText('Quick log a product');

    expect(btn).toBeTruthy();
    expect(btn.props.accessibilityRole).toBe('button');
  });

  it('renders custom accessibilityLabel when passed', () => {
    const { getByLabelText } = render(
      <LogTabButton onPress={() => {}} accessibilityLabel="Custom log action" />,
    );
    expect(getByLabelText('Custom log action')).toBeTruthy();
  });

  it('renders the "Log" label text', () => {
    const { getByText } = render(<LogTabButton onPress={() => {}} />);
    expect(getByText('Log')).toBeTruthy();
  });

  it('calls onPress once when pressed', () => {
    const handlePress = jest.fn();
    const { getByLabelText } = render(<LogTabButton onPress={handlePress} />);

    fireEvent.press(getByLabelText('Quick log a product'));
    expect(handlePress).toHaveBeenCalledTimes(1);
  });

  it('skips animation when reduce motion is enabled', () => {
    mockUseReducedMotion.mockReturnValue(true);
    const springSpy = jest.spyOn(Animated, 'spring');
    const handlePress = jest.fn();

    const { getByLabelText } = render(<LogTabButton onPress={handlePress} />);
    const btn = getByLabelText('Quick log a product');

    fireEvent(btn, 'pressIn');
    fireEvent(btn, 'pressOut');

    expect(springSpy).not.toHaveBeenCalled();
    springSpy.mockRestore();
  });
});
