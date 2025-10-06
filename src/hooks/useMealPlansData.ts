import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTenantId } from './useTenantId';
import type { MealPlan, MealPlanWithDetails, CreateMealPlanInput, AddMealItemInput } from '@/types/meal-plans';

export function useMealPlansData(filters?: {
  clientId?: string;
  status?: string;
  search?: string;
}) {
  const { tenantId } = useTenantId();
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['meal-plans', tenantId, filters],
    queryFn: async () => {
      if (!tenantId) throw new Error('Tenant ID not found');

      let query = supabase
        .from('meal_plans')
        .select(`
          *,
          client:clients!meal_plans_client_id_fkey(id, name, email, phone),
          meals:meal_plan_meals(
            id,
            items:meal_items(
              kcal_total,
              protein_total,
              carb_total,
              fat_total
            )
          )
        `)
        .eq('tenant_id', tenantId);
      
      if (filters?.clientId) {
        query = query.eq('client_id', filters.clientId);
      }
      
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      
      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as any[];
    },
    enabled: !!tenantId
  });
}

export function useMealPlanDetail(planId: string | null) {
  return useQuery({
    queryKey: ['meal-plan', planId],
    queryFn: async () => {
      if (!planId) throw new Error('Plan ID not found');

      const { data, error } = await supabase
        .from('meal_plans')
        .select(`
          *,
          client:clients!meal_plans_client_id_fkey(id, name, email, phone),
          meals:meal_plan_meals(
            *,
            items:meal_items(
              *,
              food:foods!meal_items_food_id_fkey(id, name, energy_kcal, protein_g, carbohydrate_g, lipid_g, fiber_g),
              measure:food_measures!meal_items_measure_id_fkey(id, measure_name, grams, is_default)
            )
          )
        `)
        .eq('id', planId)
        .single();
      
      if (error) throw error;
      return data as MealPlanWithDetails;
    },
    enabled: !!planId
  });
}

export function useCreateMealPlan() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenantId();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: CreateMealPlanInput) => {
      if (!tenantId) throw new Error('Tenant ID not found');

      // 1. Criar plano
      const { data: plan, error: planError } = await supabase
        .from('meal_plans')
        .insert({
          tenant_id: tenantId,
          client_id: data.clientId,
          name: data.name,
          start_date: data.startDate,
          end_date: data.endDate || null,
          goal: data.goal || null,
          target_kcal: data.targetKcal || null,
          target_protein: data.targetProtein || null,
          target_carbs: data.targetCarbs || null,
          target_fats: data.targetFats || null,
          notes: data.notes || null,
          status: 'ativo'
        })
        .select()
        .single();
      
      if (planError) throw planError;
      
      // 2. Criar refeições
      if (data.meals.length > 0) {
        const { error: mealsError } = await supabase
          .from('meal_plan_meals')
          .insert(
            data.meals.map((meal) => ({
              meal_plan_id: plan.id,
              name: meal.name,
              time: meal.time || null,
              order_index: meal.orderIndex
            }))
          );
        
        if (mealsError) throw mealsError;
      }
      
      return plan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
      toast({
        title: 'Plano criado com sucesso!',
        description: 'O plano alimentar foi criado.',
      });
    },
    onError: (error: any) => {
      console.error('Erro ao criar plano:', error);
      toast({
        title: 'Erro ao criar plano',
        description: error.message || 'Ocorreu um erro ao criar o plano alimentar',
        variant: 'destructive'
      });
    }
  });
}

export function useAddMealItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: AddMealItemInput) => {
      // Buscar o order_index atual
      const { data: existingItems } = await supabase
        .from('meal_items')
        .select('id')
        .eq('meal_id', data.mealId);

      const orderIndex = existingItems?.length || 0;

      const { data: item, error } = await supabase
        .from('meal_items')
        .insert({
          meal_id: data.mealId,
          food_id: data.foodId,
          measure_id: data.measureId || null,
          quantity: data.quantity,
          grams_total: data.macros.gramsTotal,
          kcal_total: data.macros.kcalTotal,
          protein_total: data.macros.proteinTotal,
          carb_total: data.macros.carbTotal,
          fat_total: data.macros.fatTotal
        })
        .select()
        .single();
      
      if (error) throw error;
      return item;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plan'] });
      toast({
        title: 'Alimento adicionado!',
        description: 'O alimento foi adicionado à refeição.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao adicionar alimento',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
}

export function useUpdateMealPlan() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<MealPlan> }) => {
      const { data, error } = await supabase
        .from('meal_plans')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
      queryClient.invalidateQueries({ queryKey: ['meal-plan'] });
      toast({
        title: 'Plano atualizado!',
        description: 'As alterações foram salvas.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar plano',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
}

export function useDuplicateMealPlan() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenantId();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (planId: string) => {
      if (!tenantId) throw new Error('Tenant ID not found');

      // 1. Buscar plano original completo
      const { data: originalPlan, error: fetchError } = await supabase
        .from('meal_plans')
        .select(`
          *,
          meals:meal_plan_meals(
            *,
            items:meal_items(*)
          )
        `)
        .eq('id', planId)
        .single();
      
      if (fetchError) throw fetchError;

      // 2. Criar novo plano
      const today = new Date().toISOString().split('T')[0];
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);
      
      const { data: newPlan, error: planError } = await supabase
        .from('meal_plans')
        .insert({
          tenant_id: tenantId,
          client_id: originalPlan.client_id,
          name: `${originalPlan.name} (Cópia)`,
          start_date: today,
          end_date: endDate.toISOString().split('T')[0],
          goal: originalPlan.goal,
          target_kcal: originalPlan.target_kcal,
          target_protein: originalPlan.target_protein,
          target_carbs: originalPlan.target_carbs,
          target_fats: originalPlan.target_fats,
          notes: originalPlan.notes,
          status: 'ativo'
        })
        .select()
        .single();
      
      if (planError) throw planError;

      // 3. Copiar refeições
      if (originalPlan.meals && originalPlan.meals.length > 0) {
        const { data: newMeals, error: mealsError } = await supabase
          .from('meal_plan_meals')
          .insert(
            originalPlan.meals.map((meal: any) => ({
              meal_plan_id: newPlan.id,
              name: meal.name,
              time: meal.time,
              order_index: meal.order_index
            }))
          )
          .select();
        
        if (mealsError) throw mealsError;

        // 4. Copiar itens de cada refeição
        for (let i = 0; i < originalPlan.meals.length; i++) {
          const originalMeal = originalPlan.meals[i];
          const newMeal = newMeals[i];
          
          if (originalMeal.items && originalMeal.items.length > 0) {
            const { error: itemsError } = await supabase
              .from('meal_items')
              .insert(
                originalMeal.items.map((item: any) => ({
                  meal_id: newMeal.id,
                  food_id: item.food_id,
                  measure_id: item.measure_id,
                  quantity: item.quantity,
                  grams_total: item.grams_total,
                  kcal_total: item.kcal_total,
                  protein_total: item.protein_total,
                  carb_total: item.carb_total,
                  fat_total: item.fat_total,
                  notes: item.notes
                }))
              );
            
            if (itemsError) throw itemsError;
          }
        }
      }
      
      return newPlan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
      toast({
        title: 'Plano duplicado!',
        description: 'O plano foi duplicado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao duplicar plano',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
}

export function useDeleteMealPlan() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (planId: string) => {
      const { error } = await supabase
        .from('meal_plans')
        .delete()
        .eq('id', planId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
      toast({
        title: 'Plano excluído!',
        description: 'O plano foi removido com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir plano',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
}

export function useFoodSearch(searchTerm: string) {
  return useQuery({
    queryKey: ['foods-search', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) {
        return [];
      }
      
      const { data, error } = await supabase
        .from('foods')
        .select('id, name, energy_kcal, protein_g, carbohydrate_g, lipid_g, category')
        .eq('active', true)
        .ilike('name', `%${searchTerm}%`)
        .limit(20);
      
      if (error) throw error;
      return data || [];
    },
    enabled: searchTerm.length >= 2,
    staleTime: 5 * 60 * 1000 // 5 minutos
  });
}

export function useFoodMeasuresData(foodId: string | null) {
  return useQuery({
    queryKey: ['food-measures', foodId],
    queryFn: async () => {
      if (!foodId) return [];

      const { data, error } = await supabase
        .from('food_measures')
        .select('*')
        .eq('food_id', foodId)
        .order('is_default', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!foodId
  });
}

export function useRemoveMealItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('meal_items')
        .delete()
        .eq('id', itemId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plan'] });
      toast({
        title: 'Item removido!',
        description: 'O alimento foi removido da refeição.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao remover item',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
}
