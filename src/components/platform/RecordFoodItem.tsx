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
    <div className="group flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-700/50 transition-colors">
      <div
        {...dragHandleProps}
        className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>

      <div className="flex-1 grid grid-cols-[2fr_1fr_1fr_100px] gap-3 items-center">
        <div className="font-medium truncate text-gray-100">{item.food_name}</div>

        <div className="flex items-center gap-1">
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
              className="h-8 w-16 bg-gray-700 border-gray-600 text-gray-100"
            />
          ) : (
            <button
              onClick={() => setIsEditingQuantity(true)}
              className="h-8 px-2 hover:bg-gray-700 rounded text-sm text-gray-100"
            >
              {item.quantity}
            </button>
          )}

          <Select value={item.measure_id} onValueChange={handleMeasureChange}>
            <SelectTrigger className="h-8 flex-1">
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
        </div>

        <div className="text-sm text-gray-400">
          {Math.round(item.grams_total)}g
        </div>

        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" className="font-mono border-gray-600 text-gray-100">
            {Math.round(item.kcal_total)} kcal
          </Badge>
          <Button
            size="icon"
            variant="ghost"
            onClick={onRemove}
            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-gray-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
