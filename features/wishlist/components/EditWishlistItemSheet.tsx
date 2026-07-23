import React, { useEffect, useState } from 'react';
import { Modal, View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Chip } from '../../../components/ui/Chip';
import { Icon } from '../../../components/ui/Icon';
import { colors } from '../../../theme/tokens';
import { WishlistItem, WishlistPriority } from '../../../mocks/types';
import { PRIORITY_LABELS, wishlistStrings } from '../strings';

const PRIORITIES: WishlistPriority[] = ['high', 'medium', 'low'];

interface EditWishlistItemSheetProps {
  item: WishlistItem | null;
  onClose: () => void;
  onSave: (
    id: string,
    patch: { priority: WishlistPriority; reflectionResponse: string | null },
  ) => Promise<unknown>;
  isSaving: boolean;
}

export const EditWishlistItemSheet: React.FC<EditWishlistItemSheetProps> = ({
  item,
  onClose,
  onSave,
  isSaving,
}) => {
  const s = wishlistStrings.addSheet;
  const [priority, setPriority] = useState<WishlistPriority>('medium');
  const [reflectionResponse, setReflectionResponse] = useState('');
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (item) {
      setPriority(item.priority);
      setReflectionResponse(item.reflection_response ?? '');
      setError(undefined);
    }
  }, [item]);

  if (!item) return null;

  const handleSave = async () => {
    setError(undefined);
    try {
      await onSave(item.id, {
        priority,
        reflectionResponse: reflectionResponse.trim() || null,
      });
      onClose();
    } catch {
      setError(s.errorSave);
    }
  };

  return (
    <Modal visible={!!item} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-surface">
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-border-warm">
          <Text className="text-lg font-bold font-caslon text-dark-neutral">{s.editTitle}</Text>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={s.cancel}
            hitSlop={8}
            className="min-w-[44px] min-h-[44px] items-center justify-center"
          >
            <Icon name="close" size={22} color={colors['inactive-gray']} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          <Text className="text-sm font-semibold font-satoshi text-dark-neutral mb-4">
            {item.brand} · {item.name}
          </Text>

          <Text className="text-xs font-semibold text-muted-text font-satoshi mb-2 px-2 uppercase tracking-wider">
            {s.priorityLabel}
          </Text>
          <View className="flex-row flex-wrap gap-2 px-2 mb-4">
            {PRIORITIES.map((p) => (
              <Chip
                key={p}
                label={PRIORITY_LABELS[p]}
                selected={priority === p}
                onPress={() => setPriority(p)}
                accessibilityLabel={`${PRIORITY_LABELS[p]}${priority === p ? ', selected' : ''}`}
              />
            ))}
          </View>

          <Input
            label={s.reflectionLabel}
            value={reflectionResponse}
            onChangeText={setReflectionResponse}
            placeholder={s.reflectionPlaceholder}
            multiline
            accessibilityLabel={s.reflectionLabel}
          />

          {error && (
            <Text accessibilityRole="alert" className="text-xs text-error font-satoshi mb-2 px-2">
              {error}
            </Text>
          )}

          <Button
            label={isSaving ? s.saving : s.saveEdit}
            onPress={handleSave}
            loading={isSaving}
            accessibilityLabel={s.saveEdit}
            className="mt-2"
          />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};
