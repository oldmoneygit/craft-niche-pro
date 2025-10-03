import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Scale } from "lucide-react";

interface EditPortionModalProps {
  foodItem: {
    id: string;
    food_name: string;
    current_measure: string;
    current_measure_id: string;
    current_quantity: number;
    available_measures: Array<{
      id: string;
      measure_name: string;
      grams: number;
    }>;
  } | null;
  open: boolean;
  onClose: () => void;
  onSave: (foodItemId: string, newMeasureId: string, newQuantity: number) => void;
}

export function EditPortionModal({ foodItem, open, onClose, onSave }: EditPortionModalProps) {
  const [selectedMeasure, setSelectedMeasure] = useState('');
  const [quantity, setQuantity] = useState(1);
  
  useEffect(() => {
    if (foodItem) {
      setSelectedMeasure(foodItem.current_measure_id);
      setQuantity(foodItem.current_quantity);
    }
  }, [foodItem]);
  
  const handleSave = () => {
    if (foodItem && selectedMeasure && quantity > 0) {
      onSave(foodItem.id, selectedMeasure, quantity);
      onClose();
    }
  };
  
  const selectedMeasureData = foodItem?.available_measures.find(
    m => m.id === selectedMeasure
  );
  
  const totalGrams = selectedMeasureData 
    ? (selectedMeasureData.grams * quantity).toFixed(0)
    : 0;
  
  if (!foodItem) return null;
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Ajustar Porção
          </DialogTitle>
          <p className="text-sm text-muted-foreground pt-2">
            {foodItem.food_name}
          </p>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Seletor de medida */}
          <div className="space-y-2">
            <Label>Medida caseira</Label>
            <select
              value={selectedMeasure}
              onChange={(e) => setSelectedMeasure(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {foodItem.available_measures.map(measure => (
                <option key={measure.id} value={measure.id}>
                  {measure.measure_name} ({measure.grams}g)
                </option>
              ))}
            </select>
          </div>
          
          {/* Quantidade */}
          <div className="space-y-2">
            <Label>Quantidade</Label>
            <Input
              type="number"
              min="0.1"
              step="0.1"
              value={quantity}
              onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
            />
          </div>
          
          {/* Preview */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-semibold">
                {quantity}x {selectedMeasureData?.measure_name} = {totalGrams}g
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!selectedMeasure || quantity <= 0}>
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
