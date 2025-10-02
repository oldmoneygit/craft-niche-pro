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

  const { data: results, isLoading } = useQuery({
    queryKey: ['inline-food-search', query, sourceFilter],
    queryFn: async () => {
      if (query.length < 2) return [];

      let searchQuery = supabase
        .from('foods')
        .select('id, name, brand, energy_kcal, protein_g, carbohydrate_g, lipid_g, food_categories(name), nutrition_sources(name, code)')
        .or(`name.ilike.%${query}%,brand.ilike.%${query}%`)
        .limit(10);

      if (sourceFilter === 'TACO') {
        searchQuery = searchQuery.or('nutrition_sources.code.eq.taco,nutrition_sources.code.eq.tbca');
      } else if (sourceFilter === 'OpenFoodFacts') {
        searchQuery = searchQuery.eq('nutrition_sources.code', 'openfoodfacts');
      }

      const { data } = await searchQuery;
      return data || [];
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
              results.map((food) => (
                <button
                  key={food.id}
                  onClick={() => {
                    setSelectedFood(food);
                    setIsOpen(false);
                  }}
                  className="w-full p-3 text-left hover:bg-muted transition-colors border-b last:border-0 group"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium truncate group-hover:text-primary transition-colors">
                          {food.name}
                        </p>
                        <Badge
                          variant={food.nutrition_sources?.code === 'taco' || food.nutrition_sources?.code === 'tbca' ? 'default' : 'secondary'}
                          className="flex-shrink-0 text-xs"
                        >
                          {food.nutrition_sources?.code === 'taco' || food.nutrition_sources?.code === 'tbca' ? 'TACO' : 'OFF'}
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
              ))
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
