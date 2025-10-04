import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { QuickPortionDialog } from './QuickPortionDialog';

interface InlineFoodSearchProps {
  onAddFood: (item: any) => void;
  placeholder?: string;
}

export const InlineFoodSearch = ({ onAddFood, placeholder = "Buscar alimento..." }: InlineFoodSearchProps) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [sourceFilter, setSourceFilter] = useState<'all' | 'TACO' | 'OFF'>('all');
  const [sourceIds, setSourceIds] = useState<{ taco: string[], off: string[] }>({ taco: [], off: [] });
  const [showCategories, setShowCategories] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [categoryResults, setCategoryResults] = useState<any[]>([]);
  const [isSearchingCategory, setIsSearchingCategory] = useState(false);
  const [allFoods, setAllFoods] = useState<any[]>([]);
  const [displayLimit, setDisplayLimit] = useState(50);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const categories = [
    { icon: '🌾', name: 'Cereais', searchTerms: ['arroz', 'macarrão', 'pão', 'trigo', 'aveia'] },
    { icon: '🍖', name: 'Carnes', searchTerms: ['frango', 'carne', 'porco', 'boi', 'peru'] },
    { icon: '🍎', name: 'Frutas', searchTerms: ['banana', 'maçã', 'laranja', 'morango', 'mamão'] },
    { icon: '🥛', name: 'Leite', searchTerms: ['leite', 'iogurte', 'queijo', 'requeijão'] },
    { icon: '🥬', name: 'Verduras', searchTerms: ['alface', 'couve', 'brócolis', 'espinafre'] },
    { icon: '🥕', name: 'Legumes', searchTerms: ['tomate', 'cenoura', 'batata', 'cebola'] },
    { icon: '🐟', name: 'Peixes', searchTerms: ['peixe', 'salmão', 'tilápia', 'atum'] },
    { icon: '🥚', name: 'Ovos', searchTerms: ['ovo'] },
    { icon: '🫘', name: 'Leguminosas', searchTerms: ['feijão', 'lentilha', 'grão', 'soja'] },
    { icon: '🥜', name: 'Oleaginosas', searchTerms: ['castanha', 'amendoim', 'nozes'] },
    { icon: '🍯', name: 'Açúcares', searchTerms: ['açúcar', 'mel', 'doce'] },
    { icon: '🧈', name: 'Gorduras', searchTerms: ['azeite', 'óleo', 'manteiga', 'margarina'] }
  ];

  const normalizeSearchTerm = (term: string): string => {
    return term
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[,.-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const buildSearchPattern = (term: string): string[] => {
    const normalized = normalizeSearchTerm(term);
    const words = normalized.split(' ').filter(w => w.length >= 2);

    const patterns = [
      `%${words.join('%')}%`,
      ...words.map(w => `%${w}%`)
    ];

    return patterns;
  };

  const getPriority = (code: string | undefined): number => {
    if (!code) return 999;
    const lowerCode = code.toLowerCase();
    if (lowerCode === 'taco') return 1;
    if (lowerCode === 'tbca') return 2;
    if (lowerCode === 'usda') return 3;
    return 999;
  };

  const getBadgeConfig = (source?: { code: string; name: string }) => {
    const code = source?.code?.toUpperCase() || 'OFF';

    if (code === 'TACO' || code === 'TBCA') {
      return { text: code, className: 'bg-green-600 text-white' };
    }
    if (code === 'USDA') {
      return { text: code, className: 'bg-blue-600 text-white' };
    }
    if (code === 'IBGE') {
      return { text: code, className: 'bg-orange-600 text-white' };
    }
    if (code === 'CUSTOM') {
      return { text: code, className: 'bg-purple-600 text-white' };
    }
    return { text: code, className: 'bg-secondary text-secondary-foreground' };
  };

  const handleCategoryClick = async (category: typeof categories[0]) => {
    setIsSearchingCategory(true);
    setActiveCategory(category.name);
    setShowCategories(false);
    setQuery('');

    try {
      let allResults: any[] = [];

      for (const term of category.searchTerms) {
        const searchQuery = supabase
          .from('foods')
          .select(`
            id,
            name,
            brand,
            energy_kcal,
            protein_g,
            carbohydrate_g,
            lipid_g,
            source_id,
            nutrition_sources(code, name)
          `)
          .ilike('name', `%${term}%`)
          .eq('active', true)
          .limit(20);

        const { data } = await searchQuery;
        if (data) allResults = [...allResults, ...data];
      }

      if (sourceFilter === 'TACO') {
        allResults = allResults.filter(f =>
          sourceIds.taco.includes(f.source_id)
        );
      } else if (sourceFilter === 'OFF') {
        allResults = allResults.filter(f =>
          sourceIds.off.includes(f.source_id)
        );
      }

      const uniqueResults = Array.from(
        new Map(allResults.map(item => [item.id, item])).values()
      );

      const sorted = uniqueResults.sort((a, b) => {
        const priorityA = getPriority(a.nutrition_sources?.code);
        const priorityB = getPriority(b.nutrition_sources?.code);

        if (priorityA !== priorityB) return priorityA - priorityB;
        return a.name.localeCompare(b.name);
      });

      setCategoryResults(sorted);
      setIsOpen(true);
    } catch (error) {
      console.error('Erro ao buscar categoria:', error);
    } finally {
      setIsSearchingCategory(false);
    }
  };

  const handleClearCategory = () => {
    setActiveCategory(null);
    setCategoryResults([]);
    setShowCategories(true);
    setIsOpen(false);
    setQuery('');
  };

  useEffect(() => {
    const loadSourceIds = async () => {
      try {
        const { data: sources } = await supabase
          .from('nutrition_sources')
          .select('id, code');

        if (sources) {
          const tacoIds = sources
            .filter(s => ['taco', 'tbca'].includes(s.code.toLowerCase()))
            .map(s => s.id);

          const offIds = sources
            .filter(s => ['openfoodfacts', 'off'].includes(s.code.toLowerCase()))
            .map(s => s.id);

          setSourceIds({ taco: tacoIds, off: offIds });
          console.log('📋 Source IDs carregados:', { tacoIds, offIds });
        }
      } catch (error) {
        console.error('Erro ao carregar source IDs:', error);
      }
    };

    loadSourceIds();
  }, []);

  useEffect(() => {
    const loadAllFoods = async () => {
      try {
        console.log('🔄 Carregando todos os alimentos com filtro:', sourceFilter);

        let foodsQuery = supabase
          .from('foods')
          .select(`
            id,
            name,
            brand,
            energy_kcal,
            protein_g,
            carbohydrate_g,
            lipid_g,
            source_id,
            nutrition_sources(code, name)
          `)
          .eq('active', true);

        if (sourceFilter === 'TACO' && sourceIds.taco.length > 0) {
          foodsQuery = foodsQuery.in('source_id', sourceIds.taco);
          console.log('🔍 Filtrando por TACO/TBCA IDs:', sourceIds.taco);
        } else if (sourceFilter === 'OFF' && sourceIds.off.length > 0) {
          foodsQuery = foodsQuery.in('source_id', sourceIds.off);
          console.log('🔍 Filtrando por OFF IDs:', sourceIds.off);
        }

        const { data, error } = await foodsQuery.order('name');

        console.log('📊 Query resultado:', {
          total: data?.length,
          error: error?.message,
          sample: data?.[0]
        });

        if (error) throw error;

        const sorted = (data || []).sort((a, b) => {
          const priorityA = getPriority(a.nutrition_sources?.code);
          const priorityB = getPriority(b.nutrition_sources?.code);

          if (priorityA !== priorityB) return priorityA - priorityB;
          return a.name.localeCompare(b.name);
        });

        setAllFoods(sorted);
        console.log(`✅ Carregados ${sorted.length} alimentos`);
      } catch (error) {
        console.error('❌ Erro ao carregar alimentos:', error);
      }
    };

    if (sourceFilter === 'all' || sourceIds.taco.length > 0 || sourceIds.off.length > 0) {
      loadAllFoods();
    }
  }, [sourceFilter, sourceIds]);

  const { data: results, isLoading } = useQuery({
    queryKey: ['inline-food-search', query, sourceFilter],
    queryFn: async () => {
      if (query.length < 2) return [];

      console.log('🔍 Buscando:', query, '- Filtro:', sourceFilter);

      const patterns = buildSearchPattern(query);
      console.log('📝 Padrões de busca:', patterns);

      const searches = await Promise.all(
        patterns.map(async (pattern) => {
          const searchQuery = supabase
            .from('foods')
            .select(`
              id,
              name,
              brand,
              energy_kcal,
              protein_g,
              carbohydrate_g,
              lipid_g,
              source_id,
              nutrition_sources(code, name)
            `)
            .or(`name.ilike.${pattern},brand.ilike.${pattern}`)
            .eq('active', true)
            .limit(30);

          const { data } = await searchQuery;
          return data || [];
        })
      );

      const allResults = searches.flat();
      const uniqueResults = Array.from(
        new Map(allResults.map(item => [item.id, item])).values()
      );

      let filtered = uniqueResults;

      if (sourceFilter === 'TACO') {
        filtered = filtered.filter(f =>
          sourceIds.taco.includes(f.source_id)
        );
      } else if (sourceFilter === 'OFF') {
        filtered = filtered.filter(f =>
          sourceIds.off.includes(f.source_id)
        );
      }

      const sorted = filtered.sort((a, b) => {
        const priorityA = getPriority(a.nutrition_sources?.code);
        const priorityB = getPriority(b.nutrition_sources?.code);

        if (priorityA !== priorityB) return priorityA - priorityB;

        const normalizedQuery = normalizeSearchTerm(query);
        const queryWords = normalizedQuery.split(' ');

        const scoreA = queryWords.filter(word =>
          normalizeSearchTerm(a.name).includes(word)
        ).length;

        const scoreB = queryWords.filter(word =>
          normalizeSearchTerm(b.name).includes(word)
        ).length;

        if (scoreA !== scoreB) return scoreB - scoreA;

        return a.name.localeCompare(b.name);
      });

      console.log('✅ Resultados:', sorted.length);
      console.log('📊 Distribuição:', {
        TACO: sorted.filter(r => r.nutrition_sources?.code?.toLowerCase() === 'taco').length,
        TBCA: sorted.filter(r => r.nutrition_sources?.code?.toLowerCase() === 'tbca').length,
        Outros: sorted.filter(r => {
          const code = r.nutrition_sources?.code?.toLowerCase();
          return code && code !== 'taco' && code !== 'tbca';
        }).length,
        SemFonte: sorted.filter(r => !r.nutrition_sources?.code).length
      });

      return sorted;
    },
    enabled: query.length >= 2
  });

  useEffect(() => {
    const handleScroll = () => {
      if (!resultsRef.current || query.length >= 2) return;

      const { scrollTop, scrollHeight, clientHeight } = resultsRef.current;
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

      if (scrollPercentage > 0.8 && !isLoadingMore && displayLimit < allFoods.length) {
        setIsLoadingMore(true);
        setTimeout(() => {
          setDisplayLimit(prev => Math.min(prev + 50, allFoods.length));
          setIsLoadingMore(false);
        }, 300);
      }
    };

    const ref = resultsRef.current;
    ref?.addEventListener('scroll', handleScroll);
    return () => ref?.removeEventListener('scroll', handleScroll);
  }, [displayLimit, allFoods.length, isLoadingMore, query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }

      if (e.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderFoodItem = (food: any) => {
    const sourceCode = food.nutrition_sources?.code?.toLowerCase();
    const isTACO = sourceCode === 'taco' || sourceCode === 'tbca';
    const badgeConfig = getBadgeConfig(food.nutrition_sources);

    return (
      <button
        key={food.id}
        onClick={() => {
          setSelectedFood(food);
          setIsOpen(false);
        }}
        className={cn(
          "w-full p-3 text-left hover:bg-muted transition-colors border-b last:border-0 group",
          isTACO && "bg-green-50/50 dark:bg-green-950/10"
        )}
      >
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {isTACO && <span className="text-xs">🇧🇷</span>}
              <p className="font-medium truncate group-hover:text-primary transition-colors text-sm">
                {food.name}
              </p>
              <Badge
                className={cn(
                  "flex-shrink-0 text-xs",
                  badgeConfig.className
                )}
              >
                {badgeConfig.text}
              </Badge>
            </div>
            {food.brand && (
              <p className="text-xs text-muted-foreground mb-1 truncate">
                {food.brand}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {food.energy_kcal} kcal |
              P: {food.protein_g?.toFixed(1)}g |
              C: {food.carbohydrate_g?.toFixed(1)}g |
              G: {food.lipid_g?.toFixed(1)}g
            </p>
          </div>
        </div>
      </button>
    );
  };

  return (
    <>
      <div className="relative space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground flex-shrink-0">Filtrar:</span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setSourceFilter('all')}
              className={cn(
                "px-2.5 py-1 rounded text-xs font-medium transition-all",
                sourceFilter === 'all'
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 hover:bg-muted text-muted-foreground"
              )}
            >
              Todas
            </button>
            <button
              onClick={() => setSourceFilter('TACO')}
              className={cn(
                "px-2.5 py-1 rounded text-xs font-medium transition-all",
                sourceFilter === 'TACO'
                  ? "bg-green-600 text-white"
                  : "bg-muted/50 hover:bg-muted text-muted-foreground"
              )}
            >
              TACO/TBCA
            </button>
            <button
              onClick={() => setSourceFilter('OFF')}
              className={cn(
                "px-2.5 py-1 rounded text-xs font-medium transition-all",
                sourceFilter === 'OFF'
                  ? "bg-blue-600 text-white"
                  : "bg-muted/50 hover:bg-muted text-muted-foreground"
              )}
            >
              OFF
            </button>
          </div>
        </div>

        {showCategories && !activeCategory && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Navegar por Categorias
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCategories(false)}
                className="h-6 text-xs px-2"
              >
                Ocultar
              </Button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => handleCategoryClick(category)}
                  disabled={isSearchingCategory}
                  className={cn(
                    "flex flex-col items-center gap-1 p-3 rounded-lg border transition-all",
                    "hover:border-primary hover:bg-primary/5 hover:shadow-sm",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    activeCategory === category.name
                      ? "border-primary bg-primary/10"
                      : "border-border"
                  )}
                >
                  <span className="text-2xl">{category.icon}</span>
                  <span className="text-xs font-medium text-center leading-tight">
                    {category.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {!showCategories && !activeCategory && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCategories(true)}
            className="w-full text-xs h-8"
          >
            Mostrar Categorias
          </Button>
        )}

        {activeCategory && (
          <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {categories.find(c => c.name === activeCategory)?.icon}
              </span>
              <span className="text-sm font-medium">
                {activeCategory}
                {categoryResults.length > 0 && (
                  <span className="text-muted-foreground ml-1">
                    ({categoryResults.length} alimentos)
                  </span>
                )}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearCategory}
              className="h-7 text-xs"
            >
              Voltar para categorias
            </Button>
          </div>
        )}

        <div className={cn(
          "flex items-center gap-3 border-2 rounded-lg p-4 transition-all",
          "bg-gradient-to-r from-primary/5 to-primary/10",
          "border-primary/30 hover:border-primary/50",
          "focus-within:bg-background focus-within:ring-2 focus-within:ring-primary focus-within:border-primary",
          "shadow-sm hover:shadow-md"
        )}>
          <Search className="w-5 h-5 text-primary flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              if (e.target.value.length >= 2) {
                setShowCategories(false);
                setActiveCategory(null);
                setCategoryResults([]);
              } else if (e.target.value.length === 0) {
                setActiveCategory(null);
                setCategoryResults([]);
              }
            }}
            onFocus={() => setIsOpen(true)}
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground font-medium"
            data-food-search
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setIsOpen(false);
              }}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="h-6 w-px bg-border" />
            <kbd className="hidden sm:inline-flex px-2 py-1 text-xs bg-background/80 border rounded font-mono shadow-sm">
              ⌘K
            </kbd>
          </div>
        </div>

        {(isOpen && ((query.length >= 2 && results) || (activeCategory && categoryResults.length > 0) || (query.length === 0 && allFoods.length > 0))) && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg max-h-[400px] z-50 animate-in fade-in-0 zoom-in-95 flex flex-col"
          >
            <div ref={resultsRef} className="overflow-auto flex-1">
            {(isLoading || isSearchingCategory) ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                Buscando alimentos...
              </div>
            ) : query.length === 0 && allFoods.length > 0 ? (
              <>
                <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b px-3 py-2 z-10">
                  <p className="text-xs text-muted-foreground">
                    Mostrando {Math.min(displayLimit, allFoods.length)} de {allFoods.length} alimentos
                  </p>
                </div>
                {allFoods.slice(0, displayLimit).map((food) => renderFoodItem(food))}
                {isLoadingMore && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                  </div>
                )}
                {displayLimit >= allFoods.length && allFoods.length > 50 && (
                  <div className="p-3 text-center text-xs text-muted-foreground border-t">
                    Todos os alimentos carregados
                  </div>
                )}
              </>
            ) : (activeCategory && categoryResults.length > 0) ? (
              categoryResults.map((food) => renderFoodItem(food))
            ) : results && results.length > 0 ? (
              results.map((food) => renderFoodItem(food))
            ) : (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Nenhum alimento encontrado para "{query}"
              </div>
            )}
            </div>
          </div>
        )}
      </div>

      {selectedFood && (
        <QuickPortionDialog
          food={selectedFood}
          isOpen={!!selectedFood}
          onClose={() => setSelectedFood(null)}
          onConfirm={(item) => {
            onAddFood(item);
            setSelectedFood(null);
            setQuery('');
          }}
        />
      )}
    </>
  );
};
