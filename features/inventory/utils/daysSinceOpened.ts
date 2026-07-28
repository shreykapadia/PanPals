export function daysSinceOpened(openedAt: string, now: Date = new Date()): number {
  const opened = new Date(openedAt);
  const diffMs = now.getTime() - opened.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}
