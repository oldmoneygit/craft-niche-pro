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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
  const [usageCount, setUsageCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchUsage = async () => {
      const { count } = await supabase
        .from('meal_items')
        .select('*', { count: 'exact', head: true })
        .eq('food_id', foodId);
      setUsageCount(count || 0);
    };
    fetchUsage();
  }, [foodId]);

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
const SimilarFoods = ({ food, onCompare }: { food: any; onCompare: (food: any) => void }) => {
  const [similarFoods, setSimilarFoods] = useState<any[]>([]);

  useEffect(() => {
    const fetchSimilar = async () => {
      if (!food.category) return;
      
      const { data } = await supabase
        .from('foods')
        .select('id, name, energy_kcal, protein_g, carbohydrate_g, lipid_g, fiber_g, sodium_mg')
        .eq('category', food.category)
        .neq('id', food.id)
        .order('energy_kcal')
        .limit(5);
      
      setSimilarFoods(data || []);
    };
    fetchSimilar();
  }, [food.category, food.id]);

  if (similarFoods.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Alimentos Similares</p>
      <div className="space-y-1">
        {similarFoods.map((f) => (
          <button
            key={f.id}
            onClick={() => onCompare(f)}
            className="w-full text-left p-2 rounded hover:bg-muted transition-colors flex justify-between items-center group"
          >
            <span className="text-sm text-muted-foreground group-hover:text-foreground">
              {f.name}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{f.energy_kcal}kcal</span>
              <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Componente para comparação de alimentos
const FoodComparison = ({ originalFood, comparisonFood, onBack, onUse }: { 
  originalFood: any; 
  comparisonFood: any; 
  onBack: () => void;
  onUse: (food: any) => void;
}) => {
  const getDifference = (original: number, comparison: number) => {
    const diff = comparison - original;
    const percentage = original > 0 ? ((diff / original) * 100).toFixed(0) : '0';
    return { diff, percentage, isHigher: diff > 0 };
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-semibold">Comparação de Alimentos</h3>
      </div>

      {/* Grid de comparação */}
      <div className="grid grid-cols-2 gap-4">
        {/* Alimento original */}
        <div className="space-y-2">
          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Original</p>
            <p className="font-semibold text-sm">{originalFood.name}</p>
          </div>
        </div>

        {/* Alimento comparado */}
        <div className="space-y-2">
          <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Comparar com</p>
            <p className="font-semibold text-sm">{comparisonFood.name}</p>
          </div>
        </div>
      </div>

      {/* Tabela comparativa */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Valores por 100g</p>
        
        {[
          { label: 'Calorias', key: 'energy_kcal', unit: 'kcal' },
          { label: 'Proteínas', key: 'protein_g', unit: 'g' },
          { label: 'Carboidratos', key: 'carbohydrate_g', unit: 'g' },
          { label: 'Gorduras', key: 'lipid_g', unit: 'g' },
          { label: 'Fibras', key: 'fiber_g', unit: 'g' },
          { label: 'Sódio', key: 'sodium_mg', unit: 'mg' }
        ].map(({ label, key, unit }) => {
          const original = originalFood[key] || 0;
          const comparison = comparisonFood[key] || 0;
          const { diff, percentage, isHigher } = getDifference(original, comparison);

          return (
            <div key={key} className="grid grid-cols-2 gap-4 py-2 border-b">
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-medium">{original.toFixed(1)}{unit}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-medium">{comparison.toFixed(1)}{unit}</p>
                <p className={`text-xs ${isHigher ? 'text-orange-600' : 'text-green-600'}`}>
                  {isHigher ? '+' : ''}{percentage}%
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Botão para adicionar o comparado */}
      <Button className="w-full" onClick={() => onUse(comparisonFood)}>
        Usar {comparisonFood.name}
      </Button>
    </div>
  );
};

// Componente para observações do nutricionista (placeholder)
const NutritionistNotes = ({ foodId }: { foodId: string }) => {
  const [notes, setNotes] = useState('');
  const [isEditing, setIsEditing] = useState(false);

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
            <Button size="sm" onClick={() => setIsEditing(false)}>Salvar</Button>
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
const FoodDetailsPopover = ({ food, onAddClick }: { food: any; onAddClick: (selectedFood: any) => void }) => {
  const [comparingFood, setComparingFood] = useState<any>(null);

  if (comparingFood) {
    return (
      <div className="p-4">
        <FoodComparison 
          originalFood={food}
          comparisonFood={comparingFood}
          onBack={() => setComparingFood(null)}
          onUse={onAddClick}
        />
      </div>
    );
  }

  return (
    <>
      {/* Header sticky */}
      <div className="sticky top-0 bg-background z-10 p-4 border-b">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{food.name}</h3>
            {food.brand && (
              <p className="text-sm text-muted-foreground">Marca: {food.brand}</p>
            )}
          </div>
          <Badge variant={food.nutrition_sources?.code === 'taco' || food.nutrition_sources?.code === 'tbca' ? 'default' : 'secondary'}>
            {food.nutrition_sources?.code === 'taco' || food.nutrition_sources?.code === 'tbca' ? 'TACO' : food.nutrition_sources?.name || 'Outro'}
          </Badge>
        </div>
        {food.food_categories?.name && (
          <Badge variant="outline" className="mt-2">{food.food_categories.name}</Badge>
        )}
      </div>

      {/* Conteúdo scrollável */}
      <div className="p-4 space-y-4">
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
              <SimilarFoods food={food} onCompare={setComparingFood} />

              {/* 5. OBSERVAÇÕES DO NUTRICIONISTA */}
              <NutritionistNotes foodId={food.id} />

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
                    <p className="text-xs text-muted-foreground">Fonte: {food.nutrition_sources?.name || 'Desconhecida'}</p>
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
          onClick={() => onAddClick(food)}
        >
          Adicionar ao Plano
        </Button>
      </div>
    </>
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
  const [expandedFoodId, setExpandedFoodId] = useState<string | null>(null);
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
      // Buscar categorias existentes
      const { data: categories } = await supabase
        .from('food_categories')
        .select('id, name')
        .order('name');

      if (!categories) return [];

      // Para cada categoria, contar alimentos
      const categoriesWithCounts = await Promise.all(
        categories.map(async (category) => {
          let query = supabase
            .from('foods')
            .select('id', { count: 'exact', head: true })
            .eq('category_id', category.id)
            .eq('active', true);

          if (sourceFilter && sourceFilter !== 'all') {
            if (sourceFilter === 'TACO') {
              const { data: sources } = await supabase
                .from('nutrition_sources')
                .select('id')
                .in('code', ['taco', 'tbca']);

              if (sources && sources.length > 0) {
                query = query.in('source_id', sources.map(s => s.id));
              }
            } else if (sourceFilter === 'OpenFoodFacts') {
              const { data: source } = await supabase
                .from('nutrition_sources')
                .select('id')
                .eq('code', 'openfoodfacts')
                .maybeSingle();

              if (source) {
                query = query.eq('source_id', source.id);
              }
            }
          }

          const { count } = await query;

          return {
            id: category.id,
            name: category.name,
            count: count || 0,
            slug: category.name.toLowerCase(),
            db_category: category
          };
        })
      );

      // Filtrar categorias com alimentos e ordenar por contagem
      return categoriesWithCounts
        .filter(c => c.count > 0)
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
        .select('*, food_categories(name), nutrition_sources(name, code)')
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

      let query = supabase
        .from('foods')
        .select('*, food_categories(name), nutrition_sources(name, code)')
        .eq('category_id', selectedCategory.id)
        .eq('active', true);

      if (sourceFilter && sourceFilter !== 'all') {
        if (sourceFilter === 'TACO') {
          const { data: sources } = await supabase
            .from('nutrition_sources')
            .select('id')
            .in('code', ['taco', 'tbca']);

          if (sources && sources.length > 0) {
            query = query.in('source_id', sources.map(s => s.id));
          }
        } else if (sourceFilter === 'OpenFoodFacts') {
          const { data: source } = await supabase
            .from('nutrition_sources')
            .select('id')
            .eq('code', 'openfoodfacts')
            .maybeSingle();

          if (source) {
            query = query.eq('source_id', source.id);
          }
        }
      }

      const result = await query.order('name').limit(500);

      return result.data || [];
    },
    enabled: !!selectedCategory && view === 'category-list',
  });

  // Query 3: Buscar por texto (global)
  const { data: searchResults, isLoading: loadingSearch } = useQuery({
    queryKey: ['search-foods', searchTerm, sourceFilter],
    queryFn: async () => {
      if (searchTerm.length < 2) return [];


      let query = supabase
        .from('foods')
        .select('*, food_categories(name), nutrition_sources(name, code)')
        .ilike('name', `%${searchTerm}%`)
        .eq('active', true);

      if (sourceFilter && sourceFilter !== 'all') {
        if (sourceFilter === 'TACO') {
          const { data: sources } = await supabase
            .from('nutrition_sources')
            .select('id')
            .in('code', ['taco', 'tbca']);

          if (sources && sources.length > 0) {
            query = query.in('source_id', sources.map(s => s.id));
          }
        } else if (sourceFilter === 'OpenFoodFacts') {
          const { data: source } = await supabase
            .from('nutrition_sources')
            .select('id')
            .eq('code', 'openfoodfacts')
            .maybeSingle();

          if (source) {
            query = query.eq('source_id', source.id);
          }
        }
      }

      const { data, error } = await query.order('name').limit(50);

      if (error) {
        console.error('Erro na busca:', error);
        return [];
      }

      return data || [];
    },
    enabled: searchTerm.length >= 2,
  });

  // Query 3.5: Buscar por perfil nutricional
  const { data: nutritionalResults, isLoading: loadingNutritional } = useQuery({
    queryKey: ['nutritional-foods', nutritionalFilter, sourceFilter],
    queryFn: async () => {
      if (!nutritionalFilter) return [];

      let query = supabase
        .from('foods')
        .select('*, food_categories(name), nutrition_sources(name, code)')
        .eq('active', true);

      // Aplicar filtros nutricionais
      if (nutritionalFilter === 'protein') {
        query = query.gte('protein_g', 20);
      } else if (nutritionalFilter === 'lowcarb') {
        query = query.lte('carbohydrate_g', 10);
      } else if (nutritionalFilter === 'lowfat') {
        query = query.lte('lipid_g', 5);
      }

      // Aplicar filtro de fonte se necessário
      if (sourceFilter && sourceFilter !== 'all') {
        if (sourceFilter === 'TACO') {
          const { data: sources } = await supabase
            .from('nutrition_sources')
            .select('id')
            .in('code', ['taco', 'tbca']);

          if (sources && sources.length > 0) {
            query = query.in('source_id', sources.map(s => s.id));
          }
        } else if (sourceFilter === 'OpenFoodFacts') {
          const { data: source } = await supabase
            .from('nutrition_sources')
            .select('id')
            .eq('code', 'openfoodfacts')
            .maybeSingle();

          if (source) {
            query = query.eq('source_id', source.id);
          }
        }
      }

      const { data, error } = await query.order('name').limit(50);

      if (error) {
        console.error('Erro na busca nutricional:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!nutritionalFilter,
  });


  // Buscar medidas quando seleciona alimento para adicionar porção
  const loadMeasures = async (food: any) => {
    try {
      const { data: measuresData, error } = await supabase
        .from('food_measures')
        .select('*')
        .eq('food_id', food.id)
        .order('is_default', { ascending: false });

      if (error) {
        console.error('Erro ao carregar medidas:', error);
      }

      let measures = measuresData || [];

      // Se não houver medidas, criar medidas padrão
      if (measures.length === 0) {

        // Criar medida em gramas (100g como padrão)
        const defaultMeasures = [
          {
            id: `temp-gram-${food.id}`,
            food_id: food.id,
            measure_name: 'gramas',
            grams: 100,
            is_default: true,
            created_at: new Date().toISOString()
          },
          {
            id: `temp-gram-50-${food.id}`,
            food_id: food.id,
            measure_name: 'gramas',
            grams: 50,
            is_default: false,
            created_at: new Date().toISOString()
          },
          {
            id: `temp-gram-200-${food.id}`,
            food_id: food.id,
            measure_name: 'gramas',
            grams: 200,
            is_default: false,
            created_at: new Date().toISOString()
          }
        ];

        measures = defaultMeasures;
      } else {
        // Ordenar para garantir que medidas padrão apareçam primeiro
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
    } catch (err) {
      console.error('Erro ao carregar medidas:', err);
      toast({
        title: 'Erro ao carregar medidas',
        description: 'Usando medida padrão em gramas',
        variant: 'destructive'
      });

      // Fallback para medida em gramas
      const fallbackMeasure = {
        id: `temp-gram-${food.id}`,
        food_id: food.id,
        measure_name: 'gramas',
        grams: 100,
        is_default: true,
        created_at: new Date().toISOString()
      };

      setMeasures([fallbackMeasure]);
      setSelectedMeasure(fallbackMeasure);
      setQuantity(1);
    }
  };

  const handleAddToMeal = async (food: any) => {
    setSelectedFood(food);
    await loadMeasures(food);
    setSearchTerm('');
    setView('add-portion');
  };


  const handleFinalAdd = () => {
    if (!selectedFood || !selectedMeasure) {
      toast({
        title: 'Erro',
        description: 'Selecione um alimento e uma medida',
        variant: 'destructive'
      });
      return;
    }

    const nutrition = calculateItemNutrition(selectedFood, selectedMeasure, quantity);

    const item = {
      food_id: selectedFood.id,
      measure_id: selectedMeasure.id.startsWith('temp-') ? null : selectedMeasure.id,
      quantity,
      food: selectedFood,
      measure: selectedMeasure,
      ...nutrition
    };

    onAddFood(item);

    toast({
      title: '✓ Alimento adicionado',
      description: `${quantity} ${selectedMeasure.measure_name} (${nutrition.grams_total.toFixed(0)}g) de ${selectedFood.name}`
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
                            variant={food.nutrition_sources?.code === 'taco' || food.nutrition_sources?.code === 'tbca' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {food.nutrition_sources?.code === 'taco' || food.nutrition_sources?.code === 'tbca' ? 'TACO' : food.nutrition_sources?.name || 'Outro'}
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
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                          >
                            Ver detalhes
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md p-0 max-h-[90vh] overflow-y-auto">
                          <DialogTitle className="sr-only">Detalhes do Alimento</DialogTitle>
                          <DialogDescription className="sr-only">
                            Informações nutricionais completas do alimento selecionado
                          </DialogDescription>
                          <FoodDetailsPopover
                            food={food}
                            onAddClick={() => handleAddToMeal(food)}
                          />
                        </DialogContent>
                      </Dialog>
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

  // VIEW 3 removida - agora usamos FoodDetailsPopover em todos os fluxos

  // VIEW 3: Adicionar Porção
  const AddPortionView = () => (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setView('category-list')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar à lista
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
  const SearchResultsView = () => {
    return (
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
            setExpandedFoodId(null);
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
            {searchResults?.map((food) => {
              const isExpanded = expandedFoodId === food.id;

              return (
                <Card
                  key={food.id}
                  className={cn(
                    "transition-all duration-300",
                    isExpanded
                      ? "ring-2 ring-primary bg-blue-50 dark:bg-blue-950/30"
                      : "hover:shadow-md"
                  )}
                >
                  <CardContent className="p-4">
                    {/* Header compacto - sempre visível */}
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{food.name}</h4>
                          <Badge
                            variant={food.nutrition_sources?.code === 'taco' || food.nutrition_sources?.code === 'tbca' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {food.nutrition_sources?.code === 'taco' || food.nutrition_sources?.code === 'tbca' ? 'TACO' : food.nutrition_sources?.name || 'Outro'}
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

                    <div className="space-y-3">
                      {/* Detalhes expandidos - mostrar APENAS quando expandedFoodId === food.id */}
                      {isExpanded && (
                        <div className="border-2 border-primary bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 space-y-4 animate-in slide-in-from-top-2">
                          {/* Macros em destaque */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-background rounded-lg p-3 border">
                              <p className="text-xs text-muted-foreground">Calorias</p>
                              <p className="text-2xl font-bold">{food.energy_kcal?.toFixed(0) || '-'}</p>
                              <p className="text-xs">kcal/100g</p>
                            </div>
                            <div className="bg-background rounded-lg p-3 border">
                              <p className="text-xs text-muted-foreground">Proteína</p>
                              <p className="text-2xl font-bold">{food.protein_g?.toFixed(1) || '-'}g</p>
                              <p className="text-xs">/100g</p>
                            </div>
                          </div>

                          {/* Info nutricional */}
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Informação Nutricional (100g)</p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>Carboidratos: <span className="font-medium">{food.carbohydrate_g?.toFixed(1) || '-'}g</span></div>
                              <div>Gorduras: <span className="font-medium">{food.lipid_g?.toFixed(1) || '-'}g</span></div>
                              <div>Fibras: <span className="font-medium">{food.fiber_g?.toFixed(1) || '-'}g</span></div>
                              <div>Sódio: <span className="font-medium">{food.sodium_mg?.toFixed(0) || '-'}mg</span></div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Botões de ação */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setExpandedFoodId(isExpanded ? null : food.id)}
                          className="flex-1"
                        >
                          {isExpanded ? (
                            <>
                              <ArrowLeft className="w-4 h-4 mr-1" />
                              Recolher
                            </>
                          ) : (
                            <>
                              Ver detalhes
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          onClick={async () => {
                            setSelectedFood(food);
                            await loadMeasures(food);
                            setView('add-portion');
                          }}
                          className="flex-1"
                        >
                          Adicionar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
    );
  };

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
                            variant={food.nutrition_sources?.code === 'taco' || food.nutrition_sources?.code === 'tbca' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {food.nutrition_sources?.code === 'taco' || food.nutrition_sources?.code === 'tbca' ? 'TACO' : food.nutrition_sources?.name || 'Outro'}
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
                        onClick={() => setExpandedFoodId(expandedFoodId === food.id ? null : food.id)}
                        className="flex-1"
                      >
                        {expandedFoodId === food.id ? (
                          <>
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Recolher
                          </>
                        ) : (
                          <>
                            Ver detalhes
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </>
                        )}
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

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" style={{ zIndex: 9999 }}>
        <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
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
          handleAddToMeal(food);
        }}
        searchQuery={searchTerm}
      />
    </>
  );
};
