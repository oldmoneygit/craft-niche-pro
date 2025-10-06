import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
        .ilike('name', `%${searchTerm}%`)
        .eq('active', true)
        .limit(20);
      
      if (error) throw error;
      
      // Mapear para o formato esperado
      return data?.map(food => ({
        id: food.id,
        name: food.name,
        calories: food.energy_kcal || 0,
        protein: food.protein_g || 0,
        carbs: food.carbohydrate_g || 0,
        fats: food.lipid_g || 0,
        category: food.category,
      })) || [];
    },
    enabled: searchTerm.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}
