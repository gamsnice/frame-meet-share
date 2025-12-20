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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      contact_messages: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          read_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          read_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          read_at?: string | null
        }
        Relationships: []
      }
      event_stats_daily: {
        Row: {
          caption_copies_count: number | null
          date: string
          downloads_count: number | null
          event_id: string
          id: string
          template_id: string | null
          uploads_count: number | null
          views_count: number | null
        }
        Insert: {
          caption_copies_count?: number | null
          date: string
          downloads_count?: number | null
          event_id: string
          id?: string
          template_id?: string | null
          uploads_count?: number | null
          views_count?: number | null
        }
        Update: {
          caption_copies_count?: number | null
          date?: string
          downloads_count?: number | null
          event_id?: string
          id?: string
          template_id?: string | null
          uploads_count?: number | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "event_stats_daily_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_stats_daily_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      event_stats_hourly: {
        Row: {
          caption_copies_count: number | null
          date: string
          downloads_count: number | null
          event_id: string
          hour: number
          id: string
          template_id: string | null
          uploads_count: number | null
          views_count: number | null
        }
        Insert: {
          caption_copies_count?: number | null
          date: string
          downloads_count?: number | null
          event_id: string
          hour: number
          id?: string
          template_id?: string | null
          uploads_count?: number | null
          views_count?: number | null
        }
        Update: {
          caption_copies_count?: number | null
          date?: string
          downloads_count?: number | null
          event_id?: string
          hour?: number
          id?: string
          template_id?: string | null
          uploads_count?: number | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "event_stats_hourly_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_stats_hourly_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          brand_primary_color: string | null
          brand_secondary_color: string | null
          brand_text_color: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          favicon_url: string | null
          helper_text: string | null
          hero_subtitle: string | null
          hero_title: string
          homepage_url: string | null
          id: string
          instagram_url: string | null
          layout_preset: string | null
          linkedin_url: string | null
          location: string | null
          logo_url: string | null
          name: string
          owner_user_id: string
          photo_folder_button_color: string | null
          photo_folder_button_opacity: number | null
          photo_folder_button_text: string | null
          photo_folder_button_url: string | null
          secondary_logo_url: string | null
          slug: string
          start_date: string | null
        }
        Insert: {
          brand_primary_color?: string | null
          brand_secondary_color?: string | null
          brand_text_color?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          favicon_url?: string | null
          helper_text?: string | null
          hero_subtitle?: string | null
          hero_title: string
          homepage_url?: string | null
          id?: string
          instagram_url?: string | null
          layout_preset?: string | null
          linkedin_url?: string | null
          location?: string | null
          logo_url?: string | null
          name: string
          owner_user_id: string
          photo_folder_button_color?: string | null
          photo_folder_button_opacity?: number | null
          photo_folder_button_text?: string | null
          photo_folder_button_url?: string | null
          secondary_logo_url?: string | null
          slug: string
          start_date?: string | null
        }
        Update: {
          brand_primary_color?: string | null
          brand_secondary_color?: string | null
          brand_text_color?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          favicon_url?: string | null
          helper_text?: string | null
          hero_subtitle?: string | null
          hero_title?: string
          homepage_url?: string | null
          id?: string
          instagram_url?: string | null
          layout_preset?: string | null
          linkedin_url?: string | null
          location?: string | null
          logo_url?: string | null
          name?: string
          owner_user_id?: string
          photo_folder_button_color?: string | null
          photo_folder_button_opacity?: number | null
          photo_folder_button_text?: string | null
          photo_folder_button_url?: string | null
          secondary_logo_url?: string | null
          slug?: string
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          created_at: string
          email: string | null
          event_id: string | null
          event_slug: string | null
          feedback_type: string
          id: string
          message: string
          page_url: string | null
          status: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          event_id?: string | null
          event_slug?: string | null
          feedback_type?: string
          id?: string
          message: string
          page_url?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          event_id?: string | null
          event_slug?: string | null
          feedback_type?: string
          id?: string
          message?: string
          page_url?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      placeholder_images: {
        Row: {
          created_at: string | null
          id: string
          image_url: string
          original_filename: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url: string
          original_filename: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string
          original_filename?: string
          user_id?: string
        }
        Relationships: []
      }
      subscription_tier_config: {
        Row: {
          downloads_limit: number
          events_limit: number
          id: string
          templates_per_event_limit: number
          tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string | null
        }
        Insert: {
          downloads_limit: number
          events_limit: number
          id?: string
          templates_per_event_limit: number
          tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string | null
        }
        Update: {
          downloads_limit?: number
          events_limit?: number
          id?: string
          templates_per_event_limit?: number
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          downloads_limit: number | null
          downloads_used: number | null
          events_limit: number | null
          id: string
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          templates_per_event_limit: number | null
          tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          downloads_limit?: number | null
          downloads_used?: number | null
          events_limit?: number | null
          id?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          templates_per_event_limit?: number | null
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          downloads_limit?: number | null
          downloads_used?: number | null
          events_limit?: number | null
          id?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          templates_per_event_limit?: number | null
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      template_captions: {
        Row: {
          caption_text: string
          created_at: string | null
          id: string
          template_id: string
        }
        Insert: {
          caption_text: string
          created_at?: string | null
          id?: string
          template_id: string
        }
        Update: {
          caption_text?: string
          created_at?: string | null
          id?: string
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_captions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          created_at: string | null
          event_id: string
          format: string
          id: string
          image_url: string
          name: string
          photo_frame_height: number
          photo_frame_shape: string | null
          photo_frame_width: number
          photo_frame_x: number
          photo_frame_y: number
          placeholder_image_id: string | null
          placeholder_image_url: string | null
          placeholder_scale: number | null
          placeholder_x: number | null
          placeholder_y: number | null
          type: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          format: string
          id?: string
          image_url: string
          name: string
          photo_frame_height: number
          photo_frame_shape?: string | null
          photo_frame_width: number
          photo_frame_x: number
          photo_frame_y: number
          placeholder_image_id?: string | null
          placeholder_image_url?: string | null
          placeholder_scale?: number | null
          placeholder_x?: number | null
          placeholder_y?: number | null
          type: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          format?: string
          id?: string
          image_url?: string
          name?: string
          photo_frame_height?: number
          photo_frame_shape?: string | null
          photo_frame_width?: number
          photo_frame_x?: number
          photo_frame_y?: number
          placeholder_image_id?: string | null
          placeholder_image_url?: string | null
          placeholder_scale?: number | null
          placeholder_x?: number | null
          placeholder_y?: number | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "templates_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "templates_placeholder_image_id_fkey"
            columns: ["placeholder_image_id"]
            isOneToOne: false
            referencedRelation: "placeholder_images"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_usage_stats: {
        Row: {
          created_at: string | null
          id: string
          total_downloads: number | null
          total_events_created: number | null
          total_templates_created: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          total_downloads?: number | null
          total_events_created?: number | null
          total_templates_created?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          total_downloads?: number | null
          total_events_created?: number | null
          total_templates_created?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          organization_name: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name: string
          organization_name?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          organization_name?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_subscription_limit: {
        Args: { p_action: string; p_user_id: string }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_event_stat: {
        Args: { p_event_id: string; p_stat_type: string; p_template_id: string }
        Returns: undefined
      }
      increment_event_stat_hourly: {
        Args: {
          p_event_id: string
          p_hour: number
          p_stat_type: string
          p_template_id: string
        }
        Returns: undefined
      }
      increment_user_download: { Args: { p_event_id: string }; Returns: Json }
      promote_to_super_admin: { Args: never; Returns: boolean }
      reset_event_stats: {
        Args: {
          p_end_date?: string
          p_event_id?: string
          p_start_date?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "user" | "admin" | "super_admin"
      subscription_status: "active" | "cancelled" | "expired" | "pending"
      subscription_tier: "free" | "starter" | "pro" | "enterprise" | "premium"
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
      app_role: ["user", "admin", "super_admin"],
      subscription_status: ["active", "cancelled", "expired", "pending"],
      subscription_tier: ["free", "starter", "pro", "enterprise", "premium"],
    },
  },
} as const
