import React from 'react';
import { render } from '@testing-library/react-native';
import { StreakRow, getWeeklyCheckmarks } from '../StreakRow';

describe('getWeeklyCheckmarks', () => {
  it('marks only the days that have a real logged date', () => {
    const today = new Date('2026-07-27T12:00:00.000Z');
    const loggedDates = new Set(['2026-07-25', '2026-07-27']);

    const days = getWeeklyCheckmarks(loggedDates, today);

    expect(days).toHaveLength(7);
    expect(days.filter((day) => day.logged)).toHaveLength(2);
    // Last two entries are yesterday and today (index 5 = 07-26, index 6 = 07-27).
    expect(days[6].logged).toBe(true);
    expect(days[5].logged).toBe(false);
  });

  it('marks no days when there is no logging history', () => {
    const today = new Date('2026-07-27T12:00:00.000Z');

    const days = getWeeklyCheckmarks(new Set(), today);

    expect(days.every((day) => !day.logged)).toBe(true);
  });
});

describe('StreakRow', () => {
  it('shows the streak as display-only with no rewards, badges, or points', () => {
    const { getByText, queryByText } = render(
      <StreakRow currentStreak={3} loggedDates={new Set()} />,
    );

    expect(getByText('3-day streak')).toBeTruthy();
    expect(queryByText(/badge|points|reward|unlock/i)).toBeNull();
  });

  it('renders a checkmark row with an accessible label per day', () => {
    const { getByLabelText } = render(<StreakRow currentStreak={1} loggedDates={new Set()} />);

    expect(getByLabelText('This week’s logging activity')).toBeTruthy();
  });
});
