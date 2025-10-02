import { useState, useEffect } from 'react';
import { X, Search, Plus, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { calculateItemNutrition, formatNutrient } from '@/lib/nutritionCalculations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AddCustomFoodModal } from './AddCustomFoodModal';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [foods, setFoods] = useState<any[]>([]);
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [measures, setMeasures] = useState<any[]>([]);
  const [selectedMeasure, setSelectedMeasure] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showCustomFoodModal, setShowCustomFoodModal] = useState(false);
  const [showAllFoods, setShowAllFoods] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Buscar categorias ao abrir o modal
  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  // Buscar alimentos quando mudar a query ou filtros
  useEffect(() => {
    if (showAllFoods) {
      loadAllFoods();
    } else if (searchQuery.length >= 2) {
      searchFoods();
    } else {
      setFoods([]);
    }
  }, [searchQuery, showAllFoods, selectedCategory]);

  const loadCategories = async () => {
    const { data } = await supabase
      .from('food_categories')
      .select('*')
      .order('name');
    
    setCategories(data || []);
  };

  const loadAllFoods = async () => {
    setLoading(true);
    let query = supabase
      .from('foods')
      .select(`
        *,
        food_categories (name, icon, color)
      `)
      .eq('active', true)
      .order('name');

    if (selectedCategory !== 'all') {
      query = query.eq('category_id', selectedCategory);
    }

    const { data } = await query;
    setFoods(data || []);
    setLoading(false);
  };

  const searchFoods = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('foods')
      .select(`
        *,
        food_categories (name, icon, color)
      `)
      .or(`name.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%`)
      .eq('active', true)
      .order('name')
      .limit(20);

    setFoods(data || []);
    setLoading(false);
  };

  // Quando seleciona um alimento, buscar suas medidas
  const handleSelectFood = async (food: any) => {
    setSelectedFood(food);
    
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
    
    // Selecionar primeira medida (que agora será gramas se existir)
    setSelectedMeasure(measures[0]);
    setQuantity(1);
  };

  const handleAdd = () => {
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

    // Reset
    setSelectedFood(null);
    setMeasures([]);
    setSelectedMeasure(null);
    setQuantity(1);
    setSearchQuery('');
  };

  const calculatedNutrition = selectedFood && selectedMeasure 
    ? calculateItemNutrition(selectedFood, selectedMeasure, quantity)
    : null;

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-background rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-background border-b px-6 py-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold">Adicionar Alimento</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            {/* Busca e Filtros */}
            <div className="space-y-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowAllFoods(false);
                  }}
                  placeholder="Buscar alimento... (ex: arroz, frango, banana)"
                  className="pl-10"
                  autoFocus
                />
              </div>

              {/* Toggle e Filtros */}
              <div className="flex gap-3 items-center">
                <Button
                  onClick={() => {
                    setShowAllFoods(!showAllFoods);
                    setSearchQuery('');
                  }}
                  variant={showAllFoods ? "default" : "outline"}
                  size="sm"
                >
                  {showAllFoods ? "Ocultar todos" : "Mostrar todos os alimentos"}
                </Button>

                {showAllFoods && (
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="all">Todas as categorias</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Lista de Resultados */}
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="text-muted-foreground mt-4">Buscando alimentos...</p>
              </div>
            )}

            {!loading && searchQuery && foods.length === 0 && (
              <div className="text-center py-8">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Nenhum alimento encontrado para "{searchQuery}"
                </p>
                <Button onClick={() => setShowCustomFoodModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar este alimento ao banco
                </Button>
              </div>
            )}

            {!selectedFood && foods.length > 0 && (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {showAllFoods && selectedCategory === 'all' ? (
                  // Agrupar por categoria quando mostrar todos
                  categories.map(category => {
                    const categoryFoods = foods.filter(f => f.category_id === category.id);
                    if (categoryFoods.length === 0) return null;

                    return (
                      <div key={category.id} className="space-y-2">
                        <div 
                          className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-md sticky top-0 z-10"
                          style={{ 
                            backgroundColor: `${category.color}15`,
                            borderLeft: `3px solid ${category.color}`
                          }}
                        >
                          <span className="font-semibold text-sm" style={{ color: category.color }}>
                            {category.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({categoryFoods.length})
                          </span>
                        </div>
                        <div className="space-y-2 pl-2">
                          {categoryFoods.map(food => (
                            <FoodCard key={food.id} food={food} onSelect={handleSelectFood} />
                          ))}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  // Lista simples quando buscar ou filtrar por categoria
                  foods.map(food => (
                    <FoodCard key={food.id} food={food} onSelect={handleSelectFood} />
                  ))
                )}
              </div>
            )}

            {/* Detalhes do Alimento Selecionado */}
            {/* Detalhes do Alimento Selecionado */}
            {selectedFood && (
              <div className="space-y-6">
                {/* Info do Alimento */}
                <div className="bg-accent/20 border-2 border-accent rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg">{selectedFood.name}</h3>
                      {selectedFood.brand && (
                        <p className="text-sm text-muted-foreground">Marca: {selectedFood.brand}</p>
                      )}
                    </div>
                    <Button
                      onClick={() => {
                        setSelectedFood(null);
                        setMeasures([]);
                      }}
                      variant="ghost"
                      size="sm"
                    >
                      Trocar alimento
                    </Button>
                  </div>

                  <div className="grid grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground font-medium">Calorias</p>
                      <p className="font-bold">{selectedFood.energy_kcal} kcal</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground font-medium">Proteínas</p>
                      <p className="font-bold">{formatNutrient(selectedFood.protein_g)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground font-medium">Carbos</p>
                      <p className="font-bold">{formatNutrient(selectedFood.carbohydrate_g)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground font-medium">Gorduras</p>
                      <p className="font-bold">{formatNutrient(selectedFood.lipid_g)}</p>
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
                  <Button onClick={handleAdd} className="flex-1">
                    Adicionar à Refeição
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Alimento Personalizado */}
      <AddCustomFoodModal
        isOpen={showCustomFoodModal}
        onClose={() => setShowCustomFoodModal(false)}
        onSuccess={(food) => {
          setShowCustomFoodModal(false);
          handleSelectFood(food);
        }}
        searchQuery={searchQuery}
      />
    </>
  );
};

// Componente auxiliar para o card de alimento
const FoodCard = ({ food, onSelect }: { food: any; onSelect: (food: any) => void }) => (
  <button
    onClick={() => onSelect(food)}
    className="w-full p-4 border-2 rounded-lg hover:border-primary transition-colors text-left"
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <h3 className="font-semibold">{food.name}</h3>
        {food.brand && (
          <p className="text-sm text-muted-foreground">Marca: {food.brand}</p>
        )}
        <div className="flex items-center gap-2 mt-2">
          <span 
            className="px-2 py-1 rounded text-xs font-medium"
            style={{ 
              backgroundColor: `${food.food_categories?.color}20`,
              color: food.food_categories?.color 
            }}
          >
            {food.food_categories?.name}
          </span>
          {food.is_custom && (
            <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-700">
              Personalizado
            </span>
          )}
        </div>
      </div>
      <div className="text-right ml-4">
        <p className="text-sm text-muted-foreground">Por 100g:</p>
        <p className="font-bold text-lg">{food.energy_kcal} kcal</p>
      </div>
    </div>
  </button>
);
