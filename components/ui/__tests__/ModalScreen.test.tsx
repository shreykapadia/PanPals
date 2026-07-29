import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { ModalScreen } from '../ModalScreen';

describe('ModalScreen', () => {
  it('renders children wrapped inside safe area containers when visible', () => {
    const { getByText } = render(
      <ModalScreen visible>
        <Text>Modal content</Text>
      </ModalScreen>,
    );

    expect(getByText('Modal content')).toBeTruthy();
  });
});
