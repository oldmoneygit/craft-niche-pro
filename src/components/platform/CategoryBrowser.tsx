import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (isOpen) {
      supabase
        .from('foods')
        .select('nutrition_sources(code)')
        .limit(100)
        .then(({ data }) => {
          const uniqueSources = [...new Set(data?.map(d => d.nutrition_sources?.code).filter(Boolean))];
          console.log('🔍 VALORES REAIS do campo nutrition_sources.code no banco:', uniqueSources);
        });
    }
  }, [isOpen]);

  const { data: categories } = useQuery({
    queryKey: ['food-categories-count', sourceFilter],
    queryFn: async () => {
      let query = supabase.from('foods').select('food_categories(name), nutrition_sources!inner(code)');

      if (sourceFilter === 'TACO') {
        query = query.or('nutrition_sources.code.eq.taco,nutrition_sources.code.eq.tbca');
      } else if (sourceFilter === 'OpenFoodFacts') {
        query = query.eq('nutrition_sources.code', 'openfoodfacts');
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar categorias:', error);
      }

      console.log('📊 Filtro:', sourceFilter, '- Dados retornados:', data?.length, 'alimentos');
      if (data && data.length > 0) {
        const uniqueSources = [...new Set(data.map((d: any) => d.nutrition_sources?.code))];
        console.log('📊 Fontes únicas:', uniqueSources);
      }

      const counts: Record<string, number> = {};
      data?.forEach((item: any) => {
        const categoryName = item.food_categories?.name;
        if (categoryName) {
          counts[categoryName] = (counts[categoryName] || 0) + 1;
        }
      });

      return Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
    },
    enabled: isOpen
  });

  const { data: categoryFoods, isLoading: loadingFoods } = useQuery({
    queryKey: ['category-foods-inline', selectedCategory, sourceFilter],
    queryFn: async () => {
      if (!selectedCategory) return [];

      const { data: categoryData } = await supabase
        .from('food_categories')
        .select('id')
        .eq('name', selectedCategory)
        .single();

      if (!categoryData) return [];

      let query = supabase
        .from('foods')
        .select('id, name, brand, energy_kcal, protein_g, carbohydrate_g, lipid_g, nutrition_sources!inner(name, code)')
        .eq('category_id', categoryData.id)
        .order('name')
        .limit(20);

      if (sourceFilter === 'TACO') {
        query = query.or('nutrition_sources.code.eq.taco,nutrition_sources.code.eq.tbca');
      } else if (sourceFilter === 'OpenFoodFacts') {
        query = query.eq('nutrition_sources.code', 'openfoodfacts');
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar alimentos da categoria:', error);
      }

      console.log('🍎 Alimentos da categoria:', selectedCategory, '- Filtro:', sourceFilter, '- Resultados:', data?.length);

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
