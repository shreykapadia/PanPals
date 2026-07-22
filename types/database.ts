// GENERATED — do not hand-edit. Regenerate via scripts/gen-types.sh after
// any migration (AI-CONTEXT §4).

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5';
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      analytics_events: {
        Row: {
          created_at: string;
          entity_id: string | null;
          event_name: string;
          id: string;
          properties: Json | null;
          source_view: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          entity_id?: string | null;
          event_name: string;
          id?: string;
          properties?: Json | null;
          source_view?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          entity_id?: string | null;
          event_name?: string;
          id?: string;
          properties?: Json | null;
          source_view?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'analytics_events_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      catalog_products: {
        Row: {
          active_flag: boolean;
          brand: string;
          category: Database['public']['Enums']['product_category'];
          id: string;
          image_url: string | null;
          name: string;
          shade_or_variant: string | null;
          source: string;
        };
        Insert: {
          active_flag?: boolean;
          brand: string;
          category: Database['public']['Enums']['product_category'];
          id?: string;
          image_url?: string | null;
          name: string;
          shade_or_variant?: string | null;
          source: string;
        };
        Update: {
          active_flag?: boolean;
          brand?: string;
          category?: Database['public']['Enums']['product_category'];
          id?: string;
          image_url?: string | null;
          name?: string;
          shade_or_variant?: string | null;
          source?: string;
        };
        Relationships: [];
      };
      empties: {
        Row: {
          created_at: string;
          id: string;
          months_in_use: number | null;
          photo_url: string | null;
          product_id: string;
          repurchase: Database['public']['Enums']['repurchase_verdict'];
          review_text: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          months_in_use?: number | null;
          photo_url?: string | null;
          product_id: string;
          repurchase: Database['public']['Enums']['repurchase_verdict'];
          review_text?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          months_in_use?: number | null;
          photo_url?: string | null;
          product_id?: string;
          repurchase?: Database['public']['Enums']['repurchase_verdict'];
          review_text?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'empties_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'empties_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      products: {
        Row: {
          brand: string;
          catalog_product_id: string | null;
          category: Database['public']['Enums']['product_category'];
          created_at: string;
          format: Database['public']['Enums']['product_format'];
          id: string;
          is_priority: boolean;
          name: string;
          opened_at: string | null;
          pao_months: number | null;
          percent_remaining: number;
          photo_url: string | null;
          shade: string | null;
          source_wishlist_item_id: string | null;
          status: Database['public']['Enums']['product_status'];
          user_id: string;
        };
        Insert: {
          brand: string;
          catalog_product_id?: string | null;
          category: Database['public']['Enums']['product_category'];
          created_at?: string;
          format: Database['public']['Enums']['product_format'];
          id?: string;
          is_priority?: boolean;
          name: string;
          opened_at?: string | null;
          pao_months?: number | null;
          percent_remaining?: number;
          photo_url?: string | null;
          shade?: string | null;
          source_wishlist_item_id?: string | null;
          status?: Database['public']['Enums']['product_status'];
          user_id: string;
        };
        Update: {
          brand?: string;
          catalog_product_id?: string | null;
          category?: Database['public']['Enums']['product_category'];
          created_at?: string;
          format?: Database['public']['Enums']['product_format'];
          id?: string;
          is_priority?: boolean;
          name?: string;
          opened_at?: string | null;
          pao_months?: number | null;
          percent_remaining?: number;
          photo_url?: string | null;
          shade?: string | null;
          source_wishlist_item_id?: string | null;
          status?: Database['public']['Enums']['product_status'];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'products_catalog_product_id_fkey';
            columns: ['catalog_product_id'];
            isOneToOne: false;
            referencedRelation: 'catalog_products';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'products_source_wishlist_item_id_fkey';
            columns: ['source_wishlist_item_id'];
            isOneToOne: false;
            referencedRelation: 'wishlist_items';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'products_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          age_range: string | null;
          avatar_url: string | null;
          created_at: string;
          current_streak: number;
          id: string;
          last_log_date: string | null;
          location: string | null;
          longest_streak: number;
          selected_goals: string[];
          username: string;
        };
        Insert: {
          age_range?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          current_streak?: number;
          id: string;
          last_log_date?: string | null;
          location?: string | null;
          longest_streak?: number;
          selected_goals: string[];
          username: string;
        };
        Update: {
          age_range?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          current_streak?: number;
          id?: string;
          last_log_date?: string | null;
          location?: string | null;
          longest_streak?: number;
          selected_goals?: string[];
          username?: string;
        };
        Relationships: [];
      };
      usage_logs: {
        Row: {
          id: string;
          logged_at: string;
          note: string | null;
          percent_after: number;
          photo_url: string | null;
          product_id: string;
        };
        Insert: {
          id?: string;
          logged_at?: string;
          note?: string | null;
          percent_after: number;
          photo_url?: string | null;
          product_id: string;
        };
        Update: {
          id?: string;
          logged_at?: string;
          note?: string | null;
          percent_after?: number;
          photo_url?: string | null;
          product_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'usage_logs_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
        ];
      };
      wishlist_items: {
        Row: {
          brand: string;
          catalog_product_id: string | null;
          category: Database['public']['Enums']['product_category'];
          cooling_off_ends_at: string;
          created_at: string;
          id: string;
          last_reviewed_at: string | null;
          name: string;
          photo_url: string | null;
          price: number | null;
          priority: Database['public']['Enums']['wishlist_priority'];
          product_url: string | null;
          rank_position: number | null;
          reflection_response: string | null;
          reminder_at: string | null;
          shade: string | null;
          status: Database['public']['Enums']['wishlist_status'];
          user_id: string;
        };
        Insert: {
          brand: string;
          catalog_product_id?: string | null;
          category: Database['public']['Enums']['product_category'];
          cooling_off_ends_at?: string;
          created_at?: string;
          id?: string;
          last_reviewed_at?: string | null;
          name: string;
          photo_url?: string | null;
          price?: number | null;
          priority?: Database['public']['Enums']['wishlist_priority'];
          product_url?: string | null;
          rank_position?: number | null;
          reflection_response?: string | null;
          reminder_at?: string | null;
          shade?: string | null;
          status?: Database['public']['Enums']['wishlist_status'];
          user_id: string;
        };
        Update: {
          brand?: string;
          catalog_product_id?: string | null;
          category?: Database['public']['Enums']['product_category'];
          cooling_off_ends_at?: string;
          created_at?: string;
          id?: string;
          last_reviewed_at?: string | null;
          name?: string;
          photo_url?: string | null;
          price?: number | null;
          priority?: Database['public']['Enums']['wishlist_priority'];
          product_url?: string | null;
          rank_position?: number | null;
          reflection_response?: string | null;
          reminder_at?: string | null;
          shade?: string | null;
          status?: Database['public']['Enums']['wishlist_status'];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'wishlist_items_catalog_product_id_fkey';
            columns: ['catalog_product_id'];
            isOneToOne: false;
            referencedRelation: 'catalog_products';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'wishlist_items_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      find_similar_owned: {
        Args: { category: string; exclude_product_id?: string };
        Returns: Json;
      };
      finish_product: {
        Args: {
          photo_url: string;
          product_id: string;
          repurchase: string;
          review: string;
        };
        Returns: {
          created_at: string;
          id: string;
          months_in_use: number | null;
          photo_url: string | null;
          product_id: string;
          repurchase: Database['public']['Enums']['repurchase_verdict'];
          review_text: string | null;
          user_id: string;
        };
        SetofOptions: {
          from: '*';
          to: 'empties';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      get_dashboard: { Args: never; Returns: Json };
      log_usage: {
        Args: {
          note: string;
          percent: number;
          photo_url: string;
          product_id: string;
        };
        Returns: {
          brand: string;
          catalog_product_id: string | null;
          category: Database['public']['Enums']['product_category'];
          created_at: string;
          format: Database['public']['Enums']['product_format'];
          id: string;
          is_priority: boolean;
          name: string;
          opened_at: string | null;
          pao_months: number | null;
          percent_remaining: number;
          photo_url: string | null;
          shade: string | null;
          source_wishlist_item_id: string | null;
          status: Database['public']['Enums']['product_status'];
          user_id: string;
        };
        SetofOptions: {
          from: '*';
          to: 'products';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      search_catalog: {
        Args: { category?: string; limit?: number; q: string };
        Returns: {
          brand: string;
          category: Database['public']['Enums']['product_category'];
          id: string;
          image_url: string;
          name: string;
          shade_or_variant: string;
        }[];
      };
    };
    Enums: {
      product_category: 'lip' | 'face' | 'eye' | 'skincare' | 'fragrance' | 'hair' | 'other';
      product_format: 'full' | 'mini' | 'sample';
      product_status: 'unopened' | 'in_rotation' | 'finished';
      repurchase_verdict: 'yes' | 'maybe' | 'no';
      wishlist_priority: 'high' | 'medium' | 'low';
      wishlist_status: 'cooling' | 'ready' | 'removed' | 'purchased';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema['CompositeTypes'] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      product_category: ['lip', 'face', 'eye', 'skincare', 'fragrance', 'hair', 'other'],
      product_format: ['full', 'mini', 'sample'],
      product_status: ['unopened', 'in_rotation', 'finished'],
      repurchase_verdict: ['yes', 'maybe', 'no'],
      wishlist_priority: ['high', 'medium', 'low'],
      wishlist_status: ['cooling', 'ready', 'removed', 'purchased'],
    },
  },
} as const;
