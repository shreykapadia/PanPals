export type Category = 'lip' | 'face' | 'eye' | 'skincare' | 'fragrance' | 'hair' | 'other';

export const CATEGORIES: Category[] = [
  'lip',
  'face',
  'eye',
  'skincare',
  'fragrance',
  'hair',
  'other',
];

export type Format = 'full' | 'mini' | 'sample';

export type ProductStatus = 'unopened' | 'in_rotation' | 'finished';

export type WishlistPriority = 'high' | 'medium' | 'low';

export type WishlistStatus = 'cooling' | 'ready' | 'removed' | 'purchased';

export type RepurchaseVerdict = 'yes' | 'maybe' | 'no';

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  age_range: string | null;
  location: string | null;
  selected_goals: string[];
  current_streak: number;
  longest_streak: number;
  last_log_date: string | null;
  created_at: string;
}

export interface CatalogProduct {
  id: string;
  brand: string;
  name: string;
  category: Category;
  shade_or_variant: string | null;
  image_url: string | null;
  source: string;
  active_flag: boolean;
}

export interface Product {
  id: string;
  user_id: string;
  catalog_product_id: string | null;
  brand: string;
  name: string;
  shade: string | null;
  category: Category;
  format: Format;
  status: ProductStatus;
  percent_remaining: number;
  photo_url: string | null;
  pao_months: 6 | 12 | null;
  opened_at: string | null;
  is_priority: boolean;
  source_wishlist_item_id: string | null;
  created_at: string;
}

export interface UsageLog {
  id: string;
  product_id: string;
  percent_after: number;
  note: string | null;
  photo_url: string | null;
  logged_at: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  catalog_product_id: string | null;
  brand: string;
  name: string;
  shade: string | null;
  category: Category;
  price: number | null;
  product_url: string | null;
  photo_url: string | null;
  priority: WishlistPriority;
  rank_position: number | null;
  reflection_response: string | null;
  cooling_off_ends_at: string;
  reminder_at: string | null;
  status: WishlistStatus;
  last_reviewed_at: string | null;
  created_at: string;
}

export interface Empty {
  id: string;
  user_id: string;
  product_id: string;
  review_text: string | null;
  repurchase: RepurchaseVerdict;
  months_in_use: number | null;
  photo_url: string | null;
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  user_id: string | null;
  event_name: string;
  entity_id: string | null;
  source_view: string | null;
  properties: Record<string, any> | null;
  created_at: string;
}

export interface DashboardData {
  profile: Profile;
  focus_products: Product[];
  status_counts: Record<ProductStatus, number>;
  streak: {
    current_streak: number;
    longest_streak: number;
    last_log_date: string | null;
  };
  category_counts: Record<Category, number>;
  ready_wishlist_items: WishlistItem[];
}
