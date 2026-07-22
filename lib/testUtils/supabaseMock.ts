/**
 * Shared Supabase client mock for tests (AI-CONTEXT §2: never hit real
 * Supabase in Jest). Activate per test file with:
 *
 *   jest.mock('<relative path to lib/supabase>', () =>
 *     require('<relative path to this file>'),
 *   );
 *
 * `chainableResult(result)` builds a fake PostgREST query builder: every
 * filter method (select/eq/order/...) returns itself for chaining, `single()`
 * resolves directly, and the object is also "thenable" so a bare
 * `await supabase.from(...).select(...)` resolves too — matching how the
 * real supabase-js query builder behaves.
 */

export const mockFrom = jest.fn();
export const mockRpc = jest.fn();
export const mockGetUser = jest.fn();
export const mockAuth = {
  getUser: mockGetUser,
  signUp: jest.fn(),
  signInWithPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChange: jest.fn(() => ({
    data: { subscription: { unsubscribe: jest.fn() } },
  })),
};

export const supabase = {
  from: mockFrom,
  rpc: mockRpc,
  auth: mockAuth,
};

const CHAIN_METHODS = [
  'select',
  'insert',
  'update',
  'delete',
  'upsert',
  'eq',
  'neq',
  'order',
  'limit',
] as const;

export function chainableResult(result: { data: unknown; error: unknown }) {
  const builder: Record<string, unknown> = {};
  for (const method of CHAIN_METHODS) {
    builder[method] = jest.fn(() => builder);
  }
  builder.single = jest.fn(() => Promise.resolve(result));
  builder.then = (
    resolve: (value: typeof result) => unknown,
    reject?: (reason: unknown) => unknown,
  ) => Promise.resolve(result).then(resolve, reject);
  return builder;
}

export function resetSupabaseMock() {
  mockFrom.mockReset();
  mockRpc.mockReset();
  mockGetUser.mockReset().mockResolvedValue({ data: { user: { id: 'mock-user-123' } } });
}
