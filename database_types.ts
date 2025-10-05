/**
 * 🗄️ TYPES GERADOS DO SCHEMA SUPABASE
 * 
 * Última atualização: 05/10/2025
 * Database: qmjzalbrehakxhvwrdkt
 * 
 * ⚠️ NÃO EDITAR MANUALMENTE
 * Para atualizar: npx supabase gen types typescript --project-id qmjzalbrehakxhvwrdkt
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // =====================================
      // RECORDATÓRIO ALIMENTAR
      // =====================================
      food_records: {
        Row: {
          id: string
          tenant_id: string
          client_id: string
          record_date: string
          status: string
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          client_id: string
          record_date: string
          status: string
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          client_id?: string
          record_date?: string
          status?: string
          notes?: string | null
          created_by?: string | null
          updated_at?: string
        }
      }
      
      record_meals: {
        Row: {
          id: string
          food_record_id: string  // ⚠️ ATENÇÃO: não é 'record_id'
          name: string            // ⚠️ ATENÇÃO: não é 'meal_name'
          time: string | null
          order_index: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          food_record_id: string  // ✅ Nome correto da FK
          name: string            // ✅ Nome correto do campo
          time?: string | null
          order_index: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          food_record_id?: string
          name?: string
          time?: string | null
          order_index?: number
          notes?: string | null
        }
      }
      
      record_items: {
        Row: {
          id: string
          record_meal_id: string
          food_id: string
          measure_id: string
          quantity: number
          grams_total: number
          kcal_total: number
          protein_total: number
          carb_total: number
          fat_total: number
          order_index: number
          notes: string | null
        }
        Insert: {
          id?: string
          record_meal_id: string
          food_id: string
          measure_id: string
          quantity: number
          grams_total: number
          kcal_total: number
          protein_total: number
          carb_total: number
          fat_total: number
          order_index: number
          notes?: string | null
        }
        Update: {
          id?: string
          record_meal_id?: string
          food_id?: string
          measure_id?: string
          quantity?: number
          grams_total?: number
          kcal_total?: number
          protein_total?: number
          carb_total?: number
          fat_total?: number
          order_index?: number
          notes?: string | null
        }
      }
      
      // =====================================
      // PLANOS ALIMENTARES
      // =====================================
      meal_plans: {
        Row: {
          id: string
          tenant_id: string
          client_id: string
          name: string
          start_date: string
          end_date: string
          plan_data: Json
          status: 'ativo' | 'concluido' | 'pausado'  // ⚠️ Valores em português!
          target_kcal: number | null
          target_protein: number | null
          target_carbs: number | null
          target_fats: number | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          client_id: string
          name: string
          start_date: string
          end_date: string
          plan_data: Json
          status: 'ativo' | 'concluido' | 'pausado'  // ✅ ENUM correto
          target_kcal?: number | null
          target_protein?: number | null
          target_carbs?: number | null
          target_fats?: number | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          client_id?: string
          name?: string
          start_date?: string
          end_date?: string
          plan_data?: Json
          status?: 'ativo' | 'concluido' | 'pausado'
          target_kcal?: number | null
          target_protein?: number | null
          target_carbs?: number | null
          target_fats?: number | null
          updated_at?: string
        }
      }
      
      meals: {
        Row: {
          id: string
          meal_plan_id: string
          name: string
          time: string | null
          order_index: number | null
          notes: string | null
        }
        Insert: {
          id?: string
          meal_plan_id: string
          name: string
          time?: string | null
          order_index?: number | null
          notes?: string | null
        }
        Update: {
          id?: string
          meal_plan_id?: string
          name?: string
          time?: string | null
          order_index?: number | null
          notes?: string | null
        }
      }
      
      meal_items: {
        Row: {
          id: string
          meal_id: string | null
          food_id: string | null
          measure_id: string | null
          quantity: number
          grams_total: number | null
          kcal_total: number | null
          protein_total: number | null
          carb_total: number | null
          fat_total: number | null
        }
        Insert: {
          id?: string
          meal_id?: string | null
          food_id?: string | null
          measure_id?: string | null
          quantity: number
          grams_total?: number | null
          kcal_total?: number | null
          protein_total?: number | null
          carb_total?: number | null
          fat_total?: number | null
        }
        Update: {
          id?: string
          meal_id?: string | null
          food_id?: string | null
          measure_id?: string | null
          quantity?: number
          grams_total?: number | null
          kcal_total?: number | null
          protein_total?: number | null
          carb_total?: number | null
          fat_total?: number | null
        }
      }
      
      // =====================================
      // ALIMENTOS
      // =====================================
      foods: {
        Row: {
          id: string
          fdc_id: number | null
          taco_id: string | null
          name: string
          category: string | null
          preparation: string | null
          source: string | null
          calories: number | null
          protein: number | null
          carbs: number | null
          fats: number | null
          fiber: number | null
          sodium: number | null
          confidence_score: number | null
          is_active: boolean | null
        }
        Insert: {
          id?: string
          fdc_id?: number | null
          taco_id?: string | null
          name: string
          category?: string | null
          preparation?: string | null
          source?: string | null
          calories?: number | null
          protein?: number | null
          carbs?: number | null
          fats?: number | null
          fiber?: number | null
          sodium?: number | null
          confidence_score?: number | null
          is_active?: boolean | null
        }
        Update: {
          id?: string
          name?: string
          category?: string | null
          is_active?: boolean | null
        }
      }
      
      food_measures: {
        Row: {
          id: string
          food_id: string | null
          measure_name: string
          grams: number
          reference_measure_id: string | null
        }
        Insert: {
          id?: string
          food_id?: string | null
          measure_name: string
          grams: number
          reference_measure_id?: string | null
        }
        Update: {
          id?: string
          food_id?: string | null
          measure_name?: string
          grams?: number
        }
      }
      
      // =====================================
      // CLIENTES
      // =====================================
      clients: {
        Row: {
          id: string
          tenant_id: string
          name: string
          email: string | null
          phone: string | null
          birth_date: string | null
          gender: 'male' | 'female' | 'other' | null
          height: number | null
          weight: number | null
          activity_level: 'sedentary' | 'light' | 'moderate' | 'intense' | 'very_intense' | null
          budget: 'low' | 'medium' | 'high' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          email?: string | null
          phone?: string | null
          birth_date?: string | null
          gender?: 'male' | 'female' | 'other' | null
          height?: number | null
          weight?: number | null
          activity_level?: 'sedentary' | 'light' | 'moderate' | 'intense' | 'very_intense' | null
          budget?: 'low' | 'medium' | 'high' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          weight?: number | null
          updated_at?: string
        }
      }
      
      // =====================================
      // AGENDAMENTOS
      // =====================================
      appointments: {
        Row: {
          id: string
          tenant_id: string
          client_id: string
          datetime: string
          type: 'primeira_consulta' | 'retorno'
          status: 'agendado' | 'confirmado' | 'realizado' | 'cancelado'
          payment_status: 'pending' | 'paid' | 'cancelled' | 'refunded' | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          client_id: string
          datetime: string
          type: 'primeira_consulta' | 'retorno'
          status: 'agendado' | 'confirmado' | 'realizado' | 'cancelado'
          payment_status?: 'pending' | 'paid' | 'cancelled' | 'refunded' | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: 'agendado' | 'confirmado' | 'realizado' | 'cancelado'
          payment_status?: 'pending' | 'paid' | 'cancelled' | 'refunded' | null
          notes?: string | null
          updated_at?: string
        }
      }
      
      // =====================================
      // MULTI-TENANT
      // =====================================
      tenants: {
        Row: {
          id: string
          subdomain: string
          business_name: string
          owner_email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          subdomain: string
          business_name: string
          owner_email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          subdomain?: string
          business_name?: string
          owner_email?: string
          updated_at?: string
        }
      }
    }
    
    Views: {
      [_ in never]: never
    }
    
    Functions: {
      [_ in never]: never
    }
    
    Enums: {
      meal_plan_status: 'ativo' | 'concluido' | 'pausado'
      appointment_status: 'agendado' | 'confirmado' | 'realizado' | 'cancelado'
      appointment_type: 'primeira_consulta' | 'retorno'
      payment_status: 'pending' | 'paid' | 'cancelled' | 'refunded'
      gender: 'male' | 'female' | 'other'
      activity_level: 'sedentary' | 'light' | 'moderate' | 'intense' | 'very_intense'
      budget: 'low' | 'medium' | 'high'
    }
  }
}