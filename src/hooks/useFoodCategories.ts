import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useFoodCategories(source: string | null) {
  return useQuery({
    queryKey: ['food-categories', source],
    queryFn: async () => {
      if (!source) return [];
      
      const { data, error } = await supabase
        .from('foods')
        .select('category')
        .eq('source', source)
        .eq('active', true)
        .not('category', 'is', null);
      
      if (error) throw error;
      
      // Extrair categorias únicas
      const uniqueCategories = [...new Set(data?.map(item => item.category).filter(Boolean))];
      return uniqueCategories.sort();
    },
    enabled: !!source,
    staleTime: 30 * 60 * 1000, // 30 minutos
  });
}
