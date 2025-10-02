import { useState, useEffect } from 'react';
import { X, AlertCircle, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { validateNutritionValues } from '@/lib/nutritionCalculations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface AddCustomFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (food: any) => void;
  searchQuery?: string;
}

export const AddCustomFoodModal = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  searchQuery = ''
}: AddCustomFoodModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [customSource, setCustomSource] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: searchQuery,
    category_id: '',
    brand: '',
    description: '',
    energy_kcal: 0,
    protein_g: 0,
    carbohydrate_g: 0,
    fiber_g: 0,
    lipid_g: 0,
    saturated_fat_g: 0,
    sodium_mg: 0,
    source_info: '',
    measures: [
      { measure_name: '', grams: 0, is_default: true }
    ]
  });

  const [validation, setValidation] = useState({ valid: true, message: '' });

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      fetchCustomSource();
      setFormData(prev => ({ ...prev, name: searchQuery }));
    }
  }, [isOpen, searchQuery]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('food_categories')
      .select('*')
      .order('name');
    setCategories(data || []);
  };

  const fetchCustomSource = async () => {
    const { data } = await supabase
      .from('nutrition_sources')
      .select('id')
      .eq('code', 'custom')
      .single();
    setCustomSource(data);
  };

  // Validar automaticamente quando mudam os macros
  useEffect(() => {
    if (formData.energy_kcal > 0) {
      const result = validateNutritionValues({
        kcal: formData.energy_kcal,
        protein: formData.protein_g,
        carb: formData.carbohydrate_g,
        fat: formData.lipid_g
      });
      setValidation(result as any);
    }
  }, [formData.energy_kcal, formData.protein_g, formData.carbohydrate_g, formData.lipid_g]);

  const handleAddMeasure = () => {
    setFormData(prev => ({
      ...prev,
      measures: [...prev.measures, { measure_name: '', grams: 0, is_default: false }]
    }));
  };

  const handleRemoveMeasure = (index: number) => {
    setFormData(prev => ({
      ...prev,
      measures: prev.measures.filter((_, i) => i !== index)
    }));
  };

  const handleMeasureChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      measures: prev.measures.map((m, i) => 
        i === index ? { ...m, [field]: value } : m
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validation.valid) {
      toast({
        title: 'Valores nutricionais inconsistentes',
        description: validation.message,
        variant: 'destructive'
      });
      return;
    }

    if (formData.measures.length === 0 || !formData.measures[0].measure_name) {
      toast({
        title: 'Adicione pelo menos uma medida',
        description: 'É necessário definir como o alimento será medido (ex: colher, unidade, etc)',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const { data: currentUser } = await supabase.auth.getUser();

      // Inserir alimento
      const { data: newFood, error: foodError } = await supabase
        .from('foods')
        .insert({
          source_id: customSource?.id,
          category_id: formData.category_id,
          name: formData.name,
          brand: formData.brand || null,
          description: formData.description || null,
          energy_kcal: formData.energy_kcal,
          protein_g: formData.protein_g,
          carbohydrate_g: formData.carbohydrate_g,
          fiber_g: formData.fiber_g,
          lipid_g: formData.lipid_g,
          saturated_fat_g: formData.saturated_fat_g,
          sodium_mg: formData.sodium_mg,
          is_custom: true,
          created_by: currentUser.user?.id,
          source_info: formData.source_info || null
        })
        .select()
        .single();

      if (foodError) throw foodError;

      // Inserir medidas
      const { error: measuresError } = await supabase
        .from('food_measures')
        .insert(
          formData.measures
            .filter(m => m.measure_name && m.grams > 0)
            .map(m => ({
              food_id: newFood.id,
              measure_name: m.measure_name,
              grams: m.grams,
              is_default: m.is_default
            }))
        );

      if (measuresError) throw measuresError;

      toast({
        title: '✓ Alimento adicionado!',
        description: `${formData.name} foi adicionado ao banco e já pode ser usado.`
      });

      onSuccess(newFood);
      onClose();

      // Reset form
      setFormData({
        name: '',
        category_id: '',
        brand: '',
        description: '',
        energy_kcal: 0,
        protein_g: 0,
        carbohydrate_g: 0,
        fiber_g: 0,
        lipid_g: 0,
        saturated_fat_g: 0,
        sodium_mg: 0,
        source_info: '',
        measures: [{ measure_name: '', grams: 0, is_default: true }]
      });

    } catch (error: any) {
      toast({
        title: 'Erro ao adicionar alimento',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Adicionar Novo Alimento</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nome do Alimento */}
          <div>
            <Label htmlFor="name">Nome do Alimento *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Whey Protein X-Brand sabor chocolate"
              required
            />
          </div>

          {/* Categoria e Marca */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Categoria *</Label>
              <select
                id="category"
                value={formData.category_id}
                onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Selecione...</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="brand">Marca (opcional)</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                placeholder="Ex: X-Brand"
              />
            </div>
          </div>

          {/* Descrição */}
          <div>
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Informações adicionais sobre o alimento"
              rows={2}
            />
          </div>

          {/* Composição Nutricional */}
          <div className="border-t pt-6">
            <h3 className="font-bold text-lg mb-4">Composição Nutricional (por 100g)</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="kcal">Calorias (kcal) *</Label>
                <Input
                  id="kcal"
                  type="number"
                  step="0.01"
                  value={formData.energy_kcal}
                  onChange={(e) => setFormData(prev => ({ ...prev, energy_kcal: parseFloat(e.target.value) || 0 }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="protein">Proteínas (g) *</Label>
                <Input
                  id="protein"
                  type="number"
                  step="0.01"
                  value={formData.protein_g}
                  onChange={(e) => setFormData(prev => ({ ...prev, protein_g: parseFloat(e.target.value) || 0 }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="carb">Carboidratos (g) *</Label>
                <Input
                  id="carb"
                  type="number"
                  step="0.01"
                  value={formData.carbohydrate_g}
                  onChange={(e) => setFormData(prev => ({ ...prev, carbohydrate_g: parseFloat(e.target.value) || 0 }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="fat">Gorduras (g) *</Label>
                <Input
                  id="fat"
                  type="number"
                  step="0.01"
                  value={formData.lipid_g}
                  onChange={(e) => setFormData(prev => ({ ...prev, lipid_g: parseFloat(e.target.value) || 0 }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="fiber">Fibras (g)</Label>
                <Input
                  id="fiber"
                  type="number"
                  step="0.01"
                  value={formData.fiber_g}
                  onChange={(e) => setFormData(prev => ({ ...prev, fiber_g: parseFloat(e.target.value) || 0 }))}
                />
              </div>

              <div>
                <Label htmlFor="sodium">Sódio (mg)</Label>
                <Input
                  id="sodium"
                  type="number"
                  step="0.01"
                  value={formData.sodium_mg}
                  onChange={(e) => setFormData(prev => ({ ...prev, sodium_mg: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>

            {/* Validação */}
            {!validation.valid && (
              <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Atenção</p>
                  <p className="text-sm text-yellow-700">{validation.message}</p>
                </div>
              </div>
            )}

            {validation.valid && formData.energy_kcal > 0 && (
              <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg flex items-center gap-3">
                <Check className="w-5 h-5 text-green-600" />
                <p className="text-sm text-green-700">Valores nutricionais consistentes</p>
              </div>
            )}
          </div>

          {/* Medidas Caseiras */}
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Medidas Caseiras</h3>
              <Button type="button" onClick={handleAddMeasure} variant="outline" size="sm">
                + Adicionar Medida
              </Button>
            </div>

            <div className="space-y-3">
              {formData.measures.map((measure, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <div className="flex-1">
                    <Input
                      placeholder="Ex: scoop, colher de sopa, unidade"
                      value={measure.measure_name}
                      onChange={(e) => handleMeasureChange(index, 'measure_name', e.target.value)}
                    />
                  </div>
                  <div className="w-32">
                    <Input
                      type="number"
                      placeholder="Gramas"
                      value={measure.grams}
                      onChange={(e) => handleMeasureChange(index, 'grams', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={measure.is_default}
                      onChange={(e) => handleMeasureChange(index, 'is_default', e.target.checked)}
                      className="w-5 h-5"
                    />
                    <span className="text-sm text-muted-foreground">Padrão</span>
                  </div>
                  {formData.measures.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => handleRemoveMeasure(index)}
                      variant="ghost"
                      size="sm"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Fonte dos Dados */}
          <div>
            <Label htmlFor="source">Fonte dos Dados (opcional)</Label>
            <Input
              id="source"
              value={formData.source_info}
              onChange={(e) => setFormData(prev => ({ ...prev, source_info: e.target.value }))}
              placeholder="Ex: Rótulo do produto, Site do fabricante"
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button type="button" onClick={onClose} variant="outline" className="flex-1">
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !validation.valid}
              className="flex-1"
            >
              {loading ? 'Salvando...' : 'Salvar e Adicionar ao Plano'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
