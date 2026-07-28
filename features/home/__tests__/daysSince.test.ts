import { daysSince } from '../utils/daysSince';

describe('daysSince', () => {
  const now = new Date('2026-07-27T12:00:00.000Z');

  it('returns 0 for a timestamp earlier today', () => {
    expect(daysSince('2026-07-27T08:00:00.000Z', now)).toBe(0);
  });

  it('returns 1 for exactly one day ago', () => {
    expect(daysSince('2026-07-26T12:00:00.000Z', now)).toBe(1);
  });

  it('returns the correct count for several days ago', () => {
    expect(daysSince('2026-07-20T12:00:00.000Z', now)).toBe(7);
  });

  it('never returns a negative number for a future timestamp', () => {
    expect(daysSince('2026-07-28T12:00:00.000Z', now)).toBe(0);
  });
});
