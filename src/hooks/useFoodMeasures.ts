import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useFoodMeasures(foodId: string) {
  return useQuery({
    queryKey: ['food-measures', foodId],
    queryFn: async () => {
      const { data } = await supabase
        .from('food_measures')
        .select('id, measure_name, grams, is_default')
        .eq('food_id', foodId)
        .order('is_default', { ascending: false });

      return data || [];
    },
    enabled: !!foodId
  });
}
