export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
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
      day_logs: {
        Row: {
          created_at: string;
          date: string;
          id: string;
          notes: string | null;
          owner_id: string;
          total_carbs_g: number;
          total_fat_g: number;
          total_kcal: number;
          total_protein_g: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          date: string;
          id?: string;
          notes?: string | null;
          owner_id: string;
          total_carbs_g?: number;
          total_fat_g?: number;
          total_kcal?: number;
          total_protein_g?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          date?: string;
          id?: string;
          notes?: string | null;
          owner_id?: string;
          total_carbs_g?: number;
          total_fat_g?: number;
          total_kcal?: number;
          total_protein_g?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      entries: {
        Row: {
          carbs_g: number;
          created_at: string;
          day_log_id: string;
          fat_g: number;
          id: string;
          kcal: number;
          meal_slot_id: string | null;
          nutrients: Json;
          position: number;
          protein_g: number;
          quantity: number;
          source_id: string | null;
          source_name: string;
          source_type: string;
          unit: string;
        };
        Insert: {
          carbs_g: number;
          created_at?: string;
          day_log_id: string;
          fat_g: number;
          id?: string;
          kcal: number;
          meal_slot_id?: string | null;
          nutrients?: Json;
          position?: number;
          protein_g: number;
          quantity: number;
          source_id?: string | null;
          source_name: string;
          source_type: string;
          unit: string;
        };
        Update: {
          carbs_g?: number;
          created_at?: string;
          day_log_id?: string;
          fat_g?: number;
          id?: string;
          kcal?: number;
          meal_slot_id?: string | null;
          nutrients?: Json;
          position?: number;
          protein_g?: number;
          quantity?: number;
          source_id?: string | null;
          source_name?: string;
          source_type?: string;
          unit?: string;
        };
        Relationships: [
          {
            foreignKeyName: "entries_day_log_id_fkey";
            columns: ["day_log_id"];
            isOneToOne: false;
            referencedRelation: "day_logs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "entries_meal_slot_id_fkey";
            columns: ["meal_slot_id"];
            isOneToOne: false;
            referencedRelation: "meal_slots";
            referencedColumns: ["id"];
          },
        ];
      };
      foods: {
        Row: {
          barcode: string | null;
          carbs_g: number;
          created_at: string;
          density_g_per_ml: number | null;
          fat_g: number;
          id: string;
          image_url: string | null;
          kcal: number;
          name: string;
          nutrients: Json;
          off_last_synced_at: string | null;
          owner_id: string | null;
          protein_g: number;
          serving_name: string | null;
          serving_size_g: number;
          source: string;
          updated_at: string;
        };
        Insert: {
          barcode?: string | null;
          carbs_g: number;
          created_at?: string;
          density_g_per_ml?: number | null;
          fat_g: number;
          id?: string;
          image_url?: string | null;
          kcal: number;
          name: string;
          nutrients?: Json;
          off_last_synced_at?: string | null;
          owner_id?: string | null;
          protein_g: number;
          serving_name?: string | null;
          serving_size_g?: number;
          source: string;
          updated_at?: string;
        };
        Update: {
          barcode?: string | null;
          carbs_g?: number;
          created_at?: string;
          density_g_per_ml?: number | null;
          fat_g?: number;
          id?: string;
          image_url?: string | null;
          kcal?: number;
          name?: string;
          nutrients?: Json;
          off_last_synced_at?: string | null;
          owner_id?: string | null;
          protein_g?: number;
          serving_name?: string | null;
          serving_size_g?: number;
          source?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      goals: {
        Row: {
          carbs_g: number;
          created_at: string;
          fat_g: number;
          id: string;
          is_auto: boolean;
          kcal: number;
          owner_id: string;
          protein_g: number;
          updated_at: string;
          valid_from: string;
          valid_to: string | null;
        };
        Insert: {
          carbs_g: number;
          created_at?: string;
          fat_g: number;
          id?: string;
          is_auto?: boolean;
          kcal: number;
          owner_id: string;
          protein_g: number;
          updated_at?: string;
          valid_from: string;
          valid_to?: string | null;
        };
        Update: {
          carbs_g?: number;
          created_at?: string;
          fat_g?: number;
          id?: string;
          is_auto?: boolean;
          kcal?: number;
          owner_id?: string;
          protein_g?: number;
          updated_at?: string;
          valid_from?: string;
          valid_to?: string | null;
        };
        Relationships: [];
      };
      meal_slots: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          order_index: number;
          owner_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          order_index: number;
          owner_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          order_index?: number;
          owner_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          activity_level: string | null;
          avatar_url: string | null;
          birth_date: string | null;
          created_at: string;
          display_name: string | null;
          height_cm: number | null;
          id: string;
          profile_completed_at: string | null;
          sex: string | null;
          timezone: string;
          updated_at: string;
        };
        Insert: {
          activity_level?: string | null;
          avatar_url?: string | null;
          birth_date?: string | null;
          created_at?: string;
          display_name?: string | null;
          height_cm?: number | null;
          id: string;
          profile_completed_at?: string | null;
          sex?: string | null;
          timezone?: string;
          updated_at?: string;
        };
        Update: {
          activity_level?: string | null;
          avatar_url?: string | null;
          birth_date?: string | null;
          created_at?: string;
          display_name?: string | null;
          height_cm?: number | null;
          id?: string;
          profile_completed_at?: string | null;
          sex?: string | null;
          timezone?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      recipe_items: {
        Row: {
          created_at: string;
          food_id: string | null;
          id: string;
          quantity: number;
          recipe_id: string;
          unit: string;
        };
        Insert: {
          created_at?: string;
          food_id?: string | null;
          id?: string;
          quantity: number;
          recipe_id: string;
          unit: string;
        };
        Update: {
          created_at?: string;
          food_id?: string | null;
          id?: string;
          quantity?: number;
          recipe_id?: string;
          unit?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recipe_items_food_id_fkey";
            columns: ["food_id"];
            isOneToOne: false;
            referencedRelation: "foods";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recipe_items_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          },
        ];
      };
      recipes: {
        Row: {
          created_at: string;
          id: string;
          instructions: string | null;
          name: string;
          owner_id: string;
          serving_name: string;
          servings: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          instructions?: string | null;
          name: string;
          owner_id: string;
          serving_name?: string;
          servings?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          instructions?: string | null;
          name?: string;
          owner_id?: string;
          serving_name?: string;
          servings?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      weight_logs: {
        Row: {
          created_at: string;
          date: string;
          id: string;
          notes: string | null;
          owner_id: string;
          weight_kg: number;
        };
        Insert: {
          created_at?: string;
          date: string;
          id?: string;
          notes?: string | null;
          owner_id: string;
          weight_kg: number;
        };
        Update: {
          created_at?: string;
          date?: string;
          id?: string;
          notes?: string | null;
          owner_id?: string;
          weight_kg?: number;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      show_limit: { Args: never; Returns: number };
      show_trgm: { Args: { "": string }; Returns: string[] };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
