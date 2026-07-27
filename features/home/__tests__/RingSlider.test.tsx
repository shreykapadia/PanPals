import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { RingSlider, snapToStep } from '../RingSlider';
import { Product } from '../../../mocks/types';

const product: Product = {
  id: 'product-1',
  user_id: 'user-1',
  catalog_product_id: null,
  brand: 'Rare Beauty',
  name: 'Soft Pinch Liquid Blush',
  shade: null,
  category: 'face',
  format: 'full',
  status: 'in_rotation',
  percent_remaining: 47,
  photo_url: null,
  pao_months: 12,
  opened_at: '2026-01-01',
  is_priority: true,
  source_wishlist_item_id: null,
  created_at: '2026-01-01T00:00:00.000Z',
};

describe('snapToStep', () => {
  it('snaps any percent to the nearest 5% step, clamped to 0-100', () => {
    expect(snapToStep(0)).toBe(0);
    expect(snapToStep(47)).toBe(45);
    expect(snapToStep(48)).toBe(50);
    expect(snapToStep(100)).toBe(100);
    expect(snapToStep(103)).toBe(100);
    expect(snapToStep(-5)).toBe(0);
  });
});

describe('RingSlider', () => {
  it('opens already snapped to the nearest 5% step', () => {
    const { getByLabelText } = render(
      <RingSlider product={product} onConfirm={jest.fn()} onCancel={jest.fn()} />,
    );

    expect(getByLabelText('45% remaining')).toBeTruthy();
  });

  it('confirms with the current (snapped) percent', () => {
    const onConfirm = jest.fn();
    const { getByLabelText } = render(
      <RingSlider product={product} onConfirm={onConfirm} onCancel={jest.fn()} />,
    );

    fireEvent.press(getByLabelText('Save 45% remaining'));

    expect(onConfirm).toHaveBeenCalledWith(45);
  });

  it('cancels without confirming', () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    const { getByLabelText } = render(
      <RingSlider product={product} onConfirm={onConfirm} onCancel={onCancel} />,
    );

    fireEvent.press(getByLabelText('Cancel without saving this update'));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('shows a calm retry message when the save has failed', () => {
    const { getByLabelText } = render(
      <RingSlider
        product={product}
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
        errorMessage="Your update wasn’t saved. Please try again."
      />,
    );

    expect(getByLabelText('Your update was not saved. Please try again.')).toBeTruthy();
  });
});
