import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TabsLayout from '../_layout';

const mockPush = jest.fn();

jest.mock('expo-router', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mockReact = require('react');
  return {
    useRouter: () => ({ push: mockPush, replace: jest.fn(), back: jest.fn() }),
    Tabs: Object.assign(
      ({ children }: { children: any }) => mockReact.createElement('View', null, children),
      {
        Screen: ({
          name,
          options,
        }: {
          name: string;
          options?: {
            href?: null;
            tabBarButton?: () => any;
            tabBarAccessibilityLabel?: string;
            tabBarLabel?: string;
          };
        }) => {
          if (options?.href === null && !options?.tabBarButton) {
            return null;
          }
          if (options?.tabBarButton) {
            return mockReact.createElement('View', { key: name }, options.tabBarButton());
          }
          return mockReact.createElement(
            'View',
            { key: name, accessibilityLabel: options?.tabBarAccessibilityLabel },
            options?.tabBarLabel || name,
          );
        },
      },
    ),
  };
});

describe('TabsLayout', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders four destination tabs and centre log button, excluding You and Progress from bar', () => {
    const { getByLabelText, queryByText, queryByLabelText } = render(<TabsLayout />);

    expect(getByLabelText('Home Dashboard Tab')).toBeTruthy();
    expect(getByLabelText('Inventory Tab')).toBeTruthy();
    expect(getByLabelText('Wishlist Tab')).toBeTruthy();
    expect(getByLabelText('Empties Archive Tab')).toBeTruthy();

    expect(queryByText('You')).toBeNull();
    expect(queryByLabelText('You Profile Tab')).toBeNull();
    expect(queryByText('Progress')).toBeNull();
    expect(queryByLabelText('Progress Tab')).toBeNull();

    expect(getByLabelText('Quick log a product')).toBeTruthy();
  });

  it('routes to inventory with action=log when centre button is pressed', () => {
    const { getByLabelText } = render(<TabsLayout />);
    const logBtn = getByLabelText('Quick log a product');

    fireEvent.press(logBtn);
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/(tabs)/inventory',
      params: { action: 'log' },
    });
  });
});
