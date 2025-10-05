import { Trash2, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
}

export function RecordFoodItem({ item, onRemove, onShowDetails }: RecordFoodItemProps) {
  
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
          {/* Botão Info - NOVO */}
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
