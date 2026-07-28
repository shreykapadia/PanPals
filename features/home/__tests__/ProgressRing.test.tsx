import React from 'react';
import { render } from '@testing-library/react-native';
import { ProgressRing } from '../../../components/ProgressRing';

const SIZE = 96;
const STROKE_WIDTH = 10;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function expectedOffset(percent: number) {
  return CIRCUMFERENCE - (CIRCUMFERENCE * percent) / 100;
}

describe('ProgressRing', () => {
  it.each([0, 50, 100])('renders the right arc for %i percent', (percent) => {
    const { UNSAFE_getByProps } = render(
      <ProgressRing percent={percent} accessibilityLabel={`${percent}% remaining`} />,
    );

    const arc = UNSAFE_getByProps({ testID: 'progress-ring-arc' });
    expect(arc.props.strokeDashoffset).toBeCloseTo(expectedOffset(percent));
  });

  it('exposes its accessibilityLabel and value', () => {
    const { getByLabelText } = render(
      <ProgressRing percent={42} accessibilityLabel="Rare Beauty Blush: 42% remaining" />,
    );

    const ring = getByLabelText('Rare Beauty Blush: 42% remaining');
    expect(ring.props.accessibilityValue).toEqual({ min: 0, max: 100, now: 42 });
  });

  it('never renders a stroke width below 8px', () => {
    const { UNSAFE_getByProps } = render(
      <ProgressRing percent={50} strokeWidth={2} accessibilityLabel="thin ring" />,
    );

    expect(UNSAFE_getByProps({ testID: 'progress-ring-arc' }).props.strokeWidth).toBe(8);
  });
});
