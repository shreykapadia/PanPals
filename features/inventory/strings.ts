import { Category, Format, ProductStatus } from '../../mocks/types';

export const CATEGORY_LABELS: Record<Category, string> = {
  lip: 'Lip',
  face: 'Face',
  eye: 'Eye',
  skincare: 'Skincare',
  fragrance: 'Fragrance',
  hair: 'Hair',
  other: 'Other',
};

export const FORMAT_LABELS: Record<Format, string> = {
  full: 'Full Size',
  mini: 'Mini / Travel',
  sample: 'Sample',
};

export const STATUS_LABELS: Record<ProductStatus, string> = {
  unopened: 'Unopened',
  in_rotation: 'In Rotation',
  finished: 'Finished',
};

export const inventoryStrings = {
  screen: {
    title: 'Inventory',
    addButtonLabel: 'Log a product',
    searchPlaceholder: 'Search your stash by brand or name',
    emptyTitle: 'Nothing logged yet',
    emptyMessage: 'Log the products you already own to start tracking what you have.',
    errorMessage: "We couldn't load your inventory right now.",
    noMatchesTitle: 'No items match these filters',
    noMatchesMessage: 'Try clearing a filter or search term to see more of your stash.',
    filterAllLabel: 'All',
    filterStatusLabel: 'Status',
    filterCategoryLabel: 'Category',
    focusPotFullTitle: 'Your Focus Pot is full',
    focusPotFullMessage: 'You can pin up to 5 products at a time. Unpin one to add this.',
  },
  card: {
    percentRemaining: (percent: number) => `${percent}% remaining`,
    daysSinceOpened: (days: number) =>
      days <= 0 ? 'Opened today' : `${days} day${days === 1 ? '' : 's'} since opened`,
    notOpenedYet: 'Not opened yet',
    focusLabel: 'In Focus Pot',
    pin: 'Add to Focus Pot',
    unpin: 'Remove from Focus Pot',
  },
  logSheet: {
    logTitle: 'Log New Item',
    editTitle: 'Edit item',
    subtitle: 'Add details below to keep your stash organized.',
    scanPlaceholder: 'Tap to scan barcode or take photo',
    scanAttached: 'Photo attached — tap to remove',
    modeSearch: 'Search catalog',
    modeManual: 'Manual',
    changeSelection: 'Choose a different product',
    brandLabel: 'Brand',
    brandPlaceholder: 'e.g. Fenty Beauty, The Ordinary',
    nameLabel: 'Product Name',
    namePlaceholder: 'e.g. Gloss Bomb Universal Lip Luminizer',
    shadeLabel: 'Shade (optional)',
    shadePlaceholder: 'e.g. Fenty Glow',
    categoryLabel: 'Category',
    formatLabel: 'Format',
    statusLabel: 'Current Status',
    paoLabel: 'Period After Opening (PAO) — optional',
    pao6: '6M',
    pao12: '12M',
    paoNone: 'None',
    cancel: 'Cancel',
    save: 'Log item',
    saveEdit: 'Save changes',
    saving: 'Saving…',
    errorSave: "We couldn't save that. Please try again.",
    errorRequired: 'Add a brand and product name first.',
  },
  detailSheet: {
    editAction: 'Edit',
    logUsageAction: 'Log usage',
    finishAction: 'Mark as Finished',
    close: 'Close',
    errorFocusFull: 'Your Focus Pot is full — remove a pinned item first.',
  },
  usageSheet: {
    title: 'Log usage',
    subtitle: (name: string) => `How much of ${name} is left?`,
    noteLabel: 'Note (optional)',
    notePlaceholder: 'e.g. Used daily for two weeks',
    save: 'Save update',
    saving: 'Saving…',
    errorSave: "We couldn't save that update. Please try again.",
  },
};
