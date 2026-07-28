import { isReadyToReconsider, daysUntilReady, effectiveWishlistStatus } from '../utils/coolingOff';

describe('cooling-off math', () => {
  const now = new Date('2026-08-01T00:00:00.000Z');

  it('cooling_off_ends_at = created + 14 days is not yet ready', () => {
    const createdAt = new Date('2026-07-25T00:00:00.000Z');
    const coolingOffEndsAt = new Date(createdAt.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();
    expect(isReadyToReconsider(coolingOffEndsAt, now)).toBe(false);
    expect(daysUntilReady(coolingOffEndsAt, now)).toBe(7);
  });

  it('flips to ready exactly on day 14', () => {
    const createdAt = new Date('2026-07-18T00:00:00.000Z');
    const coolingOffEndsAt = new Date(createdAt.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();
    expect(coolingOffEndsAt).toBe(now.toISOString());
    expect(isReadyToReconsider(coolingOffEndsAt, now)).toBe(true);
    expect(daysUntilReady(coolingOffEndsAt, now)).toBe(0);
  });

  it('stays ready well past the cooling-off window', () => {
    const coolingOffEndsAt = new Date('2026-07-01T00:00:00.000Z').toISOString();
    expect(isReadyToReconsider(coolingOffEndsAt, now)).toBe(true);
  });

  it('derives effective status "ready" from a stale "cooling" row past its date', () => {
    const status = effectiveWishlistStatus(
      {
        status: 'cooling',
        cooling_off_ends_at: new Date('2026-07-01T00:00:00.000Z').toISOString(),
      },
      now,
    );
    expect(status).toBe('ready');
  });

  it('keeps "cooling" when still within the window', () => {
    const status = effectiveWishlistStatus(
      {
        status: 'cooling',
        cooling_off_ends_at: new Date('2026-08-10T00:00:00.000Z').toISOString(),
      },
      now,
    );
    expect(status).toBe('cooling');
  });

  it('leaves removed/purchased statuses untouched regardless of date', () => {
    expect(
      effectiveWishlistStatus(
        { status: 'purchased', cooling_off_ends_at: new Date('2026-01-01').toISOString() },
        now,
      ),
    ).toBe('purchased');
    expect(
      effectiveWishlistStatus(
        { status: 'removed', cooling_off_ends_at: new Date('2026-01-01').toISOString() },
        now,
      ),
    ).toBe('removed');
  });
});
