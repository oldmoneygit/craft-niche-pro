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

  return (
    <div className="group flex items-start justify-between gap-4 p-4 bg-gray-700/50 rounded-lg border border-gray-600 hover:bg-gray-700 transition-colors">
      {/* Coluna Esquerda: Nome + Detalhes */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-white text-base mb-2">
          {item.food_name}
        </h4>

        <div className="flex items-center gap-3 text-sm text-gray-300 mb-2">
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
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              {item.quantity} ×
            </button>
          )}

          <Select value={item.measure_id} onValueChange={handleMeasureChange}>
            <SelectTrigger className="h-7 w-[180px] bg-gray-800 border-gray-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {measures.map((measure) => (
                <SelectItem key={measure.id} value={measure.id}>
                  {measure.measure_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="text-gray-400">
            ({Math.round(item.grams_total)}g)
          </span>
        </div>

        <div className="flex gap-4 text-xs text-gray-400">
          <span>P: {Math.round(item.protein_total)}g</span>
          <span>C: {Math.round(item.carb_total)}g</span>
          <span>G: {Math.round(item.fat_total)}g</span>
        </div>
      </div>

      {/* Coluna Direita: Calorias + Ações */}
      <div className="flex items-center gap-3">
        <div className="text-right whitespace-nowrap">
          <div className="text-lg font-bold text-white">
            {Math.round(item.kcal_total)}
          </div>
          <div className="text-xs text-gray-400">
            kcal
          </div>
        </div>

        <Button
          size="icon"
          variant="ghost"
          onClick={onRemove}
          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-gray-800"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
