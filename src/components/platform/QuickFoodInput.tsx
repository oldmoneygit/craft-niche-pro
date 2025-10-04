import { useState, useEffect, useRef } from 'react';
import { Search, Check, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface QuickFoodInputProps {
  onAdd: (item: {
    food_id: string;
    measure_id: string;
    quantity: number;
    grams_total: number;
    kcal_total: number;
    protein_total: number;
    carb_total: number;
    fat_total: number;
  }) => void;
  placeholder?: string;
  className?: string;
}

interface Food {
  id: string;
  name: string;
  brand?: string;
  energy_kcal: number;
  protein_g: number;
  carbohydrate_g: number;
  lipid_g: number;
  nutrition_sources?: {
    code: string;
    name: string;
  };
}

interface Measure {
  id: string;
  measure_name: string;
  grams: number;
  is_default: boolean;
}

export function QuickFoodInput({ onAdd, placeholder = "🔍 Digite o alimento (ex: arroz)...", className }: QuickFoodInputProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [selectedMeasure, setSelectedMeasure] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: foods = [] } = useQuery({
    queryKey: ['quick-food-search', searchTerm],
    queryFn: async () => {
      if (searchTerm.length < 2) return [];

      const term = searchTerm.trim().toLowerCase();

      // ETAPA 1: Busca exata prioritária (começa com o termo)
      const { data: exactMatches } = await supabase
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
        .ilike('name', `${term}%`)
        .eq('active', true)
        .order('source_id', { ascending: true })
        .order('name')
        .limit(20);

      // ETAPA 2: Se < 20 resultados, busca parcial
      if ((exactMatches?.length || 0) < 20) {
        const { data: partialMatches } = await supabase
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
          .not('name', 'ilike', `${term}%`)
          .eq('active', true)
          .order('source_id', { ascending: true })
          .order('name')
          .limit(20 - (exactMatches?.length || 0));

        return [...(exactMatches || []), ...(partialMatches || [])];
      }

      return exactMatches || [];
    },
    enabled: searchTerm.length >= 2 && !selectedFood
  });

  const { data: measures = [] } = useQuery({
    queryKey: ['food-measures', selectedFood?.id],
    queryFn: async () => {
      if (!selectedFood?.id) return [];

      const { data } = await supabase
        .from('food_measures')
        .select('id, measure_name, grams, is_default')
        .eq('food_id', selectedFood.id)
        .order('is_default', { ascending: false });

      return data || [];
    },
    enabled: !!selectedFood?.id
  });

  useEffect(() => {
    if (measures.length > 0 && !selectedMeasure) {
      const defaultMeasure = measures.find(m => m.is_default) || measures[0];
      setSelectedMeasure(defaultMeasure.id);
    }
  }, [measures, selectedMeasure]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectFood = (food: Food) => {
    setSelectedFood(food);
    setShowSuggestions(false);
    setSearchTerm('');
  };

  const handleSave = () => {
    if (!selectedFood || !selectedMeasure) return;

    const measure = measures.find(m => m.id === selectedMeasure);
    if (!measure) return;

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) return;

    const gramsTotal = measure.grams * qty;
    const multiplier = gramsTotal / 100;

    const item = {
      food_id: selectedFood.id,
      measure_id: measure.id,
      quantity: qty,
      grams_total: gramsTotal,
      kcal_total: (selectedFood.energy_kcal || 0) * multiplier,
      protein_total: (selectedFood.protein_g || 0) * multiplier,
      carb_total: (selectedFood.carbohydrate_g || 0) * multiplier,
      fat_total: (selectedFood.lipid_g || 0) * multiplier
    };

    onAdd(item);
    handleCancel();
  };

  const handleCancel = () => {
    setSelectedFood(null);
    setSelectedMeasure('');
    setQuantity('1');
    setSearchTerm('');
    inputRef.current?.focus();
  };

  const getBadgeConfig = (source?: { code: string }) => {
    const code = source?.code?.toUpperCase() || 'OFF';

    if (code === 'TACO' || code === 'TBCA') {
      return { text: code, className: 'bg-green-600 text-white' };
    }
    if (code === 'USDA') {
      return { text: code, className: 'bg-blue-600 text-white' };
    }
    return { text: code, className: 'bg-gray-600 text-white' };
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {!selectedFood ? (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            className="pl-10 bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-400 focus:border-primary focus:ring-primary"
          />

          {showSuggestions && foods.length > 0 && (
            <div className="absolute z-50 mt-1 w-full bg-gray-800 border border-gray-700 rounded-md shadow-xl max-h-96 overflow-y-auto">
              {foods.map((food) => {
                const badge = getBadgeConfig(food.nutrition_sources);
                return (
                  <button
                    key={food.id}
                    onClick={() => handleSelectFood(food)}
                    className="w-full px-3 py-2 text-left bg-gray-800 hover:bg-gray-700 transition-colors flex items-center justify-between gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate text-gray-100">{food.name}</div>
                      {food.brand && (
                        <div className="text-xs text-gray-400 truncate">{food.brand}</div>
                      )}
                    </div>
                    <Badge className={cn("text-xs flex-shrink-0", badge.className)}>
                      {badge.text}
                    </Badge>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2 p-3 border border-gray-700 rounded-lg bg-gray-800">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-100">{selectedFood.name}</div>
              {selectedFood.brand && (
                <div className="text-xs text-gray-400">{selectedFood.brand}</div>
              )}
            </div>
            <Badge className={cn("text-xs flex-shrink-0", getBadgeConfig(selectedFood.nutrition_sources).className)}>
              {getBadgeConfig(selectedFood.nutrition_sources).text}
            </Badge>
          </div>

          <div className="grid grid-cols-[1fr_100px_auto] gap-2 items-end">
            <div className="space-y-1">
              <label className="text-xs text-gray-400">Medida</label>
              <Select value={selectedMeasure} onValueChange={setSelectedMeasure}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {measures.map((measure) => (
                    <SelectItem key={measure.id} value={measure.id}>
                      {measure.measure_name} ({measure.grams}g)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400">Qtd</label>
              <Input
                type="number"
                min="0.1"
                step="0.1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave();
                  if (e.key === 'Escape') handleCancel();
                }}
                className="bg-gray-700 border-gray-600 text-gray-100"
              />
            </div>

            <div className="flex gap-1">
              <Button
                size="icon"
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={handleCancel}
                className="border-gray-600 text-gray-100 hover:bg-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
