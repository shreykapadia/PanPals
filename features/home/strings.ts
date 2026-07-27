export const homeStrings = {
  wordmark: 'PanPal',

  loadingAccessibilityLabel: 'Loading your Home dashboard',
  errorTitle: 'Your dashboard needs another moment',
  errorMessage: 'Please try again. Your products are still yours.',
  errorAccessibilityLabel: 'Your Home dashboard could not be loaded. Try again.',

  focusSectionTitle: "Today's Focus",
  focusEmptyTitle: 'Your Focus Pot is empty',
  focusEmptyMessage: 'Pin up to 5 products from your inventory to track them here.',
  focusEmptyAccessibilityLabel:
    'Your Focus Pot is empty. Pin up to 5 products from your inventory to track them here.',
  focusEmptyActionLabel: 'Log Item',
  focusRingAccessibilityLabel: (brand: string, name: string, percent: number) =>
    `${brand} ${name}: ${percent}% remaining`,
  focusRingLabel: (percent: number) => `${percent}%`,
  logRingAccessibilityLabel: (brand: string, name: string) => `Log a use for ${brand} ${name}`,
  unpinAccessibilityLabel: (brand: string, name: string) =>
    `Unpin ${brand} ${name} from your Focus Pot`,

  addToFocusTitle: 'Add to your Focus Pot',
  addToFocusEmptyMessage: 'Everything in rotation is already pinned.',
  addToFocusNoProductsMessage: 'Log your first product to start building your Focus Pot.',
  pinAccessibilityLabel: (brand: string, name: string) => `Pin ${brand} ${name} to your Focus Pot`,
  focusPotFullMessage: 'Your Focus Pot holds 5 — unpin one to add another',
  focusPotFullAccessibilityLabel: 'Your Focus Pot holds 5. Unpin one to add another.',

  sliderPercentAccessibilityLabel: (percent: number) => `${percent}% remaining`,
  sliderAccessibilityLabel: (brand: string, name: string) =>
    `Adjust percent remaining for ${brand} ${name}`,
  sliderCancel: 'Cancel',
  sliderCancelAccessibilityLabel: 'Cancel without saving this update',
  sliderConfirm: 'Save update',
  sliderConfirmAccessibilityLabel: (percent: number) => `Save ${percent}% remaining`,
  logUsageErrorMessage: 'Your update wasn’t saved. Please try again.',
  logUsageErrorAccessibilityLabel: 'Your update was not saved. Please try again.',

  statusDonutTitle: 'Your products',
  statusDonutTotalLabel: (count: number) => `${count} ${count === 1 ? 'item' : 'items'}`,
  statusDonutAccessibilityLabel: (inRotation: number, unopened: number, finished: number) =>
    `Product status: ${inRotation} in rotation, ${unopened} unopened, ${finished} finished`,
  statusInRotationCount: (count: number) => `${count} in rotation`,
  statusUnopenedCount: (count: number) => `${count} unopened`,
  statusFinishedCount: (count: number) => `${count} finished`,

  quickActionScan: 'Scan',
  quickActionScanAccessibilityLabel: 'Scan a product (coming soon)',
  quickActionSearch: 'Search',
  quickActionSearchAccessibilityLabel: 'Search your products (coming soon)',
  quickActionLogItem: 'Log Item',
  quickActionLogItemAccessibilityLabel: 'Log a new item',

  recentProgressTitle: 'Recent progress',
  recentProgressEmptyTitle: 'No updates yet',
  recentProgressEmptyMessage: 'Tap a ring in Today’s Focus to log your first use.',
  recentProgressEmptyAccessibilityLabel:
    'No recent updates yet. Tap a ring in Today’s Focus to log your first use.',

  streakTitle: (count: number) => `${count}-day streak`,
  streakAccessibilityLabel: (count: number) => `${count}-day logging streak`,
  weeklyCheckmarkAccessibilityLabel: 'This week’s logging activity',
  weeklyCheckmarkDayAccessibilityLabel: (day: string, logged: boolean) =>
    `${day}: ${logged ? 'logged' : 'not logged'}`,

  reconsiderTitle: 'Ready to reconsider',
  reconsiderMessage: (brand: string, name: string) =>
    `Your 14-day cooling-off period for ${brand} ${name} is over. Take another look whenever you're ready.`,
  reconsiderAccessibilityLabel: (brand: string, name: string) =>
    `${brand} ${name} is ready to reconsider. Tap to view it on your Wishlist.`,
};
