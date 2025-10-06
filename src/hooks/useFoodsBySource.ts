import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useFoodsBySource(
  source: string | null, 
  category: string | null, 
  searchTerm: string = ''
) {
  return useQuery({
    queryKey: ['foods-by-source', source, category, searchTerm],
    queryFn: async () => {
      if (!source) return [];
      
      let query = supabase
        .from('foods')
        .select('id, name, energy_kcal, protein_g, carbohydrate_g, lipid_g, category, source')
        .eq('source', source)
        .eq('active', true);
      
      if (category) {
        query = query.eq('category', category);
      }

      if (searchTerm.length >= 2) {
        query = query.ilike('name', `%${searchTerm}%`);
      }
      
      const { data, error } = await query
        .order('name')
        .limit(1000); // Aumentado para 1000 alimentos
      
      if (error) throw error;
      
      return data?.map(food => ({
        id: food.id,
        name: food.name,
        calories: food.energy_kcal || 0,
        protein: food.protein_g || 0,
        carbs: food.carbohydrate_g || 0,
        fats: food.lipid_g || 0,
        category: food.category,
        source: food.source || 'TACO',
      })) || [];
    },
    enabled: !!source,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}
