import React from 'react';
import { render } from '@testing-library/react-native';
import { Button } from '../Button';
import { Card } from '../Card';
import { Input } from '../Input';
import { Badge } from '../Badge';
import { Chip } from '../Chip';
import { EmptyState } from '../EmptyState';
import { LoadingState } from '../LoadingState';
import { ErrorState } from '../ErrorState';

describe('UI Primitives Smoke Test', () => {
  it('renders Button correctly', () => {
    const { getByText } = render(<Button label="Test Button" onPress={() => {}} />);
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('renders Card correctly', () => {
    const { getByText } = render(
      <Card>
        <Button label="In Card" onPress={() => {}} />
      </Card>,
    );
    expect(getByText('In Card')).toBeTruthy();
  });

  it('renders Input correctly', () => {
    const { getByPlaceholderText } = render(<Input placeholder="Test Placeholder" />);
    expect(getByPlaceholderText('Test Placeholder')).toBeTruthy();
  });

  it('renders Badge correctly', () => {
    const { getByText } = render(<Badge label="Eco" variant="success" />);
    expect(getByText('ECO')).toBeTruthy(); // Uppercased in component
  });

  it('renders Chip correctly', () => {
    const { getByText } = render(<Chip label="Interactive" onPress={() => {}} />);
    expect(getByText('Interactive')).toBeTruthy();
  });

  it('renders EmptyState correctly', () => {
    const { getByText } = render(<EmptyState title="Nothing here" message="Please add items." />);
    expect(getByText('Nothing here')).toBeTruthy();
    expect(getByText('Please add items.')).toBeTruthy();
  });

  it('renders LoadingState correctly', () => {
    const { getByText } = render(<LoadingState message="Fetching data..." />);
    expect(getByText('Fetching data...')).toBeTruthy();
  });

  it('renders ErrorState correctly', () => {
    const { getByText } = render(<ErrorState message="Could not connect" onRetry={() => {}} />);
    expect(getByText('Could not connect')).toBeTruthy();
  });
});
