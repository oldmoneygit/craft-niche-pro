import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface FoodDetailsModalProps {
  food: {
    food_id?: string;
    food_name: string;
    quantity: number;
    measure_name: string;
    grams: number;
    kcal: number;
    protein: number;
    carb: number;
    fat: number;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

interface FoodNutrition {
  fiber_g?: number;
  sodium_mg?: number;
  calcium_mg?: number;
  iron_mg?: number;
  vitamin_a_mcg?: number;
  vitamin_c_mg?: number;
  cholesterol_mg?: number;
  saturated_fat_g?: number;
  monounsaturated_fat_g?: number;
  polyunsaturated_fat_g?: number;
  source?: { code: string; name: string };
  category?: { name: string };
}

export function FoodDetailsModal({ food, isOpen, onClose }: FoodDetailsModalProps) {
  const [nutritionData, setNutritionData] = useState<FoodNutrition | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && food?.food_id) {
      fetchNutritionData();
    }
  }, [isOpen, food?.food_id]);

  const fetchNutritionData = async () => {
    if (!food?.food_id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('foods')
        .select(`
          fiber_g,
          sodium_mg,
          saturated_fat_g,
          category,
          source,
          nutrition_sources (code, name),
          food_categories (name)
        `)
        .eq('id', food.food_id)
        .single();

      if (!error && data) {
        setNutritionData({
          fiber_g: data.fiber_g,
          sodium_mg: data.sodium_mg,
          saturated_fat_g: data.saturated_fat_g,
          source: data.nutrition_sources || { code: data.source || 'OFF', name: '' },
          category: data.food_categories
        });
      }
    } catch (error) {
      console.error('Erro ao buscar dados nutricionais:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !food) return null;

  const getBadgeStyle = (code?: string) => {
    const c = code?.toLowerCase();
    if (c === 'taco' || c === 'tbca') return 'bg-green-600 text-white';
    if (c === 'usda') return 'bg-purple-600 text-white';
    if (c === 'ibge') return 'bg-orange-600 text-white';
    return 'bg-gray-600 text-white';
  };

  // Calcular porcentagem de contribuição calórica
  const proteinPercent = food.kcal > 0 ? ((food.protein * 4 / food.kcal) * 100).toFixed(0) : '0';
  const carbsPercent = food.kcal > 0 ? ((food.carb * 4 / food.kcal) * 100).toFixed(0) : '0';
  const fatsPercent = food.kcal > 0 ? ((food.fat * 9 / food.kcal) * 100).toFixed(0) : '0';

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] 
                   overflow-y-auto border border-gray-700"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header Fixo */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 
                        flex items-start justify-between z-10">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-3">
              {food.food_name}
            </h2>
            <div className="flex items-center gap-2">
              <Badge className={getBadgeStyle(nutritionData?.source?.code)}>
                {nutritionData?.source?.code?.toUpperCase() || 'OFF'}
              </Badge>
              <span className="text-gray-400 text-sm">
                {nutritionData?.category?.name || 'Pães e Massas'}
              </span>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Porção Consumida - Destaque Verde */}
          <div className="bg-gradient-to-r from-green-900/30 to-green-800/20 
                          border border-green-600/40 rounded-xl p-5">
            <h3 className="text-green-400 font-semibold mb-3 text-xs 
                           uppercase tracking-wider">
              Porção Consumida
            </h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-green-500 font-bold text-3xl">
                {food.quantity}
              </span>
              <span className="text-green-500/60 text-xl">×</span>
              <span className="text-white font-medium text-lg">
                {food.measure_name}
              </span>
              <span className="text-gray-400 text-sm">
                ({food.grams.toFixed(0)}g)
              </span>
            </div>
            <div className="text-orange-400 font-bold text-4xl">
              {food.kcal.toFixed(0)} kcal
            </div>
          </div>

          {/* Macronutrientes Principais */}
          <div>
            <h3 className="text-gray-300 font-semibold mb-3 text-xs 
                           uppercase tracking-wider">
              Macronutrientes
            </h3>
            <div className="grid grid-cols-3 gap-3">
              
              {/* Proteínas */}
              <div className="bg-blue-900/20 border border-blue-500/30 
                              rounded-lg p-4 text-center">
                <div className="text-blue-400 font-bold text-3xl mb-1">
                  {food.protein.toFixed(1)}g
                </div>
                <div className="text-blue-400/70 text-xs font-medium mb-1">
                  Proteínas
                </div>
                <div className="text-gray-500 text-xs">
                  {proteinPercent}%
                </div>
              </div>
              
              {/* Carboidratos */}
              <div className="bg-purple-900/20 border border-purple-500/30 
                              rounded-lg p-4 text-center">
                <div className="text-purple-400 font-bold text-3xl mb-1">
                  {food.carb.toFixed(1)}g
                </div>
                <div className="text-purple-400/70 text-xs font-medium mb-1">
                  Carboidratos
                </div>
                <div className="text-gray-500 text-xs">
                  {carbsPercent}%
                </div>
              </div>
              
              {/* Gorduras */}
              <div className="bg-yellow-900/20 border border-yellow-500/30 
                              rounded-lg p-4 text-center">
                <div className="text-yellow-400 font-bold text-3xl mb-1">
                  {food.fat.toFixed(1)}g
                </div>
                <div className="text-yellow-400/70 text-xs font-medium mb-1">
                  Gorduras
                </div>
                <div className="text-gray-500 text-xs">
                  {fatsPercent}%
                </div>
              </div>
            </div>
          </div>

          {/* Perfil Lipídico */}
          {nutritionData?.saturated_fat_g !== undefined && (
            <div>
              <h3 className="text-gray-300 font-semibold mb-3 text-xs 
                             uppercase tracking-wider">
                Perfil Lipídico
              </h3>
              <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">
                    Gorduras Saturadas
                  </span>
                  <span className="text-white font-semibold">
                    {(nutritionData.saturated_fat_g * food.grams / 100).toFixed(1)}g
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">
                    Gorduras Monoinsaturadas
                  </span>
                  <span className="text-white font-semibold">
                    {(nutritionData.monounsaturated_fat_g || 0).toFixed(1)}g
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">
                    Gorduras Poli-insaturadas
                  </span>
                  <span className="text-white font-semibold">
                    {(nutritionData.polyunsaturated_fat_g || 0).toFixed(1)}g
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 
                                border-t border-gray-700">
                  <span className="text-gray-400 text-sm">Colesterol</span>
                  <span className="text-white font-semibold">
                    {(nutritionData.cholesterol_mg || 0).toFixed(0)}mg
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Fibras e Micronutrientes */}
          {(nutritionData?.fiber_g || nutritionData?.sodium_mg || nutritionData?.calcium_mg || 
            nutritionData?.iron_mg || nutritionData?.vitamin_a_mcg || nutritionData?.vitamin_c_mg) && (
            <div>
              <h3 className="text-gray-300 font-semibold mb-3 text-xs 
                             uppercase tracking-wider">
                Fibras e Micronutrientes
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {nutritionData.fiber_g !== undefined && (
                  <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-3">
                    <div className="text-gray-400 text-xs mb-1">Fibras</div>
                    <div className="text-white font-bold text-xl">
                      {(nutritionData.fiber_g * food.grams / 100).toFixed(1)}g
                    </div>
                  </div>
                )}
                {nutritionData.sodium_mg !== undefined && (
                  <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-3">
                    <div className="text-gray-400 text-xs mb-1">Sódio</div>
                    <div className="text-white font-bold text-xl">
                      {(nutritionData.sodium_mg * food.grams / 100).toFixed(0)}mg
                    </div>
                  </div>
                )}
                {nutritionData.calcium_mg !== undefined && (
                  <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-3">
                    <div className="text-gray-400 text-xs mb-1">Cálcio</div>
                    <div className="text-white font-bold text-xl">
                      {(nutritionData.calcium_mg * food.grams / 100).toFixed(0)}mg
                    </div>
                  </div>
                )}
                {nutritionData.iron_mg !== undefined && (
                  <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-3">
                    <div className="text-gray-400 text-xs mb-1">Ferro</div>
                    <div className="text-white font-bold text-xl">
                      {(nutritionData.iron_mg * food.grams / 100).toFixed(1)}mg
                    </div>
                  </div>
                )}
                {nutritionData.vitamin_a_mcg !== undefined && (
                  <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-3">
                    <div className="text-gray-400 text-xs mb-1">Vitamina A</div>
                    <div className="text-white font-bold text-xl">
                      {(nutritionData.vitamin_a_mcg * food.grams / 100).toFixed(0)}µg
                    </div>
                  </div>
                )}
                {nutritionData.vitamin_c_mg !== undefined && (
                  <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-3">
                    <div className="text-gray-400 text-xs mb-1">Vitamina C</div>
                    <div className="text-white font-bold text-xl">
                      {(nutritionData.vitamin_c_mg * food.grams / 100).toFixed(1)}mg
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fonte dos Dados */}
          <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4">
            <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-2">
              Fonte dos Dados
            </h3>
            <p className="text-white text-sm font-medium">
              {nutritionData?.source?.name || 'Tabela Brasileira de Composição de Alimentos (TBCA)'}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
