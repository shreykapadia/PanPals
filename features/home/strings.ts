export const homeStrings = {
  wordmark: 'PanPal',

  loadingMessage: 'Loading your dashboard...',
  loadingAccessibilityLabel: 'Loading your Home dashboard',
  errorTitle: 'Your dashboard needs another moment',
  errorMessage: 'Please try again. Your products are still yours.',
  errorAccessibilityLabel: 'Your Home dashboard could not be loaded. Try again.',

  focusSectionTitle: "Today's Focus",
  focusEmptyTitle: 'Your Focus Pot is empty',
  focusEmptyMessage: 'Pin up to 5 products from your inventory to track them here.',
  focusEmptyAccessibilityLabel:
    'Your Focus Pot is empty. Pin up to 5 products from your inventory to track them here.',
  focusRingAccessibilityLabel: (brand: string, name: string, percent: number) =>
    `${brand} ${name}: ${percent}% remaining`,
  focusRingLabel: (percent: number) => `${percent}%`,

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
  quickActionLogItemAccessibilityLabel: 'Log a new item (coming soon)',

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
