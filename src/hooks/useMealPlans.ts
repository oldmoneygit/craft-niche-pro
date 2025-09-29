import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from './useTenant';
import { useToast } from '@/hooks/use-toast';

export interface MealPlan {
  id: string;
  tenant_id: string;
  client_id: string;
  name: string;
  start_date: string;
  end_date: string;
  plan_data: {
    breakfast: string[];
    lunch: string[];
    dinner: string[];
    snacks: string[];
  };
  status: 'ativo' | 'concluido' | 'pausado';
  created_at: string;
  updated_at: string;
}

export function useMealPlans() {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { tenant } = useTenant();
  const { toast } = useToast();

  const fetchMealPlans = async () => {
    if (!tenant?.id) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMealPlans((data as any) || []);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar planos alimentares',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createMealPlan = async (mealPlan: Omit<MealPlan, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>) => {
    if (!tenant?.id) return null;

    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .insert([{ ...mealPlan, tenant_id: tenant.id }])
        .select()
        .single();

      if (error) throw error;

      setMealPlans(prev => [data as any, ...prev]);
      toast({
        title: 'Plano alimentar criado',
        description: 'O plano foi criado com sucesso.',
      });
      return data;
    } catch (error: any) {
      toast({
        title: 'Erro ao criar plano alimentar',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateMealPlan = async (id: string, updates: Partial<Omit<MealPlan, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>>) => {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setMealPlans(prev => prev.map(plan => plan.id === id ? data as any : plan));
      toast({
        title: 'Plano alimentar atualizado',
        description: 'As alterações foram salvas.',
      });
      return data;
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar plano alimentar',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteMealPlan = async (id: string) => {
    try {
      const { error } = await supabase
        .from('meal_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMealPlans(prev => prev.filter(plan => plan.id !== id));
      toast({
        title: 'Plano alimentar excluído',
        description: 'O plano foi removido com sucesso.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir plano alimentar',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchMealPlans();
  }, [tenant?.id]);

  return {
    mealPlans,
    loading,
    createMealPlan,
    updateMealPlan,
    deleteMealPlan,
    refetch: fetchMealPlans,
  };
}