import { useState } from 'react';
import { GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useFoodMeasures } from '@/hooks/useFoodMeasures';

interface RecordFoodItemProps {
  item: {
    id?: string;
    food_id: string;
    food_name: string;
    measure_id: string;
    measure_name: string;
    measure_grams: number;
    quantity: number;
    grams_total: number;
    kcal_total: number;
    protein_total: number;
    carb_total: number;
    fat_total: number;
  };
  onUpdate: (updates: { measure_id?: string; quantity?: number }) => void;
  onRemove: () => void;
  dragHandleProps?: any;
}

export function RecordFoodItem({ item, onUpdate, onRemove, dragHandleProps }: RecordFoodItemProps) {
  const [isEditingQuantity, setIsEditingQuantity] = useState(false);
  const [tempQuantity, setTempQuantity] = useState(item.quantity.toString());
  const { data: measures = [] } = useFoodMeasures(item.food_id);

  const handleQuantitySubmit = () => {
    const qty = parseFloat(tempQuantity);
    if (!isNaN(qty) && qty > 0) {
      onUpdate({ quantity: qty });
    }
    setIsEditingQuantity(false);
  };

  const handleMeasureChange = (measureId: string) => {
    onUpdate({ measure_id: measureId });
  };

  const getBadgeColor = (code?: string) => {
    const c = code?.toLowerCase();
    
    if (c === 'taco' || c === 'tbca') {
      return 'bg-green-600 text-white hover:bg-green-700';
    }
    if (c === 'usda') {
      return 'bg-blue-600 text-white hover:bg-blue-700';
    }
    if (c === 'ibge') {
      return 'bg-orange-600 text-white hover:bg-orange-700';
    }
    return 'bg-gray-600 text-white hover:bg-gray-700';
  };

  return (
    <div className="group relative flex items-start gap-4 p-4 
                    bg-gradient-to-r from-gray-800/60 to-gray-700/40
                    rounded-lg border border-gray-600/50
                    hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5
                    transition-all duration-200">
      
      {/* Drag Handle */}
      <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing opacity-40 
                      group-hover:opacity-100 transition-opacity pt-1">
        <GripVertical className="h-5 w-5 text-gray-400" />
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 min-w-0">
        
        {/* Linha 1: Nome + Badge + Botão Remover */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h4 className="font-semibold text-white text-lg leading-tight">
            {item.food_name}
          </h4>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="h-8 w-8 opacity-0 group-hover:opacity-100 
                         transition-opacity text-red-400 hover:text-red-300
                         hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Linha 2: Quantidade × Medida + Calorias */}
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-baseline gap-1.5">
            {isEditingQuantity ? (
              <Input
                type="number"
                min="0.1"
                step="0.1"
                value={tempQuantity}
                onChange={(e) => setTempQuantity(e.target.value)}
                onBlur={handleQuantitySubmit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleQuantitySubmit();
                  if (e.key === 'Escape') {
                    setTempQuantity(item.quantity.toString());
                    setIsEditingQuantity(false);
                  }
                }}
                autoFocus
                className="h-7 w-16 bg-gray-800 border-gray-600 text-gray-100"
              />
            ) : (
              <button
                onClick={() => setIsEditingQuantity(true)}
                className="font-bold text-primary text-lg hover:text-primary/80 transition-colors"
              >
                {item.quantity}
              </button>
            )}
            
            <span className="text-primary/60 font-medium text-base">×</span>
            
            <Select value={item.measure_id} onValueChange={handleMeasureChange}>
              <SelectTrigger className="h-7 w-[180px] bg-gray-800 border-gray-600 text-gray-300 font-medium">
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

            <span className="text-gray-500 text-sm ml-1">
              ({Math.round(item.grams_total)}g)
            </span>
          </div>
          
          <div className="text-right flex-shrink-0">
            <div className="text-2xl font-bold text-orange-400 leading-none">
              {Math.round(item.kcal_total)}
            </div>
            <div className="text-xs text-orange-400/60 font-medium leading-none mt-0.5">
              kcal
            </div>
          </div>
        </div>

        {/* Linha 3: Macronutrientes */}
        <div className="flex gap-5 text-sm font-medium">
          <div className="flex items-baseline gap-1">
            <span className="text-blue-400/80 font-semibold">P:</span>
            <span className="text-blue-300 font-bold">
              {item.protein_total.toFixed(1)}g
            </span>
          </div>
          
          <div className="flex items-baseline gap-1">
            <span className="text-purple-400/80 font-semibold">C:</span>
            <span className="text-purple-300 font-bold">
              {item.carb_total.toFixed(1)}g
            </span>
          </div>
          
          <div className="flex items-baseline gap-1">
            <span className="text-yellow-400/80 font-semibold">G:</span>
            <span className="text-yellow-300 font-bold">
              {item.fat_total.toFixed(1)}g
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
