import { AnalyticsEvent } from '../../mocks/types';

const mockAnalyticsLog: AnalyticsEvent[] = [];

/**
 * Tracks pseudonymous product analytics events.
 * Never store raw review text in event properties.
 */
export function track(
  eventName:
    | 'account_completed'
    | 'inventory_item_added'
    | 'wishlist_item_added'
    | 'focus_product_set'
    | 'usage_logged'
    | 'duplicate_warning_shown'
    | 'warning_decision'
    | 'product_finished'
    | 'wishlist_item_removed'
    | 'wishlist_item_purchased',
  properties?: Record<string, any>,
  entityId?: string,
  sourceView?: string,
) {
  const event: AnalyticsEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    user_id: 'mock-user-123',
    event_name: eventName,
    entity_id: entityId || null,
    source_view: sourceView || null,
    properties: properties || null,
    created_at: new Date().toISOString(),
  };

  mockAnalyticsLog.push(event);

  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log(`[Analytics Track]: ${eventName}`, properties || '');
  }

  return event;
}

export function getTrackedEvents() {
  return [...mockAnalyticsLog];
}
