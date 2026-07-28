import React from 'react';
import { View, Text, Pressable, Linking } from 'react-native';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { colors } from '../../../theme/tokens';
import { Category } from '../../../mocks/types';
import { CATEGORY_LABELS, wishlistStrings } from '../strings';
import { SimilarMatch } from '../hooks/useIntercept';

const MAX_SHOWN = 4;

interface InterceptBannerProps {
  category: Category;
  count: number;
  matches: SimilarMatch[];
  productUrl: string | null;
  onKeepOnWishlist: () => void;
  onUseOwned: () => void;
  onContinueToRetailer: () => void;
  isSaving?: boolean;
}

export const InterceptBanner: React.FC<InterceptBannerProps> = ({
  category,
  count,
  matches,
  productUrl,
  onKeepOnWishlist,
  onUseOwned,
  onContinueToRetailer,
  isSaving,
}) => {
  const s = wishlistStrings.intercept;
  const shown = matches.slice(0, MAX_SHOWN);
  const categoryLabel = CATEGORY_LABELS[category].toLowerCase();

  const handleRetailer = () => {
    onContinueToRetailer();
    if (productUrl) {
      Linking.openURL(productUrl).catch(() => {});
    }
  };

  return (
    <View
      accessibilityRole="alert"
      accessibilityLabel={`${s.headline} ${s.body(count, categoryLabel)}`}
      className="bg-warning-peach rounded-3xl p-4 mb-4"
    >
      <View className="flex-row items-start mb-3">
        <Icon name="info" size={20} color={colors['dark-neutral']} />
        <View className="flex-1 ml-2">
          <Text className="text-sm font-semibold font-satoshi text-dark-neutral">{s.headline}</Text>
          <Text className="text-xs font-satoshi text-dark-neutral mt-1 leading-relaxed">
            {s.body(count, categoryLabel)}
          </Text>
        </View>
      </View>

      <Text className="text-[11px] font-semibold font-satoshi text-dark-neutral mb-2 uppercase tracking-wider">
        {s.similarItemsLabel(count)}
      </Text>
      <View className="flex-row flex-wrap gap-2 mb-3">
        {shown.map((match) => (
          <View key={match.product.id} className="bg-white rounded-2xl p-3 flex-1 min-w-[45%]">
            <Text
              className="text-xs font-semibold font-satoshi text-dark-neutral"
              numberOfLines={1}
            >
              {match.product.brand} · {match.product.name}
            </Text>
            {match.product.shade && (
              <Text className="text-[11px] font-satoshi text-muted-text" numberOfLines={1}>
                {match.product.shade}
              </Text>
            )}
            <Text className="text-[11px] font-satoshi text-muted-text mt-1" numberOfLines={2}>
              {match.reason}
            </Text>
          </View>
        ))}
      </View>

      <Button
        label={s.keepOnWishlistAction}
        onPress={onKeepOnWishlist}
        loading={isSaving}
        accessibilityLabel={s.keepOnWishlistAction}
        className="mb-2"
      />
      {/* Deprioritized per F5 — visually secondary, never disabled. */}
      <Button
        label={s.continueToRetailerAction}
        onPress={handleRetailer}
        variant="secondary"
        accessibilityLabel={s.continueToRetailerAction}
        className="mb-2"
      />
      <Pressable
        onPress={onUseOwned}
        accessibilityRole="button"
        accessibilityLabel={s.useOwnedAction}
        className="items-center py-2"
      >
        <Text className="text-xs font-semibold font-satoshi text-primary underline">
          {s.useOwnedAction}
        </Text>
      </Pressable>
    </View>
  );
};
