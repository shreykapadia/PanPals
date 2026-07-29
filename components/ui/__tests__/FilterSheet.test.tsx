import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FilterSheet } from '../FilterSheet';
import { FilterBar } from '../FilterBar';

describe('FilterSheet & FilterBar Components', () => {
  it('renders FilterBar with active count badge and opens sheet on press', () => {
    const handleOpen = jest.fn();
    const { getByText } = render(
      <FilterBar
        activeCount={2}
        onOpenFilterSheet={handleOpen}
        quickOptions={['unopened', 'in_rotation']}
        quickOptionLabel={(v) => v}
      />,
    );

    expect(getByText('Filters')).toBeTruthy();
    expect(getByText('2')).toBeTruthy();

    fireEvent.press(getByText('Filters'));
    expect(handleOpen).toHaveBeenCalledTimes(1);
  });

  it('renders FilterSheet when visible and triggers callbacks', () => {
    const handleClose = jest.fn();
    const handleReset = jest.fn();
    const handleSelectStatus = jest.fn();

    const { getByText } = render(
      <FilterSheet
        visible={true}
        onClose={handleClose}
        onResetAll={handleReset}
        activeCount={1}
        groups={[
          {
            id: 'status',
            label: 'Status',
            selected: undefined,
            options: ['unopened', 'in_rotation'],
            optionLabel: (v) => v.toUpperCase(),
            onSelect: handleSelectStatus,
          },
        ]}
      />,
    );

    expect(getByText('Filters')).toBeTruthy();
    expect(getByText('Reset all')).toBeTruthy();
    expect(getByText('UNOPENED')).toBeTruthy();

    fireEvent.press(getByText('Reset all'));
    expect(handleReset).toHaveBeenCalledTimes(1);

    fireEvent.press(getByText('UNOPENED'));
    expect(handleSelectStatus).toHaveBeenCalledWith('unopened');

    fireEvent.press(getByText('Apply Filters'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
