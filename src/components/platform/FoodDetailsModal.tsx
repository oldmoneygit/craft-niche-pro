import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface FoodDetailsModalProps {
  food: {
    food_name: string;
    quantity: number;
    measure_name: string;
    grams: number;
    kcal: number;
    protein: number;
    carb: number;
    fat: number;
    // Detalhes completos opcionais
    fiber?: number;
    sodium?: number;
    calcium?: number;
    iron?: number;
    vitamin_a?: number;
    vitamin_c?: number;
    cholesterol?: number;
    saturated_fat?: number;
    monounsaturated_fat?: number;
    polyunsaturated_fat?: number;
    source?: { code: string; name: string };
    category?: { name: string };
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export function FoodDetailsModal({ food, isOpen, onClose }: FoodDetailsModalProps) {
  if (!isOpen || !food) return null;

  const getBadgeStyle = (code?: string) => {
    const c = code?.toLowerCase();
    if (c === 'taco' || c === 'tbca') return 'bg-green-600 text-white';
    if (c === 'usda') return 'bg-blue-600 text-white';
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
            <h2 className="text-2xl font-bold text-white mb-2">
              {food.food_name}
            </h2>
            <div className="flex items-center gap-3">
              <Badge className={getBadgeStyle(food.source?.code)}>
                {food.source?.code?.toUpperCase() || 'OFF'}
              </Badge>
              <span className="text-gray-400 text-sm">
                {food.category?.name || 'Alimento'}
              </span>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Porção Consumida - Destaque Verde */}
          <div className="bg-gradient-to-r from-green-900/20 to-green-800/10 
                          border border-green-600/30 rounded-xl p-4">
            <h3 className="text-green-400 font-semibold mb-2 text-sm 
                           uppercase tracking-wide">
              Porção Consumida
            </h3>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-green-500 font-bold text-2xl">
                {food.quantity}
              </span>
              <span className="text-green-500/60">×</span>
              <span className="text-white font-medium text-lg">
                {food.measure_name}
              </span>
              <span className="text-gray-400">
                ({food.grams.toFixed(0)}g)
              </span>
            </div>
            <div className="text-orange-400 font-bold text-3xl">
              {food.kcal.toFixed(0)} kcal
            </div>
          </div>

          {/* Macronutrientes Principais */}
          <div>
            <h3 className="text-gray-300 font-semibold mb-3 text-sm 
                           uppercase tracking-wide">
              Macronutrientes
            </h3>
            <div className="grid grid-cols-3 gap-4">
              
              {/* Proteínas */}
              <div className="bg-blue-500/10 border border-blue-500/20 
                              rounded-lg p-4 text-center">
                <div className="text-blue-400 font-bold text-2xl mb-1">
                  {food.protein.toFixed(1)}g
                </div>
                <div className="text-blue-400/60 text-xs">Proteínas</div>
                <div className="text-gray-500 text-xs mt-1">
                  {proteinPercent}%
                </div>
              </div>
              
              {/* Carboidratos */}
              <div className="bg-purple-500/10 border border-purple-500/20 
                              rounded-lg p-4 text-center">
                <div className="text-purple-400 font-bold text-2xl mb-1">
                  {food.carb.toFixed(1)}g
                </div>
                <div className="text-purple-400/60 text-xs">Carboidratos</div>
                <div className="text-gray-500 text-xs mt-1">
                  {carbsPercent}%
                </div>
              </div>
              
              {/* Gorduras */}
              <div className="bg-yellow-500/10 border border-yellow-500/20 
                              rounded-lg p-4 text-center">
                <div className="text-yellow-400 font-bold text-2xl mb-1">
                  {food.fat.toFixed(1)}g
                </div>
                <div className="text-yellow-400/60 text-xs">Gorduras</div>
                <div className="text-gray-500 text-xs mt-1">
                  {fatsPercent}%
                </div>
              </div>
            </div>
          </div>

          {/* Perfil Lipídico */}
          {(food.saturated_fat || food.monounsaturated_fat || food.polyunsaturated_fat || food.cholesterol) && (
            <div>
              <h3 className="text-gray-300 font-semibold mb-3 text-sm 
                             uppercase tracking-wide">
                Perfil Lipídico
              </h3>
              <div className="bg-gray-900/50 rounded-lg p-4 space-y-2">
                {food.saturated_fat !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">
                      Gorduras Saturadas
                    </span>
                    <span className="text-white font-semibold">
                      {food.saturated_fat.toFixed(2)}g
                    </span>
                  </div>
                )}
                {food.monounsaturated_fat !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">
                      Gorduras Monoinsaturadas
                    </span>
                    <span className="text-white font-semibold">
                      {food.monounsaturated_fat.toFixed(2)}g
                    </span>
                  </div>
                )}
                {food.polyunsaturated_fat !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">
                      Gorduras Poli-insaturadas
                    </span>
                    <span className="text-white font-semibold">
                      {food.polyunsaturated_fat.toFixed(2)}g
                    </span>
                  </div>
                )}
                {food.cholesterol !== undefined && (
                  <div className="flex justify-between items-center pt-2 
                                  border-t border-gray-700">
                    <span className="text-gray-400 text-sm">Colesterol</span>
                    <span className="text-white font-semibold">
                      {food.cholesterol.toFixed(1)}mg
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fibras e Micronutrientes */}
          {(food.fiber || food.sodium || food.calcium || food.iron || food.vitamin_a || food.vitamin_c) && (
            <div>
              <h3 className="text-gray-300 font-semibold mb-3 text-sm 
                             uppercase tracking-wide">
                Fibras e Micronutrientes
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {food.fiber !== undefined && (
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <div className="text-gray-400 text-xs mb-1">Fibras</div>
                    <div className="text-white font-bold text-lg">
                      {food.fiber.toFixed(1)}g
                    </div>
                  </div>
                )}
                {food.sodium !== undefined && (
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <div className="text-gray-400 text-xs mb-1">Sódio</div>
                    <div className="text-white font-bold text-lg">
                      {food.sodium.toFixed(0)}mg
                    </div>
                  </div>
                )}
                {food.calcium !== undefined && (
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <div className="text-gray-400 text-xs mb-1">Cálcio</div>
                    <div className="text-white font-bold text-lg">
                      {food.calcium.toFixed(0)}mg
                    </div>
                  </div>
                )}
                {food.iron !== undefined && (
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <div className="text-gray-400 text-xs mb-1">Ferro</div>
                    <div className="text-white font-bold text-lg">
                      {food.iron.toFixed(1)}mg
                    </div>
                  </div>
                )}
                {food.vitamin_a !== undefined && (
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <div className="text-gray-400 text-xs mb-1">Vitamina A</div>
                    <div className="text-white font-bold text-lg">
                      {food.vitamin_a.toFixed(0)}µg
                    </div>
                  </div>
                )}
                {food.vitamin_c !== undefined && (
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <div className="text-gray-400 text-xs mb-1">Vitamina C</div>
                    <div className="text-white font-bold text-lg">
                      {food.vitamin_c.toFixed(1)}mg
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fonte dos Dados */}
          <div className="bg-gray-900/50 rounded-lg p-4">
            <h3 className="text-gray-400 text-xs uppercase tracking-wide mb-2">
              Fonte dos Dados
            </h3>
            <p className="text-white text-sm">
              {food.source?.name || 'Fonte não identificada'}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
