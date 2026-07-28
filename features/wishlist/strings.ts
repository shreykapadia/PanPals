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
    reconsiderAction: 'Reconsider this item',
  },
  undo: {
    message: 'Removed from your wishlist.',
    action: 'Undo',
    errorRemove: "We couldn't remove that item. Please try again.",
    errorRestore: "We couldn't restore that item. Please try again.",
  },
  intercept: {
    headline: 'Hold on — take a breath.',
    body: (count: number, categoryLabel: string) =>
      `You already have ${count} similar ${categoryLabel} items in active rotation.`,
    similarItemsLabel: (count: number) => `Similar items you own · ${count}`,
    keepOnWishlistAction: 'Add to 14-Day Cooling-Off Wishlist',
    continueToRetailerAction: 'Continue to Retailer',
    continueToRetailerNoLink: "This item doesn't have a saved link yet.",
    useOwnedAction: "I'll use one I already own",
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
    reminderLabel: 'Remind me to check back in 14 days',
    changeSelection: 'Choose a different product',
    cancel: 'Cancel',
    save: 'Add to wishlist',
    saveEdit: 'Save changes',
    saving: 'Saving…',
    errorSave: "We couldn't save that. Please try again.",
    errorRequiredManual: 'Add a brand and product name first.',
    errorRequiredLink: 'Paste a link first.',
  },
  duplicate: {
    title: 'Looks like this may already be on your list.',
    message: (brand: string, name: string) =>
      `You already have "${brand} ${name}" on your wishlist. Keep both?`,
    keepBothAction: 'Keep both',
    cancelAction: 'Cancel',
  },
  reconsider: {
    title: 'Reconsider this item',
    readyBanner: "It's been 14 days — take a moment to reconsider.",
    coolingBanner: (days: number) =>
      `${days} day${days === 1 ? '' : 's'} left in your cooling-off period.`,
    similarOwnedLoading: 'Checking what you already own…',
    similarOwnedLabel: (count: number) =>
      count === 0
        ? "You don't own anything similar in this category yet."
        : `You own ${count} similar item${count === 1 ? '' : 's'} in this category.`,
    buyExternallyAction: 'Buy externally',
    buyExternallyNoLink: "This item doesn't have a saved link.",
    markPurchasedAction: 'I bought this',
    markPurchasedHelp: 'Moves it into your inventory — no need to log it again.',
    keepWaitingAction: 'Keep waiting',
    removeAction: 'Remove from wishlist',
    errorPurchase: "We couldn't complete that. Please try again.",
    close: 'Close',
  },
};
