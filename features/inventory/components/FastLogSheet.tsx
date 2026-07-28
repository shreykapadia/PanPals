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
  Format,
  Product,
  ProductStatus,
} from '../../../mocks/types';
import { CATEGORY_LABELS, FORMAT_LABELS, STATUS_LABELS, inventoryStrings } from '../strings';

type NewProduct = Omit<Product, 'id' | 'user_id' | 'created_at'>;

type CaptureMode = 'search' | 'manual';

interface FastLogSheetProps {
  visible: boolean;
  onClose: () => void;
  onSave: (item: NewProduct) => Promise<unknown>;
  isSaving: boolean;
}

const FORMATS: Format[] = ['full', 'mini', 'sample'];
const STATUSES: ProductStatus[] = ['unopened', 'in_rotation'];
const PAO_OPTIONS: (6 | 12 | null)[] = [null, 6, 12];

/**
 * F1 fast-log modal (PRD §F1, log-modal.png). The "Tap to scan" zone is a
 * visual placeholder only (D5 — Wizard-of-Oz, no real camera/identification);
 * tapping it just toggles a local "photo attached" flag.
 */
export const FastLogSheet: React.FC<FastLogSheetProps> = ({
  visible,
  onClose,
  onSave,
  isSaving,
}) => {
  const s = inventoryStrings.logSheet;
  const [mode, setMode] = useState<CaptureMode>('search');
  const [catalogSelection, setCatalogSelection] = useState<CatalogProduct | null>(null);
  const [photoAttached, setPhotoAttached] = useState(false);

  const [brand, setBrand] = useState('');
  const [name, setName] = useState('');
  const [shade, setShade] = useState('');
  const [category, setCategory] = useState<Category>('other');
  const [format, setFormat] = useState<Format>('full');
  const [status, setStatus] = useState<ProductStatus>('unopened');
  const [paoMonths, setPaoMonths] = useState<6 | 12 | null>(null);
  const [error, setError] = useState<string | undefined>();

  const resetForm = () => {
    setMode('search');
    setCatalogSelection(null);
    setPhotoAttached(false);
    setBrand('');
    setName('');
    setShade('');
    setCategory('other');
    setFormat('full');
    setStatus('unopened');
    setPaoMonths(null);
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

  const canSave = brand.trim().length > 0 && name.trim().length > 0;

  const handleSave = async () => {
    if (!canSave) {
      setError(s.errorRequired);
      return;
    }
    setError(undefined);
    const openedNow = status === 'in_rotation';
    try {
      await onSave({
        catalog_product_id: catalogSelection?.id ?? null,
        brand: brand.trim(),
        name: name.trim(),
        shade: shade.trim() || null,
        category,
        format,
        status,
        percent_remaining: 100,
        photo_url: null,
        pao_months: paoMonths,
        opened_at: openedNow ? new Date().toISOString().substring(0, 10) : null,
        is_priority: false,
        source_wishlist_item_id: null,
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
          <Text className="text-lg font-bold font-caslon text-dark-neutral">{s.logTitle}</Text>
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
          <Text className="text-sm font-satoshi text-muted-text mb-4">{s.subtitle}</Text>

          <Pressable
            onPress={() => setPhotoAttached((prev) => !prev)}
            accessibilityRole="button"
            accessibilityLabel={photoAttached ? s.scanAttached : s.scanPlaceholder}
            className="h-28 rounded-3xl border border-border-warm bg-surface-container items-center justify-center mb-4"
          >
            <Icon
              name={photoAttached ? 'check' : 'info'}
              size={24}
              color={colors['primary-container']}
            />
            <Text className="text-sm font-satoshi text-dark-neutral mt-2">
              {photoAttached ? s.scanAttached : s.scanPlaceholder}
            </Text>
          </Pressable>

          <View className="flex-row gap-2 mb-4">
            <Chip
              label={s.modeSearch}
              selected={mode === 'search'}
              onPress={() => setMode('search')}
            />
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

          <Text className="text-xs font-semibold text-muted-text font-satoshi mb-2 px-2 uppercase tracking-wider">
            {s.formatLabel}
          </Text>
          <View className="flex-row flex-wrap gap-2 px-2 mb-4">
            {FORMATS.map((f) => (
              <Chip
                key={f}
                label={FORMAT_LABELS[f]}
                selected={format === f}
                onPress={() => setFormat(f)}
                accessibilityLabel={`${FORMAT_LABELS[f]}${format === f ? ', selected' : ''}`}
              />
            ))}
          </View>

          <Text className="text-xs font-semibold text-muted-text font-satoshi mb-2 px-2 uppercase tracking-wider">
            {s.statusLabel}
          </Text>
          <View className="flex-row flex-wrap gap-2 px-2 mb-4">
            {STATUSES.map((st) => (
              <Chip
                key={st}
                label={STATUS_LABELS[st]}
                selected={status === st}
                onPress={() => setStatus(st)}
                accessibilityLabel={`${STATUS_LABELS[st]}${status === st ? ', selected' : ''}`}
              />
            ))}
          </View>

          <Text className="text-xs font-semibold text-muted-text font-satoshi mb-2 px-2 uppercase tracking-wider">
            {s.paoLabel}
          </Text>
          <View className="flex-row flex-wrap gap-2 px-2 mb-4">
            {PAO_OPTIONS.map((p) => (
              <Chip
                key={p ?? 'none'}
                label={p === null ? s.paoNone : p === 6 ? s.pao6 : s.pao12}
                selected={paoMonths === p}
                onPress={() => setPaoMonths(p)}
                accessibilityLabel={`${p === null ? s.paoNone : p === 6 ? s.pao6 : s.pao12}${
                  paoMonths === p ? ', selected' : ''
                }`}
              />
            ))}
          </View>

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
