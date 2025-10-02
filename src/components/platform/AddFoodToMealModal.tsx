import { useState, useEffect } from 'react';
import { X, Search, Plus, Package, ArrowLeft, ChevronRight, Clock, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { calculateItemNutrition, formatNutrient } from '@/lib/nutritionCalculations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AddCustomFoodModal } from './AddCustomFoodModal';
import { FOOD_CATEGORIES } from '@/lib/foodCategories';
import { getCategoryIcon } from '@/components/icons/FoodCategoryIcons';
import { cn } from '@/lib/utils';
import { useTenantId } from '@/hooks/useTenantId';

type ModalView = 'categories' | 'recent' | 'category-list' | 'food-details' | 'add-portion';

interface FoodCategory {
  id: string;
  name: string;
  count: number;
  slug: string;
  db_category: any;
}

interface AddFoodToMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFood: (item: any) => void;
}

// Componente para histórico de uso do alimento
const FoodUsageHistory = ({ foodId }: { foodId: string }) => {
  const { data: usageCount } = useQuery({
    queryKey: ['food-usage', foodId],
    queryFn: async () => {
      const { count } = await supabase
        .from('meal_items')
        .select('*', { count: 'exact', head: true })
        .eq('food_id', foodId);
      return count || 0;
    },
  });

  if (!usageCount) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Histórico de Uso</p>
      <div className="flex items-center gap-2 text-sm">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">
          Usado <span className="font-medium text-foreground">{usageCount}</span> {usageCount === 1 ? 'vez' : 'vezes'} em planos alimentares
        </span>
      </div>
    </div>
  );
};

// Componente para alimentos similares
const SimilarFoods = ({ food }: { food: any }) => {
  const { data: similarFoods } = useQuery({
    queryKey: ['similar-foods', food.category, food.id],
    queryFn: async () => {
      if (!food.category) return [];
      
      const { data } = await supabase
        .from('foods')
        .select('id, name, energy_kcal, protein_g')
        .eq('category', food.category)
        .neq('id', food.id)
        .order('name')
        .limit(3);
      
      return data || [];
    },
  });

  if (!similarFoods || similarFoods.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Alimentos Similares</p>
      <div className="space-y-2">
        {similarFoods.map((similar) => (
          <div key={similar.id} className="flex justify-between items-center text-sm p-2 bg-muted/50 rounded">
            <span className="text-muted-foreground">{similar.name}</span>
            <span className="text-xs font-medium">{similar.energy_kcal} kcal</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente para observações do nutricionista
const NutritionistNotes = ({ foodId, initialNotes }: { foodId: string; initialNotes?: string }) => {
  const [notes, setNotes] = useState(initialNotes || '');
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('foods')
        .update({ nutritionist_notes: notes })
        .eq('id', foodId);

      if (error) throw error;

      toast({ description: 'Observações salvas com sucesso!' });
      setIsEditing(false);
    } catch (error) {
      toast({ 
        variant: 'destructive',
        description: 'Erro ao salvar observações' 
      });
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Observações do Nutricionista</p>
      {isEditing ? (
        <div className="space-y-2">
          <textarea
            className="w-full min-h-[80px] p-2 text-sm border rounded-md bg-background"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Adicione observações sobre este alimento..."
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave}>Salvar</Button>
            <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button>
          </div>
        </div>
      ) : (
        <div>
          {notes ? (
            <p className="text-sm text-muted-foreground">{notes}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">Nenhuma observação registrada</p>
          )}
          <Button size="sm" variant="ghost" className="mt-2" onClick={() => setIsEditing(true)}>
            {notes ? 'Editar' : 'Adicionar observações'}
          </Button>
        </div>
      )}
    </div>
  );
};

// Componente para detalhes do alimento
const FoodDetailsPopover = ({ food, onAddClick }: { food: any; onAddClick: () => void }) => {
  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="border-b pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{food.name}</h3>
            {food.brand && (
              <p className="text-sm text-muted-foreground">Marca: {food.brand}</p>
            )}
          </div>
          <Badge variant={food.source?.includes('TACO') ? 'default' : 'secondary'}>
            {food.source?.includes('TACO') ? 'TACO' : 'OFF'}
          </Badge>
        </div>
        {food.food_categories?.name && (
          <Badge variant="outline" className="mt-2">{food.food_categories.name}</Badge>
        )}
      </div>

      {/* Macros principais */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-muted rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Calorias</p>
          <p className="text-2xl font-bold">{food.energy_kcal?.toFixed(0) || '-'}</p>
          <p className="text-xs">kcal/100g</p>
        </div>
        <div className="bg-muted rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Proteína</p>
          <p className="text-2xl font-bold">{food.protein_g?.toFixed(1) || '-'}</p>
          <p className="text-xs">g/100g</p>
        </div>
      </div>

      {/* Grid nutricional completo */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Informação Nutricional (100g)</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>Carboidratos: <span className="font-medium">{food.carbohydrate_g?.toFixed(1) || '-'}g</span></div>
          <div>Gorduras: <span className="font-medium">{food.lipid_g?.toFixed(1) || '-'}g</span></div>
          <div>Fibras: <span className="font-medium">{food.fiber_g?.toFixed(1) || '-'}g</span></div>
          <div>Sódio: <span className="font-medium">{food.sodium_mg?.toFixed(0) || '-'}mg</span></div>
          {food.saturated_fat_g && (
            <div className="col-span-2">Gordura Saturada: <span className="font-medium">{food.saturated_fat_g.toFixed(1)}g</span></div>
          )}
        </div>
      </div>

      {/* Accordion com detalhes completos */}
      <Accordion type="single" collapsible>
        <AccordionItem value="details" className="border-none">
          <AccordionTrigger className="text-sm text-muted-foreground hover:text-foreground py-2">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Ver informações detalhadas
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-3">
            {/* 1. ALERTAS NUTRICIONAIS */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Alertas Nutricionais</p>
              {(() => {
                const alerts = [];
                if ((food.sodium_mg || 0) > 400) alerts.push({ type: 'warning', text: 'Alto teor de sódio', icon: '⚠️' });
                if ((food.sugar_g || 0) > 15) alerts.push({ type: 'warning', text: 'Alto teor de açúcar', icon: '⚠️' });
                if ((food.saturated_fat_g || 0) > 5) alerts.push({ type: 'warning', text: 'Alto teor de gordura saturada', icon: '⚠️' });
                if ((food.protein_g || 0) > 20) alerts.push({ type: 'success', text: 'Alto teor de proteína', icon: '✓' });
                if ((food.fiber_g || 0) > 6) alerts.push({ type: 'success', text: 'Alto teor de fibras', icon: '✓' });
                
                if (alerts.length === 0) return <p className="text-xs text-muted-foreground">Nenhum alerta nutricional</p>;
                
                return alerts.map((alert, i) => (
                  <div key={i} className={`flex items-center gap-2 text-sm ${alert.type === 'warning' ? 'text-orange-600' : 'text-green-600'}`}>
                    <span>{alert.icon}</span>
                    <span>{alert.text}</span>
                  </div>
                ));
              })()}
            </div>

            {/* 2. % VALOR DIÁRIO (VD) */}
            <div className="space-y-2">
              <p className="text-sm font-medium">% Valor Diário (100g)</p>
              <div className="grid gap-1 text-sm">
                {food.protein_g && <div className="flex justify-between"><span className="text-muted-foreground">Proteína:</span><span className="font-medium">{((food.protein_g / 75) * 100).toFixed(0)}% VD</span></div>}
                {food.carbohydrate_g && <div className="flex justify-between"><span className="text-muted-foreground">Carboidratos:</span><span className="font-medium">{((food.carbohydrate_g / 300) * 100).toFixed(0)}% VD</span></div>}
                {food.fiber_g && <div className="flex justify-between"><span className="text-muted-foreground">Fibras:</span><span className="font-medium">{((food.fiber_g / 25) * 100).toFixed(0)}% VD</span></div>}
                {food.sodium_mg && <div className="flex justify-between"><span className="text-muted-foreground">Sódio:</span><span className="font-medium">{((food.sodium_mg / 2400) * 100).toFixed(0)}% VD</span></div>}
              </div>
              <p className="text-xs text-muted-foreground italic">Baseado em dieta de 2000 kcal</p>
            </div>

            {/* 3. HISTÓRICO DE USO */}
            <FoodUsageHistory foodId={food.id} />

            {/* 4. ALIMENTOS SIMILARES */}
            <SimilarFoods food={food} />

            {/* 5. OBSERVAÇÕES DO NUTRICIONISTA */}
            <NutritionistNotes foodId={food.id} initialNotes={food.nutritionist_notes} />

            {/* Campos nutricionais detalhados */}
            <div className="space-y-2 pt-2 border-t">
              <p className="text-sm font-medium">Informações Adicionais</p>
              <div className="grid gap-2 text-sm">
                {food.energy_kcal && <div className="flex justify-between"><span className="text-muted-foreground">Energia:</span><span className="font-medium">{food.energy_kcal} kcal</span></div>}
                {food.energy_kj && <div className="flex justify-between"><span className="text-muted-foreground">Energia (kJ):</span><span className="font-medium">{food.energy_kj} kJ</span></div>}
                {food.water_g && <div className="flex justify-between"><span className="text-muted-foreground">Água:</span><span className="font-medium">{food.water_g}g</span></div>}
                {food.cholesterol_mg && <div className="flex justify-between"><span className="text-muted-foreground">Colesterol:</span><span className="font-medium">{food.cholesterol_mg}mg</span></div>}
                {food.calcium_mg && <div className="flex justify-between"><span className="text-muted-foreground">Cálcio:</span><span className="font-medium">{food.calcium_mg}mg</span></div>}
                {food.iron_mg && <div className="flex justify-between"><span className="text-muted-foreground">Ferro:</span><span className="font-medium">{food.iron_mg}mg</span></div>}
                {food.magnesium_mg && <div className="flex justify-between"><span className="text-muted-foreground">Magnésio:</span><span className="font-medium">{food.magnesium_mg}mg</span></div>}
                {food.phosphorus_mg && <div className="flex justify-between"><span className="text-muted-foreground">Fósforo:</span><span className="font-medium">{food.phosphorus_mg}mg</span></div>}
                {food.potassium_mg && <div className="flex justify-between"><span className="text-muted-foreground">Potássio:</span><span className="font-medium">{food.potassium_mg}mg</span></div>}
                {food.zinc_mg && <div className="flex justify-between"><span className="text-muted-foreground">Zinco:</span><span className="font-medium">{food.zinc_mg}mg</span></div>}
                {food.vitamin_a_mcg && <div className="flex justify-between"><span className="text-muted-foreground">Vitamina A:</span><span className="font-medium">{food.vitamin_a_mcg}mcg</span></div>}
                {food.vitamin_c_mg && <div className="flex justify-between"><span className="text-muted-foreground">Vitamina C:</span><span className="font-medium">{food.vitamin_c_mg}mg</span></div>}
                
                {/* Fonte */}
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">Fonte: {food.source}</p>
                  {food.barcode && <p className="text-xs text-muted-foreground">Código: {food.barcode}</p>}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Botão adicionar */}
      <Button 
        className="w-full" 
        size="lg"
        onClick={onAddClick}
      >
        Adicionar ao Plano
      </Button>
    </div>
  );
};

export const AddFoodToMealModal = ({ 
  isOpen, 
  onClose, 
  onAddFood 
}: AddFoodToMealModalProps) => {
  const { toast } = useToast();
  const { tenantId } = useTenantId();
  const [view, setView] = useState<ModalView>('categories');
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [nutritionalFilter, setNutritionalFilter] = useState<string | null>(null);
  const [substitutionSort, setSubstitutionSort] = useState('energy_kcal');
  const [measures, setMeasures] = useState<any[]>([]);
  const [selectedMeasure, setSelectedMeasure] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [showCustomFoodModal, setShowCustomFoodModal] = useState(false);

  // MAPEAMENTO DE ÍCONES COM EMOJIS
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

  // Reset ao fechar
  useEffect(() => {
    if (!isOpen) {
      setView('categories');
      setSelectedFood(null);
      setSelectedCategory(null);
      setSearchTerm('');
      setNutritionalFilter(null);
      setMeasures([]);
      setSelectedMeasure(null);
      setQuantity(1);
    }
  }, [isOpen]);

  // Query 1: Buscar categorias com contadores
  const { data: categoriesWithCount } = useQuery({
    queryKey: ['categories-with-count', sourceFilter],
    queryFn: async () => {
      // Buscar todos os alimentos ou filtrados por fonte
      let foodsQuery: any = supabase.from('foods').select('category');
      
      if (sourceFilter && sourceFilter !== 'all') {
        if (sourceFilter === 'TACO') {
          foodsQuery = foodsQuery.like('source', '%TACO%');
        } else {
          foodsQuery = foodsQuery.eq('source', sourceFilter);
        }
      }
      
      const foodsResult = await foodsQuery;
      const data = foodsResult.data;
      
      // Contar itens por categoria
      const counts: Record<string, number> = {};
      data?.forEach((item: any) => {
        if (item.category) {
          counts[item.category] = (counts[item.category] || 0) + 1;
        }
      });
      
      return Object.entries(counts)
        .map(([name, count]) => ({ 
          id: name,
          name, 
          count,
          slug: name.toLowerCase(),
          db_category: { name }
        }))
        .sort((a, b) => b.count - a.count);
    },
    enabled: isOpen,
  });

  // Query 1.5: Buscar alimentos recentes
  const { data: recentFoods } = useQuery({
    queryKey: ['recent-foods', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      
      // Buscar meal_items recentes do tenant
      const { data: mealItems } = await supabase
        .from('meal_items')
        .select(`
          food_id,
          created_at,
          meal_id,
          meal_plan_meals!inner (
            meal_plan_id,
            meal_plans!inner (
              tenant_id
            )
          )
        `)
        .eq('meal_plan_meals.meal_plans.tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (!mealItems || mealItems.length === 0) return [];
      
      // Remover duplicatas, mantendo o mais recente de cada food_id
      const uniqueFoodIds = new Set<string>();
      const uniqueItems = [];
      
      for (const item of mealItems) {
        if (!uniqueFoodIds.has(item.food_id)) {
          uniqueFoodIds.add(item.food_id);
          uniqueItems.push(item);
          if (uniqueItems.length >= 10) break;
        }
      }
      
      // Buscar detalhes dos alimentos
      const foodIds = uniqueItems.map(item => item.food_id);
      const { data: foods } = await supabase
        .from('foods')
        .select('*')
        .in('id', foodIds);
      
      // Ordenar foods na mesma ordem dos uniqueItems
      const foodsMap = new Map(foods?.map(f => [f.id, f]) || []);
      return uniqueItems
        .map(item => foodsMap.get(item.food_id))
        .filter(Boolean);
    },
    enabled: isOpen && !!tenantId,
  });

  // Query 2: Buscar alimentos por categoria
  const { data: categoryFoods, isLoading: loadingCategoryFoods } = useQuery({
    queryKey: ['category-foods', selectedCategory?.id, sourceFilter],
    queryFn: async () => {
      if (!selectedCategory?.id) return [];
      
      let query = (supabase
        .from('foods')
        .select('*') as any)
        .eq('category', selectedCategory.name);
      
      if (sourceFilter && sourceFilter !== 'all') {
        if (sourceFilter === 'TACO') {
          query = query.like('source', '%TACO%');
        } else {
          query = query.eq('source', sourceFilter);
        }
      }
      
      query = query.order('name').limit(500);
      
      const result = await query;
      
      return result.data || [];
    },
    enabled: !!selectedCategory && view === 'category-list',
  });

  // Query 3: Buscar por texto (global)
  const { data: searchResults, isLoading: loadingSearch } = useQuery({
    queryKey: ['search-foods', searchTerm, sourceFilter],
    queryFn: async () => {
      if (searchTerm.length < 2) return [];
      
      const words = searchTerm
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .split(/[\s,]+/)
        .filter(w => w.length >= 2);
      
      console.log('🔍 Buscando palavras:', words);
      
      let allResults: any[] = [];
      
      // Se filtro específico, buscar apenas daquela fonte
      if (sourceFilter && sourceFilter !== 'all') {
        let query: any = supabase
          .from('foods')
          .select('*, food_categories(name)');
        
        if (sourceFilter === 'TACO') {
          query = query.like('source', '%TACO%');
        } else {
          query = query.eq('source', sourceFilter);
        }
        
        const { data } = await query.limit(200);
        allResults = data || [];
      } 
      // Se "Todas as tabelas", buscar de cada fonte separadamente
      else {
        const [tacoResult, offResult] = await Promise.all([
          (supabase
            .from('foods')
            .select('*, food_categories(name)') as any)
            .like('source', '%TACO%')
            .limit(100),
          (supabase
            .from('foods')
            .select('*, food_categories(name)') as any)
            .eq('source', 'OpenFoodFacts')
            .limit(100)
        ]);
        
        allResults = [...(tacoResult.data || []), ...(offResult.data || [])];
      }
      
      // Filtrar no JavaScript
      const filtered = allResults.filter((food: any) => {
        const foodName = food.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
        
        return words.every(word => foodName.includes(word));
      });
      
      console.log('📦 Resultados:', filtered.length);
      
      return filtered.slice(0, 50);
    },
    enabled: searchTerm.length >= 2,
  });

  // Query 3.5: Buscar por perfil nutricional
  const { data: nutritionalResults, isLoading: loadingNutritional } = useQuery({
    queryKey: ['nutritional-foods', nutritionalFilter, sourceFilter],
    queryFn: async () => {
      if (!nutritionalFilter) return [];
      
      let result: any;
      
      // Construir query base
      const baseQuery = supabase
        .from('foods')
        .select('*, food_categories(name)');
      
      // Aplicar filtros nutricionais e de fonte
      if (nutritionalFilter === 'protein') {
        if (sourceFilter === 'all' || !sourceFilter) {
          result = await (baseQuery as any).gte('protein_g', 20).order('name').limit(50);
        } else if (sourceFilter === 'TACO') {
          result = await (baseQuery as any).gte('protein_g', 20).like('source', '%TACO%').order('name').limit(50);
        } else {
          result = await (baseQuery as any).gte('protein_g', 20).eq('source', sourceFilter).order('name').limit(50);
        }
      } else if (nutritionalFilter === 'lowcarb') {
        if (sourceFilter === 'all' || !sourceFilter) {
          result = await (baseQuery as any).lte('carbohydrate_g', 10).order('name').limit(50);
        } else if (sourceFilter === 'TACO') {
          result = await (baseQuery as any).lte('carbohydrate_g', 10).like('source', '%TACO%').order('name').limit(50);
        } else {
          result = await (baseQuery as any).lte('carbohydrate_g', 10).eq('source', sourceFilter).order('name').limit(50);
        }
      } else if (nutritionalFilter === 'lowfat') {
        if (sourceFilter === 'all' || !sourceFilter) {
          result = await (baseQuery as any).lte('lipid_g', 5).order('name').limit(50);
        } else if (sourceFilter === 'TACO') {
          result = await (baseQuery as any).lte('lipid_g', 5).like('source', '%TACO%').order('name').limit(50);
        } else {
          result = await (baseQuery as any).lte('lipid_g', 5).eq('source', sourceFilter).order('name').limit(50);
        }
      }
      
      return result?.data || [];
    },
    enabled: !!nutritionalFilter,
  });

  // Query 4: Detalhes completos do alimento
  const { data: foodDetails } = useQuery({
    queryKey: ['food-details', selectedFood?.id],
    queryFn: async () => {
      if (!selectedFood) return null;

      const { data } = await supabase
        .from('foods')
        .select('*, food_categories(name, icon, color)')
        .eq('id', selectedFood.id)
        .single();

      return data;
    },
    enabled: !!selectedFood && view === 'food-details',
  });

  // Função para calcular score de similaridade nutricional
  const calculateNutritionalScore = (food1: any, food2: any) => {
    const proteinDiff = Math.abs((food1.protein_g || 0) - (food2.protein_g || 0));
    const carbDiff = Math.abs((food1.carbohydrate_g || 0) - (food2.carbohydrate_g || 0));
    const fatDiff = Math.abs((food1.lipid_g || 0) - (food2.lipid_g || 0));
    const calorieDiff = Math.abs((food1.energy_kcal || 0) - (food2.energy_kcal || 0));
    
    return proteinDiff + carbDiff + fatDiff + (calorieDiff / 10);
  };

  // Query 5: Sugestões de substituição
  const { data: substitutions } = useQuery({
    queryKey: ['substitutions', foodDetails?.category_id, foodDetails?.id],
    queryFn: async () => {
      if (!foodDetails?.category_id) return [];

      const { data } = await supabase
        .from('foods')
        .select('id, name, brand, energy_kcal, protein_g, carbohydrate_g, lipid_g')
        .eq('category_id', foodDetails.category_id)
        .eq('active', true)
        .neq('id', foodDetails.id)
        .limit(50);

      // Ordenar por score de similaridade nutricional
      const sortedData = (data || []).map(food => ({
        ...food,
        similarityScore: calculateNutritionalScore(foodDetails, food)
      }))
      .sort((a, b) => a.similarityScore - b.similarityScore)
      .slice(0, 10);

      return sortedData;
    },
    enabled: !!foodDetails && view === 'food-details',
  });

  // Buscar medidas quando seleciona alimento para adicionar porção
  const loadMeasures = async (food: any) => {
    const { data: measuresData } = await supabase
      .from('food_measures')
      .select('*')
      .eq('food_id', food.id)
      .order('is_default', { ascending: false });

    let measures = measuresData || [];

    // Se não houver medidas, criar uma padrão em gramas
    if (measures.length === 0) {
      measures = [{
        id: 'temp-gram-measure',
        food_id: food.id,
        measure_name: 'gramas (100g)',
        grams: 100,
        is_default: true,
        created_at: new Date().toISOString()
      }];
    } else {
      // Ordenar para garantir que gramas apareça primeiro
      measures = measures.sort((a, b) => {
        const aIsGram = a.measure_name.toLowerCase().includes('grama') || 
                        a.measure_name.toLowerCase().includes('gram');
        const bIsGram = b.measure_name.toLowerCase().includes('grama') || 
                        b.measure_name.toLowerCase().includes('gram');
        
        if (aIsGram && !bIsGram) return -1;
        if (!aIsGram && bIsGram) return 1;
        if (a.is_default && !b.is_default) return -1;
        if (!a.is_default && b.is_default) return 1;
        return 0;
      });
    }

    setMeasures(measures);
    setSelectedMeasure(measures[0]);
    setQuantity(1);
  };

  const handleSelectFoodForDetails = async (food: any) => {
    setSelectedFood(food);
    setView('food-details');
  };

  const handleAddToMeal = async (food: any) => {
    setSelectedFood(food);
    await loadMeasures(food);
    setView('add-portion');
  };

  const handleFinalAdd = () => {
    if (!selectedFood || !selectedMeasure) return;

    const nutrition = calculateItemNutrition(selectedFood, selectedMeasure, quantity);

    const item = {
      food_id: selectedFood.id,
      measure_id: selectedMeasure.id,
      quantity,
      food: selectedFood,
      measure: selectedMeasure,
      ...nutrition
    };

    onAddFood(item);

    toast({
      title: '✓ Alimento adicionado',
      description: `${quantity} ${selectedMeasure.measure_name} de ${selectedFood.name}`
    });

    // Reset e fechar
    onClose();
  };

  const calculatedNutrition = selectedFood && selectedMeasure 
    ? calculateItemNutrition(selectedFood, selectedMeasure, quantity)
    : null;

  if (!isOpen) return null;

  // VIEW 1: Grid de Categorias
  const CategoriesView = () => {
    return (
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
        {categoriesWithCount?.map((category) => {
          return (
            <Card
              key={category.slug}
              className={cn(
                "cursor-pointer transition-all duration-300",
                "border border-border bg-zinc-100 hover:bg-background",
                "flex flex-col items-center justify-center text-center",
                "min-h-[100px] md:min-h-[120px] p-4 rounded-lg"
              )}
              onClick={() => {
                setSelectedCategory(category);
                setView('category-list');
              }}
            >
              <div className="text-4xl mb-2">
                {CATEGORY_ICONS[category.name] || '🍽️'}
              </div>
              <h3 className="font-medium text-sm md:text-base mb-1">
                {category.name}
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                {category.count} itens
              </p>
            </Card>
          );
        })}
      </div>
    );
  };

  // VIEW 1.5: Alimentos Recentes
  const RecentFoodsView = () => {
    if (!recentFoods || recentFoods.length === 0) {
      return (
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Nenhum alimento adicionado ainda.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Seus alimentos mais usados aparecerão aqui.
          </p>
        </div>
      );
    }

    return (
      <ScrollArea className="h-[500px]">
        <div className="grid gap-3 pr-4">
          {recentFoods.map((food: any) => (
            <Card key={food.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{food.name}</h4>
                      <Badge 
                        variant={food.source?.includes('TACO') ? 'default' : 'secondary'} 
                        className="text-xs"
                      >
                        {food.source?.includes('TACO') ? 'TACO' : 'OFF'}
                      </Badge>
                    </div>
                    {food.brand && (
                      <p className="text-sm text-muted-foreground">
                        Marca: {food.brand}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mb-3">
                  {food.energy_kcal} kcal | 
                  P: {formatNutrient(food.protein_g)} | 
                  C: {formatNutrient(food.carbohydrate_g)} | 
                  G: {formatNutrient(food.lipid_g)}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleAddToMeal(food)}
                    className="flex-1"
                  >
                    Adicionar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    );
  };

  // VIEW 2: Lista de Alimentos da Categoria
  const CategoryListView = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setView('categories');
              setSelectedCategory(null);
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <span className="text-2xl">
                {selectedCategory ? CATEGORY_ICONS[selectedCategory.name] || '🍽️' : '🍽️'}
              </span>
              {selectedCategory?.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {categoryFoods?.length || 0} alimentos
            </p>
          </div>
        </div>

        {loadingCategoryFoods ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-muted-foreground mt-4">Carregando...</p>
          </div>
        ) : (
          <ScrollArea className="h-[500px]">
            <div className="grid gap-3 pr-4">
              {categoryFoods?.map((food) => (
                <Card key={food.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{food.name}</h4>
                          <Badge 
                            variant={food.source?.includes('TACO') ? 'default' : 'secondary'} 
                            className="text-xs"
                          >
                            {food.source?.includes('TACO') ? 'TACO' : 'OFF'}
                          </Badge>
                        </div>
                        {food.brand && (
                          <p className="text-sm text-muted-foreground">
                            Marca: {food.brand}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground mb-3">
                      {food.energy_kcal} kcal | 
                      P: {formatNutrient(food.protein_g)} | 
                      C: {formatNutrient(food.carbohydrate_g)} | 
                      G: {formatNutrient(food.lipid_g)}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSelectFoodForDetails(food)}
                        className="flex-1"
                      >
                        Ver detalhes
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAddToMeal(food)}
                        className="flex-1"
                      >
                        Adicionar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    );
  };

  // VIEW 3: Detalhes do Alimento + Substituições
  const FoodDetailsView = () => (
    <ScrollArea className="h-[600px] pr-4">
      <div className="space-y-6">
        {/* Botão Voltar */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setView('category-list')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para lista
        </Button>

        {/* Cabeçalho do Alimento */}
        <div className="border-b pb-4">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl font-bold">{foodDetails?.name}</h2>
            <Badge 
              variant={(foodDetails as any)?.source?.includes('TACO') ? 'default' : 'secondary'} 
              className="text-xs"
            >
              {(foodDetails as any)?.source?.includes('TACO') ? 'TACO' : 'OFF'}
            </Badge>
          </div>
          {foodDetails?.brand && (
            <p className="text-muted-foreground mb-1">
              Marca: {foodDetails.brand}
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            Grupo alimentar: {foodDetails?.food_categories?.name}
          </p>
          <p className="text-sm text-muted-foreground">
            1 Porção = 100g
          </p>
        </div>

        {/* Tabela Nutricional Completa */}
        <div className="border-b pb-6">
          <h3 className="font-semibold text-lg mb-4">📊 Tabela Nutricional (por 100g)</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-accent/20 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">Energia</p>
              <p className="font-medium text-lg">{foodDetails?.energy_kcal || 0} kcal</p>
            </div>
            <div className="bg-accent/20 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">Carboidratos</p>
              <p className="font-medium text-lg">{formatNutrient(foodDetails?.carbohydrate_g)}</p>
            </div>
            <div className="bg-accent/20 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">Proteínas</p>
              <p className="font-medium text-lg">{formatNutrient(foodDetails?.protein_g)}</p>
            </div>
            <div className="bg-accent/20 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">Lipídeos</p>
              <p className="font-medium text-lg">{formatNutrient(foodDetails?.lipid_g)}</p>
            </div>
            {foodDetails?.fiber_g !== null && foodDetails?.fiber_g !== undefined && (
              <div className="bg-accent/20 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Fibra Alimentar</p>
                <p className="font-medium text-lg">{formatNutrient(foodDetails.fiber_g)}</p>
              </div>
            )}
            {foodDetails?.sodium_mg !== null && foodDetails?.sodium_mg !== undefined && (
              <div className="bg-accent/20 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Sódio</p>
                <p className="font-medium text-lg">{foodDetails.sodium_mg}mg</p>
              </div>
            )}
            {foodDetails?.saturated_fat_g !== null && foodDetails?.saturated_fat_g !== undefined && (
              <div className="bg-accent/20 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Gordura Saturada</p>
                <p className="font-medium text-lg">{formatNutrient(foodDetails.saturated_fat_g)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sugestões de Substituição */}
        <div className="pb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">📋 Sugestões de Substituição</h3>
            <Select value={substitutionSort} onValueChange={setSubstitutionSort}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ordenar por..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="energy_kcal">Energia</SelectItem>
                <SelectItem value="protein_g">Proteínas</SelectItem>
                <SelectItem value="carbohydrate_g">Carboidratos</SelectItem>
                <SelectItem value="lipid_g">Lipídeos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            (baseado no mesmo grupo alimentar)
          </p>
          <div className="grid gap-3">
            {substitutions?.map((sub) => (
              <Card key={sub.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="font-medium mb-1">{sub.name}</p>
                      {sub.brand && (
                        <p className="text-xs text-muted-foreground mb-1">
                          {sub.brand}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {sub.energy_kcal} kcal | 
                        P: {formatNutrient(sub.protein_g)} | 
                        C: {formatNutrient(sub.carbohydrate_g)} | 
                        L: {formatNutrient(sub.lipid_g)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddToMeal(sub)}
                    >
                      Adicionar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Botão Principal */}
        <div className="sticky bottom-0 bg-background pt-4 border-t">
          <Button
            className="w-full"
            size="lg"
            onClick={() => handleAddToMeal(foodDetails)}
          >
            Adicionar este alimento
          </Button>
        </div>
      </div>
    </ScrollArea>
  );

  // VIEW 4: Adicionar Porção
  const AddPortionView = () => (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setView('food-details')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar aos detalhes
      </Button>

      {/* Info do Alimento */}
      <div className="bg-accent/20 border-2 border-accent rounded-lg p-4">
        <h3 className="font-bold text-lg mb-2">{selectedFood?.name}</h3>
        {selectedFood?.brand && (
          <p className="text-sm text-muted-foreground mb-3">Marca: {selectedFood.brand}</p>
        )}
        <div className="grid grid-cols-4 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground font-medium">Calorias</p>
            <p className="font-bold">{selectedFood?.energy_kcal} kcal</p>
          </div>
          <div>
            <p className="text-muted-foreground font-medium">Proteínas</p>
            <p className="font-bold">{formatNutrient(selectedFood?.protein_g)}</p>
          </div>
          <div>
            <p className="text-muted-foreground font-medium">Carbos</p>
            <p className="font-bold">{formatNutrient(selectedFood?.carbohydrate_g)}</p>
          </div>
          <div>
            <p className="text-muted-foreground font-medium">Gorduras</p>
            <p className="font-bold">{formatNutrient(selectedFood?.lipid_g)}</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Valores por 100g</p>
      </div>

      {/* Medida */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Medida
        </label>
        <select
          value={selectedMeasure?.id || ''}
          onChange={(e) => {
            const measure = measures.find(m => m.id === e.target.value);
            setSelectedMeasure(measure);
          }}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {measures.map(measure => (
            <option key={measure.id} value={measure.id}>
              {measure.measure_name} ({measure.grams}g)
            </option>
          ))}
        </select>
      </div>

      {/* Quantidade */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Quantidade
        </label>
        <Input
          type="number"
          step="0.5"
          min="0.1"
          value={quantity}
          onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
        />
      </div>

      {/* Preview dos Valores Calculados */}
      {calculatedNutrition && (
        <div className="bg-primary/10 border-2 border-primary/20 rounded-lg p-4">
          <p className="text-sm font-medium mb-3">
            Total: {quantity} {selectedMeasure?.measure_name} = {calculatedNutrition.grams_total.toFixed(0)}g
          </p>
          <div className="grid grid-cols-4 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Calorias</p>
              <p className="font-bold">{calculatedNutrition.kcal_total.toFixed(0)} kcal</p>
            </div>
            <div>
              <p className="text-muted-foreground">Proteínas</p>
              <p className="font-bold">{formatNutrient(calculatedNutrition.protein_total)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Carbos</p>
              <p className="font-bold">{formatNutrient(calculatedNutrition.carb_total)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Gorduras</p>
              <p className="font-bold">{formatNutrient(calculatedNutrition.fat_total)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Botões */}
      <div className="flex gap-3">
        <Button onClick={onClose} variant="outline" className="flex-1">
          Cancelar
        </Button>
        <Button onClick={handleFinalAdd} className="flex-1">
          Adicionar à Refeição
        </Button>
      </div>
    </div>
  );

  // Resultados de Busca
  const SearchResultsView = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {searchResults?.length || 0} resultados para "{searchTerm}"
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSearchTerm('');
            setView('categories');
          }}
        >
          Limpar busca
        </Button>
      </div>

      {loadingSearch ? (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground mt-4">Buscando...</p>
        </div>
      ) : searchResults && searchResults.length === 0 ? (
        <div className="text-center py-8">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            Nenhum alimento encontrado para "{searchTerm}"
          </p>
          <Button onClick={() => setShowCustomFoodModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar este alimento ao banco
          </Button>
        </div>
      ) : (
        <ScrollArea className="h-[500px]">
          <div className="grid gap-3 pr-4">
            {searchResults?.map((food) => (
              <Card key={food.id} className="hover:shadow-md transition-shadow">
                 <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{food.name}</h4>
                        <Badge 
                          variant={food.source?.includes('TACO') ? 'default' : 'secondary'} 
                          className="text-xs"
                        >
                          {food.source?.includes('TACO') ? 'TACO' : 'OFF'}
                        </Badge>
                      </div>
                      {food.brand && (
                        <p className="text-sm text-muted-foreground">
                          Marca: {food.brand}
                        </p>
                      )}
                      <Badge variant="secondary" className="mt-1">
                        {food.food_categories?.name}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground mb-3">
                    {food.energy_kcal} kcal | 
                    P: {formatNutrient(food.protein_g)} | 
                    C: {formatNutrient(food.carbohydrate_g)} | 
                    G: {formatNutrient(food.lipid_g)}
                  </div>
                  <div className="mt-3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full">
                          Ver detalhes e adicionar
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md p-0">
                        <DialogTitle className="sr-only">Detalhes do Alimento</DialogTitle>
                        <DialogDescription className="sr-only">
                          Informações nutricionais completas do alimento selecionado
                        </DialogDescription>
                        <FoodDetailsPopover 
                          food={food}
                          onAddClick={async () => {
                            setSelectedFood(food);
                            await loadMeasures(food);
                            setView('add-portion');
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );

  // Resultados de Filtro Nutricional
  const NutritionalFilterView = () => {
    const filterLabels = {
      protein: 'Rico em Proteína (>20g)',
      lowcarb: 'Baixo Carboidrato (<10g)',
      lowfat: 'Baixa Gordura (<5g)'
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {nutritionalResults?.length || 0} alimentos - {filterLabels[nutritionalFilter as keyof typeof filterLabels]}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setNutritionalFilter(null);
              setView('categories');
            }}
          >
            Limpar filtro
          </Button>
        </div>

        {loadingNutritional ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-muted-foreground mt-4">Buscando...</p>
          </div>
        ) : nutritionalResults && nutritionalResults.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhum alimento encontrado com esse perfil nutricional
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[500px]">
            <div className="grid gap-3 pr-4">
              {nutritionalResults?.map((food) => (
                <Card key={food.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{food.name}</h4>
                          <Badge 
                            variant={food.source?.includes('TACO') ? 'default' : 'secondary'} 
                            className="text-xs"
                          >
                            {food.source?.includes('TACO') ? 'TACO' : 'OFF'}
                          </Badge>
                        </div>
                        {food.brand && (
                          <p className="text-sm text-muted-foreground">
                            Marca: {food.brand}
                          </p>
                        )}
                        <Badge variant="secondary" className="mt-1">
                          {food.food_categories?.name}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground mb-3">
                      {food.energy_kcal} kcal | 
                      P: {formatNutrient(food.protein_g)} | 
                      C: {formatNutrient(food.carbohydrate_g)} | 
                      G: {formatNutrient(food.lipid_g)}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSelectFoodForDetails(food)}
                        className="flex-1"
                      >
                        Ver detalhes
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAddToMeal(food)}
                        className="flex-1"
                      >
                        Adicionar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="border-b px-6 py-4 flex justify-between items-center shrink-0">
            <h2 className="text-2xl font-bold">Adicionar Alimento</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Barra de Busca + Filtro */}
          <div className="px-6 pt-4 pb-2 shrink-0">
            {/* Filtros Nutricionais */}
            {searchTerm.length < 2 && (view === 'categories' || view === 'recent') && (
              <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                <Button 
                  variant={nutritionalFilter === 'protein' ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setNutritionalFilter(nutritionalFilter === 'protein' ? null : 'protein')}
                  className="whitespace-nowrap"
                >
                  🥩 Rico em Proteína (&gt;20g)
                </Button>
                <Button 
                  variant={nutritionalFilter === 'lowcarb' ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setNutritionalFilter(nutritionalFilter === 'lowcarb' ? null : 'lowcarb')}
                  className="whitespace-nowrap"
                >
                  🥬 Baixo Carboidrato (&lt;10g)
                </Button>
                <Button 
                  variant={nutritionalFilter === 'lowfat' ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setNutritionalFilter(nutritionalFilter === 'lowfat' ? null : 'lowfat')}
                  className="whitespace-nowrap"
                >
                  🥗 Baixa Gordura (&lt;5g)
                </Button>
              </div>
            )}
            
            <div className="flex gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar alimento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as tabelas</SelectItem>
                  <SelectItem value="TACO">Tabela TACO</SelectItem>
                  <SelectItem value="OpenFoodFacts">OpenFoodFacts</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Navegação Categorias / Recentes */}
            {searchTerm.length < 2 && (view === 'categories' || view === 'recent') && (
              <div className="flex gap-2 mb-4">
                <Button
                  variant={view === 'categories' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setView('categories')}
                  className="flex-1"
                >
                  Categorias
                </Button>
                <Button
                  variant={view === 'recent' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setView('recent')}
                  className="flex-1"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Recentes
                </Button>
              </div>
            )}
          </div>

          {/* Conteúdo Principal */}
          <div className="px-6 pb-6 overflow-y-auto flex-1">
            {searchTerm.length >= 2 ? (
              <SearchResultsView />
            ) : nutritionalFilter ? (
              <NutritionalFilterView />
            ) : view === 'categories' ? (
              <CategoriesView />
            ) : view === 'recent' ? (
              <RecentFoodsView />
            ) : view === 'category-list' ? (
              <CategoryListView />
            ) : view === 'food-details' ? (
              <FoodDetailsView />
            ) : view === 'add-portion' ? (
              <AddPortionView />
            ) : null}
          </div>
        </div>
      </div>

      {/* Modal de Alimento Personalizado */}
      <AddCustomFoodModal
        isOpen={showCustomFoodModal}
        onClose={() => setShowCustomFoodModal(false)}
        onSuccess={(food) => {
          setShowCustomFoodModal(false);
          handleSelectFoodForDetails(food);
        }}
        searchQuery={searchTerm}
      />
    </>
  );
};
