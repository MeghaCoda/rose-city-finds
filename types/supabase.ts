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
          author_id: string
          body: string
          created_at: string | null
          id: string
          is_flagged: boolean | null
          rating: number | null
          resource_id: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string | null
          id?: string
          is_flagged?: boolean | null
          rating?: number | null
          resource_id: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string | null
          id?: string
          is_flagged?: boolean | null
          rating?: number | null
          resource_id?: string
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
            foreignKeyName: "community_notes_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      edit_history: {
        Row: {
          approved_by: string | null
          changed_at: string | null
          changed_by: string
          edit_id: string | null
          field_name: string
          id: string
          new_value: string | null
          old_value: string | null
          resource_id: string
        }
        Insert: {
          approved_by?: string | null
          changed_at?: string | null
          changed_by: string
          edit_id?: string | null
          field_name: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          resource_id: string
        }
        Update: {
          approved_by?: string | null
          changed_at?: string | null
          changed_by?: string
          edit_id?: string | null
          field_name?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          resource_id?: string
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
            foreignKeyName: "edit_history_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      edits: {
        Row: {
          created_at: string | null
          field_name: string
          id: string
          new_value: string | null
          old_value: string | null
          resource_id: string
          reviewed_by: string | null
          status: Database["public"]["Enums"]["edit_status"]
          submitted_by: string
        }
        Insert: {
          created_at?: string | null
          field_name: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          resource_id: string
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["edit_status"]
          submitted_by: string
        }
        Update: {
          created_at?: string | null
          field_name?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          resource_id?: string
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["edit_status"]
          submitted_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "edits_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
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
      online_access: {
        Row: {
          created_at: string | null
          id: string
          instructions: string | null
          resource_id: string
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          instructions?: string | null
          resource_id: string
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          instructions?: string | null
          resource_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "online_access_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      other_access: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          resource_id: string
          url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          resource_id: string
          url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          resource_id?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "other_access_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      owners: {
        Row: {
          created_at: string | null
          id: string
          resource_id: string
          user_id: string
          verification_method: string | null
          verification_notes: string | null
          verification_status: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          resource_id: string
          user_id: string
          verification_method?: string | null
          verification_notes?: string | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          resource_id?: string
          user_id?: string
          verification_method?: string | null
          verification_notes?: string | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "owners_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owners_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owners_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      physical_locations: {
        Row: {
          address: string
          address2: string | null
          city: string
          created_at: string | null
          id: string
          latitude: number | null
          longitude: number | null
          neighborhood: string | null
          phone_number: string | null
          resource_id: string
          state: string
          verification_status: string | null
          zip_code: string
        }
        Insert: {
          address: string
          address2?: string | null
          city: string
          created_at?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          neighborhood?: string | null
          phone_number?: string | null
          resource_id: string
          state: string
          verification_status?: string | null
          zip_code: string
        }
        Update: {
          address?: string
          address2?: string | null
          city?: string
          created_at?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          neighborhood?: string | null
          phone_number?: string | null
          resource_id?: string
          state?: string
          verification_status?: string | null
          zip_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "physical_locations_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_benefits: {
        Row: {
          benefit: Database["public"]["Enums"]["benefit_category"]
          id: string
          notes: string | null
          resource_id: string
        }
        Insert: {
          benefit: Database["public"]["Enums"]["benefit_category"]
          id?: string
          notes?: string | null
          resource_id: string
        }
        Update: {
          benefit?: Database["public"]["Enums"]["benefit_category"]
          id?: string
          notes?: string | null
          resource_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_benefits_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_eligibility: {
        Row: {
          id: string
          id_required: boolean | null
          income_limit: string | null
          notes: string | null
          other_requirements: string | null
          referral_required: boolean | null
          residency_required: boolean | null
          resource_id: string
        }
        Insert: {
          id?: string
          id_required?: boolean | null
          income_limit?: string | null
          notes?: string | null
          other_requirements?: string | null
          referral_required?: boolean | null
          residency_required?: boolean | null
          resource_id: string
        }
        Update: {
          id?: string
          id_required?: boolean | null
          income_limit?: string | null
          notes?: string | null
          other_requirements?: string | null
          referral_required?: boolean | null
          residency_required?: boolean | null
          resource_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_eligibility_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_hours: {
        Row: {
          closes_at: string
          day: Database["public"]["Enums"]["day_of_week"]
          id: string
          notes: string | null
          opens_at: string
          physical_location_id: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          closes_at: string
          day: Database["public"]["Enums"]["day_of_week"]
          id?: string
          notes?: string | null
          opens_at: string
          physical_location_id: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          closes_at?: string
          day?: Database["public"]["Enums"]["day_of_week"]
          id?: string
          notes?: string | null
          opens_at?: string
          physical_location_id?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resource_hours_physical_location_id_fkey"
            columns: ["physical_location_id"]
            isOneToOne: false
            referencedRelation: "physical_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          benefits: Database["public"]["Enums"]["benefit_category"][] | null
          created_at: string | null
          created_by: string
          description: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          name: string
          offer_desc: string | null
          offer_source: string | null
          updated_at: string | null
          verification_status: string | null
        }
        Insert: {
          benefits?: Database["public"]["Enums"]["benefit_category"][] | null
          created_at?: string | null
          created_by: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          offer_desc?: string | null
          offer_source?: string | null
          updated_at?: string | null
          verification_status?: string | null
        }
        Update: {
          benefits?: Database["public"]["Enums"]["benefit_category"][] | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          offer_desc?: string | null
          offer_source?: string | null
          updated_at?: string | null
          verification_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resources_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          access_notes: string | null
          benefits: Database["public"]["Enums"]["benefit_category"][] | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          reviewed_by: string | null
          status: Database["public"]["Enums"]["submission_status"]
          submitted_by: string
        }
        Insert: {
          access_notes?: string | null
          benefits?: Database["public"]["Enums"]["benefit_category"][] | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          submitted_by: string
        }
        Update: {
          access_notes?: string | null
          benefits?: Database["public"]["Enums"]["benefit_category"][] | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          submitted_by?: string
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
          created_at: string | null
          email: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          username: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          username: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          username?: string
        }
        Relationships: []
      }
      verification_events: {
        Row: {
          id: string
          method: string | null
          notes: string | null
          outcome: string | null
          owner_id: string | null
          physical_location_id: string | null
          resource_id: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          id?: string
          method?: string | null
          notes?: string | null
          outcome?: string | null
          owner_id?: string | null
          physical_location_id?: string | null
          resource_id?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          id?: string
          method?: string | null
          notes?: string | null
          outcome?: string | null
          owner_id?: string | null
          physical_location_id?: string | null
          resource_id?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_events_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_events_physical_location_id_fkey"
            columns: ["physical_location_id"]
            isOneToOne: false
            referencedRelation: "physical_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_events_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
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
      [_ in never]: never
    }
    Enums: {
      benefit_category:
        | "free_food"
        | "discounted_food"
        | "snap_accepted"
        | "student_discount"
        | "senior_discount"
        | "kids_eat_free"
        | "bogo"
        | "coupon"
        | "free_breakfast"
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
      user_role: "admin" | "owner" | "contributor" | "viewer"
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
        "free_food",
        "discounted_food",
        "snap_accepted",
        "student_discount",
        "senior_discount",
        "kids_eat_free",
        "bogo",
        "coupon",
        "free_breakfast",
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
      user_role: ["admin", "owner", "contributor", "viewer"],
    },
  },
} as const
