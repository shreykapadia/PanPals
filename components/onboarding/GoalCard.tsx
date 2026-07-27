import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { Icon, IconName } from '../ui/Icon';
import { colors } from '../../theme/tokens';
import { useReducedMotion } from '../../lib/useReducedMotion';

interface GoalCardProps {
  icon: IconName;
  title: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
  accessibilityLabel: string;
}

/**
 * A goal tile in the capture grid. Selection is carried by a check pip *and* a
 * tinted fill *and* a rose border — never by color alone (AI-CONTEXT §5), which
 * also keeps the subtitle on a light background where it stays legible.
 */
export const GoalCard: React.FC<GoalCardProps> = ({
  icon,
  title,
  subtitle,
  selected,
  onPress,
  accessibilityLabel,
}) => {
  const reducedMotion = useReducedMotion();
  const press = useRef(new Animated.Value(0)).current;
  const pip = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    if (reducedMotion) {
      pip.setValue(selected ? 1 : 0);
      return;
    }

    const animation = Animated.spring(pip, {
      toValue: selected ? 1 : 0,
      damping: 18,
      stiffness: 220,
      mass: 0.6,
      useNativeDriver: true,
    });
    animation.start();

    return () => animation.stop();
  }, [pip, selected, reducedMotion]);

  const animatePress = (toValue: number) => {
    if (reducedMotion) return;
    Animated.spring(press, {
      toValue,
      damping: 18,
      stiffness: 220,
      mass: 0.6,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={{
        width: '48%',
        transform: [{ scale: press.interpolate({ inputRange: [0, 1], outputRange: [1, 0.97] }) }],
      }}
    >
      <Pressable
        onPress={onPress}
        onPressIn={() => animatePress(1)}
        onPressOut={() => animatePress(0)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: selected }}
        accessibilityLabel={accessibilityLabel}
        className={`rounded-xl border p-4 min-h-[132px] ${
          selected
            ? 'bg-surface-container-low border-primary-container'
            : 'bg-card-surface border-border-warm'
        }`}
      >
        <View className="flex-row items-start justify-between mb-3">
          <Icon
            name={icon}
            size={22}
            color={selected ? colors['on-primary-container'] : colors['muted-text']}
            strokeWidth={1.75}
          />
          <Animated.View
            style={{
              opacity: pip,
              transform: [
                { scale: pip.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) },
              ],
            }}
            className="h-6 w-6 rounded-full bg-primary-container items-center justify-center"
          >
            <Icon name="check" size={14} color={colors['dark-neutral']} strokeWidth={2.5} />
          </Animated.View>
        </View>
        <Text className="text-base font-satoshi-medium text-dark-neutral">{title}</Text>
        <Text className="text-sm font-satoshi text-muted-text mt-1">{subtitle}</Text>
      </Pressable>
    </Animated.View>
  );
};
