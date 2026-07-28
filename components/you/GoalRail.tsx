import React from 'react';
import { Text, View } from 'react-native';
import { Icon, IconName } from '../ui/Icon';
import { colors } from '../../theme/tokens';

export interface GoalRailOption {
  value: string;
  title: string;
  subtitle: string;
  icon: IconName;
}

interface GoalRailProps {
  /** `profiles.selected_goals` — raw stored values. */
  selected: string[];
  /** The pickable set, so this component holds no copy of its own. */
  options: readonly GoalRailOption[];
}

/**
 * The chosen goals, rendered the way goal-capture presented them: icon, title,
 * subtitle.
 *
 * Previously these were `<Badge variant="success">` pills, which was wrong three
 * ways — a goal is a commitment, not a success state; `Badge` upper-cases, so
 * "Finish what I own" shouted at 11px; and the icon and subtitle the user chose
 * from in onboarding were thrown away. Reading the same three parts back is the
 * continuity between signing up and living in the app.
 *
 * A goal value with no matching option still renders (as a plain titled row) —
 * `selected_goals` is a free `text[]`, so a value from an older build must not
 * silently vanish from her profile.
 */
export const GoalRail: React.FC<GoalRailProps> = ({ selected, options }) => (
  <View>
    {selected.map((goal, index) => {
      const option = options.find((candidate) => candidate.value === goal);
      return (
        <View
          key={goal}
          accessible
          className={`flex-row items-center ${
            index === 0 ? '' : 'mt-3 border-t border-border-warm pt-3'
          }`}
        >
          <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-container-low">
            <Icon
              name={option?.icon ?? 'check'}
              size={18}
              color={colors['on-primary-container']}
              strokeWidth={1.75}
            />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-base font-satoshi-bold text-dark-neutral">
              {option?.title ?? goal}
            </Text>
            {option ? (
              <Text className="mt-0.5 text-sm font-satoshi text-muted-text">{option.subtitle}</Text>
            ) : null}
          </View>
        </View>
      );
    })}
  </View>
);
