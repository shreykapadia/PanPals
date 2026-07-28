import React from 'react';
import { render } from '@testing-library/react-native';
import { HomeSkeleton } from '../HomeSkeleton';

describe('HomeSkeleton', () => {
  it('announces itself as loading the Home dashboard', () => {
    const { getByLabelText } = render(<HomeSkeleton />);

    expect(getByLabelText('Loading your Home dashboard')).toBeTruthy();
  });
});
