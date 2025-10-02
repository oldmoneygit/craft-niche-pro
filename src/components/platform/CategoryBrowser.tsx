import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ChevronDown, ChevronRight, Grid3x3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatNutrient } from '@/lib/nutritionCalculations';

interface CategoryBrowserProps {
  onSelectFood: (food: any) => void;
}

export const CategoryBrowser = ({ onSelectFood }: CategoryBrowserProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState<'all' | 'TACO' | 'OpenFoodFacts'>('all');

  const { data: categories } = useQuery({
    queryKey: ['food-categories-count', sourceFilter],
    queryFn: async () => {
      console.log('🔍 Buscando categorias com filtro:', sourceFilter);

      let query = supabase.from('foods').select('category, source');

      if (sourceFilter === 'TACO') {
        query = query.or('source.ilike.%TACO%,source.ilike.%TBCA%');
      } else if (sourceFilter === 'OpenFoodFacts') {
        query = query.ilike('source', '%OpenFoodFacts%');
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Erro ao buscar categorias:', error);
        return [];
      }

      console.log('✅ Total de alimentos encontrados:', data?.length);
      console.log('✅ Primeiras 3 fontes:', data?.slice(0, 3).map(d => d.source));

      const counts: Record<string, number> = {};
      data?.forEach((item: any) => {
        if (item.category) {
          counts[item.category] = (counts[item.category] || 0) + 1;
        }
      });

      const result = Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      console.log('✅ Categorias encontradas:', result.length);

      return result;
    },
    enabled: isOpen
  });

  const { data: categoryFoods, isLoading: loadingFoods } = useQuery({
    queryKey: ['category-foods-inline', selectedCategory, sourceFilter],
    queryFn: async () => {
      if (!selectedCategory) return [];

      console.log('🔍 Buscando alimentos da categoria:', selectedCategory, 'com filtro:', sourceFilter);

      let query = supabase
        .from('foods')
        .select('id, name, brand, energy_kcal, protein_g, carbohydrate_g, lipid_g, source')
        .eq('category', selectedCategory)
        .order('name')
        .limit(20);

      if (sourceFilter === 'TACO') {
        query = query.or('source.ilike.%TACO%,source.ilike.%TBCA%');
      } else if (sourceFilter === 'OpenFoodFacts') {
        query = query.ilike('source', '%OpenFoodFacts%');
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Erro ao buscar alimentos:', error);
        return [];
      }

      console.log('✅ Alimentos encontrados:', data?.length);

      return data || [];
    },
    enabled: !!selectedCategory
  });

  const CATEGORY_ICONS: Record<string, string> = {
    'Cereais e Derivados': '🌾',
    'Frutas e derivados': '🍎',
    'Leite e derivados': '🥛',
    'Verduras, hortaliças e derivados': '🥬',
    'Leguminosas e derivados': '🌱',
    'Produtos açucarados': '🍯',
    'Bebidas (alcoólicas e não alcoólicas)': '🥤',
    'Carnes e Derivados': '🥩',
    'Ovos e derivados': '🥚',
    'Pescados e frutos do mar': '🐟',
    'Suplementos': '💊',
    'Alimentos preparados': '🍱',
    'Gorduras e óleos': '🧈',
    'Miscelâneas': '🍽️',
    'Nozes e sementes': '🥜',
    'Outros alimentos industrializados': '📦',
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div>
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            if (isOpen) setSelectedCategory(null);
          }}
          className={cn(
            "w-full flex items-center justify-between p-4 transition-colors",
            "hover:bg-muted/50",
            isOpen && "bg-muted/30 border-b"
          )}
        >
          <div className="flex items-center gap-3">
            <Grid3x3 className="w-5 h-5 text-primary" />
            <span className="font-medium">Navegar por Categorias</span>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {categories?.length || 0} categorias
              </Badge>
              {sourceFilter !== 'all' && (
                <Badge
                  variant={sourceFilter === 'TACO' ? 'default' : 'outline'}
                  className="text-xs"
                >
                  {sourceFilter === 'TACO' ? '🇧🇷 TACO' : '🌍 OFF'}
                </Badge>
              )}
            </div>
          </div>
          {isOpen ? (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          )}
        </button>

        {isOpen && (
          <div className="px-4 py-3 border-b bg-muted/10">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground flex-shrink-0">Fonte:</span>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => {
                    setSourceFilter('all');
                    setSelectedCategory(null);
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                    sourceFilter === 'all'
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  )}
                >
                  Todas as Tabelas
                </button>
                <button
                  onClick={() => {
                    setSourceFilter('TACO');
                    setSelectedCategory(null);
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                    sourceFilter === 'TACO'
                      ? "bg-green-600 text-white shadow-sm"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  )}
                >
                  Tabela TACO
                </button>
                <button
                  onClick={() => {
                    setSourceFilter('OpenFoodFacts');
                    setSelectedCategory(null);
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                    sourceFilter === 'OpenFoodFacts'
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  )}
                >
                  OpenFoodFacts
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
          <div className="max-h-[400px] overflow-y-auto">
            {categories?.map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={cn(
                  "w-full flex items-center justify-between p-3 transition-colors text-left",
                  "hover:bg-muted/50",
                  selectedCategory === category.name && "bg-primary/10 border-l-2 border-primary"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl flex-shrink-0">
                    {CATEGORY_ICONS[category.name] || '🍽️'}
                  </span>
                  <div>
                    <p className="font-medium text-sm">{category.name}</p>
                    <p className="text-xs text-muted-foreground">{category.count} alimentos</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>

          <div className="max-h-[400px] overflow-y-auto bg-muted/20">
            {!selectedCategory ? (
              <div className="flex items-center justify-center h-full p-8 text-center text-sm text-muted-foreground">
                Selecione uma categoria para ver os alimentos
              </div>
            ) : loadingFoods ? (
              <div className="flex items-center justify-center h-full p-8">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : categoryFoods && categoryFoods.length > 0 ? (
              <div className="divide-y">
                {categoryFoods.map((food) => (
                  <button
                    key={food.id}
                    onClick={() => onSelectFood(food)}
                    className="w-full p-3 text-left hover:bg-background transition-colors group"
                  >
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <p className="font-medium text-sm group-hover:text-primary transition-colors">
                        {food.name}
                      </p>
                      <Badge
                        variant={food.nutrition_sources?.code === 'taco' || food.nutrition_sources?.code === 'tbca' ? 'default' : 'secondary'}
                        className="text-xs flex-shrink-0"
                      >
                        {food.nutrition_sources?.code === 'taco' || food.nutrition_sources?.code === 'tbca' ? 'TACO' : 'OFF'}
                      </Badge>
                    </div>
                    {food.brand && (
                      <p className="text-xs text-muted-foreground mb-1">{food.brand}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {food.energy_kcal} kcal |
                      P: {formatNutrient(food.protein_g)} |
                      C: {formatNutrient(food.carbohydrate_g)} |
                      G: {formatNutrient(food.lipid_g)}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full p-8 text-center text-sm text-muted-foreground">
                Nenhum alimento encontrado nesta categoria
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
