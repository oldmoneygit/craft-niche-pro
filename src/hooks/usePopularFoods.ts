import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function usePopularFoods() {
  return useQuery({
    queryKey: ['popular-foods'],
    queryFn: async () => {
      // Buscar alimentos mais comuns da TACO primeiro
      const { data, error } = await supabase
        .from('foods')
        .select('id, name, energy_kcal, protein_g, carbohydrate_g, lipid_g, category, source')
        .eq('active', true)
        .in('name', [
          // Alimentos mais comuns do brasileiro
          'Arroz, integral, cozido',
          'Arroz, branco, cozido',
          'Feijão, preto, cozido',
          'Feijão, carioca, cozido',
          'Frango, peito, sem pele, cru',
          'Banana, prata',
          'Banana, nanica',
          'Ovo, de galinha, inteiro, cozido',
          'Batata, inglesa, cozida',
          'Batata, doce, cozida',
          'Macarrão, cozido',
          'Pão, francês',
          'Leite, vaca, integral',
          'Carne, bovina, alcatra, sem gordura, crua',
          'Tomate, cru',
          'Alface, crespa, crua',
        ])
        .order('name')
        .limit(20);
      
      if (error) throw error;
      
      // Mapear para o formato esperado e ordenar TACO primeiro
      const mappedData = data?.map(food => ({
        id: food.id,
        name: food.name,
        calories: food.energy_kcal || 0,
        protein: food.protein_g || 0,
        carbs: food.carbohydrate_g || 0,
        fats: food.lipid_g || 0,
        category: food.category,
        source: food.source || 'TACO',
      })) || [];

      // Ordenar: TACO primeiro, depois outros
      return mappedData.sort((a, b) => {
        if (a.source === 'TACO' && b.source !== 'TACO') return -1;
        if (a.source !== 'TACO' && b.source === 'TACO') return 1;
        return 0;
      });
    },
    staleTime: 30 * 60 * 1000, // 30 minutos
  });
}
