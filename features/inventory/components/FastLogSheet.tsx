import React, { useEffect, useState } from 'react';
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
import { ProductPatch } from '../../../lib/api';
import { CATEGORY_LABELS, FORMAT_LABELS, STATUS_LABELS, inventoryStrings } from '../strings';

type NewProduct = Omit<Product, 'id' | 'user_id' | 'created_at'>;

type CaptureMode = 'search' | 'manual';

/** The only statuses this form ever lets a user pick — 'finished' goes through Talbia's flow. */
type EditableStatus = Exclude<ProductStatus, 'finished'>;

const PERCENT_STEP = 5;

interface FastLogSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Required in create mode; ignored (and may be omitted) in edit mode. */
  onSave?: (item: NewProduct) => Promise<unknown>;
  isSaving: boolean;
  /**
   * When set, the sheet opens in edit mode for this product instead of
   * create mode: catalog search and the photo placeholder are hidden (there
   * is nothing for either to do on an edit), a percent-remaining stepper is
   * shown so a wrong number can be corrected directly, and saving calls
   * `onSaveEdit` with a `ProductPatch` instead of `onSave`. `status` still
   * excludes `'finished'` (ProductPatch's type already forbids it — see
   * lib/api/useProducts.ts) since finishing stays Talbia's flow.
   */
  editingItem?: Product | null;
  onSaveEdit?: (patch: ProductPatch) => Promise<unknown>;
}

const FORMATS: Format[] = ['full', 'mini', 'sample'];
const STATUSES: EditableStatus[] = ['unopened', 'in_rotation'];
const PAO_OPTIONS: (6 | 12 | null)[] = [null, 6, 12];

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value));
}

/**
 * F1 fast-log modal (PRD §F1, log-modal.png). The "Tap to scan" zone is a
 * visual placeholder only (D5 — Wizard-of-Oz, no real camera/identification);
 * tapping it just toggles a local "photo attached" flag. Also serves as the
 * Phase 1b edit form (`editingItem` prop) — see that prop's doc comment.
 */
export const FastLogSheet: React.FC<FastLogSheetProps> = ({
  visible,
  onClose,
  onSave,
  isSaving,
  editingItem = null,
  onSaveEdit,
}) => {
  const s = inventoryStrings.logSheet;
  const isEditMode = editingItem != null;
  const [mode, setMode] = useState<CaptureMode>('search');
  const [catalogSelection, setCatalogSelection] = useState<CatalogProduct | null>(null);
  const [photoAttached, setPhotoAttached] = useState(false);

  const [brand, setBrand] = useState('');
  const [name, setName] = useState('');
  const [shade, setShade] = useState('');
  const [category, setCategory] = useState<Category>('other');
  const [format, setFormat] = useState<Format>('full');
  const [status, setStatus] = useState<EditableStatus>('unopened');
  const [paoMonths, setPaoMonths] = useState<6 | 12 | null>(null);
  const [percentRemaining, setPercentRemaining] = useState(100);
  const [openedAt, setOpenedAt] = useState<string | null>(null);
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
    setPercentRemaining(100);
    setOpenedAt(null);
    setError(undefined);
  };

  // Seed the form from `editingItem` whenever a new one opens the sheet.
  useEffect(() => {
    if (editingItem) {
      setBrand(editingItem.brand);
      setName(editingItem.name);
      setShade(editingItem.shade ?? '');
      setCategory(editingItem.category);
      setFormat(editingItem.format);
      setStatus(editingItem.status === 'finished' ? 'in_rotation' : editingItem.status);
      setPaoMonths(editingItem.pao_months);
      setPercentRemaining(editingItem.percent_remaining);
      setOpenedAt(editingItem.opened_at);
      setError(undefined);
    }
  }, [editingItem]);

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

  const handleStatusChange = (next: EditableStatus) => {
    setStatus(next);
    // Only fill in a missing opened_at — never clobber real history by
    // clearing it if the user toggles back to "Unopened" by mistake.
    if (next === 'in_rotation' && !openedAt) {
      setOpenedAt(new Date().toISOString().substring(0, 10));
    }
  };

  const canSave = brand.trim().length > 0 && name.trim().length > 0;

  const handleSave = async () => {
    if (!canSave) {
      setError(s.errorRequired);
      return;
    }
    setError(undefined);

    try {
      if (isEditMode && editingItem) {
        if (!onSaveEdit) {
          throw new Error('FastLogSheet: onSaveEdit is required in edit mode.');
        }
        const patch: ProductPatch = {
          brand: brand.trim(),
          name: name.trim(),
          shade: shade.trim() || null,
          category,
          format,
          status,
          percent_remaining: percentRemaining,
          pao_months: paoMonths,
          opened_at: openedAt,
        };
        await onSaveEdit(patch);
      } else {
        if (!onSave) {
          throw new Error('FastLogSheet: onSave is required in create mode.');
        }
        const openedNow = status === 'in_rotation';
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
      }
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
          <Text className="text-lg font-bold font-caslon text-dark-neutral">
            {isEditMode ? s.editTitle : s.logTitle}
          </Text>
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
          {!isEditMode && (
            <>
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
                      hitSlop={8}
                      className="mt-2 py-2 -mx-2 px-2"
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
            </>
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
                onPress={() => handleStatusChange(st)}
                accessibilityLabel={`${STATUS_LABELS[st]}${status === st ? ', selected' : ''}`}
              />
            ))}
          </View>

          {isEditMode && (
            <>
              <Text className="text-xs font-semibold text-muted-text font-satoshi mb-2 px-2 uppercase tracking-wider">
                {s.percentRemainingLabel}
              </Text>
              <View className="flex-row items-center justify-center gap-6 mb-4">
                <Pressable
                  onPress={() => setPercentRemaining((p) => clampPercent(p - PERCENT_STEP))}
                  accessibilityRole="button"
                  accessibilityLabel={s.decreaseHint}
                  className="w-11 h-11 rounded-full border border-border-warm items-center justify-center"
                >
                  <Text className="text-lg font-satoshi-medium text-dark-neutral">–</Text>
                </Pressable>
                <Text
                  className="text-2xl font-bold font-caslon text-dark-neutral min-w-[72px] text-center"
                  accessibilityLabel={`${percentRemaining} percent remaining`}
                >
                  {percentRemaining}%
                </Text>
                <Pressable
                  onPress={() => setPercentRemaining((p) => clampPercent(p + PERCENT_STEP))}
                  accessibilityRole="button"
                  accessibilityLabel={s.increaseHint}
                  className="w-11 h-11 rounded-full border border-border-warm items-center justify-center"
                >
                  <Text className="text-lg font-satoshi-medium text-dark-neutral">+</Text>
                </Pressable>
              </View>
            </>
          )}

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
            label={isSaving ? s.saving : isEditMode ? s.saveEdit : s.save}
            onPress={handleSave}
            disabled={!canSave}
            loading={isSaving}
            accessibilityLabel={isEditMode ? s.saveEdit : s.save}
            className="mt-2"
          />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};
