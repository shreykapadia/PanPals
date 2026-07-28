import React from 'react';
import { render } from '@testing-library/react-native';
import { mockDashboardData, mockEmpties } from '../../../mocks/fixtures';
import { EmptiesSummary } from '../EmptiesSummary';

jest.mock('../components/ProgressRing', () => ({
  ProgressRing: () => null,
}));

describe('EmptiesSummary', () => {
  it('shows the finished count and private repurchase verdict split', () => {
    const dashboard = {
      ...mockDashboardData,
      status_counts: {
        unopened: 2,
        in_rotation: 3,
        finished: 1,
      },
    };
    const entries = mockEmpties.map((empty) => ({ empty, product: undefined }));
    const { getByLabelText, getByText, queryByText } = render(
      <EmptiesSummary dashboard={dashboard} entries={entries} />,
    );

    expect(getByText('1 finished')).toBeTruthy();
    expect(getByText('1 YES')).toBeTruthy();
    expect(getByText('1 MAYBE')).toBeTruthy();
    expect(getByText('1 NO')).toBeTruthy();
    expect(getByLabelText('Repurchase verdicts: 1 Yes, 1 Maybe, 1 No')).toBeTruthy();
    expect(queryByText(/logging streak/)).toBeNull();
    expect(queryByText(/IN ROTATION/)).toBeNull();
    expect(queryByText(/UNOPENED/)).toBeNull();
  });
});
