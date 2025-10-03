import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { calculateItemNutrition, formatNutrient } from '@/lib/nutritionCalculations';

interface QuickPortionDialogProps {
  food: any;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (item: any) => void;
}

export const QuickPortionDialog = ({ food, isOpen, onClose, onConfirm }: QuickPortionDialogProps) => {
  const [selectedMeasure, setSelectedMeasure] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);

  const { data: measures } = useQuery({
    queryKey: ['food-measures', food.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('food_measures')
        .select('*')
        .eq('food_id', food.id)
        .order('is_default', { ascending: false });

      let measuresData = data || [];

      if (measuresData.length === 0) {
        measuresData = [{
          id: 'temp-gram',
          food_id: food.id,
          measure_name: 'gramas (100g)',
          grams: 100,
          grams_equivalent: 100,
          is_default: true,
          created_at: new Date().toISOString()
        }];
      }

      return measuresData;
    },
    enabled: isOpen && !!food
  });

  useEffect(() => {
    if (measures && measures.length > 0 && !selectedMeasure) {
      setSelectedMeasure(measures[0]);
    }
  }, [measures, selectedMeasure]);

  const calculatedNutrition = selectedMeasure
    ? calculateItemNutrition(food, selectedMeasure, quantity)
    : null;

  const handleConfirm = () => {
    if (!selectedMeasure) return;

    const item = {
      food_id: food.id,
      measure_id: selectedMeasure.id,
      quantity,
      food,
      measure: selectedMeasure,
      ...calculatedNutrition
    };

    onConfirm(item);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{food.name}</span>
            <Badge
              variant={
                food.source?.toLowerCase().includes('taco') ||
                food.source?.toLowerCase().includes('tbca')
                  ? 'default'
                  : 'secondary'
              }
              className={
                food.source?.toLowerCase().includes('taco') ||
                food.source?.toLowerCase().includes('tbca')
                  ? 'bg-green-600'
                  : 'bg-blue-500'
              }
            >
              {food.source?.toLowerCase().includes('taco') ||
               food.source?.toLowerCase().includes('tbca')
                ? 'TACO'
                : 'OFF'}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="bg-muted/30 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-2">Valores por 100g</p>
            <div className="grid grid-cols-4 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Calorias</p>
                <p className="font-bold">{food.energy_kcal}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Proteínas</p>
                <p className="font-bold">{formatNutrient(food.protein_g)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Carbos</p>
                <p className="font-bold">{formatNutrient(food.carbohydrate_g)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Gorduras</p>
                <p className="font-bold">{formatNutrient(food.lipid_g)}</p>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Medida</label>
            <select
              value={selectedMeasure?.id || ''}
              onChange={(e) => {
                const measure = measures?.find(m => m.id === e.target.value);
                setSelectedMeasure(measure);
              }}
              className="w-full h-10 px-3 rounded-md border bg-background text-sm"
            >
              {measures?.map(measure => (
                <option key={measure.id} value={measure.id}>
                  {measure.measure_name} ({measure.grams}g)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Quantidade</label>
            <Input
              type="number"
              step="0.5"
              min="0.1"
              value={quantity}
              onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
            />
          </div>

          {calculatedNutrition && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
              <p className="text-sm font-medium mb-2">
                Total: {quantity} {selectedMeasure?.measure_name} = {calculatedNutrition.grams_total.toFixed(0)}g
              </p>
              <div className="grid grid-cols-4 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Calorias</p>
                  <p className="font-bold">{calculatedNutrition.kcal_total.toFixed(0)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Proteínas</p>
                  <p className="font-bold">{formatNutrient(calculatedNutrition.protein_total)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Carbos</p>
                  <p className="font-bold">{formatNutrient(calculatedNutrition.carb_total)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Gorduras</p>
                  <p className="font-bold">{formatNutrient(calculatedNutrition.fat_total)}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleConfirm} className="flex-1">
              Adicionar à Refeição
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
