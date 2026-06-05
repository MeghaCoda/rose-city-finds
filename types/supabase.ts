export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      community_notes: {
        Row: {
          author_id: string | null
          body: string
          created_at: string
          flagged_reason: string | null
          id: string
          is_flagged: boolean
          location_id: string
          rating: number | null
        }
        Insert: {
          author_id?: string | null
          body: string
          created_at?: string
          flagged_reason?: string | null
          id?: string
          is_flagged?: boolean
          location_id: string
          rating?: number | null
        }
        Update: {
          author_id?: string | null
          body?: string
          created_at?: string
          flagged_reason?: string | null
          id?: string
          is_flagged?: boolean
          location_id?: string
          rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "community_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_notes_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      edit_history: {
        Row: {
          approved_by: string | null
          changed_at: string
          changed_by: string | null
          edit_id: string | null
          field_name: string
          id: string
          location_id: string
          new_value: string | null
          old_value: string | null
        }
        Insert: {
          approved_by?: string | null
          changed_at?: string
          changed_by?: string | null
          edit_id?: string | null
          field_name: string
          id?: string
          location_id: string
          new_value?: string | null
          old_value?: string | null
        }
        Update: {
          approved_by?: string | null
          changed_at?: string
          changed_by?: string | null
          edit_id?: string | null
          field_name?: string
          id?: string
          location_id?: string
          new_value?: string | null
          old_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "edit_history_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edit_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edit_history_edit_id_fkey"
            columns: ["edit_id"]
            isOneToOne: false
            referencedRelation: "edits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edit_history_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      edits: {
        Row: {
          created_at: string
          field_name: string
          id: string
          location_id: string
          new_value: string
          old_value: string | null
          reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_note: string | null
          status: Database["public"]["Enums"]["edit_status"]
          submitted_by: string | null
        }
        Insert: {
          created_at?: string
          field_name: string
          id?: string
          location_id: string
          new_value: string
          old_value?: string | null
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_note?: string | null
          status?: Database["public"]["Enums"]["edit_status"]
          submitted_by?: string | null
        }
        Update: {
          created_at?: string
          field_name?: string
          id?: string
          location_id?: string
          new_value?: string
          old_value?: string | null
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_note?: string | null
          status?: Database["public"]["Enums"]["edit_status"]
          submitted_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "edits_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edits_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edits_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      location_benefits: {
        Row: {
          benefit: Database["public"]["Enums"]["benefit_category"]
          id: string
          location_id: string
          notes: string | null
        }
        Insert: {
          benefit: Database["public"]["Enums"]["benefit_category"]
          id?: string
          location_id: string
          notes?: string | null
        }
        Update: {
          benefit?: Database["public"]["Enums"]["benefit_category"]
          id?: string
          location_id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "location_benefits_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      location_eligibility: {
        Row: {
          id: string
          id_required: boolean | null
          income_limit: string | null
          location_id: string
          notes: string | null
          other_requirements: string | null
          referral_details: string | null
          referral_required: boolean | null
          residency_details: string | null
          residency_required: boolean | null
        }
        Insert: {
          id?: string
          id_required?: boolean | null
          income_limit?: string | null
          location_id: string
          notes?: string | null
          other_requirements?: string | null
          referral_details?: string | null
          referral_required?: boolean | null
          residency_details?: string | null
          residency_required?: boolean | null
        }
        Update: {
          id?: string
          id_required?: boolean | null
          income_limit?: string | null
          location_id?: string
          notes?: string | null
          other_requirements?: string | null
          referral_details?: string | null
          referral_required?: boolean | null
          residency_details?: string | null
          residency_required?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "location_eligibility_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      location_hours: {
        Row: {
          closes_at: string | null
          day: Database["public"]["Enums"]["day_of_week"]
          id: string
          location_id: string
          notes: string | null
          opens_at: string | null
        }
        Insert: {
          closes_at?: string | null
          day: Database["public"]["Enums"]["day_of_week"]
          id?: string
          location_id: string
          notes?: string | null
          opens_at?: string | null
        }
        Update: {
          closes_at?: string | null
          day?: Database["public"]["Enums"]["day_of_week"]
          id?: string
          location_id?: string
          notes?: string | null
          opens_at?: string | null
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
          city: string
          created_at: string
          created_by: string | null
          delivery_available: boolean | null
          description: string | null
          donation_link: string | null
          id: string
          info_last_verified: string | null
          is_active: boolean
          is_verified: boolean
          latitude: number | null
          longitude: number | null
          name: string
          neighborhood: string | null
          offer_desc: string | null
          offer_source: string | null
          phone: string | null
          state: string
          updated_at: string
          verified_at: string | null
          verified_by: string | null
          volunteer_link: string | null
          website: string | null
          zip: string | null
          zip_code: string | null
        }
        Insert: {
          address: string
          address2?: string | null
          city?: string
          created_at?: string
          created_by?: string | null
          delivery_available?: boolean | null
          description?: string | null
          donation_link?: string | null
          id?: string
          info_last_verified?: string | null
          is_active?: boolean
          is_verified?: boolean
          latitude?: number | null
          longitude?: number | null
          name: string
          neighborhood?: string | null
          offer_desc?: string | null
          offer_source?: string | null
          phone?: string | null
          state?: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
          volunteer_link?: string | null
          website?: string | null
          zip?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string
          address2?: string | null
          city?: string
          created_at?: string
          created_by?: string | null
          delivery_available?: boolean | null
          description?: string | null
          donation_link?: string | null
          id?: string
          info_last_verified?: string | null
          is_active?: boolean
          is_verified?: boolean
          latitude?: number | null
          longitude?: number | null
          name?: string
          neighborhood?: string | null
          offer_desc?: string | null
          offer_source?: string | null
          phone?: string | null
          state?: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
          volunteer_link?: string | null
          website?: string | null
          zip?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "locations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locations_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          address: string
          benefits: Database["public"]["Enums"]["benefit_category"][] | null
          city: string
          created_at: string
          description: string | null
          eligibility_notes: string | null
          hours_notes: string | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          neighborhood: string | null
          phone: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_note: string | null
          state: string
          status: Database["public"]["Enums"]["submission_status"]
          submitted_by: string | null
          website: string | null
          zip: string | null
        }
        Insert: {
          address: string
          benefits?: Database["public"]["Enums"]["benefit_category"][] | null
          city?: string
          created_at?: string
          description?: string | null
          eligibility_notes?: string | null
          hours_notes?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          neighborhood?: string | null
          phone?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_note?: string | null
          state?: string
          status?: Database["public"]["Enums"]["submission_status"]
          submitted_by?: string | null
          website?: string | null
          zip?: string | null
        }
        Update: {
          address?: string
          benefits?: Database["public"]["Enums"]["benefit_category"][] | null
          city?: string
          created_at?: string
          description?: string | null
          eligibility_notes?: string | null
          hours_notes?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          neighborhood?: string | null
          phone?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_note?: string | null
          state?: string
          status?: Database["public"]["Enums"]["submission_status"]
          submitted_by?: string | null
          website?: string | null
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "submissions_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          last_login_at: string | null
          password_hash: string
          role: Database["public"]["Enums"]["user_role"]
          username: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          password_hash: string
          role?: Database["public"]["Enums"]["user_role"]
          username: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          password_hash?: string
          role?: Database["public"]["Enums"]["user_role"]
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      earth: { Args: never; Returns: number }
    }
    Enums: {
      benefit_category:
        | "snap_accepted"
        | "snap_double_dollars"
        | "wic_accepted"
        | "free_food"
        | "food_pantry"
        | "community_fridge"
        | "coupon_deal"
        | "sliding_scale"
        | "student_discount"
        | "military_discount"
        | "senior_discount"
        | "other"
      day_of_week:
        | "monday"
        | "tuesday"
        | "wednesday"
        | "thursday"
        | "friday"
        | "saturday"
        | "sunday"
      edit_status: "pending" | "approved" | "rejected"
      submission_status: "pending" | "approved" | "rejected"
      user_role: "admin" | "reviewer" | "contributor"
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
  public: {
    Enums: {
      benefit_category: [
        "snap_accepted",
        "snap_double_dollars",
        "wic_accepted",
        "free_food",
        "food_pantry",
        "community_fridge",
        "coupon_deal",
        "sliding_scale",
        "student_discount",
        "military_discount",
        "senior_discount",
        "other",
      ],
      day_of_week: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ],
      edit_status: ["pending", "approved", "rejected"],
      submission_status: ["pending", "approved", "rejected"],
      user_role: ["admin", "reviewer", "contributor"],
    },
  },
} as const
