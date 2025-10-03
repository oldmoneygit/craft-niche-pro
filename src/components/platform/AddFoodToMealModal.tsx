import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ArrowLeft, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AddFoodToMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFood: (item: any) => void;
}

export function AddFoodToMealModal({
  isOpen,
  onClose,
  onAddFood
}: AddFoodToMealModalProps) {
  const [view, setView] = useState<'search' | 'add-portion'>('search');
  const [searchTerm, setSearchTerm] = useState('');
  const [foods, setFoods] = useState<any[]>([]);
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [measures, setMeasures] = useState<any[]>([]);
  const [selectedMeasure, setSelectedMeasure] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<'all' | 'TACO' | 'OpenFoodFacts'>('all');

  useEffect(() => {
    if (isOpen) {
      setView('search');
      setSearchTerm('');
      setSelectedFood(null);
      setQuantity(1);
      setFoods([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      const debounce = setTimeout(() => {
        searchFoods();
      }, 300);

      return () => clearTimeout(debounce);
    } else {
      setFoods([]);
    }
  }, [searchTerm, sourceFilter]);

  const searchFoods = async () => {
    setIsLoading(true);

    try {
      let query = supabase
        .from('foods')
        .select('*')
        .ilike('name', `%${searchTerm}%`)
        .limit(50);

      if (sourceFilter !== 'all') {
        query = query.eq('source', sourceFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      const sortedData = (data || []).sort((a, b) => {
        if (a.source === 'TACO' && b.source !== 'TACO') return -1;
        if (a.source !== 'TACO' && b.source === 'TACO') return 1;
        return a.name.localeCompare(b.name);
      });

      setFoods(sortedData);
    } catch (error) {
      console.error('Erro ao buscar alimentos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMeasures = async (foodId: string) => {
    try {
      const { data, error } = await supabase
        .from('food_measures')
        .select('*')
        .eq('food_id', foodId)
        .order('grams', { ascending: true });

      if (error) throw error;

      setMeasures(data || []);
      if (data && data.length > 0) {
        setSelectedMeasure(data[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar medidas:', error);
    }
  };

  const handleSelectFood = async (food: any) => {
    setSelectedFood(food);
    await loadMeasures(food.id);
    setView('add-portion');
  };

  const handleAdd = async () => {
    if (!selectedFood || !selectedMeasure) return;

    const selectedMeasureData = measures.find(m => m.id === selectedMeasure);
    if (!selectedMeasureData) return;

    const totalGrams = selectedMeasureData.grams * quantity;

    const item = {
      food_id: selectedFood.id,
      food_name: selectedFood.name,
      measure_id: selectedMeasure,
      measure_name: selectedMeasureData.name,
      measure_grams: selectedMeasureData.grams,
      quantity: quantity,
      kcal: (selectedFood.energy_kcal * totalGrams) / 100,
      protein: (selectedFood.protein_g * totalGrams) / 100,
      carbs: (selectedFood.carbs_g * totalGrams) / 100,
      fat: (selectedFood.fat_g * totalGrams) / 100
    };

    onAddFood(item);

    setView('search');
    setSearchTerm('');
    setSelectedFood(null);
    setQuantity(1);
    setFoods([]);
  };

  const selectedMeasureData = measures.find(m => m.id === selectedMeasure);
  const totalGrams = selectedMeasureData
    ? (selectedMeasureData.grams * quantity).toFixed(0)
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        {view === 'search' && (
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold">Adicionar Alimento</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="flex gap-2 flex-wrap mb-4">
                <Button
                  variant={sourceFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSourceFilter('all')}
                >
                  Todas as tabelas
                </Button>
                <Button
                  variant={sourceFilter === 'TACO' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSourceFilter('TACO')}
                >
                  Apenas TACO
                </Button>
                <Button
                  variant={sourceFilter === 'OpenFoodFacts' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSourceFilter('OpenFoodFacts')}
                >
                  Apenas OpenFoodFacts
                </Button>
              </div>

              {searchTerm.length === 0 && (
                <div>
                  <p className="text-sm font-semibold mb-3">Navegar por Categorias:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      className="h-auto py-3 flex flex-col items-center gap-2"
                      onClick={() => setSearchTerm('arroz')}
                    >
                      <span className="text-2xl">🌾</span>
                      <span className="text-xs">Cereais</span>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-auto py-3 flex flex-col items-center gap-2"
                      onClick={() => setSearchTerm('frango')}
                    >
                      <span className="text-2xl">🍖</span>
                      <span className="text-xs">Carnes</span>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-auto py-3 flex flex-col items-center gap-2"
                      onClick={() => setSearchTerm('banana')}
                    >
                      <span className="text-2xl">🍎</span>
                      <span className="text-xs">Frutas</span>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-auto py-3 flex flex-col items-center gap-2"
                      onClick={() => setSearchTerm('leite')}
                    >
                      <span className="text-2xl">🥛</span>
                      <span className="text-xs">Leite</span>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-auto py-3 flex flex-col items-center gap-2"
                      onClick={() => setSearchTerm('alface')}
                    >
                      <span className="text-2xl">🥬</span>
                      <span className="text-xs">Verduras</span>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-auto py-3 flex flex-col items-center gap-2"
                      onClick={() => setSearchTerm('peixe')}
                    >
                      <span className="text-2xl">🐟</span>
                      <span className="text-xs">Peixes</span>
                    </Button>
                  </div>
                </div>
              )}

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Digite o nome do alimento... (ex: arroz, frango, banana)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-base"
                  autoFocus
                />
              </div>


              {searchTerm.length > 0 && searchTerm.length < 2 && (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">
                    Digite mais caracteres...
                  </p>
                </div>
              )}

              {isLoading && searchTerm.length >= 2 && (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">Buscando alimentos...</p>
                </div>
              )}

              {!isLoading && searchTerm.length >= 2 && foods.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-lg text-muted-foreground">
                    Nenhum alimento encontrado para "{searchTerm}"
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Tente buscar por outro nome
                  </p>
                </div>
              )}

              {!isLoading && foods.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground mb-3">
                    {foods.length} {foods.length === 1 ? 'alimento encontrado' : 'alimentos encontrados'}
                  </p>

                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                    {foods.map(food => (
                    <Card
                      key={food.id}
                      className="cursor-pointer hover:border-primary hover:shadow-md transition-all"
                      onClick={() => handleSelectFood(food)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <p className="font-semibold text-base mb-1">
                              {food.name}
                            </p>
                            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                              <span>{food.energy_kcal} kcal</span>
                              <span>P: {food.protein_g}g</span>
                              <span>C: {food.carbs_g}g</span>
                              <span>G: {food.fat_g}g</span>
                              <span className="text-xs">(por 100g)</span>
                            </div>
                          </div>
                          <Badge
                            variant={food.source === 'TACO' ? 'default' : 'secondary'}
                            className="shrink-0"
                          >
                            {food.source}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'add-portion' && selectedFood && (
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 p-6 border-b">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setView('search')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{selectedFood.name}</h2>
                <p className="text-sm text-muted-foreground">
                  Configure a porção
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-xl mx-auto space-y-6">
                <div>
                  <Label className="text-base font-semibold mb-2 block">
                    Medida Caseira
                  </Label>
                  <Select value={selectedMeasure} onValueChange={setSelectedMeasure}>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {measures.map(measure => (
                        <SelectItem key={measure.id} value={measure.id} className="text-base">
                          {measure.name} ({measure.grams}g)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-base font-semibold mb-2 block">
                    Quantidade
                  </Label>
                  <Input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                    className="h-12 text-base"
                  />
                </div>

                <div className="bg-primary/5 border-2 border-primary/20 rounded-lg p-5">
                  <p className="text-sm font-semibold text-muted-foreground mb-3">
                    VALORES NUTRICIONAIS
                  </p>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Porção Total:</span>
                      <span className="text-lg font-bold text-primary">
                        {quantity}x {selectedMeasureData?.name} = {totalGrams}g
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                      <div className="bg-background rounded p-3">
                        <p className="text-xs text-muted-foreground mb-1">Calorias</p>
                        <p className="text-xl font-bold">
                          {selectedFood.energy_kcal != null
                            ? (((selectedFood.energy_kcal || 0) * parseFloat(totalGrams)) / 100).toFixed(0)
                            : '0'
                          }
                          <span className="text-sm font-normal text-muted-foreground ml-1">kcal</span>
                        </p>
                      </div>

                      <div className="bg-background rounded p-3">
                        <p className="text-xs text-muted-foreground mb-1">Proteínas</p>
                        <p className="text-xl font-bold">
                          {selectedFood.protein_g != null
                            ? (((selectedFood.protein_g || 0) * parseFloat(totalGrams)) / 100).toFixed(1)
                            : '0.0'
                          }
                          <span className="text-sm font-normal text-muted-foreground ml-1">g</span>
                        </p>
                      </div>

                      <div className="bg-background rounded p-3">
                        <p className="text-xs text-muted-foreground mb-1">Carboidratos</p>
                        <p className="text-xl font-bold">
                          {selectedFood.carbs_g != null
                            ? (((selectedFood.carbs_g || 0) * parseFloat(totalGrams)) / 100).toFixed(1)
                            : '0.0'
                          }
                          <span className="text-sm font-normal text-muted-foreground ml-1">g</span>
                        </p>
                      </div>

                      <div className="bg-background rounded p-3">
                        <p className="text-xs text-muted-foreground mb-1">Gorduras</p>
                        <p className="text-xl font-bold">
                          {selectedFood.fat_g != null
                            ? (((selectedFood.fat_g || 0) * parseFloat(totalGrams)) / 100).toFixed(1)
                            : '0.0'
                          }
                          <span className="text-sm font-normal text-muted-foreground ml-1">g</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t p-6 bg-muted/30">
              <div className="max-w-xl mx-auto flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setView('search')}
                  className="flex-1 h-12"
                  size="lg"
                >
                  Voltar à Busca
                </Button>
                <Button
                  onClick={handleAdd}
                  className="flex-1 h-12"
                  size="lg"
                >
                  Adicionar ao Plano
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
