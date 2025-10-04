import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useFoodMeasures(foodId: string) {
  return useQuery({
    queryKey: ['food-measures', foodId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('food_measures')
        .select('id, measure_name, grams, is_default')
        .eq('food_id', foodId)
        .order('is_default', { ascending: false })
        .order('measure_name');

      if (error) {
        console.error('Erro ao buscar medidas:', error);
        return [];
      }

      if (!data || data.length === 0) {
        console.warn(`Nenhuma medida encontrada para food_id: ${foodId}`);
      }

      return data || [];
    },
    enabled: !!foodId
  });
}
