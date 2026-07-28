import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RingMark } from '../ui/RingMark';
import { colors } from '../../theme/tokens';
import { Reveal } from './Reveal';

export interface FocusPotHeroItem {
  percent: number;
  category: string;
  /** Pre-formatted status copy, e.g. "57% used" or "Hit pan!". */
  badge: string;
  /** Rose accent treatment for a standout state (e.g. hit pan) vs. neutral. */
  highlight: boolean;
}

interface FocusPotHeroProps {
  items: readonly FocusPotHeroItem[];
  /** One honest label for the whole composition; the tiles stay silent. */
  accessibilityLabel: string;
}

/** Vertical rhythm and emphasis per column — the middle tile leads. */
const COLUMNS = [
  { offset: 22, ring: 60, featured: false },
  { offset: 0, ring: 74, featured: true },
  { offset: 32, ring: 60, featured: false },
];

const STAGGER = 80;

/**
 * A miniature of the Today's Focus row from `docs/mockups/home-dashboard.png`:
 * three part-finished products, drawn entirely from tokens so onboarding needs
 * no illustration asset. It previews the actual product rather than standing in
 * for one, which is the point — Maya's motivation is watching the ring move.
 *
 * Sits directly under `StashWall` on welcome, and the tiles climb into its lower
 * fade. The warm halo that used to back them is gone: the tiles span ~354 of 393
 * points, so a 244-point circle behind them only ever showed as slivers, and the
 * photographic band now carries that depth properly.
 */
export const FocusPotHero: React.FC<FocusPotHeroProps> = ({ items, accessibilityLabel }) => (
  <View
    accessible
    accessibilityLabel={accessibilityLabel}
    accessibilityElementsHidden={false}
    importantForAccessibility="yes"
    className="w-full items-center justify-start"
    style={{ height: 196 }}
  >
    <View
      className="flex-row items-start justify-center gap-3"
      importantForAccessibility="no-hide-descendants"
    >
      {items.slice(0, COLUMNS.length).map((item, index) => {
        const column = COLUMNS[index];
        return (
          <Reveal key={item.category} delay={index * STAGGER} style={{ marginTop: column.offset }}>
            <View
              style={column.featured ? styles.featuredShadow : styles.tileShadow}
              className={`rounded-xl items-center px-4 py-5 ${
                column.featured
                  ? 'bg-card-surface border border-border-warm'
                  : 'bg-surface-container-lowest border border-border-warm'
              }`}
            >
              <RingMark
                percent={item.percent}
                size={column.ring}
                strokeWidth={column.featured ? 9 : 8}
                delay={index * STAGGER}
              >
                <Text className="text-base font-satoshi-medium text-dark-neutral">
                  {`${item.percent}%`}
                </Text>
              </RingMark>
              <Text className="mt-3 text-sm uppercase tracking-wider font-satoshi-bold text-dark-neutral">
                {item.category}
              </Text>
              <View
                className={`mt-2 rounded-full px-2.5 py-1 ${
                  item.highlight ? 'bg-primary-container' : 'bg-surface-container'
                }`}
              >
                <Text
                  className={`text-xs font-satoshi-bold ${
                    item.highlight ? 'text-on-primary-container' : 'text-muted-text'
                  }`}
                >
                  {item.badge}
                </Text>
              </View>
            </View>
          </Reveal>
        );
      })}
    </View>
  </View>
);

const styles = StyleSheet.create({
  // Soft and diffused, never a hard black shadow (DESIGN-TOKENS §4).
  tileShadow: {
    shadowColor: colors['dark-neutral'],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 1,
  },
  featuredShadow: {
    shadowColor: colors['dark-neutral'],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 3,
  },
});
