import React from 'react';
import { Text, View } from 'react-native';

interface RecordFigure {
  value: number;
  label: string;
}

interface RecordPanelProps {
  figures: readonly RecordFigure[];
  /**
   * One line that says something the numbers don't — omitted when there's
   * nothing to add, rather than padded with encouragement.
   */
  footnote?: string;
  /** Composed sentence for screen readers; the figures themselves stay silent. */
  accessibilityLabel: string;
}

/**
 * Maya's cumulative record: streak, best run, products finished.
 *
 * Tonal, not white, and flat — DESIGN-TOKENS §4 says hierarchy comes from tonal
 * layering, so this is the one content block that steps *down* off the surface
 * while the reminder control below steps up onto white. Stacking a fifth white
 * card here is what made the old screen read as a list of unrelated settings.
 *
 * Serif numerals in `on-primary-container` (8.3:1 on this tone). They used to be
 * `text-primary-container` — the rose *fill* token used as text, at roughly 1.9:1
 * on white, which is unreadable and not what the token is for.
 *
 * Display only: no badges, no points, no reward economy (D15). Nothing here is
 * earned or spent, it's just her own history read back to her.
 */
export const RecordPanel: React.FC<RecordPanelProps> = ({
  figures,
  footnote,
  accessibilityLabel,
}) => (
  <View
    accessible
    accessibilityLabel={accessibilityLabel}
    className="rounded-xl bg-surface-container-low p-5"
  >
    <View className="flex-row" importantForAccessibility="no-hide-descendants">
      {figures.map((figure, index) => (
        <View
          key={figure.label}
          // Symmetric gutter around each hairline — 16pt either side, so the
          // rule sits in the middle of the gap rather than against a numeral.
          className={`flex-1 ${index === 0 ? '' : 'border-l border-border-warm pl-4'} ${
            index === figures.length - 1 ? '' : 'pr-4'
          }`}
        >
          <Text className="text-2xl font-caslon-bold text-on-primary-container">
            {figure.value}
          </Text>
          <Text className="mt-1 text-sm font-satoshi text-muted-text">{figure.label}</Text>
        </View>
      ))}
    </View>
    {footnote ? (
      <Text
        className="mt-4 border-t border-border-warm pt-4 text-sm font-satoshi text-on-surface-variant"
        importantForAccessibility="no-hide-descendants"
      >
        {footnote}
      </Text>
    ) : null}
  </View>
);
