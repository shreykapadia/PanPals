import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Product } from '../../../mocks/types';
import { FinishFlow } from '../FinishFlow';

const mockUseProducts = jest.fn();
const mockUseFinishProduct = jest.fn();
const mockAddListener = jest.fn();

jest.mock('../../../lib/api', () => ({
  useProducts: () => mockUseProducts(),
  useFinishProduct: () => mockUseFinishProduct(),
}));

jest.mock('expo-router', () => ({
  useNavigation: () => ({ addListener: mockAddListener }),
}));

jest.mock('../useReducedMotion', () => ({
  useReducedMotion: () => true,
}));

const product: Product = {
  id: 'product-1',
  user_id: 'user-1',
  catalog_product_id: null,
  brand: 'Rare Beauty',
  name: 'Soft Pinch Liquid Blush',
  shade: 'Happy',
  category: 'face',
  format: 'full',
  status: 'in_rotation',
  percent_remaining: 0,
  photo_url: null,
  pao_months: 12,
  opened_at: '2026-03-22',
  is_priority: false,
  source_wishlist_item_id: null,
  created_at: '2026-03-22T00:00:00.000Z',
};

function setDefaultHookResponses(mutateAsync = jest.fn().mockResolvedValue({ id: 'empty-1' })) {
  mockUseProducts.mockReturnValue({
    data: [product],
    isPending: false,
    isError: false,
    refetch: jest.fn(),
  });
  mockUseFinishProduct.mockReturnValue({
    mutateAsync,
    isPending: false,
    error: null,
    reset: jest.fn(),
  });
  return mutateAsync;
}

describe('FinishFlow', () => {
  beforeEach(() => {
    mockUseProducts.mockReset();
    mockUseFinishProduct.mockReset();
    mockAddListener.mockReset().mockReturnValue(jest.fn());
  });

  it('saves the selected verdict and one-line review through the shared finish mutation', async () => {
    const mutateAsync = setDefaultHookResponses();
    const onComplete = jest.fn();
    const { getByLabelText } = render(
      <FinishFlow productId={product.id} onComplete={onComplete} />,
    );

    fireEvent.press(getByLabelText('Continue to the repurchase review'));
    fireEvent.press(getByLabelText('Yes'));
    fireEvent.changeText(getByLabelText('A note for future you'), 'Loved the soft finish.');
    fireEvent.press(getByLabelText('Save this finished product to your private empties archive'));

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({
        productId: product.id,
        repurchase: 'yes',
        reviewText: 'Loved the soft finish.',
        photoUrl: undefined,
      }),
    );
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('allows a user to skip the review and saves the default Maybe verdict', async () => {
    const mutateAsync = setDefaultHookResponses();
    const { getByLabelText } = render(<FinishFlow productId={product.id} onComplete={jest.fn()} />);

    fireEvent.press(getByLabelText('Continue to the repurchase review'));
    fireEvent.press(getByLabelText('Skip the review and save Maybe as your verdict'));

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({
        productId: product.id,
        repurchase: 'maybe',
        reviewText: undefined,
        photoUrl: undefined,
      }),
    );
  });

  it('shows a calm retry state when saving the finish has failed', () => {
    const reset = jest.fn();
    setDefaultHookResponses();
    mockUseFinishProduct.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
      error: new Error('Save failed'),
      reset,
    });
    const { getByLabelText, getByText } = render(<FinishFlow productId={product.id} />);

    fireEvent.press(getByLabelText('Continue to the repurchase review'));

    expect(getByText('Your finish was not saved yet')).toBeTruthy();
    fireEvent.press(getByLabelText('Try Again'));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('shows the months-in-use celebration without points, badges, or score', () => {
    setDefaultHookResponses();
    const { getByText, queryByText } = render(
      <FinishFlow productId={product.id} onComplete={jest.fn()} />,
    );

    expect(getByText('You finished it!')).toBeTruthy();
    expect(getByText('Rare Beauty Soft Pinch Liquid Blush')).toBeTruthy();
    expect(getByText('Shade: Happy')).toBeTruthy();
    expect(getByText(/months in use/)).toBeTruthy();
    expect(queryByText(/points|badge|score/i)).toBeNull();
  });

  it('lets a sample preview reach completion without calling the finish mutation', async () => {
    const mutateAsync = setDefaultHookResponses();
    const onComplete = jest.fn();
    const { getByLabelText } = render(
      <FinishFlow
        productId={product.id}
        productOverride={product}
        previewOnly
        onComplete={onComplete}
      />,
    );

    fireEvent.press(getByLabelText('Continue to the repurchase review'));
    fireEvent.press(getByLabelText('Save this finished product to your private empties archive'));

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it('lets someone return to Progress before saving a finish', () => {
    setDefaultHookResponses();
    const onCancel = jest.fn();
    const { getByLabelText } = render(<FinishFlow productId={product.id} onCancel={onCancel} />);

    fireEvent.press(getByLabelText('Return to Progress without finishing this product'));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('starts on celebration without an extra completion-confirmation screen', () => {
    setDefaultHookResponses();
    const { getByText, queryByText } = render(<FinishFlow productId={product.id} />);

    expect(getByText('You finished it!')).toBeTruthy();
    expect(queryByText('Finished this one?')).toBeNull();
  });

  it('returns to Progress when the active Progress tab is pressed', () => {
    setDefaultHookResponses();
    const onCancel = jest.fn();
    let tabPressHandler: (() => void) | undefined;
    mockAddListener.mockImplementation((_eventName, listener) => {
      tabPressHandler = listener;
      return jest.fn();
    });

    render(<FinishFlow productId={product.id} onCancel={onCancel} />);
    tabPressHandler?.();

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
