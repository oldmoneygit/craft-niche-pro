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
      anamneses: {
        Row: {
          alcohol_consumption: string | null
          allergies: string | null
          anamnesis_date: string
          client_id: string
          clinical_observations: string | null
          created_at: string
          created_by: string | null
          current_medications: string | null
          current_weight: number | null
          dietary_restrictions: string | null
          eating_out_frequency: string | null
          family_history: string | null
          food_dislikes: string | null
          food_intolerances: string | null
          food_preferences: string | null
          height: number | null
          hip_circumference: number | null
          household_size: number | null
          id: string
          main_goal: string
          marital_status: string | null
          meals_per_day: number | null
          medical_conditions: string | null
          motivation: string | null
          occupation: string | null
          physical_activity: string | null
          previous_diets: string | null
          professional_notes: string | null
          recent_exams: Json | null
          sleep_hours: number | null
          smoking: string | null
          stress_level: string | null
          target_weight: number | null
          tenant_id: string
          updated_at: string
          waist_circumference: number | null
          water_intake_liters: number | null
        }
        Insert: {
          alcohol_consumption?: string | null
          allergies?: string | null
          anamnesis_date?: string
          client_id: string
          clinical_observations?: string | null
          created_at?: string
          created_by?: string | null
          current_medications?: string | null
          current_weight?: number | null
          dietary_restrictions?: string | null
          eating_out_frequency?: string | null
          family_history?: string | null
          food_dislikes?: string | null
          food_intolerances?: string | null
          food_preferences?: string | null
          height?: number | null
          hip_circumference?: number | null
          household_size?: number | null
          id?: string
          main_goal: string
          marital_status?: string | null
          meals_per_day?: number | null
          medical_conditions?: string | null
          motivation?: string | null
          occupation?: string | null
          physical_activity?: string | null
          previous_diets?: string | null
          professional_notes?: string | null
          recent_exams?: Json | null
          sleep_hours?: number | null
          smoking?: string | null
          stress_level?: string | null
          target_weight?: number | null
          tenant_id: string
          updated_at?: string
          waist_circumference?: number | null
          water_intake_liters?: number | null
        }
        Update: {
          alcohol_consumption?: string | null
          allergies?: string | null
          anamnesis_date?: string
          client_id?: string
          clinical_observations?: string | null
          created_at?: string
          created_by?: string | null
          current_medications?: string | null
          current_weight?: number | null
          dietary_restrictions?: string | null
          eating_out_frequency?: string | null
          family_history?: string | null
          food_dislikes?: string | null
          food_intolerances?: string | null
          food_preferences?: string | null
          height?: number | null
          hip_circumference?: number | null
          household_size?: number | null
          id?: string
          main_goal?: string
          marital_status?: string | null
          meals_per_day?: number | null
          medical_conditions?: string | null
          motivation?: string | null
          occupation?: string | null
          physical_activity?: string | null
          previous_diets?: string | null
          professional_notes?: string | null
          recent_exams?: Json | null
          sleep_hours?: number | null
          smoking?: string | null
          stress_level?: string | null
          target_weight?: number | null
          tenant_id?: string
          updated_at?: string
          waist_circumference?: number | null
          water_intake_liters?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "anamneses_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anamneses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
      category_default_measures: {
        Row: {
          category: string
          created_at: string | null
          display_order: number | null
          id: string
          reference_measure_id: string | null
          typical_grams: number
        }
        Insert: {
          category: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          reference_measure_id?: string | null
          typical_grams: number
        }
        Update: {
          category?: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          reference_measure_id?: string | null
          typical_grams?: number
        }
        Relationships: [
          {
            foreignKeyName: "category_default_measures_reference_measure_id_fkey"
            columns: ["reference_measure_id"]
            isOneToOne: false
            referencedRelation: "reference_measures"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          activity_level: string | null
          age: number | null
          allergies: string | null
          birth_date: string | null
          budget: string | null
          created_at: string
          dietary_restrictions: string[] | null
          dislikes: string[] | null
          email: string | null
          gender: string | null
          goal: string | null
          height: number | null
          height_cm: number | null
          id: string
          meal_preferences: string[] | null
          medical_conditions: string[] | null
          medications: string[] | null
          name: string
          notes: string | null
          phone: string | null
          target_weight_kg: number | null
          tenant_id: string
          updated_at: string
          weight_current: number | null
          weight_kg: number | null
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          allergies?: string | null
          birth_date?: string | null
          budget?: string | null
          created_at?: string
          dietary_restrictions?: string[] | null
          dislikes?: string[] | null
          email?: string | null
          gender?: string | null
          goal?: string | null
          height?: number | null
          height_cm?: number | null
          id?: string
          meal_preferences?: string[] | null
          medical_conditions?: string[] | null
          medications?: string[] | null
          name: string
          notes?: string | null
          phone?: string | null
          target_weight_kg?: number | null
          tenant_id: string
          updated_at?: string
          weight_current?: number | null
          weight_kg?: number | null
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          allergies?: string | null
          birth_date?: string | null
          budget?: string | null
          created_at?: string
          dietary_restrictions?: string[] | null
          dislikes?: string[] | null
          email?: string | null
          gender?: string | null
          goal?: string | null
          height?: number | null
          height_cm?: number | null
          id?: string
          meal_preferences?: string[] | null
          medical_conditions?: string[] | null
          medications?: string[] | null
          name?: string
          notes?: string | null
          phone?: string | null
          target_weight_kg?: number | null
          tenant_id?: string
          updated_at?: string
          weight_current?: number | null
          weight_kg?: number | null
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
      food_categories: {
        Row: {
          color: string | null
          created_at: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      food_measures: {
        Row: {
          created_at: string | null
          food_id: string | null
          grams: number
          grams_equivalent: number | null
          id: string
          is_default: boolean | null
          measure_name: string
        }
        Insert: {
          created_at?: string | null
          food_id?: string | null
          grams: number
          grams_equivalent?: number | null
          id?: string
          is_default?: boolean | null
          measure_name: string
        }
        Update: {
          created_at?: string | null
          food_id?: string | null
          grams?: number
          grams_equivalent?: number | null
          id?: string
          is_default?: boolean | null
          measure_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_measures_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
        ]
      }
      food_records: {
        Row: {
          client_id: string
          created_at: string
          id: string
          notes: string | null
          record_date: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          notes?: string | null
          record_date: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          record_date?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      food_usage_history: {
        Row: {
          food_id: string | null
          id: string
          meal_plan_id: string | null
          used_at: string | null
          user_id: string | null
        }
        Insert: {
          food_id?: string | null
          id?: string
          meal_plan_id?: string | null
          used_at?: string | null
          user_id?: string | null
        }
        Update: {
          food_id?: string | null
          id?: string
          meal_plan_id?: string | null
          used_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "food_usage_history_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_usage_history_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_usage_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      foods: {
        Row: {
          active: boolean | null
          barcode: string | null
          brand: string | null
          carb_per_100g: number | null
          carbohydrate_g: number | null
          category: string | null
          category_id: string | null
          confidence_score: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          energy_kcal: number | null
          fat_per_100g: number | null
          fiber_g: number | null
          fiber_per_100g: number | null
          id: string
          is_custom: boolean | null
          kcal_per_100g: number | null
          lipid_g: number | null
          name: string
          nutritionist_notes: string | null
          protein_g: number | null
          protein_per_100g: number | null
          saturated_fat_g: number | null
          saturated_fat_per_100g: number | null
          sodium_mg: number | null
          source: string | null
          source_id: string | null
          source_info: string | null
          sugars_per_100g: number | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          barcode?: string | null
          brand?: string | null
          carb_per_100g?: number | null
          carbohydrate_g?: number | null
          category?: string | null
          category_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          energy_kcal?: number | null
          fat_per_100g?: number | null
          fiber_g?: number | null
          fiber_per_100g?: number | null
          id?: string
          is_custom?: boolean | null
          kcal_per_100g?: number | null
          lipid_g?: number | null
          name: string
          nutritionist_notes?: string | null
          protein_g?: number | null
          protein_per_100g?: number | null
          saturated_fat_g?: number | null
          saturated_fat_per_100g?: number | null
          sodium_mg?: number | null
          source?: string | null
          source_id?: string | null
          source_info?: string | null
          sugars_per_100g?: number | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          barcode?: string | null
          brand?: string | null
          carb_per_100g?: number | null
          carbohydrate_g?: number | null
          category?: string | null
          category_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          energy_kcal?: number | null
          fat_per_100g?: number | null
          fiber_g?: number | null
          fiber_per_100g?: number | null
          id?: string
          is_custom?: boolean | null
          kcal_per_100g?: number | null
          lipid_g?: number | null
          name?: string
          nutritionist_notes?: string | null
          protein_g?: number | null
          protein_per_100g?: number | null
          saturated_fat_g?: number | null
          saturated_fat_per_100g?: number | null
          sodium_mg?: number | null
          source?: string | null
          source_id?: string | null
          source_info?: string | null
          sugars_per_100g?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "foods_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "food_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "foods_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "foods_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "nutrition_sources"
            referencedColumns: ["id"]
          },
        ]
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
      meal_items: {
        Row: {
          carb_total: number | null
          created_at: string | null
          fat_total: number | null
          food_id: string | null
          grams_total: number | null
          id: string
          kcal_total: number | null
          meal_id: string | null
          measure_id: string | null
          notes: string | null
          protein_total: number | null
          quantity: number
        }
        Insert: {
          carb_total?: number | null
          created_at?: string | null
          fat_total?: number | null
          food_id?: string | null
          grams_total?: number | null
          id?: string
          kcal_total?: number | null
          meal_id?: string | null
          measure_id?: string | null
          notes?: string | null
          protein_total?: number | null
          quantity: number
        }
        Update: {
          carb_total?: number | null
          created_at?: string | null
          fat_total?: number | null
          food_id?: string | null
          grams_total?: number | null
          id?: string
          kcal_total?: number | null
          meal_id?: string | null
          measure_id?: string | null
          notes?: string | null
          protein_total?: number | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "meal_items_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_items_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meal_plan_meals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_items_measure_id_fkey"
            columns: ["measure_id"]
            isOneToOne: false
            referencedRelation: "food_measures"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plan_meals: {
        Row: {
          created_at: string | null
          id: string
          meal_plan_id: string | null
          name: string
          order_index: number | null
          time: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          meal_plan_id?: string | null
          name: string
          order_index?: number | null
          time?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          meal_plan_id?: string | null
          name?: string
          order_index?: number | null
          time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_plan_meals_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plan_template_foods: {
        Row: {
          created_at: string | null
          food_id: string
          id: string
          meal_id: string
          measure_id: string
          quantity: number
        }
        Insert: {
          created_at?: string | null
          food_id: string
          id?: string
          meal_id: string
          measure_id: string
          quantity: number
        }
        Update: {
          created_at?: string | null
          food_id?: string
          id?: string
          meal_id?: string
          measure_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "meal_plan_template_foods_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_plan_template_foods_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meal_plan_template_meals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_plan_template_foods_measure_id_fkey"
            columns: ["measure_id"]
            isOneToOne: false
            referencedRelation: "food_measures"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plan_template_meals: {
        Row: {
          created_at: string | null
          id: string
          name: string
          order_index: number
          template_id: string
          time: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          order_index: number
          template_id: string
          time?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          order_index?: number
          template_id?: string
          time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_plan_template_meals_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "meal_plan_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plan_templates: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          name: string
          objective: string | null
          reference_calories: number
          reference_carbs: number
          reference_fat: number
          reference_protein: number
          tags: string[] | null
          tenant_id: string
          times_used: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          name: string
          objective?: string | null
          reference_calories: number
          reference_carbs: number
          reference_fat: number
          reference_protein: number
          tags?: string[] | null
          tenant_id: string
          times_used?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          objective?: string | null
          reference_calories?: number
          reference_carbs?: number
          reference_fat?: number
          reference_protein?: number
          tags?: string[] | null
          tenant_id?: string
          times_used?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      meal_plans: {
        Row: {
          client_id: string
          created_at: string
          end_date: string
          goal: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          public_token: string | null
          replaced_by: string | null
          start_date: string
          status: string
          target_carbs: number | null
          target_fats: number | null
          target_kcal: number | null
          target_protein: number | null
          tenant_id: string
          updated_at: string
          version: number | null
        }
        Insert: {
          client_id: string
          created_at?: string
          end_date: string
          goal?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          public_token?: string | null
          replaced_by?: string | null
          start_date: string
          status?: string
          target_carbs?: number | null
          target_fats?: number | null
          target_kcal?: number | null
          target_protein?: number | null
          tenant_id: string
          updated_at?: string
          version?: number | null
        }
        Update: {
          client_id?: string
          created_at?: string
          end_date?: string
          goal?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          public_token?: string | null
          replaced_by?: string | null
          start_date?: string
          status?: string
          target_carbs?: number | null
          target_fats?: number | null
          target_kcal?: number | null
          target_protein?: number | null
          tenant_id?: string
          updated_at?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_plans_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_plans_replaced_by_fkey"
            columns: ["replaced_by"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_plans_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
      nutrition_sources: {
        Row: {
          active: boolean | null
          code: string
          country: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          active?: boolean | null
          code: string
          country?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          active?: boolean | null
          code?: string
          country?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
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
      questionnaire_questions: {
        Row: {
          created_at: string | null
          id: string
          is_required: boolean | null
          options: Json | null
          order_index: number
          question_text: string
          question_type: string
          questionnaire_id: string
          section: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          options?: Json | null
          order_index: number
          question_text: string
          question_type: string
          questionnaire_id: string
          section?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          options?: Json | null
          order_index?: number
          question_text?: string
          question_type?: string
          questionnaire_id?: string
          section?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questionnaire_questions_questionnaire_id_fkey"
            columns: ["questionnaire_id"]
            isOneToOne: false
            referencedRelation: "questionnaires"
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
          started_at: string | null
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
          started_at?: string | null
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
          started_at?: string | null
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
      questionnaire_templates: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          template_data: Json
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          template_data: Json
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          template_data?: Json
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questionnaire_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      questionnaires: {
        Row: {
          active: boolean | null
          category: string | null
          created_at: string | null
          description: string | null
          estimated_time: number | null
          id: string
          is_active: boolean | null
          question_count: number | null
          questions: Json
          tenant_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          estimated_time?: number | null
          id?: string
          is_active?: boolean | null
          question_count?: number | null
          questions: Json
          tenant_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          estimated_time?: number | null
          id?: string
          is_active?: boolean | null
          question_count?: number | null
          questions?: Json
          tenant_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      record_items: {
        Row: {
          carb_total: number
          created_at: string | null
          fat_total: number
          food_id: string
          grams_total: number
          id: string
          kcal_total: number
          measure_id: string
          order_index: number
          protein_total: number
          quantity: number
          record_meal_id: string
        }
        Insert: {
          carb_total: number
          created_at?: string | null
          fat_total: number
          food_id: string
          grams_total: number
          id?: string
          kcal_total: number
          measure_id: string
          order_index?: number
          protein_total: number
          quantity: number
          record_meal_id: string
        }
        Update: {
          carb_total?: number
          created_at?: string | null
          fat_total?: number
          food_id?: string
          grams_total?: number
          id?: string
          kcal_total?: number
          measure_id?: string
          order_index?: number
          protein_total?: number
          quantity?: number
          record_meal_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "record_items_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "record_items_measure_id_fkey"
            columns: ["measure_id"]
            isOneToOne: false
            referencedRelation: "food_measures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "record_items_record_meal_id_fkey"
            columns: ["record_meal_id"]
            isOneToOne: false
            referencedRelation: "record_meals"
            referencedColumns: ["id"]
          },
        ]
      }
      record_meals: {
        Row: {
          created_at: string | null
          food_record_id: string
          id: string
          name: string
          notes: string | null
          order_index: number
          time: string | null
        }
        Insert: {
          created_at?: string | null
          food_record_id: string
          id?: string
          name: string
          notes?: string | null
          order_index?: number
          time?: string | null
        }
        Update: {
          created_at?: string | null
          food_record_id?: string
          id?: string
          name?: string
          notes?: string | null
          order_index?: number
          time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "record_meals_food_record_id_fkey"
            columns: ["food_record_id"]
            isOneToOne: false
            referencedRelation: "food_records"
            referencedColumns: ["id"]
          },
        ]
      }
      reference_measures: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          measure_type: string
          name: string
          typical_grams: number | null
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          measure_type: string
          name: string
          typical_grams?: number | null
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          measure_type?: string
          name?: string
          typical_grams?: number | null
        }
        Relationships: []
      }
      response_answers: {
        Row: {
          answer_value: Json
          created_at: string | null
          id: string
          question_id: string
          response_id: string
        }
        Insert: {
          answer_value: Json
          created_at?: string | null
          id?: string
          question_id: string
          response_id: string
        }
        Update: {
          answer_value?: Json
          created_at?: string | null
          id?: string
          question_id?: string
          response_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "response_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questionnaire_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "response_answers_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "questionnaire_responses"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "fk_service_subscriptions_client"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_subscriptions_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
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
      ensure_gram_measure: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
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
