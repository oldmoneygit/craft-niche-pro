import { useState } from 'react';
import { Search, Plus, X, Filter } from 'lucide-react';
import { useFoodSearch } from '@/hooks/useFoodSearch';
import { useFoodMeasures } from '@/hooks/useFoodMeasures';
import { usePopularFoods } from '@/hooks/usePopularFoods';
import { useFoodsBySource } from '@/hooks/useFoodsBySource';
import { useFoodCategories } from '@/hooks/useFoodCategories';
import { Badge } from '@/components/ui/badge';

interface FoodItem {
  food: any;
  measure: any;
  quantity: number;
  calculatedNutrients: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

interface MealFoodBuilderProps {
  mealType: string;
  mealLabel: string;
  mealEmoji: string;
  foods: FoodItem[];
  onAddFood: (food: FoodItem) => void;
  onRemoveFood: (index: number) => void;
}

export function MealFoodBuilder({
  mealType,
  mealLabel,
  mealEmoji,
  foods,
  onAddFood,
  onRemoveFood
}: MealFoodBuilderProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [selectedMeasure, setSelectedMeasure] = useState<any>(null);
  const [quantity, setQuantity] = useState('1');
  const [showSearch, setShowSearch] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: searchResults, isLoading } = useFoodSearch(searchTerm);
  const { data: popularFoods, isLoading: isLoadingPopular } = usePopularFoods();
  const { data: measures } = useFoodMeasures(selectedFood?.id || '');
  const { data: foodsBySource, isLoading: isLoadingBySource } = useFoodsBySource(selectedSource, selectedCategory);
  const { data: categories } = useFoodCategories(selectedSource);

  // Lógica para determinar quais alimentos mostrar
  const displayFoods = selectedSource 
    ? foodsBySource 
    : searchTerm.length >= 2 
      ? searchResults 
      : (isFocused ? popularFoods : []);

  const handleAddFood = () => {
    if (!selectedFood || !quantity) return;

    const quantityNum = parseFloat(quantity);
    const grams = selectedMeasure ? selectedMeasure.grams * quantityNum : quantityNum;

    const foodData: FoodItem = {
      food: selectedFood,
      measure: selectedMeasure,
      quantity: quantityNum,
      calculatedNutrients: {
        calories: (selectedFood.calories * grams) / 100,
        protein: (selectedFood.protein * grams) / 100,
        carbs: (selectedFood.carbs * grams) / 100,
        fats: (selectedFood.fats * grams) / 100,
      }
    };

    onAddFood(foodData);
    
    // Reset
    setSearchTerm('');
    setSelectedFood(null);
    setSelectedMeasure(null);
    setQuantity('1');
    setShowSearch(false);
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="text-2xl">{mealEmoji}</span>
          {mealLabel}
        </h4>
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Adicionar
        </button>
      </div>

      {/* Lista de alimentos adicionados */}
      {foods.length > 0 && (
        <div className="space-y-2 mb-4">
          {foods.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg"
            >
              <div className="flex-1">
                <div className="font-semibold text-gray-900 dark:text-white text-sm">
                  {item.food.name}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {item.quantity} {item.measure?.measure_name || 'g'} • {' '}
                  {item.calculatedNutrients.calories.toFixed(0)} kcal • {' '}
                  P: {item.calculatedNutrients.protein.toFixed(1)}g • {' '}
                  C: {item.calculatedNutrients.carbs.toFixed(1)}g • {' '}
                  G: {item.calculatedNutrients.fats.toFixed(1)}g
                </div>
              </div>
              <button
                onClick={() => onRemoveFood(index)}
                className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Busca de alimentos */}
      {showSearch && (
        <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
          {/* Filtros por Fonte de Dados */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                Fonte de Dados
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setSelectedSource(selectedSource === 'TACO' ? null : 'TACO');
                  setSelectedCategory(null);
                  setSearchTerm('');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedSource === 'TACO'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-emerald-500'
                }`}
              >
                TACO (Brasil)
              </button>
              <button
                onClick={() => {
                  setSelectedSource(selectedSource === 'OpenFoodFacts' ? null : 'OpenFoodFacts');
                  setSelectedCategory(null);
                  setSearchTerm('');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedSource === 'OpenFoodFacts'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-blue-500'
                }`}
              >
                OpenFoodFacts
              </button>
              <button
                onClick={() => {
                  setSelectedSource(selectedSource === 'USDA' ? null : 'USDA');
                  setSelectedCategory(null);
                  setSearchTerm('');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedSource === 'USDA'
                    ? 'bg-purple-500 text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-purple-500'
                }`}
              >
                USDA (EUA)
              </button>
            </div>
          </div>

          {/* Filtros por Categoria (só aparece quando uma fonte está selecionada) */}
          {selectedSource && categories && categories.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                  Categoria
                </span>
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    Limpar filtro
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      selectedCategory === category
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-emerald-500'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input de busca (desabilitado quando há filtro de fonte ativo) */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={selectedSource ? "Pesquisa desabilitada - use os filtros acima" : "Buscar alimento... (ex: arroz, frango, banana)"}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              disabled={!!selectedSource}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Resultados da busca ou alimentos populares */}
          {(searchTerm.length >= 2 || isFocused || selectedSource) && (
            <div className="space-y-2">
              {selectedSource && (
                <div className="flex items-center justify-between px-2">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {selectedCategory ? `${selectedSource} - ${selectedCategory}` : `Todos os alimentos ${selectedSource}`}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {displayFoods?.length || 0} alimentos
                  </div>
                </div>
              )}
              {searchTerm.length === 0 && isFocused && !selectedSource && (
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-2">
                  Alimentos mais comuns
                </div>
              )}
              <div className="max-h-64 overflow-y-auto space-y-1">
                {(isLoading || isLoadingPopular || isLoadingBySource) ? (
                  <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    Buscando...
                  </div>
                ) : displayFoods?.length ? (
                  displayFoods.map((food) => (
                    <button
                      key={food.id}
                      onClick={() => setSelectedFood(food)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedFood?.id === food.id
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-gray-900 dark:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-semibold text-sm flex-1">{food.name}</div>
                        <Badge 
                          variant={food.source === 'TACO' ? 'default' : 'secondary'}
                          className={`ml-2 text-[10px] ${
                            food.source === 'TACO' 
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                              : 'bg-gray-400 hover:bg-gray-500 text-white'
                          } ${selectedFood?.id === food.id ? 'bg-white text-emerald-600' : ''}`}
                        >
                          {food.source}
                        </Badge>
                      </div>
                      <div className={`text-xs ${
                        selectedFood?.id === food.id 
                          ? 'text-emerald-100' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {food.calories?.toFixed(0) || 0} kcal/100g • {' '}
                        P: {food.protein?.toFixed(1) || 0}g • {' '}
                        C: {food.carbs?.toFixed(1) || 0}g • {' '}
                        G: {food.fats?.toFixed(1) || 0}g
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    Nenhum alimento encontrado
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Seleção de medida e quantidade */}
          {selectedFood && (
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Medida
                </label>
                <select
                  value={selectedMeasure?.id || ''}
                  onChange={(e) => {
                    const measure = measures?.find(m => m.id === e.target.value);
                    setSelectedMeasure(measure || null);
                  }}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors"
                >
                  <option value="">Gramas</option>
                  {measures?.map((measure) => (
                    <option key={measure.id} value={measure.id}>
                      {measure.measure_name} ({measure.grams}g)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Quantidade
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Botão adicionar */}
          {selectedFood && (
            <button
              onClick={handleAddFood}
              className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              Adicionar à Refeição
            </button>
          )}
        </div>
      )}
    </div>
  );
}
