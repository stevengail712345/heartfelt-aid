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
      campaign_updates: {
        Row: {
          body: string
          campaign_id: string
          created_at: string
          id: string
          title: string
        }
        Insert: {
          body: string
          campaign_id: string
          created_at?: string
          id?: string
          title: string
        }
        Update: {
          body?: string
          campaign_id?: string
          created_at?: string
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_updates_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          beneficiary_name: string
          category: Database["public"]["Enums"]["campaign_category"]
          country: string
          created_at: string
          deadline: string | null
          donated_cents: number
          donor_count: number
          id: string
          image_url: string
          is_urgent: boolean
          location: string
          pre_secured_cents: number
          slug: string
          status: Database["public"]["Enums"]["campaign_status"]
          story: string
          summary: string
          title: string
          total_need_cents: number
          updated_at: string
        }
        Insert: {
          beneficiary_name: string
          category?: Database["public"]["Enums"]["campaign_category"]
          country: string
          created_at?: string
          deadline?: string | null
          donated_cents?: number
          donor_count?: number
          id?: string
          image_url: string
          is_urgent?: boolean
          location: string
          pre_secured_cents?: number
          slug: string
          status?: Database["public"]["Enums"]["campaign_status"]
          story: string
          summary: string
          title: string
          total_need_cents: number
          updated_at?: string
        }
        Update: {
          beneficiary_name?: string
          category?: Database["public"]["Enums"]["campaign_category"]
          country?: string
          created_at?: string
          deadline?: string | null
          donated_cents?: number
          donor_count?: number
          id?: string
          image_url?: string
          is_urgent?: boolean
          location?: string
          pre_secured_cents?: number
          slug?: string
          status?: Database["public"]["Enums"]["campaign_status"]
          story?: string
          summary?: string
          title?: string
          total_need_cents?: number
          updated_at?: string
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount_cents: number
          campaign_id: string | null
          created_at: string
          currency: string
          donor_email: string | null
          donor_name: string | null
          id: string
          is_anonymous: boolean
          is_recurring: boolean
          message: string | null
          provider_session_id: string | null
          status: string
        }
        Insert: {
          amount_cents: number
          campaign_id?: string | null
          created_at?: string
          currency?: string
          donor_email?: string | null
          donor_name?: string | null
          id?: string
          is_anonymous?: boolean
          is_recurring?: boolean
          message?: string | null
          provider_session_id?: string | null
          status?: string
        }
        Update: {
          amount_cents?: number
          campaign_id?: string | null
          created_at?: string
          currency?: string
          donor_email?: string | null
          donor_name?: string | null
          id?: string
          is_anonymous?: boolean
          is_recurring?: boolean
          message?: string | null
          provider_session_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "donations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      testimonies: {
        Row: {
          body: string | null
          campaign_slug: string | null
          created_at: string
          helped_year: number | null
          id: string
          image_url: string
          is_published: boolean
          location: string
          person_name: string
          quote: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          body?: string | null
          campaign_slug?: string | null
          created_at?: string
          helped_year?: number | null
          id?: string
          image_url: string
          is_published?: boolean
          location: string
          person_name: string
          quote: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          body?: string | null
          campaign_slug?: string | null
          created_at?: string
          helped_year?: number | null
          id?: string
          image_url?: string
          is_published?: boolean
          location?: string
          person_name?: string
          quote?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "editor"
      campaign_category:
        | "medical"
        | "education"
        | "housing"
        | "emergency"
        | "livelihood"
        | "water"
      campaign_status: "draft" | "published" | "completed"
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
      app_role: ["admin", "editor"],
      campaign_category: [
        "medical",
        "education",
        "housing",
        "emergency",
        "livelihood",
        "water",
      ],
      campaign_status: ["draft", "published", "completed"],
    },
  },
} as const
