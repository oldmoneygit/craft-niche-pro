import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from './useTenantId';
import { toast } from './use-toast';

export interface RecordatorioMeal {
  id?: string;
  recordatorio_id?: string;
  meal_type: string;
  time?: string;
  foods: string;
  order_index: number;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface Recordatorio {
  id: string;
  tenant_id: string;
  patient_id: string;
  patient_name: string;
  type: 'r24h' | 'r3d';
  status: 'pending' | 'analyzed';
  record_date: string;
  notes?: string;
  total_calories?: number;
  total_protein?: number;
  total_carbs?: number;
  total_fat?: number;
  total_fiber?: number;
  created_at: string;
  analyzed_at?: string;
  meals?: RecordatorioMeal[];
  meals_count?: number;
}

export function useRecordatorio() {
  const [recordatorios, setRecordatorios] = useState<Recordatorio[]>([]);
  const [loading, setLoading] = useState(true);
  const { tenantId } = useTenantId();

  // Buscar recordatórios
  const fetchRecordatorios = async () => {
    if (!tenantId) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('recordatorios')
        .select(`
          *,
          meals:recordatorio_meals(*)
        `)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Adicionar contagem de refeições e converter tipos
      const recordatoriosWithCount: Recordatorio[] = (data || []).map(rec => ({
        ...rec,
        type: rec.type as 'r24h' | 'r3d',
        status: rec.status as 'pending' | 'analyzed',
        meals_count: rec.meals?.length || 0
      }));
      
      setRecordatorios(recordatoriosWithCount);
    } catch (error) {
      console.error('Erro ao buscar recordatórios:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os recordatórios',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Criar recordatório
  const createRecordatorio = async (data: {
    patient_id: string;
    patient_name: string;
    type: 'r24h' | 'r3d';
    record_date: string;
    notes?: string;
    meals: Omit<RecordatorioMeal, 'id' | 'recordatorio_id'>[];
  }) => {
    if (!tenantId) {
      toast({
        title: 'Erro',
        description: 'Tenant ID não encontrado',
        variant: 'destructive'
      });
      return;
    }

    try {
      // 1. Criar o recordatório
      const { data: recordatorio, error: recError } = await supabase
        .from('recordatorios')
        .insert([{
          tenant_id: tenantId,
          patient_id: data.patient_id,
          patient_name: data.patient_name,
          type: data.type,
          record_date: data.record_date,
          notes: data.notes,
          status: 'pending'
        }])
        .select()
        .single();
      
      if (recError) throw recError;
      
      // 2. Criar as refeições
      if (data.meals.length > 0) {
        const mealsToInsert = data.meals.map((meal, index) => ({
          recordatorio_id: recordatorio.id,
          meal_type: meal.meal_type,
          time: meal.time,
          foods: meal.foods,
          order_index: index
        }));
        
        const { error: mealsError } = await supabase
          .from('recordatorio_meals')
          .insert(mealsToInsert);
        
        if (mealsError) throw mealsError;
      }
      
      toast({
        title: 'Sucesso!',
        description: 'Recordatório criado com sucesso'
      });
      
      // Recarregar lista
      await fetchRecordatorios();
      
      return recordatorio;
    } catch (error) {
      console.error('Erro ao criar recordatório:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o recordatório',
        variant: 'destructive'
      });
      throw error;
    }
  };

  // Deletar recordatório
  const deleteRecordatorio = async (id: string) => {
    try {
      const { error } = await supabase
        .from('recordatorios')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: 'Sucesso!',
        description: 'Recordatório excluído'
      });
      
      await fetchRecordatorios();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o recordatório',
        variant: 'destructive'
      });
    }
  };

  // Buscar recordatório por ID
  const getRecordatorioById = async (id: string): Promise<Recordatorio | null> => {
    try {
      const { data, error } = await supabase
        .from('recordatorios')
        .select(`
          *,
          meals:recordatorio_meals(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      // Ordenar meals e converter tipos
      const recordatorio: Recordatorio = {
        ...data,
        type: data.type as 'r24h' | 'r3d',
        status: data.status as 'pending' | 'analyzed'
      };
      
      if (recordatorio.meals) {
        recordatorio.meals.sort((a: RecordatorioMeal, b: RecordatorioMeal) => a.order_index - b.order_index);
      }
      
      return recordatorio;
    } catch (error) {
      console.error('Erro ao buscar recordatório:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o recordatório',
        variant: 'destructive'
      });
      return null;
    }
  };

  useEffect(() => {
    fetchRecordatorios();
  }, [tenantId]);

  return {
    recordatorios,
    loading,
    fetchRecordatorios,
    createRecordatorio,
    deleteRecordatorio,
    getRecordatorioById
  };
}
