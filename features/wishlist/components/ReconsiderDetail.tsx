import React, { useState } from 'react';
import { Modal, View, Text, ScrollView, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Icon } from '../../../components/ui/Icon';
import { colors } from '../../../theme/tokens';
import { useSimilarOwned } from '../../../lib/api';
import { WishlistItem } from '../../../mocks/types';
import { PRIORITY_LABELS, STATUS_LABELS, wishlistStrings } from '../strings';
import { daysOnList } from '../utils/daysOnList';
import { daysUntilReady, effectiveWishlistStatus } from '../utils/coolingOff';

interface ReconsiderDetailProps {
  item: WishlistItem | null;
  onClose: () => void;
  onRemove: (item: WishlistItem) => Promise<unknown>;
  onMarkPurchased: (item: WishlistItem) => Promise<unknown>;
  isRemoving?: boolean;
  isMarkingPurchased?: boolean;
}

export const ReconsiderDetail: React.FC<ReconsiderDetailProps> = (props) => {
  // Gate here, above every hook — useSimilarOwned's live query must not
  // fire while the detail sheet is closed.
  if (!props.item) return null;
  return <ReconsiderDetailContent {...props} item={props.item} />;
};

interface ContentProps extends Omit<ReconsiderDetailProps, 'item'> {
  item: WishlistItem;
}

const ReconsiderDetailContent: React.FC<ContentProps> = ({
  item,
  onClose,
  onRemove,
  onMarkPurchased,
  isRemoving,
  isMarkingPurchased,
}) => {
  const s = wishlistStrings.reconsider;
  const [error, setError] = useState<string | undefined>();

  const days = daysOnList(item.created_at);
  const daysLeft = daysUntilReady(item.cooling_off_ends_at);
  const effectiveStatus = effectiveWishlistStatus(item);
  const { data: similar, isLoading: isSimilarLoading } = useSimilarOwned(item.category);
  const similarCount = similar?.count ?? 0;

  const handleBuyExternally = () => {
    if (item.product_url) {
      Linking.openURL(item.product_url).catch(() => {});
    }
  };

  const handleMarkPurchased = async () => {
    setError(undefined);
    try {
      await onMarkPurchased(item);
      onClose();
    } catch {
      setError(s.errorPurchase);
    }
  };

  const handleRemove = async () => {
    setError(undefined);
    try {
      await onRemove(item);
      onClose();
    } catch {
      setError(wishlistStrings.undo.errorRemove);
    }
  };

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-surface">
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-border-warm">
          <Text className="text-lg font-bold font-caslon text-dark-neutral">{s.title}</Text>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={s.close}
            hitSlop={8}
            className="min-w-[44px] min-h-[44px] items-center justify-center"
          >
            <Icon name="close" size={22} color={colors['inactive-gray']} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          <Card className="mb-4">
            <Text className="text-base font-semibold font-satoshi text-dark-neutral">
              {item.brand} · {item.name}
            </Text>
            {item.shade && (
              <Text className="text-xs font-satoshi text-muted-text mt-1">{item.shade}</Text>
            )}
            {item.price != null && (
              <Text className="text-sm font-satoshi text-dark-neutral mt-2">
                ${item.price.toFixed(2)}
              </Text>
            )}
          </Card>

          <View className="flex-row flex-wrap items-center gap-2 mb-2">
            <Badge label={PRIORITY_LABELS[item.priority]} />
            <Badge
              label={STATUS_LABELS[effectiveStatus]}
              variant={effectiveStatus === 'ready' ? 'success' : 'default'}
            />
          </View>

          <Text className="text-xs font-satoshi text-muted-text mb-1">
            {wishlistStrings.card.daysOnList(days)}
          </Text>
          <Text className="text-xs font-satoshi text-muted-text mb-4">
            {effectiveStatus === 'ready' ? s.readyBanner : s.coolingBanner(daysLeft)}
          </Text>

          <Card className="mb-4">
            <Text className="text-sm font-satoshi text-dark-neutral">
              {isSimilarLoading ? '…' : s.similarOwnedLabel(similarCount)}
            </Text>
          </Card>

          {error && (
            <Text accessibilityRole="alert" className="text-xs text-error font-satoshi mb-2 px-2">
              {error}
            </Text>
          )}

          <Button
            label={s.buyExternallyAction}
            onPress={handleBuyExternally}
            variant="secondary"
            accessibilityLabel={s.buyExternallyAction}
            className="mb-1"
          />
          {!item.product_url && (
            <Text className="text-[11px] font-satoshi text-muted-text mb-3 px-2">
              {s.buyExternallyNoLink}
            </Text>
          )}

          <Button
            label={s.markPurchasedAction}
            onPress={handleMarkPurchased}
            loading={isMarkingPurchased}
            accessibilityLabel={s.markPurchasedAction}
            className="mb-1 mt-2"
          />
          <Text className="text-[11px] font-satoshi text-muted-text mb-4 px-2">
            {s.markPurchasedHelp}
          </Text>

          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={s.keepWaitingAction}
            className="items-center py-3"
          >
            <Text className="text-sm font-semibold font-satoshi text-dark-neutral">
              {s.keepWaitingAction}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleRemove}
            accessibilityRole="button"
            accessibilityLabel={s.removeAction}
            disabled={isRemoving}
            className="items-center py-2"
          >
            <Text className="text-sm font-semibold font-satoshi text-error underline">
              {s.removeAction}
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};
