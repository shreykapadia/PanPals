import React, { useState } from 'react';
import { Modal, View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Chip } from '../../../components/ui/Chip';
import { Icon } from '../../../components/ui/Icon';
import { ProductSearch } from '../../../components/ui/ProductSearch';
import { colors } from '../../../theme/tokens';
import {
  CatalogProduct,
  Category,
  CATEGORIES,
  WishlistItem,
  WishlistPriority,
} from '../../../mocks/types';
import { CATEGORY_LABELS, PRIORITY_LABELS, wishlistStrings } from '../strings';

type NewWishlistItem = Omit<
  WishlistItem,
  'id' | 'user_id' | 'created_at' | 'cooling_off_ends_at' | 'status'
>;

type CaptureMode = 'search' | 'link' | 'manual';

interface AddWishlistItemSheetProps {
  visible: boolean;
  onClose: () => void;
  onSave: (item: NewWishlistItem) => Promise<unknown>;
  isSaving: boolean;
}

const PRIORITIES: WishlistPriority[] = ['high', 'medium', 'low'];

export const AddWishlistItemSheet: React.FC<AddWishlistItemSheetProps> = ({
  visible,
  onClose,
  onSave,
  isSaving,
}) => {
  const s = wishlistStrings.addSheet;
  const [mode, setMode] = useState<CaptureMode>('search');
  const [catalogSelection, setCatalogSelection] = useState<CatalogProduct | null>(null);

  const [brand, setBrand] = useState('');
  const [name, setName] = useState('');
  const [shade, setShade] = useState('');
  const [category, setCategory] = useState<Category>('other');
  const [price, setPrice] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [priority, setPriority] = useState<WishlistPriority>('medium');
  const [reflectionResponse, setReflectionResponse] = useState('');
  const [error, setError] = useState<string | undefined>();

  const resetForm = () => {
    setMode('search');
    setCatalogSelection(null);
    setBrand('');
    setName('');
    setShade('');
    setCategory('other');
    setPrice('');
    setProductUrl('');
    setPriority('medium');
    setReflectionResponse('');
    setError(undefined);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSelectCatalogItem = (item: CatalogProduct) => {
    setCatalogSelection(item);
    setBrand(item.brand);
    setName(item.name);
    setShade(item.shade_or_variant ?? '');
    setCategory(item.category);
  };

  const canSave =
    brand.trim().length > 0 &&
    name.trim().length > 0 &&
    (mode !== 'link' || productUrl.trim().length > 0);

  const handleSave = async () => {
    if (!canSave) {
      setError(
        mode === 'link' && productUrl.trim().length === 0
          ? s.errorRequiredLink
          : s.errorRequiredManual,
      );
      return;
    }
    setError(undefined);
    try {
      await onSave({
        catalog_product_id: catalogSelection?.id ?? null,
        brand: brand.trim(),
        name: name.trim(),
        shade: shade.trim() || null,
        category,
        price: price.trim() ? Number(price) : null,
        product_url: productUrl.trim() || null,
        photo_url: catalogSelection?.image_url ?? null,
        priority,
        rank_position: null,
        reflection_response: reflectionResponse.trim() || null,
        reminder_at: null,
        last_reviewed_at: null,
      });
      handleClose();
    } catch {
      setError(s.errorSave);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <SafeAreaView className="flex-1 bg-surface">
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-border-warm">
          <Text className="text-lg font-bold font-caslon text-dark-neutral">{s.addTitle}</Text>
          <Pressable
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel={s.cancel}
            hitSlop={8}
            className="min-w-[44px] min-h-[44px] items-center justify-center"
          >
            <Icon name="close" size={22} color={colors['inactive-gray']} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          <View className="flex-row gap-2 mb-4">
            <Chip
              label={s.modeSearch}
              selected={mode === 'search'}
              onPress={() => setMode('search')}
            />
            <Chip label={s.modeLink} selected={mode === 'link'} onPress={() => setMode('link')} />
            <Chip
              label={s.modeManual}
              selected={mode === 'manual'}
              onPress={() => setMode('manual')}
            />
          </View>

          {mode === 'search' &&
            (catalogSelection ? (
              <Card className="mb-4">
                <Text className="text-sm font-semibold font-satoshi text-dark-neutral">
                  {catalogSelection.brand} · {catalogSelection.name}
                </Text>
                <Pressable
                  onPress={() => setCatalogSelection(null)}
                  accessibilityRole="button"
                  accessibilityLabel={s.changeSelection}
                  className="mt-2"
                >
                  <Text className="text-xs font-semibold font-satoshi text-primary">
                    {s.changeSelection}
                  </Text>
                </Pressable>
              </Card>
            ) : (
              <View className="mb-4">
                <ProductSearch onSelect={handleSelectCatalogItem} allowManual={false} />
              </View>
            ))}

          {mode === 'link' && (
            <View className="mb-2">
              <Input
                label={s.linkLabel}
                value={productUrl}
                onChangeText={setProductUrl}
                placeholder={s.linkPlaceholder}
                autoCapitalize="none"
                accessibilityLabel={s.linkLabel}
              />
              <Text className="text-xs font-satoshi text-muted-text -mt-2 mb-4 px-2">
                {s.linkHelp}
              </Text>
            </View>
          )}

          <Input
            label={s.brandLabel}
            value={brand}
            onChangeText={setBrand}
            placeholder={s.brandPlaceholder}
            accessibilityLabel={s.brandLabel}
          />
          <Input
            label={s.nameLabel}
            value={name}
            onChangeText={setName}
            placeholder={s.namePlaceholder}
            accessibilityLabel={s.nameLabel}
          />
          <Input
            label={s.shadeLabel}
            value={shade}
            onChangeText={setShade}
            placeholder={s.shadePlaceholder}
            accessibilityLabel={s.shadeLabel}
          />

          <Text className="text-xs font-semibold text-muted-text font-satoshi mb-2 px-2 uppercase tracking-wider">
            {s.categoryLabel}
          </Text>
          <View className="flex-row flex-wrap gap-2 px-2 mb-4">
            {CATEGORIES.map((c) => (
              <Chip
                key={c}
                label={CATEGORY_LABELS[c]}
                selected={category === c}
                onPress={() => setCategory(c)}
                accessibilityLabel={`${CATEGORY_LABELS[c]}${category === c ? ', selected' : ''}`}
              />
            ))}
          </View>

          <Input
            label={s.priceLabel}
            value={price}
            onChangeText={setPrice}
            placeholder={s.pricePlaceholder}
            keyboardType="decimal-pad"
            accessibilityLabel={s.priceLabel}
          />

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
            label={isSaving ? s.saving : s.save}
            onPress={handleSave}
            disabled={!canSave}
            loading={isSaving}
            accessibilityLabel={s.save}
            className="mt-2"
          />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};
