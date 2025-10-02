import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
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
  const [sourceFilter, setSourceFilter] = useState<'all' | 'TACO' | 'OpenFoodFacts'>('all');
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const { data: results, isLoading } = useQuery({
    queryKey: ['inline-food-search', query, sourceFilter],
    queryFn: async () => {
      if (query.length < 2) return [];

      console.log('🔍 Buscando:', query, '- Filtro:', sourceFilter);

      const patterns = buildSearchPattern(query);
      console.log('📝 Padrões de busca:', patterns);

      const searches = await Promise.all(
        patterns.map(async (pattern) => {
          let searchQuery = supabase
            .from('foods')
            .select('id, name, brand, energy_kcal, protein_g, carbohydrate_g, lipid_g, source, category')
            .or(`name.ilike.${pattern},brand.ilike.${pattern}`)
            .limit(20);

          if (sourceFilter === 'TACO') {
            searchQuery = searchQuery.or('source.ilike.%TACO%,source.ilike.%TBCA%');
          } else if (sourceFilter === 'OpenFoodFacts') {
            searchQuery = searchQuery.ilike('source', '%OpenFoodFacts%');
          }

          const { data } = await searchQuery;
          return data || [];
        })
      );

      const allResults = searches.flat();
      const uniqueResults = Array.from(
        new Map(allResults.map(item => [item.id, item])).values()
      );

      const sorted = uniqueResults.sort((a, b) => {
        const aIsTACO = a.source?.toLowerCase().includes('taco') || a.source?.toLowerCase().includes('tbca');
        const bIsTACO = b.source?.toLowerCase().includes('taco') || b.source?.toLowerCase().includes('tbca');

        if (aIsTACO && !bIsTACO) return -1;
        if (!aIsTACO && bIsTACO) return 1;

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

      const limited = sorted.slice(0, 10);

      console.log('✅ Resultados:', limited.length, '- Únicos de', uniqueResults.length);
      console.log('📊 Distribuição:', {
        TACO: limited.filter(r => r.source?.toLowerCase().includes('taco')).length,
        OFF: limited.filter(r => r.source?.toLowerCase().includes('openfood')).length
      });

      return limited;
    },
    enabled: query.length >= 2
  });

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
              TACO
            </button>
            <button
              onClick={() => setSourceFilter('OpenFoodFacts')}
              className={cn(
                "px-2.5 py-1 rounded text-xs font-medium transition-all",
                sourceFilter === 'OpenFoodFacts'
                  ? "bg-blue-600 text-white"
                  : "bg-muted/50 hover:bg-muted text-muted-foreground"
              )}
            >
              OFF
            </button>
          </div>
        </div>

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
            }}
            onFocus={() => query.length >= 2 && setIsOpen(true)}
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

        {isOpen && query.length >= 2 && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg max-h-[400px] overflow-auto z-50 animate-in fade-in-0 zoom-in-95"
          >
            {isLoading ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                Buscando alimentos...
              </div>
            ) : results && results.length > 0 ? (
              results.map((food) => {
                const isTACO = food.source?.toLowerCase().includes('taco') || food.source?.toLowerCase().includes('tbca');

                return (
                  <button
                    key={food.id}
                    onClick={() => {
                      setSelectedFood(food);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full p-3 text-left hover:bg-muted transition-colors border-b last:border-0 group",
                      isTACO && "bg-green-50 dark:bg-green-950/20"
                    )}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {isTACO && <span className="text-xs">🇧🇷</span>}
                          <p className="font-medium truncate group-hover:text-primary transition-colors">
                            {food.name}
                          </p>
                          <Badge
                            variant={isTACO ? 'default' : 'secondary'}
                            className="flex-shrink-0 text-xs"
                          >
                            {isTACO ? 'TACO' : 'OFF'}
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
              })
            ) : (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Nenhum alimento encontrado para "{query}"
              </div>
            )}
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
