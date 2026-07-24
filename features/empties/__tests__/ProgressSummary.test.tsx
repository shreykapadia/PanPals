import React from 'react';
import { render } from '@testing-library/react-native';
import { mockDashboardData } from '../../../mocks/fixtures';
import { ProgressSummary } from '../ProgressSummary';

jest.mock('../components/ProgressRing', () => ({
  ProgressRing: () => null,
}));

describe('ProgressSummary', () => {
  it('shows the live inventory status breakdown', () => {
    const dashboard = {
      ...mockDashboardData,
      status_counts: {
        unopened: 2,
        in_rotation: 3,
        finished: 1,
      },
    };
    const { getByLabelText, getByText } = render(<ProgressSummary dashboard={dashboard} />);

    expect(getByText('3 IN ROTATION')).toBeTruthy();
    expect(getByText('2 UNOPENED')).toBeTruthy();
    expect(getByText('1 FINISHED')).toBeTruthy();
    expect(getByLabelText('Product status: 3 in rotation, 2 unopened, 1 finished')).toBeTruthy();
  });
});
