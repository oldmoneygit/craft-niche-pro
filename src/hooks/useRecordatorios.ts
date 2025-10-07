import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from './useTenantId';
import { toast } from '@/hooks/use-toast';

export interface RecordatorioMeal {
  id?: string;
  meal_type: string;
  time?: string;
  foods: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  order_index: number;
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
  analysis_notes?: string;
  analyzed_at?: string;
  analyzed_by?: string;
  created_at: string;
  updated_at: string;
  meals?: RecordatorioMeal[];
  meals_count?: number;
}

export const useRecordatorios = () => {
  const { tenantId } = useTenantId();
  const queryClient = useQueryClient();

  const { data: recordatorios = [], isLoading } = useQuery({
    queryKey: ['recordatorios', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from('recordatorios')
        .select(`
          *,
          meals:recordatorio_meals(*)
        `)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(rec => ({
        ...rec,
        meals_count: rec.meals?.length || 0
      })) as Recordatorio[];
    },
    enabled: !!tenantId
  });

  const createRecordatorio = useMutation({
    mutationFn: async (data: {
      patient_id: string;
      patient_name: string;
      type: 'r24h' | 'r3d';
      record_date: string;
      notes?: string;
      meals: Omit<RecordatorioMeal, 'id'>[];
    }) => {
      console.log('🔵 [createRecordatorio] Iniciando criação com dados:', data);
      console.log('🔵 [createRecordatorio] tenantId:', tenantId);
      
      if (!tenantId) {
        console.error('❌ [createRecordatorio] Tenant ID não encontrado!');
        throw new Error('Tenant ID não encontrado');
      }

      // Criar recordatório
      console.log('🔵 [createRecordatorio] Inserindo no banco...');
      const { data: recordatorio, error: recError } = await supabase
        .from('recordatorios')
        .insert({
          tenant_id: tenantId,
          patient_id: data.patient_id,
          patient_name: data.patient_name,
          type: data.type,
          record_date: data.record_date,
          notes: data.notes,
          status: 'pending'
        })
        .select()
        .single();

      if (recError) {
        console.error('❌ [createRecordatorio] Erro ao criar recordatório:', recError);
        throw recError;
      }
      
      console.log('✅ [createRecordatorio] Recordatório criado:', recordatorio);

      // Criar refeições
      console.log('🔵 [createRecordatorio] Criando refeições...', data.meals.length);
      if (data.meals.length > 0) {
        const mealsToInsert = data.meals.map((meal, index) => ({
          recordatorio_id: recordatorio.id,
          meal_type: meal.meal_type,
          time: meal.time,
          foods: meal.foods,
          order_index: index
        }));

        console.log('🔵 [createRecordatorio] Inserindo refeições:', mealsToInsert);
        const { error: mealsError } = await supabase
          .from('recordatorio_meals')
          .insert(mealsToInsert);

        if (mealsError) {
          console.error('❌ [createRecordatorio] Erro ao criar refeições:', mealsError);
          throw mealsError;
        }
        console.log('✅ [createRecordatorio] Refeições criadas com sucesso!');
      }

      console.log('✅ [createRecordatorio] Processo completo!');
      return recordatorio;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recordatorios'] });
      toast({
        title: 'Sucesso',
        description: 'Recordatório criado com sucesso!'
      });
    },
    onError: (error) => {
      console.error('Erro ao criar recordatório:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao criar recordatório',
        variant: 'destructive'
      });
    }
  });

  const updateRecordatorio = useMutation({
    mutationFn: async (data: {
      id: string;
      status?: 'pending' | 'analyzed';
      total_calories?: number;
      total_protein?: number;
      total_carbs?: number;
      total_fat?: number;
      total_fiber?: number;
      analysis_notes?: string;
    }) => {
      const { error } = await supabase
        .from('recordatorios')
        .update({
          ...data,
          analyzed_at: data.status === 'analyzed' ? new Date().toISOString() : undefined
        })
        .eq('id', data.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recordatorios'] });
      toast({
        title: 'Sucesso',
        description: 'Recordatório atualizado com sucesso!'
      });
    },
    onError: (error) => {
      console.error('Erro ao atualizar recordatório:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar recordatório',
        variant: 'destructive'
      });
    }
  });

  const deleteRecordatorio = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('recordatorios')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recordatorios'] });
      toast({
        title: 'Sucesso',
        description: 'Recordatório excluído com sucesso!'
      });
    },
    onError: (error) => {
      console.error('Erro ao excluir recordatório:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir recordatório',
        variant: 'destructive'
      });
    }
  });

  return {
    recordatorios,
    isLoading,
    createRecordatorio,
    updateRecordatorio,
    deleteRecordatorio
  };
};
