import { Category, WishlistPriority, WishlistStatus } from '../../mocks/types';

export const CATEGORY_LABELS: Record<Category, string> = {
  lip: 'Lip',
  face: 'Face',
  eye: 'Eye',
  skincare: 'Skincare',
  fragrance: 'Fragrance',
  hair: 'Hair',
  other: 'Other',
};

export const PRIORITY_LABELS: Record<WishlistPriority, string> = {
  high: 'High priority',
  medium: 'Medium priority',
  low: 'Low priority',
};

export const STATUS_LABELS: Record<WishlistStatus, string> = {
  cooling: 'Cooling off',
  ready: 'Ready to reconsider',
  removed: 'Removed',
  purchased: 'Purchased',
};

export const wishlistStrings = {
  screen: {
    title: 'Wishlist',
    emptyTitle: 'Nothing on your wishlist yet',
    emptyMessage: "Add something you're considering and we'll help you decide.",
    errorTitle: 'Something went wrong',
    errorMessage: "We couldn't load your wishlist right now.",
    addButtonLabel: 'Add to wishlist',
    filterAllLabel: 'All',
    filterStatusLabel: 'Status',
    filterCategoryLabel: 'Category',
    filterPriorityLabel: 'Priority',
    noMatchesTitle: 'No items match these filters',
    noMatchesMessage: 'Try clearing a filter to see more of your wishlist.',
  },
  card: {
    daysOnList: (days: number) =>
      days <= 0 ? 'Added today' : `${days} day${days === 1 ? '' : 's'} on your list`,
    removeAction: 'Remove from wishlist',
    editAction: 'Edit wishlist item',
  },
  undo: {
    message: 'Removed from your wishlist.',
    action: 'Undo',
  },
  addSheet: {
    addTitle: 'Add to your wishlist',
    editTitle: 'Edit wishlist item',
    modeSearch: 'Search catalog',
    modeLink: 'Paste link',
    modeManual: 'Manual',
    brandLabel: 'Brand',
    brandPlaceholder: 'e.g. Rare Beauty',
    nameLabel: 'Product name',
    namePlaceholder: 'e.g. Soft Pinch Blush',
    shadeLabel: 'Shade (optional)',
    shadePlaceholder: 'e.g. Joy',
    categoryLabel: 'Category',
    priceLabel: 'Price (optional)',
    pricePlaceholder: '0.00',
    linkLabel: 'Product link',
    linkPlaceholder: 'Paste a retailer link',
    linkHelp: "We'll save this as a reference — no checkout, nothing purchased automatically.",
    priorityLabel: 'How much do you want this?',
    reflectionLabel: 'Would you still want this in 30 days? (optional)',
    reflectionPlaceholder: 'Jot down your honest thought…',
    changeSelection: 'Choose a different product',
    cancel: 'Cancel',
    save: 'Add to wishlist',
    saveEdit: 'Save changes',
    saving: 'Saving…',
    errorSave: "We couldn't save that. Please try again.",
    errorRequiredManual: 'Add a brand and product name first.',
    errorRequiredLink: 'Paste a link first.',
  },
};
