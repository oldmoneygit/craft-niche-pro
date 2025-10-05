import { useState } from 'react';
import { Trash2, Info, Edit2, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface RecordFoodItemProps {
  item: {
    id?: string;
    food_id?: string;
    food_name: string;
    measure_id?: string;
    measure_name: string;
    quantity: number;
    grams: number;
    kcal: number;
    protein: number;
    carb: number;
    fat: number;
    source_code?: string;
  };
  onRemove: () => void;
  onShowDetails: () => void;
  onUpdate?: (updates: { measure_id?: string; quantity?: number }) => void;
}

export function RecordFoodItem({ item, onRemove, onShowDetails, onUpdate }: RecordFoodItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editQuantity, setEditQuantity] = useState(item.quantity.toString());
  const [editMeasureId, setEditMeasureId] = useState(item.measure_id || '');

  const { data: measures = [] } = useQuery({
    queryKey: ['food-measures', item.food_id],
    queryFn: async () => {
      if (!item.food_id) return [];

      const { data } = await supabase
        .from('food_measures')
        .select('id, measure_name, grams, is_default')
        .eq('food_id', item.food_id)
        .order('is_default', { ascending: false })
        .order('measure_name');

      return data || [];
    },
    enabled: isEditing && !!item.food_id
  });
  
  const getBadgeStyle = (code?: string) => {
    const c = code?.toLowerCase();
    if (c === 'taco' || c === 'tbca') {
      return 'bg-green-600 hover:bg-green-700 text-white';
    }
    if (c === 'usda') {
      return 'bg-purple-600 hover:bg-purple-700 text-white';
    }
    if (c === 'ibge') {
      return 'bg-orange-600 hover:bg-orange-700 text-white';
    }
    return 'bg-gray-600 hover:bg-gray-700 text-white';
  };

  const handleSaveEdit = () => {
    const qty = parseFloat(editQuantity);
    if (isNaN(qty) || qty <= 0) return;

    if (onUpdate) {
      onUpdate({
        quantity: qty,
        measure_id: editMeasureId !== item.measure_id ? editMeasureId : undefined
      });
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditQuantity(item.quantity.toString());
    setEditMeasureId(item.measure_id || '');
    setIsEditing(false);
  };

  return (
    <div className="bg-gradient-to-r from-gray-800/60 to-gray-700/40 
                    rounded-lg border border-gray-600/50 p-4 
                    hover:border-green-500/40 transition-all group">
      
      {/* Linha 1: Nome + Badge + Botões */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h4 className="font-semibold text-white text-lg flex-1 leading-tight">
          {item.food_name}
        </h4>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Botão Edit - NOVO */}
          {!isEditing && onUpdate && (
            <button 
              onClick={() => setIsEditing(true)}
              className="opacity-0 group-hover:opacity-100 transition-opacity 
                         text-blue-400 hover:text-blue-300 p-1.5 
                         hover:bg-blue-500/10 rounded"
              title="Editar quantidade/medida"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          
          {/* Botão Info */}
          <button 
            onClick={onShowDetails}
            className="opacity-0 group-hover:opacity-100 transition-opacity 
                       text-blue-400 hover:text-blue-300 p-1.5 
                       hover:bg-blue-500/10 rounded"
            title="Ver detalhes completos"
          >
            <Info className="w-4 h-4" />
          </button>
          
          {/* Badge */}
          <Badge className={getBadgeStyle(item.source_code)}>
            {item.source_code?.toUpperCase() || 'OFF'}
          </Badge>
          
          {/* Botão Delete */}
          <button 
            onClick={onRemove}
            className="opacity-0 group-hover:opacity-100 transition-opacity 
                       text-red-400 hover:text-red-300 p-1.5 
                       hover:bg-red-500/10 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Linha 2: Quantidade + Medida + Calorias */}
      <div className="flex items-center justify-between mb-3">
        {isEditing ? (
          // Modo de edição
          <div className="flex items-center gap-2 flex-1">
            <Input
              type="number"
              min="0.1"
              step="0.1"
              value={editQuantity}
              onChange={(e) => setEditQuantity(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveEdit();
                if (e.key === 'Escape') handleCancelEdit();
              }}
              className="h-8 w-20 bg-gray-700 border-gray-600 text-gray-100"
              autoFocus
            />
            <span className="text-green-500/60 font-medium">×</span>
            
            <Select value={editMeasureId} onValueChange={setEditMeasureId}>
              <SelectTrigger className="h-8 w-[200px] bg-gray-700 border-gray-600 text-gray-300">
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

            <button
              onClick={handleSaveEdit}
              className="p-1.5 rounded text-green-400 hover:text-green-300 hover:bg-green-500/10"
              title="Salvar"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={handleCancelEdit}
              className="p-1.5 rounded text-gray-400 hover:text-gray-300 hover:bg-gray-500/10"
              title="Cancelar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          // Modo visualização
          <div className="flex items-baseline gap-2">
            {/* Quantidade - VERDE */}
            <span className="text-green-500 font-bold text-xl">
              {item.quantity}
            </span>
            <span className="text-green-500/60 font-medium">×</span>
            
            {/* Medida - CINZA CLARO */}
            <span className="text-gray-300 font-medium">
              {item.measure_name}
            </span>
            
            {/* Gramas - CINZA ESCURO */}
            <span className="text-gray-500 text-sm">
              ({item.grams.toFixed(0)}g)
            </span>
          </div>
        )}
        
        {/* Calorias - LARANJA DESTAQUE */}
        <div className="text-right flex-shrink-0">
          <div className="text-orange-400 font-bold text-2xl leading-none">
            {item.kcal.toFixed(0)}
          </div>
          <div className="text-orange-400/60 text-xs font-medium leading-none mt-0.5">
            kcal
          </div>
        </div>
      </div>

      {/* Linha 3: Macronutrientes COLORIDOS */}
      <div className="flex gap-6 text-sm font-medium">
        {/* Proteínas - AZUL */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-blue-400/80 font-semibold">Proteínas:</span>
          <span className="text-blue-300 font-bold">
            {item.protein.toFixed(1)}g
          </span>
        </div>
        
        {/* Carboidratos - ROXO */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-purple-400/80 font-semibold">Carboidratos:</span>
          <span className="text-purple-300 font-bold">
            {item.carb.toFixed(1)}g
          </span>
        </div>
        
        {/* Gorduras - AMARELO */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-yellow-400/80 font-semibold">Gorduras:</span>
          <span className="text-yellow-300 font-bold">
            {item.fat.toFixed(1)}g
          </span>
        </div>
      </div>
    </div>
  );
}
