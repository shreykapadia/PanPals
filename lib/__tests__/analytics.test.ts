import { track, EventName } from '../analytics';
import { mockFrom, resetSupabaseMock, chainableResult } from '../testUtils/supabaseMock';

// eslint-disable-next-line @typescript-eslint/no-require-imports
jest.mock('../supabase', () => require('../testUtils/supabaseMock'));

describe('track()', () => {
  beforeEach(() => {
    resetSupabaseMock();
    mockFrom.mockReturnValue(chainableResult({ data: null, error: null }));
  });

  it('allows every event in the DATA-MODEL.md dictionary and inserts it', async () => {
    expect(() => track('account_completed')).not.toThrow();
    await track('usage_logged', { percent_after: 50 }, 'prod-1');
    expect(mockFrom).toHaveBeenCalledWith('analytics_events');
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
