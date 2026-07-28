export function daysSince(isoString: string, now: Date = new Date()): number {
  const then = new Date(isoString);
  const diffMs = now.getTime() - then.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}
