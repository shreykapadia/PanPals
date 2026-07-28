import React from 'react';
import { Text, View } from 'react-native';
import { Icon } from '../../components/ui/Icon';
import { colors } from '../../theme/tokens';
import { homeStrings } from './strings';

interface StreakRowProps {
  currentStreak: number;
  loggedDates: Set<string>;
}

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAYS_IN_WEEK = 7;

export function getWeeklyCheckmarks(loggedDates: Set<string>, today: Date = new Date()) {
  return Array.from({ length: DAYS_IN_WEEK }, (_, index) => {
    const dayOffset = DAYS_IN_WEEK - 1 - index;
    const date = new Date(today);
    date.setDate(date.getDate() - dayOffset);
    const iso = date.toISOString().slice(0, 10);
    return {
      dayLetter: DAY_LETTERS[date.getDay()],
      logged: loggedDates.has(iso),
    };
  });
}

export function StreakRow({ currentStreak, loggedDates }: StreakRowProps) {
  const days = getWeeklyCheckmarks(loggedDates);

  return (
    <View className="mb-8 rounded-3xl border border-border-warm bg-card-surface p-4">
      <Text
        accessibilityLabel={homeStrings.streakAccessibilityLabel(currentStreak)}
        className="text-2xl font-caslon-bold text-dark-neutral"
      >
        {homeStrings.streakTitle(currentStreak)}
      </Text>
      <View
        accessibilityLabel={homeStrings.weeklyCheckmarkAccessibilityLabel}
        className="mt-4 flex-row justify-between"
      >
        {days.map((day, index) => (
          <View
            key={index}
            accessibilityLabel={homeStrings.weeklyCheckmarkDayAccessibilityLabel(
              day.dayLetter,
              day.logged,
            )}
            className="items-center"
          >
            <View
              className={`h-8 w-8 items-center justify-center rounded-full ${
                day.logged ? 'bg-primary-container' : 'bg-surface-container-high'
              }`}
            >
              {day.logged ? (
                <Icon name="check" size={16} color={colors['on-primary-container']} />
              ) : null}
            </View>
            <Text className="mt-1 text-xs font-satoshi text-muted-text">{day.dayLetter}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
