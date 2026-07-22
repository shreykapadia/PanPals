import { track, EventName } from '../analytics';

describe('track()', () => {
  it('allows every event in the DATA-MODEL.md dictionary', () => {
    expect(() => track('account_completed')).not.toThrow();
    expect(() => track('usage_logged', { percent_after: 50 }, 'prod-1')).not.toThrow();
  });

  it('rejects an event name outside the dictionary', () => {
    expect(() => track('not_a_real_event' as unknown as EventName)).toThrow();
  });

  it('rejects raw review text in event properties', () => {
    expect(() =>
      track('product_finished', { review_text: 'Loved this product!' } as Record<string, unknown>),
    ).toThrow();
  });
});
