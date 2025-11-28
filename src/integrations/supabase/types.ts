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
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
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
          id: string
          layout_preset: string | null
          location: string | null
          logo_url: string | null
          name: string
          owner_user_id: string
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
          id?: string
          layout_preset?: string | null
          location?: string | null
          logo_url?: string | null
          name: string
          owner_user_id: string
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
          id?: string
          layout_preset?: string | null
          location?: string | null
          logo_url?: string | null
          name?: string
          owner_user_id?: string
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
        ]
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
