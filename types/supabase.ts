export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      businesses: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          updated_at: string
          venue_type: Database["public"]["Enums"]["venue_type"]
          verification_expires_at: string | null
          verification_status: Database["public"]["Enums"]["verification_status"]
          verification_status_changed_at: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          updated_at?: string
          venue_type: Database["public"]["Enums"]["venue_type"]
          verification_expires_at?: string | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
          verification_status_changed_at?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          updated_at?: string
          venue_type?: Database["public"]["Enums"]["venue_type"]
          verification_expires_at?: string | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
          verification_status_changed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "businesses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      location_hours: {
        Row: {
          closes_at: string
          day: Database["public"]["Enums"]["day_of_week"]
          id: string
          location_id: string
          notes: string | null
          opens_at: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          closes_at: string
          day: Database["public"]["Enums"]["day_of_week"]
          id?: string
          location_id: string
          notes?: string | null
          opens_at: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          closes_at?: string
          day?: Database["public"]["Enums"]["day_of_week"]
          id?: string
          location_id?: string
          notes?: string | null
          opens_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "location_hours_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          address: string
          address2: string | null
          business_id: string
          city: string
          created_at: string
          created_by: string | null
          food_formats: Database["public"]["Enums"]["food_format"][]
          id: string
          latitude: number
          longitude: number
          neighborhood: string | null
          notes: string | null
          phone_number: string | null
          state: string
          verification_status: Database["public"]["Enums"]["verification_status"]
          verification_status_changed_at: string | null
          zip_code: string
        }
        Insert: {
          address: string
          address2?: string | null
          business_id: string
          city: string
          created_at?: string
          created_by?: string | null
          food_formats?: Database["public"]["Enums"]["food_format"][]
          id?: string
          latitude: number
          longitude: number
          neighborhood?: string | null
          notes?: string | null
          phone_number?: string | null
          state: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
          verification_status_changed_at?: string | null
          zip_code: string
        }
        Update: {
          address?: string
          address2?: string | null
          business_id?: string
          city?: string
          created_at?: string
          created_by?: string | null
          food_formats?: Database["public"]["Enums"]["food_format"][]
          id?: string
          latitude?: number
          longitude?: number
          neighborhood?: string | null
          notes?: string | null
          phone_number?: string | null
          state?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
          verification_status_changed_at?: string | null
          zip_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      offer_hours: {
        Row: {
          closes_at: string
          day: Database["public"]["Enums"]["day_of_week"]
          id: string
          notes: string | null
          offer_id: string
          opens_at: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          closes_at: string
          day: Database["public"]["Enums"]["day_of_week"]
          id?: string
          notes?: string | null
          offer_id: string
          opens_at: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          closes_at?: string
          day?: Database["public"]["Enums"]["day_of_week"]
          id?: string
          notes?: string | null
          offer_id?: string
          opens_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offer_hours_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      offer_locations: {
        Row: {
          created_at: string
          id: string
          location_id: string
          offer_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          location_id: string
          offer_id: string
        }
        Update: {
          created_at?: string
          id?: string
          location_id?: string
          offer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_locations_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_locations_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          business_id: string
          created_at: string
          created_by: string | null
          description: string | null
          eligibility: Database["public"]["Enums"]["eligibility_type"][]
          expires_at: string | null
          id: string
          is_active: boolean
          is_seasonal: boolean
          name: string
          notes: string | null
          price_type: Database["public"]["Enums"]["price_type"][]
          proof_desc: string | null
          proof_required: boolean
          season_end_date: string | null
          season_start_date: string | null
          updated_at: string
          verification_expires_at: string | null
          verification_status: Database["public"]["Enums"]["verification_status"]
          verification_status_changed_at: string | null
        }
        Insert: {
          business_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          eligibility: Database["public"]["Enums"]["eligibility_type"][]
          expires_at?: string | null
          id?: string
          is_active?: boolean
          is_seasonal?: boolean
          name: string
          notes?: string | null
          price_type: Database["public"]["Enums"]["price_type"][]
          proof_desc?: string | null
          proof_required?: boolean
          season_end_date?: string | null
          season_start_date?: string | null
          updated_at?: string
          verification_expires_at?: string | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
          verification_status_changed_at?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          eligibility?: Database["public"]["Enums"]["eligibility_type"][]
          expires_at?: string | null
          id?: string
          is_active?: boolean
          is_seasonal?: boolean
          name?: string
          notes?: string | null
          price_type?: Database["public"]["Enums"]["price_type"][]
          proof_desc?: string | null
          proof_required?: boolean
          season_end_date?: string | null
          season_start_date?: string | null
          updated_at?: string
          verification_expires_at?: string | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
          verification_status_changed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offers_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          deactivated_at: string | null
          email: string
          id: string
          is_active: boolean
          username: string
        }
        Insert: {
          created_at?: string | null
          deactivated_at?: string | null
          email: string
          id?: string
          is_active?: boolean
          username: string
        }
        Update: {
          created_at?: string | null
          deactivated_at?: string | null
          email?: string
          id?: string
          is_active?: boolean
          username?: string
        }
        Relationships: []
      }
      verification_events: {
        Row: {
          business_id: string | null
          id: string
          location_id: string | null
          method: string | null
          notes: string | null
          offer_id: string | null
          outcome: Database["public"]["Enums"]["verification_outcome"]
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          business_id?: string | null
          id?: string
          location_id?: string | null
          method?: string | null
          notes?: string | null
          offer_id?: string | null
          outcome: Database["public"]["Enums"]["verification_outcome"]
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          business_id?: string | null
          id?: string
          location_id?: string | null
          method?: string | null
          notes?: string | null
          offer_id?: string | null
          outcome?: Database["public"]["Enums"]["verification_outcome"]
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_events_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_events_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_events_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_events_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      deactivate_current_user: { Args: never; Returns: undefined }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      day_of_week:
        | "monday"
        | "tuesday"
        | "wednesday"
        | "thursday"
        | "friday"
        | "saturday"
        | "sunday"
      eligibility_type:
        | "anyone"
        | "student"
        | "senior"
        | "kids"
        | "military"
        | "snap"
        | "income_requirement"
        | "other"
      food_format: "dine_in" | "grocery" | "pickup" | "delivery"
      price_type: "free" | "discount"
      venue_type:
        | "food_pantry"
        | "food_bank"
        | "restaurant"
        | "cafe"
        | "grocery_store"
        | "farmers_market"
        | "community_organization"
        | "other"
      verification_outcome: "verified" | "rejected" | "delisted"
      verification_status: "pending" | "verified" | "rejected" | "delisted"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      day_of_week: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ],
      eligibility_type: [
        "anyone",
        "student",
        "senior",
        "kids",
        "military",
        "snap",
        "income_requirement",
        "other",
      ],
      food_format: ["dine_in", "grocery", "pickup", "delivery"],
      price_type: ["free", "discount"],
      venue_type: [
        "food_pantry",
        "food_bank",
        "restaurant",
        "cafe",
        "grocery_store",
        "farmers_market",
        "community_organization",
        "other",
      ],
      verification_outcome: ["verified", "rejected", "delisted"],
      verification_status: ["pending", "verified", "rejected", "delisted"],
    },
  },
} as const

