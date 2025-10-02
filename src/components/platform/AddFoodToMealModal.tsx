import { useState, useEffect } from 'react';
import { X, Search, Plus, Package, ArrowLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { calculateItemNutrition, formatNutrient } from '@/lib/nutritionCalculations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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

type ModalView = 'categories' | 'category-list' | 'food-details' | 'add-portion';

interface FoodCategory {
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

export const AddFoodToMealModal = ({ 
  isOpen, 
  onClose, 
  onAddFood 
}: AddFoodToMealModalProps) => {
  const { toast } = useToast();
  const [view, setView] = useState<ModalView>('categories');
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
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
    'Leguminosas e derivados': '🫘',
    'Produtos açucarados': '🍯',
    'Bebidas (alcoólicas e não alcoólicas)': '🥤',
    'Carnes e Derivados': '🥩',
    'Ovos e derivados': '🥚',
    'Pescados e frutos do mar': '🐟',
    'Suplementos': '💊',
    'Alimentos preparados': '🍱',
    'Gorduras e óleos': '🫒',
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
      setMeasures([]);
      setSelectedMeasure(null);
      setQuantity(1);
    }
  }, [isOpen]);

  // Query 1: Buscar categorias com contadores
  const { data: categoriesWithCount } = useQuery({
    queryKey: ['food-categories-count', sourceFilter],
    queryFn: async () => {
      const { data: dbCategories } = await supabase
        .from('food_categories')
        .select('*')
        .order('name');

      // CRÍTICO: só filtrar se não for "all"
      const { data: foods } = sourceFilter && sourceFilter !== 'all'
        ? await supabase
            .from('foods')
            .select('category_id, food_categories(name)')
            .eq('active', true)
            .eq('source_info', sourceFilter)
        : await supabase
            .from('foods')
            .select('category_id, food_categories(name)')
            .eq('active', true);

      if (!foods || !dbCategories) return [];

      // Contar alimentos por categoria
      const grouped = foods.reduce((acc: Record<string, number>, item) => {
        if (!item.category_id) return acc;
        acc[item.category_id] = (acc[item.category_id] || 0) + 1;
        return acc;
      }, {});

      // Mapear com as categorias predefinidas
      return dbCategories
        .map((dbCat) => {
          const predefinedCat = FOOD_CATEGORIES.find(
            (cat) => cat.name.toLowerCase() === dbCat.name.toLowerCase()
          );
          
          return {
            name: dbCat.name,
            slug: predefinedCat?.slug || dbCat.name.toLowerCase(),
            count: grouped[dbCat.id] || 0,
            db_category: dbCat,
          };
        })
        .filter((cat) => cat.count > 0)
        .sort((a, b) => b.count - a.count);
    },
    enabled: isOpen,
  });

  // Query 2: Buscar alimentos por categoria
  const { data: categoryFoods, isLoading: loadingCategoryFoods } = useQuery({
    queryKey: ['category-foods', selectedCategory?.db_category?.id, sourceFilter],
    queryFn: async () => {
      if (!selectedCategory?.db_category?.id) return [];

      const { data } = sourceFilter && sourceFilter !== 'all'
        ? await supabase
            .from('foods')
            .select('*')
            .eq('category_id', selectedCategory.db_category.id)
            .eq('active', true)
            .eq('source_info', sourceFilter)
            .order('name')
        : await supabase
            .from('foods')
            .select('*')
            .eq('category_id', selectedCategory.db_category.id)
            .eq('active', true)
            .order('name');

      return data || [];
    },
    enabled: !!selectedCategory && view === 'category-list',
  });

  // Query 3: Buscar por texto (global)
  const { data: searchResults, isLoading: loadingSearch } = useQuery({
    queryKey: ['search-foods', searchTerm, sourceFilter],
    queryFn: async () => {
      if (searchTerm.length < 2) return [];

      const { data } = sourceFilter && sourceFilter !== 'all'
        ? await supabase
            .from('foods')
            .select('*, food_categories(name, icon, color)')
            .or(`name.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%`)
            .eq('active', true)
            .eq('source_info', sourceFilter)
            .order('name')
            .limit(50)
        : await supabase
            .from('foods')
            .select('*, food_categories(name, icon, color)')
            .or(`name.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%`)
            .eq('active', true)
            .order('name')
            .limit(50);

      return data || [];
    },
    enabled: searchTerm.length >= 2,
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

  // Query 5: Sugestões de substituição
  const { data: substitutions } = useQuery({
    queryKey: ['substitutions', foodDetails?.category_id, substitutionSort],
    queryFn: async () => {
      if (!foodDetails?.category_id) return [];

      const { data } = await supabase
        .from('foods')
        .select('id, name, brand, energy_kcal, protein_g, carbohydrate_g, lipid_g')
        .eq('category_id', foodDetails.category_id)
        .eq('active', true)
        .neq('id', foodDetails.id)
        .order(substitutionSort, { ascending: true })
        .limit(10);

      return data || [];
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
                        <h4 className="font-medium">{food.name}</h4>
                        {food.brand && (
                          <p className="text-sm text-muted-foreground">
                            Marca: {food.brand}
                          </p>
                        )}
                      </div>
                      {food.source_info && (
                        <Badge variant="secondary" className="ml-2">
                          {food.source_info}
                        </Badge>
                      )}
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
          <h2 className="text-2xl font-bold mb-2">{foodDetails?.name}</h2>
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
                      <h4 className="font-medium">{food.name}</h4>
                      {food.brand && (
                        <p className="text-sm text-muted-foreground">
                          Marca: {food.brand}
                        </p>
                      )}
                      <Badge variant="secondary" className="mt-1">
                        {food.food_categories?.name}
                      </Badge>
                    </div>
                    {food.source_info && (
                      <Badge variant="outline" className="ml-2">
                        {food.source_info}
                      </Badge>
                    )}
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
                  <SelectItem value="IBGE">Tabela IBGE</SelectItem>
                  <SelectItem value="Marcas">Tabela de Marcas</SelectItem>
                  <SelectItem value="Custom">Meus Alimentos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div className="px-6 pb-6 overflow-y-auto flex-1">
            {searchTerm.length >= 2 ? (
              <SearchResultsView />
            ) : view === 'categories' ? (
              <CategoriesView />
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
