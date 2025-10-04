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

interface AddFoodModalProps {
  open: boolean;
  onClose: () => void;
  mealId: string;
  onFoodAdded: (foodItem: {
    food_id: string;
    food_name: string;
    measure_id: string;
    quantity: number;
  }) => void;
}

export function AddFoodModal({
  open,
  onClose,
  mealId,
  onFoodAdded
}: AddFoodModalProps) {
  const [view, setView] = useState<'search' | 'add-portion'>('search');
  const [searchTerm, setSearchTerm] = useState('');
  const [foods, setFoods] = useState<any[]>([]);
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [measures, setMeasures] = useState<any[]>([]);
  const [selectedMeasure, setSelectedMeasure] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<'all' | 'TACO' | 'OpenFoodFacts'>('all');

  // Estado para adicionar medida customizada
  const [showCustomMeasure, setShowCustomMeasure] = useState(false);
  const [customMeasureName, setCustomMeasureName] = useState('');
  const [customMeasureGrams, setCustomMeasureGrams] = useState('');
  const [isSavingMeasure, setIsSavingMeasure] = useState(false);

  useEffect(() => {
    if (open) {
      setView('search');
      setSearchTerm('');
      setSelectedFood(null);
      setQuantity(1);
      setFoods([]);
      setShowCustomMeasure(false);
      setCustomMeasureName('');
      setCustomMeasureGrams('');
    }
  }, [open]);

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

      if (sourceFilter === 'TACO') {
        query = query.ilike('source', '%TACO%');
      } else if (sourceFilter === 'OpenFoodFacts') {
        query = query.eq('source', 'OpenFoodFacts');
      }

      const { data, error } = await query;

      if (error) throw error;

      const sortedData = (data || []).sort((a, b) => {
        const isTacoA = a.source?.includes('TACO');
        const isTacoB = b.source?.includes('TACO');

        if (isTacoA && !isTacoB) return -1;
        if (!isTacoA && isTacoB) return 1;
        return a.name.localeCompare(b.name);
      });

      setFoods(sortedData);
    } catch (error) {
      console.error('Erro ao buscar alimentos:', error);
      setFoods([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMeasures = async (foodId: string) => {
    try {
      console.log('🔍 Carregando medidas para food_id:', foodId);

      const { data, error } = await supabase
        .from('food_measures')
        .select('*')
        .eq('food_id', foodId);

      if (error) throw error;

      console.log('📊 Medidas retornadas do banco:', data);
      console.log('📊 Total de medidas:', data?.length);

      // Ordenar medidas: "100 gramas" sempre primeiro, depois alfabética
      const sortedMeasures = (data || []).sort((a, b) => {
        const isA100g = a.measure_name === '100 gramas';
        const isB100g = b.measure_name === '100 gramas';

        if (isA100g && !isB100g) return -1;
        if (!isA100g && isB100g) return 1;

        return a.measure_name.localeCompare(b.measure_name);
      });

      console.log('✅ Medidas ordenadas:', sortedMeasures.map(m => ({
        id: m.id,
        name: m.measure_name,
        grams: m.grams
      })));

      setMeasures(sortedMeasures);

      // Selecionar "100 gramas" como padrão, ou a primeira disponível
      if (sortedMeasures.length > 0) {
        const defaultMeasure = sortedMeasures.find(m => m.measure_name === '100 gramas') || sortedMeasures[0];
        console.log('🎯 Medida padrão selecionada:', defaultMeasure.measure_name);
        setSelectedMeasure(defaultMeasure.id);
      } else {
        console.warn('⚠️ Nenhuma medida encontrada para este alimento!');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar medidas:', error);
      setMeasures([]);
    }
  };

  const handleSelectFood = async (food: any) => {
    console.log('🍎 Alimento selecionado:', food.name, '| ID:', food.id);
    setSelectedFood(food);
    await loadMeasures(food.id);
    setView('add-portion');
  };

  // Debug: Log medidas sempre que mudarem
  useEffect(() => {
    if (measures.length > 0) {
      console.log('🔄 State "measures" atualizado. Total:', measures.length);
      console.log('📋 Lista de medidas no state:', measures.map(m => `${m.measure_name} (${m.grams}g)`));
    }
  }, [measures]);

  // Debug: Log medida selecionada
  useEffect(() => {
    if (selectedMeasure) {
      const selected = measures.find(m => m.id === selectedMeasure);
      console.log('🎯 Medida selecionada no state:', selected?.measure_name, '(', selected?.grams, 'g)');
    }
  }, [selectedMeasure, measures]);

  const handleSaveCustomMeasure = async () => {
    if (!selectedFood || !customMeasureName.trim() || !customMeasureGrams) return;

    const grams = parseFloat(customMeasureGrams);
    if (isNaN(grams) || grams <= 0) {
      alert('Por favor, insira um peso válido em gramas.');
      return;
    }

    // Verificar se já existe medida com esse nome
    const existingMeasure = measures.find(
      m => m.measure_name.toLowerCase() === customMeasureName.trim().toLowerCase()
    );
    if (existingMeasure) {
      alert('Já existe uma medida com esse nome. Escolha outro nome.');
      return;
    }

    setIsSavingMeasure(true);
    try {
      const { data, error } = await supabase
        .from('food_measures')
        .insert({
          food_id: selectedFood.id,
          measure_name: customMeasureName.trim(),
          grams: grams,
          is_default: false
        })
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Medida customizada salva:', data);

      // Recarregar medidas
      await loadMeasures(selectedFood.id);

      // Selecionar a medida recém-criada
      if (data) {
        setSelectedMeasure(data.id);
      }

      // Fechar formulário e limpar
      setShowCustomMeasure(false);
      setCustomMeasureName('');
      setCustomMeasureGrams('');
    } catch (error) {
      console.error('❌ Erro ao salvar medida:', error);
      alert('Erro ao salvar medida. Tente novamente.');
    } finally {
      setIsSavingMeasure(false);
    }
  };

  const handleCancelCustomMeasure = () => {
    setShowCustomMeasure(false);
    setCustomMeasureName('');
    setCustomMeasureGrams('');
  };

  const handleAdd = () => {
    if (!selectedFood || !selectedMeasure) return;

    onFoodAdded({
      food_id: selectedFood.id,
      food_name: selectedFood.name,
      measure_id: selectedMeasure,
      quantity: quantity
    });

    setView('search');
    setSearchTerm('');
    setSelectedFood(null);
    setQuantity(1);
    setFoods([]);
    setShowCustomMeasure(false);
    setCustomMeasureName('');
    setCustomMeasureGrams('');
  };

  const selectedMeasureData = measures.find(m => m.id === selectedMeasure);
  const totalGrams = selectedMeasureData
    ? (selectedMeasureData.grams * quantity).toFixed(0)
    : 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
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
                  className="gap-1"
                >
                  Todas as tabelas
                  {sourceFilter === 'all' && foods.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {foods.length}
                    </Badge>
                  )}
                </Button>
                <Button
                  variant={sourceFilter === 'TACO' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSourceFilter('TACO')}
                  className="gap-1"
                >
                  <span>🇧🇷</span> TACO
                  {sourceFilter === 'TACO' && foods.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {foods.length}
                    </Badge>
                  )}
                </Button>
                <Button
                  variant={sourceFilter === 'OpenFoodFacts' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSourceFilter('OpenFoodFacts')}
                  className="gap-1"
                >
                  OpenFoodFacts
                  {sourceFilter === 'OpenFoodFacts' && foods.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {foods.length}
                    </Badge>
                  )}
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
                      className={`cursor-pointer transition-all ${
                        food.source?.includes('TACO')
                          ? 'border-2 border-green-500 hover:border-green-600 hover:shadow-lg bg-green-50/30'
                          : 'border border-gray-200 hover:border-primary hover:shadow-md'
                      }`}
                      onClick={() => handleSelectFood(food)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {food.source?.includes('TACO') && (
                                <span className="text-green-600 text-lg">🇧🇷</span>
                              )}
                              <p className="font-semibold text-base">{food.name}</p>
                            </div>
                            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                              <span>{food.energy_kcal != null ? food.energy_kcal : 0} kcal</span>
                              <span>P: {food.protein_g != null ? food.protein_g : 0}g</span>
                              <span>C: {food.carbs_g != null ? food.carbs_g : 0}g</span>
                              <span>G: {food.fat_g != null ? food.fat_g : 0}g</span>
                              <span className="text-xs">(por 100g)</span>
                            </div>
                          </div>
                          <Badge
                            variant={food.source?.includes('TACO') ? 'default' : 'secondary'}
                            className={`shrink-0 ${
                              food.source?.includes('TACO')
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                            }`}
                          >
                            {food.source?.includes('TACO') ? '🇧🇷 TACO' : 'OFF'}
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
                      <SelectValue placeholder="Selecione a medida" />
                    </SelectTrigger>
                    <SelectContent>
                      {measures.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">
                          Nenhuma medida disponível
                        </div>
                      ) : (
                        measures.map(measure => {
                          console.log('🔧 Renderizando medida:', measure.measure_name, '(', measure.grams, 'g)');
                          return (
                            <SelectItem key={measure.id} value={measure.id} className="text-base">
                              {measure.measure_name} ({measure.grams}g)
                            </SelectItem>
                          );
                        })
                      )}
                    </SelectContent>
                  </Select>

                  {!showCustomMeasure && (
                    <Button
                      type="button"
                      variant="link"
                      className="mt-2 p-0 h-auto text-sm text-primary hover:text-primary/80"
                      onClick={() => setShowCustomMeasure(true)}
                    >
                      ➕ Adicionar medida caseira
                    </Button>
                  )}

                  {showCustomMeasure && (
                    <div className="mt-4 p-4 border rounded-lg bg-muted/30 space-y-4">
                      <div>
                        <Label className="text-sm font-medium mb-1.5 block">
                          Nome da medida
                        </Label>
                        <Input
                          type="text"
                          placeholder="ex: pacote, lata, sachê"
                          value={customMeasureName}
                          onChange={(e) => setCustomMeasureName(e.target.value)}
                          className="h-10"
                          disabled={isSavingMeasure}
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium mb-1.5 block">
                          Peso em gramas
                        </Label>
                        <Input
                          type="number"
                          placeholder="ex: 250"
                          value={customMeasureGrams}
                          onChange={(e) => setCustomMeasureGrams(e.target.value)}
                          className="h-10"
                          min="0"
                          step="0.1"
                          disabled={isSavingMeasure}
                        />
                      </div>

                      <div className="flex gap-2 justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleCancelCustomMeasure}
                          disabled={isSavingMeasure}
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleSaveCustomMeasure}
                          disabled={isSavingMeasure || !customMeasureName.trim() || !customMeasureGrams}
                        >
                          {isSavingMeasure ? 'Salvando...' : 'Salvar'}
                        </Button>
                      </div>
                    </div>
                  )}
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
                        {quantity}x {selectedMeasureData?.measure_name} = {totalGrams}g
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
