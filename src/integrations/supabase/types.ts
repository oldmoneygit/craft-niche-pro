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
      ai_suggestions: {
        Row: {
          created_at: string
          data: Json
          id: string
          priority: number
          resolved: boolean
          tenant_id: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
          priority?: number
          resolved?: boolean
          tenant_id: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          priority?: number
          resolved?: boolean
          tenant_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      appointment_reminders: {
        Row: {
          appointment_id: string
          client_response: string | null
          created_at: string | null
          id: string
          reminder_type: string
          sent_at: string
          status: string | null
          tenant_id: string
        }
        Insert: {
          appointment_id: string
          client_response?: string | null
          created_at?: string | null
          id?: string
          reminder_type: string
          sent_at?: string
          status?: string | null
          tenant_id: string
        }
        Update: {
          appointment_id?: string
          client_response?: string | null
          created_at?: string | null
          id?: string
          reminder_type?: string
          sent_at?: string
          status?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_reminders_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          client_id: string
          confirmation_requested_at: string | null
          created_at: string
          datetime: string
          id: string
          notes: string | null
          payment_date: string | null
          payment_method: string | null
          payment_notes: string | null
          payment_status: string | null
          reminder_sent: string | null
          reminder_type: string | null
          status: string
          tenant_id: string
          type: string
          updated_at: string
          value: number | null
        }
        Insert: {
          client_id: string
          confirmation_requested_at?: string | null
          created_at?: string
          datetime: string
          id?: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_notes?: string | null
          payment_status?: string | null
          reminder_sent?: string | null
          reminder_type?: string | null
          status?: string
          tenant_id: string
          type: string
          updated_at?: string
          value?: number | null
        }
        Update: {
          client_id?: string
          confirmation_requested_at?: string | null
          created_at?: string
          datetime?: string
          id?: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_notes?: string | null
          payment_status?: string | null
          reminder_sent?: string | null
          reminder_type?: string | null
          status?: string
          tenant_id?: string
          type?: string
          updated_at?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          allergies: string | null
          birth_date: string | null
          created_at: string
          email: string | null
          goal: string | null
          height: number | null
          id: string
          name: string
          phone: string | null
          tenant_id: string
          updated_at: string
          weight_current: number | null
        }
        Insert: {
          allergies?: string | null
          birth_date?: string | null
          created_at?: string
          email?: string | null
          goal?: string | null
          height?: number | null
          id?: string
          name: string
          phone?: string | null
          tenant_id: string
          updated_at?: string
          weight_current?: number | null
        }
        Update: {
          allergies?: string | null
          birth_date?: string | null
          created_at?: string
          email?: string | null
          goal?: string | null
          height?: number | null
          id?: string
          name?: string
          phone?: string | null
          tenant_id?: string
          updated_at?: string
          weight_current?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      communications: {
        Row: {
          client_id: string
          content: string
          created_at: string
          direction: string
          id: string
          metadata: Json | null
          status: string
          template_used: string | null
          tenant_id: string
          type: string
        }
        Insert: {
          client_id: string
          content: string
          created_at?: string
          direction: string
          id?: string
          metadata?: Json | null
          status?: string
          template_used?: string | null
          tenant_id: string
          type: string
        }
        Update: {
          client_id?: string
          content?: string
          created_at?: string
          direction?: string
          id?: string
          metadata?: Json | null
          status?: string
          template_used?: string | null
          tenant_id?: string
          type?: string
        }
        Relationships: []
      }
      faq_items: {
        Row: {
          active: boolean
          answer: string
          category: string
          created_at: string
          id: string
          question: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          answer: string
          category: string
          created_at?: string
          id?: string
          question: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          answer?: string
          category?: string
          created_at?: string
          id?: string
          question?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      knowledge_base: {
        Row: {
          active: boolean | null
          category: string
          content: string
          created_at: string | null
          id: string
          keywords: string[] | null
          tenant_id: string
          title: string
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          active?: boolean | null
          category: string
          content: string
          created_at?: string | null
          id?: string
          keywords?: string[] | null
          tenant_id: string
          title: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          active?: boolean | null
          category?: string
          content?: string
          created_at?: string | null
          id?: string
          keywords?: string[] | null
          tenant_id?: string
          title?: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          conversation_summary: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string
          preferred_datetime: string | null
          preferred_time_description: string | null
          source: string | null
          status: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          conversation_summary?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone: string
          preferred_datetime?: string | null
          preferred_time_description?: string | null
          source?: string | null
          status?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          conversation_summary?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string
          preferred_datetime?: string | null
          preferred_time_description?: string | null
          source?: string | null
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      meal_foods: {
        Row: {
          calories: number | null
          created_at: string | null
          id: string
          meal_id: string
          name: string
          order_index: number | null
          quantity: string
        }
        Insert: {
          calories?: number | null
          created_at?: string | null
          id?: string
          meal_id: string
          name: string
          order_index?: number | null
          quantity: string
        }
        Update: {
          calories?: number | null
          created_at?: string | null
          id?: string
          meal_id?: string
          name?: string
          order_index?: number | null
          quantity?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_foods_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meals"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plans: {
        Row: {
          active: boolean | null
          calories_target: number | null
          client_id: string
          created_at: string
          end_date: string
          id: string
          name: string
          notes: string | null
          plan_data: Json
          public_token: string | null
          start_date: string
          status: string
          tenant_id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          calories_target?: number | null
          client_id: string
          created_at?: string
          end_date: string
          id?: string
          name: string
          notes?: string | null
          plan_data?: Json
          public_token?: string | null
          start_date: string
          status?: string
          tenant_id: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          calories_target?: number | null
          client_id?: string
          created_at?: string
          end_date?: string
          id?: string
          name?: string
          notes?: string | null
          plan_data?: Json
          public_token?: string | null
          start_date?: string
          status?: string
          tenant_id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_plans_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      meals: {
        Row: {
          created_at: string | null
          id: string
          meal_plan_id: string
          name: string
          order_index: number | null
          time: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          meal_plan_id: string
          name: string
          order_index?: number | null
          time?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          meal_plan_id?: string
          name?: string
          order_index?: number | null
          time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meals_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          content: string
          created_at: string
          id: string
          name: string
          subject: string | null
          tenant_id: string
          type: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          name: string
          subject?: string | null
          tenant_id: string
          type: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          name?: string
          subject?: string | null
          tenant_id?: string
          type?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          role: string | null
          tenant_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string | null
          tenant_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string | null
          tenant_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      questionnaire_responses: {
        Row: {
          answers: Json
          client_id: string | null
          completed_at: string | null
          created_at: string | null
          id: string
          public_token: string | null
          questionnaire_id: string | null
          respondent_email: string | null
          respondent_name: string | null
          respondent_phone: string | null
          score: number | null
          status: string | null
          tenant_id: string
        }
        Insert: {
          answers: Json
          client_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          public_token?: string | null
          questionnaire_id?: string | null
          respondent_email?: string | null
          respondent_name?: string | null
          respondent_phone?: string | null
          score?: number | null
          status?: string | null
          tenant_id: string
        }
        Update: {
          answers?: Json
          client_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          public_token?: string | null
          questionnaire_id?: string | null
          respondent_email?: string | null
          respondent_name?: string | null
          respondent_phone?: string | null
          score?: number | null
          status?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "questionnaire_responses_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questionnaire_responses_questionnaire_id_fkey"
            columns: ["questionnaire_id"]
            isOneToOne: false
            referencedRelation: "questionnaires"
            referencedColumns: ["id"]
          },
        ]
      }
      questionnaires: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          id: string
          questions: Json
          tenant_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          questions: Json
          tenant_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          questions?: Json
          tenant_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      service_notifications: {
        Row: {
          id: string
          message_content: string | null
          notification_type: string | null
          sent_at: string | null
          subscription_id: string | null
          whatsapp_sent: boolean | null
        }
        Insert: {
          id?: string
          message_content?: string | null
          notification_type?: string | null
          sent_at?: string | null
          subscription_id?: string | null
          whatsapp_sent?: boolean | null
        }
        Update: {
          id?: string
          message_content?: string | null
          notification_type?: string | null
          sent_at?: string | null
          subscription_id?: string | null
          whatsapp_sent?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "service_notifications_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "service_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      service_subscriptions: {
        Row: {
          client_id: string
          created_at: string | null
          end_date: string
          id: string
          notes: string | null
          payment_status: string | null
          price: number | null
          service_id: string
          start_date: string
          status: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          end_date: string
          id?: string
          notes?: string | null
          payment_status?: string | null
          price?: number | null
          service_id: string
          start_date: string
          status?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          end_date?: string
          id?: string
          notes?: string | null
          payment_status?: string | null
          price?: number | null
          service_id?: string
          start_date?: string
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          duration_days: number | null
          duration_type: string | null
          id: string
          modality: string | null
          name: string
          price: number
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          duration_days?: number | null
          duration_type?: string | null
          id?: string
          modality?: string | null
          name: string
          price: number
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          duration_days?: number | null
          duration_type?: string | null
          id?: string
          modality?: string | null
          name?: string
          price?: number
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tenant_config: {
        Row: {
          ai_config: Json | null
          branding: Json | null
          business_type: string | null
          created_at: string | null
          custom_fields: Json | null
          enabled_features: Json | null
          id: string
          tenant_id: string
          terminology: Json | null
          updated_at: string | null
        }
        Insert: {
          ai_config?: Json | null
          branding?: Json | null
          business_type?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          enabled_features?: Json | null
          id?: string
          tenant_id: string
          terminology?: Json | null
          updated_at?: string | null
        }
        Update: {
          ai_config?: Json | null
          branding?: Json | null
          business_type?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          enabled_features?: Json | null
          id?: string
          tenant_id?: string
          terminology?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_config_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          business_name: string
          created_at: string
          id: string
          owner_email: string
          subdomain: string
          updated_at: string
        }
        Insert: {
          business_name: string
          created_at?: string
          id?: string
          owner_email: string
          subdomain: string
          updated_at?: string
        }
        Update: {
          business_name?: string
          created_at?: string
          id?: string
          owner_email?: string
          subdomain?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      financial_summary: {
        Row: {
          month: string | null
          paid_count: number | null
          pending_count: number | null
          tenant_id: string | null
          total_appointments: number | null
          total_expected: number | null
          total_pending: number | null
          total_received: number | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_analytics_data: {
        Args: { p_months?: number; p_tenant_id: string }
        Returns: {
          attendance_rate: number
          avg_revenue_per_appointment: number
          cancelled_appointments: number
          completed_appointments: number
          month: string
          new_clients: number
          no_show_appointments: number
          total_appointments: number
          total_revenue: number
        }[]
      }
      get_financial_stats: {
        Args: { p_end_date: string; p_start_date: string; p_tenant_id: string }
        Returns: {
          average_value: number
          paid_appointments: number
          payment_rate: number
          pending_appointments: number
          total_appointments: number
          total_pending: number
          total_received: number
        }[]
      }
      get_general_metrics: {
        Args: { p_tenant_id: string }
        Returns: {
          active_clients: number
          active_meal_plans: number
          completed_appointments_all_time: number
          completed_questionnaires: number
          overall_attendance_rate: number
          total_appointments_all_time: number
          total_clients: number
          total_revenue_all_time: number
        }[]
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
