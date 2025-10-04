import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, Trash2, GripVertical, Clock, Save } from 'lucide-react';
import { toast } from 'sonner';
import { QuickFoodInput } from '@/components/platform/QuickFoodInput';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTenantId } from '@/hooks/useTenantId';

interface FoodItem {
  id: string;
  food_id: string;
  food_name: string;
  measure_id: string;
  measure_name: string;
  quantity: number;
  grams: number;
  kcal: number;
  protein: number;
  carb: number;
  fat: number;
  order: number;
}

interface Meal {
  id?: string;
  name: string;
  time: string;
  notes: string;
  order: number;
  items: FoodItem[];
}

export default function PlatformFoodRecordEditor() {
  const navigate = useNavigate();
  const { recordId } = useParams();
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get('client');
  const { tenantId, loading: loadingTenant } = useTenantId();

  const [clientName, setClientName] = useState('');
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [meals, setMeals] = useState<Meal[]>([]);
  const [saving, setSaving] = useState(false);
  const [showAddMealDialog, setShowAddMealDialog] = useState(false);
  const [newMealTime, setNewMealTime] = useState('08:00');
  const [newMealName, setNewMealName] = useState('');

  useEffect(() => {
    if (clientId && tenantId) {
      loadClient();
    }
  }, [clientId, tenantId]);

  useEffect(() => {
    if (recordId && tenantId) {
      loadRecord();
    }
  }, [recordId, tenantId]);

  const loadClient = async () => {
    if (!clientId || !tenantId) return;

    const { data, error } = await supabase
      .from('clients')
      .select('name')
      .eq('id', clientId)
      .eq('tenant_id', tenantId)
      .single();

    if (!error && data) {
      setClientName(data.name);
    }
  };

  const loadRecord = async () => {
    if (!recordId || !tenantId) return;

    try {
      const { data, error } = await supabase
        .from('food_records' as any)
        .select(`
          id,
          record_date,
          notes,
          client_id,
          tenant_id,
          record_meals (
            id,
            name,
            time,
            order_index,
            notes,
            record_items (
              id,
              food_id,
              measure_id,
              quantity,
              grams_total,
              kcal_total,
              protein_total,
              carb_total,
              fat_total,
              order_index,
              foods (name),
              food_measures (measure_name)
            )
          )
        `)
        .eq('id', recordId)
        .eq('tenant_id', tenantId)
        .single();

      if (error) {
        console.error('Erro ao carregar recordatório:', error);
        toast.error('Erro ao carregar recordatório');
        return;
      }

      if (!data) return;

      setRecordDate((data as any).record_date);
      setNotes((data as any).notes || '');
      
      const loadedMeals: Meal[] = ((data as any).record_meals || []).map((meal: any) => ({
        id: meal.id,
        name: meal.name,
        time: meal.time || '08:00',
        notes: meal.notes || '',
        order: meal.order_index || 0,
        items: (meal.record_items || []).map((item: any) => ({
          id: item.id,
          food_id: item.food_id,
          food_name: item.foods?.name || '',
          measure_id: item.measure_id,
          measure_name: item.food_measures?.measure_name || '',
          quantity: item.quantity,
          grams: item.grams_total,
          kcal: item.kcal_total,
          protein: item.protein_total,
          carb: item.carb_total,
          fat: item.fat_total,
          order: item.order_index || 0
        }))
      }));

      setMeals(loadedMeals);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao carregar recordatório');
    }
  };

  const handleAddMeal = () => {
    const newMeal: Meal = {
      name: newMealName || `Refeição ${meals.length + 1}`,
      time: newMealTime,
      notes: '',
      order: meals.length,
      items: []
    };

    setMeals([...meals, newMeal]);
    setShowAddMealDialog(false);
    setNewMealTime('08:00');
    setNewMealName('');
  };

  const handleRemoveMeal = (index: number) => {
    setMeals(meals.filter((_, i) => i !== index));
  };

  const handleAddFood = async (mealIndex: number, foodData: any) => {
    const { data: food } = await supabase
      .from('foods')
      .select('name')
      .eq('id', foodData.food_id)
      .single();

    const { data: measure } = await supabase
      .from('food_measures')
      .select('measure_name')
      .eq('id', foodData.measure_id)
      .single();

    const newItem: FoodItem = {
      id: `temp-${Date.now()}`,
      food_id: foodData.food_id,
      food_name: food?.name || '',
      measure_id: foodData.measure_id,
      measure_name: measure?.measure_name || '',
      quantity: foodData.quantity,
      grams: foodData.grams_total,
      kcal: foodData.kcal_total,
      protein: foodData.protein_total,
      carb: foodData.carb_total,
      fat: foodData.fat_total,
      order: meals[mealIndex].items.length
    };

    const updatedMeals = [...meals];
    updatedMeals[mealIndex].items.push(newItem);
    setMeals(updatedMeals);
  };

  const handleRemoveFood = (mealIndex: number, itemIndex: number) => {
    const updatedMeals = [...meals];
    updatedMeals[mealIndex].items = updatedMeals[mealIndex].items.filter((_, i) => i !== itemIndex);
    setMeals(updatedMeals);
  };

  const handleSave = async () => {
    if (!clientId || !tenantId) {
      toast.error('Cliente não identificado');
      return;
    }

    setSaving(true);
    try {
      let recordIdToUse = recordId;

      if (!recordId) {
        const { data: newRecord, error: recordError } = await supabase
          .from('food_records' as any)
          .insert({
            client_id: clientId,
            tenant_id: tenantId,
            record_date: recordDate,
            notes,
            status: 'draft'
          })
          .select()
          .single();

        if (recordError) throw recordError;
        recordIdToUse = (newRecord as any).id;
      } else {
        const { error: updateError } = await supabase
          .from('food_records' as any)
          .update({
            record_date: recordDate,
            notes
          })
          .eq('id', recordId);

        if (updateError) throw updateError;
      }

      const { error: deleteMealsError } = await supabase
        .from('record_meals' as any)
        .delete()
        .eq('food_record_id', recordIdToUse);

      if (deleteMealsError) throw deleteMealsError;

      for (const meal of meals) {
        const { data: mealData, error: mealError } = await supabase
          .from('record_meals' as any)
          .insert({
            food_record_id: recordIdToUse,
            name: meal.name,
            time: meal.time,
            order_index: meal.order,
            notes: meal.notes
          })
          .select()
          .single();

        if (mealError) throw mealError;

        if (meal.items.length > 0) {
          const mealId = (mealData as any).id;
          const items = meal.items.map((item, idx) => ({
            record_meal_id: mealId,
            food_id: item.food_id,
            measure_id: item.measure_id,
            quantity: item.quantity,
            grams_total: item.grams,
            kcal_total: item.kcal,
            protein_total: item.protein,
            carb_total: item.carb,
            fat_total: item.fat,
            order_index: idx
          }));

          const { error: itemsError } = await supabase
            .from('record_items' as any)
            .insert(items);

          if (itemsError) throw itemsError;
        }
      }

      toast.success('Recordatório salvo com sucesso!');
      navigate(`/platform/${tenantId}/recordatorio`);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar recordatório');
    } finally {
      setSaving(false);
    }
  };

  const handleConvertToPlan = async () => {
    if (!clientId || !tenantId) return;

    try {
      const totals = calculateTotals();
      
      const { data: mealPlan, error } = await supabase
        .from('meal_plans')
        .insert({
          client_id: clientId,
          tenant_id: tenantId,
          name: `Plano baseado em ${format(new Date(recordDate), 'dd/MM/yyyy')}`,
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          calorie_target: totals.kcal,
          protein_target_g: totals.protein,
          carb_target_g: totals.carb,
          fat_target_g: totals.fat
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Plano alimentar criado!');
      navigate(`/platform/${tenantId}/planos-alimentares/${mealPlan.id}`);
    } catch (error) {
      console.error('Erro ao converter:', error);
      toast.error('Erro ao criar plano');
    }
  };

  const calculateTotals = () => {
    let kcal = 0, protein = 0, carb = 0, fat = 0;
    
    meals.forEach(meal => {
      meal.items.forEach(item => {
        kcal += item.kcal;
        protein += item.protein;
        carb += item.carb;
        fat += item.fat;
      });
    });

    return { kcal, protein, carb, fat };
  };

  const totals = calculateTotals();

  if (loadingTenant) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <p className="text-gray-400">Carregando...</p>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto p-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/platform/${tenantId}/recordatorio`)}
              className="text-gray-100 hover:bg-gray-800"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-100">
                Recordatório - {clientName}
              </h1>
              <p className="text-sm text-gray-400">
                {format(new Date(recordDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary hover:bg-primary/90"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>

        {/* Meals */}
        <div className="space-y-4 mb-6">
          {meals.map((meal, mealIndex) => (
            <Card key={mealIndex} className="bg-gray-800 border-gray-700">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <span className="font-semibold text-gray-100">{meal.time} {meal.name}</span>
                    <span className="text-sm text-gray-400">
                      {Math.round(meal.items.reduce((sum, item) => sum + item.kcal, 0))} kcal
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveMeal(mealIndex)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <QuickFoodInput
                  onAdd={(foodData) => handleAddFood(mealIndex, foodData)}
                  placeholder="🔍 Digite alimento..."
                />

                <div className="mt-4 space-y-2">
                  {meal.items.map((item, itemIndex) => (
                    <div key={item.id} className="flex items-center gap-3 p-2 bg-gray-700/50 rounded">
                      <GripVertical className="h-4 w-4 text-gray-500" />
                      <div className="flex-1 text-gray-100">
                        {item.food_name}
                      </div>
                      <div className="text-gray-300">
                        {item.quantity} {item.measure_name}
                      </div>
                      <div className="text-gray-400">
                        {Math.round(item.grams)}g
                      </div>
                      <div className="text-gray-100 font-medium">
                        {Math.round(item.kcal)} kcal
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveFood(mealIndex, itemIndex)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {meal.items.length > 0 && (
                  <div className="mt-3">
                    <Textarea
                      placeholder="Observações sobre esta refeição..."
                      value={meal.notes}
                      onChange={(e) => {
                        const updated = [...meals];
                        updated[mealIndex].notes = e.target.value;
                        setMeals(updated);
                      }}
                      className="bg-gray-700 border-gray-600 text-gray-100"
                      rows={2}
                    />
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        <Button
          onClick={() => setShowAddMealDialog(true)}
          variant="outline"
          className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Refeição
        </Button>

        {/* Summary */}
        {meals.length > 0 && (
          <Card className="mt-6 bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-8 text-gray-100">
                  <div>
                    <span className="text-sm text-gray-400">RESUMO:</span>
                    <span className="ml-2 font-bold">{Math.round(totals.kcal)} kcal</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">P:</span>
                    <span className="ml-1">{Math.round(totals.protein)}g</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">C:</span>
                    <span className="ml-1">{Math.round(totals.carb)}g</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">G:</span>
                    <span className="ml-1">{Math.round(totals.fat)}g</span>
                  </div>
                </div>
                <Button
                  onClick={handleConvertToPlan}
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10"
                >
                  Criar Plano Alimentar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Meal Dialog */}
      <Dialog open={showAddMealDialog} onOpenChange={setShowAddMealDialog}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-100">Adicionar Refeição</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Horário</Label>
              <Input
                type="time"
                value={newMealTime}
                onChange={(e) => setNewMealTime(e.target.value)}
                className="bg-gray-700 border-gray-600 text-gray-100"
              />
            </div>
            <div>
              <Label className="text-gray-300">Nome da Refeição</Label>
              <Input
                value={newMealName}
                onChange={(e) => setNewMealName(e.target.value)}
                placeholder={`Refeição ${meals.length + 1}`}
                className="bg-gray-700 border-gray-600 text-gray-100"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddMealDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddMeal} className="bg-primary hover:bg-primary/90">
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
