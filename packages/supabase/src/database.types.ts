export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5'
  }
  public: {
    Tables: {
      club_applications: {
        Row: {
          additional_info: string | null
          address: string
          applicant_id: string
          city: string
          club_name: string
          created_at: string
          id: string
          phone: string | null
          province: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          sport_types: string[]
          status: Database['public']['Enums']['application_status']
          updated_at: string
        }
        Insert: {
          additional_info?: string | null
          address: string
          applicant_id: string
          city: string
          club_name: string
          created_at?: string
          id?: string
          phone?: string | null
          province?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sport_types?: string[]
          status?: Database['public']['Enums']['application_status']
          updated_at?: string
        }
        Update: {
          additional_info?: string | null
          address?: string
          applicant_id?: string
          city?: string
          club_name?: string
          created_at?: string
          id?: string
          phone?: string | null
          province?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sport_types?: string[]
          status?: Database['public']['Enums']['application_status']
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'club_applications_applicant_id_fkey'
            columns: ['applicant_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'club_applications_reviewed_by_fkey'
            columns: ['reviewed_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      club_cancellation_policies: {
        Row: {
          club_id: string
          created_at: string
          hours_before_start: number
          id: string
          is_active: boolean
          refund_percentage: number | null
          refund_type: Database['public']['Enums']['refund_type']
          updated_at: string
        }
        Insert: {
          club_id: string
          created_at?: string
          hours_before_start: number
          id?: string
          is_active?: boolean
          refund_percentage?: number | null
          refund_type: Database['public']['Enums']['refund_type']
          updated_at?: string
        }
        Update: {
          club_id?: string
          created_at?: string
          hours_before_start?: number
          id?: string
          is_active?: boolean
          refund_percentage?: number | null
          refund_type?: Database['public']['Enums']['refund_type']
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'club_cancellation_policies_club_id_fkey'
            columns: ['club_id']
            isOneToOne: false
            referencedRelation: 'clubs'
            referencedColumns: ['id']
          },
        ]
      }
      club_members: {
        Row: {
          club_id: string
          created_at: string
          id: string
          profile_id: string
          role: Database['public']['Enums']['club_role']
          updated_at: string
        }
        Insert: {
          club_id: string
          created_at?: string
          id?: string
          profile_id: string
          role: Database['public']['Enums']['club_role']
          updated_at?: string
        }
        Update: {
          club_id?: string
          created_at?: string
          id?: string
          profile_id?: string
          role?: Database['public']['Enums']['club_role']
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'club_members_club_id_fkey'
            columns: ['club_id']
            isOneToOne: false
            referencedRelation: 'clubs'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'club_members_profile_id_fkey'
            columns: ['profile_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      club_mp_credentials: {
        Row: {
          club_id: string
          connected_at: string
          created_at: string
          id: string
          is_active: boolean
          mp_access_token: string
          mp_public_key: string
          mp_refresh_token: string | null
          mp_user_id: string
          updated_at: string
        }
        Insert: {
          club_id: string
          connected_at?: string
          created_at?: string
          id?: string
          is_active?: boolean
          mp_access_token: string
          mp_public_key: string
          mp_refresh_token?: string | null
          mp_user_id: string
          updated_at?: string
        }
        Update: {
          club_id?: string
          connected_at?: string
          created_at?: string
          id?: string
          is_active?: boolean
          mp_access_token?: string
          mp_public_key?: string
          mp_refresh_token?: string | null
          mp_user_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'club_mp_credentials_club_id_fkey'
            columns: ['club_id']
            isOneToOne: true
            referencedRelation: 'clubs'
            referencedColumns: ['id']
          },
        ]
      }
      clubs: {
        Row: {
          address: string
          city: string
          cover_url: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          is_active: boolean
          lat: number | null
          lng: number | null
          logo_url: string | null
          mp_connected: boolean
          name: string
          phone: string | null
          province: string
          slug: string
          updated_at: string
          website: string | null
        }
        Insert: {
          address: string
          city: string
          cover_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          lat?: number | null
          lng?: number | null
          logo_url?: string | null
          mp_connected?: boolean
          name: string
          phone?: string | null
          province?: string
          slug: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string
          city?: string
          cover_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          lat?: number | null
          lng?: number | null
          logo_url?: string | null
          mp_connected?: boolean
          name?: string
          phone?: string | null
          province?: string
          slug?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      court_blocked_dates: {
        Row: {
          court_id: string
          created_at: string
          date: string
          id: string
          reason: string | null
        }
        Insert: {
          court_id: string
          created_at?: string
          date: string
          id?: string
          reason?: string | null
        }
        Update: {
          court_id?: string
          created_at?: string
          date?: string
          id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'court_blocked_dates_court_id_fkey'
            columns: ['court_id']
            isOneToOne: false
            referencedRelation: 'courts'
            referencedColumns: ['id']
          },
        ]
      }
      court_slot_templates: {
        Row: {
          court_id: string
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean
          price_ars: number
          start_time: string
          updated_at: string
        }
        Insert: {
          court_id: string
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean
          price_ars: number
          start_time: string
          updated_at?: string
        }
        Update: {
          court_id?: string
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean
          price_ars?: number
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'court_slot_templates_court_id_fkey'
            columns: ['court_id']
            isOneToOne: false
            referencedRelation: 'courts'
            referencedColumns: ['id']
          },
        ]
      }
      courts: {
        Row: {
          capacity: number
          club_id: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          is_indoor: boolean
          name: string
          sport: Database['public']['Enums']['sport_type']
          surface: Database['public']['Enums']['surface_type']
          updated_at: string
        }
        Insert: {
          capacity?: number
          club_id: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_indoor?: boolean
          name: string
          sport: Database['public']['Enums']['sport_type']
          surface: Database['public']['Enums']['surface_type']
          updated_at?: string
        }
        Update: {
          capacity?: number
          club_id?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_indoor?: boolean
          name?: string
          sport?: Database['public']['Enums']['sport_type']
          surface?: Database['public']['Enums']['surface_type']
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'courts_club_id_fkey'
            columns: ['club_id']
            isOneToOne: false
            referencedRelation: 'clubs'
            referencedColumns: ['id']
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          channel: Database['public']['Enums']['notification_channel']
          created_at: string
          id: string
          is_read: boolean
          profile_id: string
          read_at: string | null
          reservation_id: string | null
          sent_at: string | null
          title: string
          type: Database['public']['Enums']['notification_type']
        }
        Insert: {
          body: string
          channel: Database['public']['Enums']['notification_channel']
          created_at?: string
          id?: string
          is_read?: boolean
          profile_id: string
          read_at?: string | null
          reservation_id?: string | null
          sent_at?: string | null
          title: string
          type: Database['public']['Enums']['notification_type']
        }
        Update: {
          body?: string
          channel?: Database['public']['Enums']['notification_channel']
          created_at?: string
          id?: string
          is_read?: boolean
          profile_id?: string
          read_at?: string | null
          reservation_id?: string | null
          sent_at?: string | null
          title?: string
          type?: Database['public']['Enums']['notification_type']
        }
        Relationships: [
          {
            foreignKeyName: 'notifications_profile_id_fkey'
            columns: ['profile_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'notifications_reservation_id_fkey'
            columns: ['reservation_id']
            isOneToOne: false
            referencedRelation: 'reservations'
            referencedColumns: ['id']
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          mp_merchant_order_id: string | null
          mp_payment_id: string | null
          mp_preference_id: string | null
          paid_at: string | null
          platform_fee: number
          raw_mp_response: Json | null
          refund_amount: number | null
          refund_type: Database['public']['Enums']['refund_type'] | null
          refunded_at: string | null
          reservation_id: string
          status: Database['public']['Enums']['payment_status']
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          mp_merchant_order_id?: string | null
          mp_payment_id?: string | null
          mp_preference_id?: string | null
          paid_at?: string | null
          platform_fee: number
          raw_mp_response?: Json | null
          refund_amount?: number | null
          refund_type?: Database['public']['Enums']['refund_type'] | null
          refunded_at?: string | null
          reservation_id: string
          status?: Database['public']['Enums']['payment_status']
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          mp_merchant_order_id?: string | null
          mp_payment_id?: string | null
          mp_preference_id?: string | null
          paid_at?: string | null
          platform_fee?: number
          raw_mp_response?: Json | null
          refund_amount?: number | null
          refund_type?: Database['public']['Enums']['refund_type'] | null
          refunded_at?: string | null
          reservation_id?: string
          status?: Database['public']['Enums']['payment_status']
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'payments_reservation_id_fkey'
            columns: ['reservation_id']
            isOneToOne: false
            referencedRelation: 'reservations'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string
          id: string
          last_name: string
          phone: string | null
          platform_role: Database['public']['Enums']['platform_role']
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name: string
          id: string
          last_name: string
          phone?: string | null
          platform_role?: Database['public']['Enums']['platform_role']
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          platform_role?: Database['public']['Enums']['platform_role']
          updated_at?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          cancellation_reason: string | null
          cancelled_at: string | null
          court_amount: number
          court_id: string
          created_at: string
          date: string
          end_time: string
          id: string
          notes: string | null
          platform_fee: number
          profile_id: string
          slot_template_id: string | null
          start_time: string
          status: Database['public']['Enums']['reservation_status']
          total_amount: number
          updated_at: string
        }
        Insert: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          court_amount: number
          court_id: string
          created_at?: string
          date: string
          end_time: string
          id?: string
          notes?: string | null
          platform_fee: number
          profile_id: string
          slot_template_id?: string | null
          start_time: string
          status?: Database['public']['Enums']['reservation_status']
          total_amount: number
          updated_at?: string
        }
        Update: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          court_amount?: number
          court_id?: string
          created_at?: string
          date?: string
          end_time?: string
          id?: string
          notes?: string | null
          platform_fee?: number
          profile_id?: string
          slot_template_id?: string | null
          start_time?: string
          status?: Database['public']['Enums']['reservation_status']
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'reservations_court_id_fkey'
            columns: ['court_id']
            isOneToOne: false
            referencedRelation: 'courts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reservations_profile_id_fkey'
            columns: ['profile_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reservations_slot_template_id_fkey'
            columns: ['slot_template_id']
            isOneToOne: false
            referencedRelation: 'court_slot_templates'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_club_owner: { Args: { p_club_id: string }; Returns: boolean }
      is_club_staff: { Args: { p_club_id: string }; Returns: boolean }
      is_platform_admin: { Args: never; Returns: boolean }
      unaccent: { Args: { '': string }; Returns: string }
    }
    Enums: {
      application_status: 'pending' | 'approved' | 'rejected'
      club_role: 'club_owner' | 'club_administrator'
      notification_channel: 'email' | 'push' | 'whatsapp'
      notification_type:
        | 'reservation_confirmed'
        | 'reservation_cancelled'
        | 'reservation_reminder'
        | 'payment_approved'
        | 'payment_rejected'
        | 'refund_processed'
        | 'club_announcement'
      payment_status:
        | 'pending'
        | 'approved'
        | 'rejected'
        | 'refunded'
        | 'partially_refunded'
        | 'in_mediation'
        | 'cancelled'
      platform_role: 'platform_admin' | 'user'
      refund_type: 'full' | 'partial' | 'none'
      reservation_status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
      sport_type:
        | 'football'
        | 'tennis'
        | 'paddle'
        | 'basketball'
        | 'volleyball'
        | 'squash'
        | 'other'
      surface_type: 'grass' | 'synthetic_grass' | 'clay' | 'hard' | 'wood' | 'concrete' | 'other'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      application_status: ['pending', 'approved', 'rejected'],
      club_role: ['club_owner', 'club_administrator'],
      notification_channel: ['email', 'push', 'whatsapp'],
      notification_type: [
        'reservation_confirmed',
        'reservation_cancelled',
        'reservation_reminder',
        'payment_approved',
        'payment_rejected',
        'refund_processed',
        'club_announcement',
      ],
      payment_status: [
        'pending',
        'approved',
        'rejected',
        'refunded',
        'partially_refunded',
        'in_mediation',
        'cancelled',
      ],
      platform_role: ['platform_admin', 'user'],
      refund_type: ['full', 'partial', 'none'],
      reservation_status: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'],
      sport_type: ['football', 'tennis', 'paddle', 'basketball', 'volleyball', 'squash', 'other'],
      surface_type: ['grass', 'synthetic_grass', 'clay', 'hard', 'wood', 'concrete', 'other'],
    },
  },
} as const
