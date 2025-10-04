import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Save, Utensils, Clock, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { QuickFoodInput } from '@/components/platform/QuickFoodInput';
import { RecordFoodItem } from '@/components/platform/RecordFoodItem';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RecordMeal {
  id?: string;
  meal_time: string;
  meal_name: string;
  notes: string;
  items: RecordItem[];
}

interface RecordItem {
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
}

export default function PlatformFoodRecordEditor() {
  const { tenantId, recordId } = useParams();
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get('client');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [meals, setMeals] = useState<RecordMeal[]>([]);
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0]);
  const [recordNotes, setRecordNotes] = useState('');
  const [showAddMealDialog, setShowAddMealDialog] = useState(false);
  const [newMealTime, setNewMealTime] = useState('07:00');
  const [newMealName, setNewMealName] = useState('');

  const { data: client } = useQuery({
    queryKey: ['client', clientId],
    queryFn: async () => {
      console.log('🔍 Buscando cliente:', clientId);

      const { data, error } = await supabase
        .from('clients')
        .select('id, name')
        .eq('id', clientId)
        .single();

      if (error) {
        console.error('❌ Erro ao buscar cliente:', error);
        console.log('📊 Usando cliente mock temporário');

        if (clientId?.startsWith('mock-')) {
          const mockClients: Record<string, any> = {
            'mock-1': { id: 'mock-1', name: 'João Silva' },
            'mock-2': { id: 'mock-2', name: 'Maria Santos' },
            'mock-3': { id: 'mock-3', name: 'Pedro Oliveira' }
          };
          return mockClients[clientId] || { id: clientId, name: 'Cliente Teste' };
        }

        return { id: clientId, name: 'Cliente Teste' };
      }

      console.log('✅ Cliente carregado:', data);
      return data;
    },
    enabled: !!clientId
  });

  const { data: existingRecord, isLoading } = useQuery({
    queryKey: ['food-record', recordId],
    queryFn: async () => {
      if (!recordId) return null;

      const { data } = await supabase
        .from('food_records')
        .select(`
          *,
          record_meals(
            *,
            record_items(
              *,
              foods(name),
              food_measures(measure_name, grams)
            )
          )
        `)
        .eq('id', recordId)
        .single();

      return data;
    },
    enabled: !!recordId
  });

  useEffect(() => {
    if (existingRecord) {
      setRecordDate(existingRecord.record_date);
      setRecordNotes(existingRecord.notes || '');

      const loadedMeals = existingRecord.record_meals?.map((meal: any) => ({
        id: meal.id,
        meal_time: meal.meal_time,
        meal_name: meal.meal_name,
        notes: meal.notes || '',
        items: meal.record_items?.map((item: any) => ({
          id: item.id,
          food_id: item.food_id,
          food_name: item.foods.name,
          measure_id: item.measure_id,
          measure_name: item.food_measures.measure_name,
          measure_grams: item.food_measures.grams,
          quantity: item.quantity,
          grams_total: item.grams_total,
          kcal_total: item.kcal_total,
          protein_total: item.protein_total,
          carb_total: item.carb_total,
          fat_total: item.fat_total
        })) || []
      })) || [];

      setMeals(loadedMeals);
    }
  }, [existingRecord]);

  const handleAddMeal = () => {
    const newMeal: RecordMeal = {
      meal_time: newMealTime,
      meal_name: newMealName || `Refeição ${meals.length + 1}`,
      notes: '',
      items: []
    };
    setMeals([...meals, newMeal]);
    setShowAddMealDialog(false);
    setNewMealTime('07:00');
    setNewMealName('');
  };

  const handleRemoveMeal = (index: number) => {
    setMeals(meals.filter((_, i) => i !== index));
  };

  const handleAddFoodToMeal = async (mealIndex: number, foodData: any) => {
    const { data: food } = await supabase
      .from('foods')
      .select('name')
      .eq('id', foodData.food_id)
      .single();

    const { data: measure } = await supabase
      .from('food_measures')
      .select('measure_name, grams')
      .eq('id', foodData.measure_id)
      .single();

    const newItem: RecordItem = {
      food_id: foodData.food_id,
      food_name: food?.name || '',
      measure_id: foodData.measure_id,
      measure_name: measure?.measure_name || '',
      measure_grams: measure?.grams || 0,
      quantity: foodData.quantity,
      grams_total: foodData.grams_total,
      kcal_total: foodData.kcal_total,
      protein_total: foodData.protein_total,
      carb_total: foodData.carb_total,
      fat_total: foodData.fat_total
    };

    const updatedMeals = [...meals];
    updatedMeals[mealIndex].items.push(newItem);
    setMeals(updatedMeals);
  };

  const handleUpdateItem = async (mealIndex: number, itemIndex: number, updates: any) => {
    const updatedMeals = [...meals];
    const item = updatedMeals[mealIndex].items[itemIndex];

    if (updates.measure_id) {
      const { data: measure } = await supabase
        .from('food_measures')
        .select('measure_name, grams')
        .eq('id', updates.measure_id)
        .single();

      if (measure) {
        item.measure_id = updates.measure_id;
        item.measure_name = measure.measure_name;
        item.measure_grams = measure.grams;
      }
    }

    if (updates.quantity !== undefined) {
      item.quantity = updates.quantity;
    }

    const { data: food } = await supabase
      .from('foods')
      .select('energy_kcal, protein_g, carbohydrate_g, lipid_g')
      .eq('id', item.food_id)
      .single();

    if (food) {
      const gramsTotal = item.measure_grams * item.quantity;
      const multiplier = gramsTotal / 100;

      item.grams_total = gramsTotal;
      item.kcal_total = (food.energy_kcal || 0) * multiplier;
      item.protein_total = (food.protein_g || 0) * multiplier;
      item.carb_total = (food.carbohydrate_g || 0) * multiplier;
      item.fat_total = (food.lipid_g || 0) * multiplier;
    }

    setMeals(updatedMeals);
  };

  const handleRemoveItem = (mealIndex: number, itemIndex: number) => {
    const updatedMeals = [...meals];
    updatedMeals[mealIndex].items.splice(itemIndex, 1);
    setMeals(updatedMeals);
  };

  const calculateTotals = () => {
    let totals = { kcal: 0, protein: 0, carb: 0, fat: 0 };

    meals.forEach(meal => {
      meal.items.forEach(item => {
        totals.kcal += item.kcal_total || 0;
        totals.protein += item.protein_total || 0;
        totals.carb += item.carb_total || 0;
        totals.fat += item.fat_total || 0;
      });
    });

    return totals;
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      let recordIdToUse = recordId;

      if (!recordId) {
        const { data: newRecord, error: recordError } = await supabase
          .from('food_records')
          .insert({
            client_id: clientId,
            record_date: recordDate,
            notes: recordNotes,
            created_by: user.id
          })
          .select()
          .single();

        if (recordError) throw recordError;
        recordIdToUse = newRecord.id;
      } else {
        const { error: updateError } = await supabase
          .from('food_records')
          .update({
            record_date: recordDate,
            notes: recordNotes
          })
          .eq('id', recordId);

        if (updateError) throw updateError;

        await supabase
          .from('record_meals')
          .delete()
          .eq('record_id', recordId);
      }

      for (const [index, meal] of meals.entries()) {
        const { data: newMeal, error: mealError } = await supabase
          .from('record_meals')
          .insert({
            record_id: recordIdToUse,
            meal_time: meal.meal_time,
            meal_name: meal.meal_name,
            notes: meal.notes,
            order_index: index
          })
          .select()
          .single();

        if (mealError) throw mealError;

        if (meal.items.length > 0) {
          const items = meal.items.map(item => ({
            record_meal_id: newMeal.id,
            food_id: item.food_id,
            measure_id: item.measure_id,
            quantity: item.quantity,
            grams_total: item.grams_total,
            kcal_total: item.kcal_total,
            protein_total: item.protein_total,
            carb_total: item.carb_total,
            fat_total: item.fat_total
          }));

          const { error: itemsError } = await supabase
            .from('record_items')
            .insert(items);

          if (itemsError) throw itemsError;
        }
      }

      return recordIdToUse;
    },
    onSuccess: (savedRecordId) => {
      queryClient.invalidateQueries({ queryKey: ['food-records'] });
      queryClient.invalidateQueries({ queryKey: ['food-record', savedRecordId] });
      toast.success('Recordatório salvo com sucesso!');
      navigate(`/platform/${tenantId}/recordatorio`);
    },
    onError: (error) => {
      console.error('Error saving record:', error);
      toast.error('Erro ao salvar recordatório');
    }
  });

  const convertToMealPlanMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      const totals = calculateTotals();

      const { data: plan, error: planError } = await supabase
        .from('meal_plans')
        .insert({
          client_id: clientId,
          name: `Plano baseado em ${format(new Date(recordDate), "dd/MM/yyyy")}`,
          target_kcal: Math.round(totals.kcal),
          target_protein: Math.round(totals.protein),
          target_carbs: Math.round(totals.carb),
          target_fats: Math.round(totals.fat),
          created_by: user.id
        })
        .select()
        .single();

      if (planError) throw planError;

      for (const meal of meals) {
        const { data: newMeal, error: mealError } = await supabase
          .from('meals')
          .insert({
            meal_plan_id: plan.id,
            name: meal.meal_name,
            time: meal.meal_time
          })
          .select()
          .single();

        if (mealError) throw mealError;

        if (meal.items.length > 0) {
          const items = meal.items.map(item => ({
            meal_id: newMeal.id,
            food_id: item.food_id,
            measure_id: item.measure_id,
            quantity: item.quantity,
            grams_total: item.grams_total,
            kcal_total: item.kcal_total,
            protein_total: item.protein_total,
            carb_total: item.carb_total,
            fat_total: item.fat_total
          }));

          const { error: itemsError } = await supabase
            .from('meal_items')
            .insert(items);

          if (itemsError) throw itemsError;
        }
      }

      return plan.id;
    },
    onSuccess: (planId) => {
      toast.success('Plano alimentar criado com sucesso!');
      navigate(`/platform/${tenantId}/planos-alimentares/${planId}`);
    },
    onError: (error) => {
      console.error('Error converting to meal plan:', error);
      toast.error('Erro ao criar plano alimentar');
    }
  });

  const totals = calculateTotals();

  if (isLoading) {
    return <div className="container mx-auto p-6">Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/platform/${tenantId}/recordatorio`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              Recordatório - {client?.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {format(new Date(recordDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
        </div>
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
          <Save className="h-4 w-4 mr-2" />
          Salvar
        </Button>
      </div>

      <div className="space-y-4">
        {meals.map((meal, mealIndex) => (
          <Card key={mealIndex}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-lg">{meal.meal_time} - {meal.meal_name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {Math.round(meal.items.reduce((sum, item) => sum + item.kcal_total, 0))} kcal
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemoveMeal(mealIndex)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <QuickFoodInput
                onAdd={(foodData) => handleAddFoodToMeal(mealIndex, foodData)}
                placeholder="🔍 Digite o alimento..."
              />

              <div className="space-y-1">
                {meal.items.map((item, itemIndex) => (
                  <RecordFoodItem
                    key={itemIndex}
                    item={item}
                    onUpdate={(updates) => handleUpdateItem(mealIndex, itemIndex, updates)}
                    onRemove={() => handleRemoveItem(mealIndex, itemIndex)}
                  />
                ))}
              </div>

              {meal.items.length > 0 && (
                <div className="pt-2">
                  <Label className="text-xs text-muted-foreground">Observações</Label>
                  <Textarea
                    value={meal.notes}
                    onChange={(e) => {
                      const updatedMeals = [...meals];
                      updatedMeals[mealIndex].notes = e.target.value;
                      setMeals(updatedMeals);
                    }}
                    placeholder="Ex: Come correndo antes do trabalho..."
                    className="mt-1 min-h-[60px]"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowAddMealDialog(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Refeição
        </Button>

        <Card className="bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Resumo do Dia</h3>
            </div>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{Math.round(totals.kcal)}</div>
                <div className="text-xs text-muted-foreground">kcal</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{Math.round(totals.protein)}g</div>
                <div className="text-xs text-muted-foreground">Proteínas</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{Math.round(totals.carb)}g</div>
                <div className="text-xs text-muted-foreground">Carboidratos</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{Math.round(totals.fat)}g</div>
                <div className="text-xs text-muted-foreground">Gorduras</div>
              </div>
            </div>

            {meals.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <Button
                  className="w-full"
                  variant="default"
                  onClick={() => convertToMealPlanMutation.mutate()}
                  disabled={convertToMealPlanMutation.isPending}
                >
                  <Utensils className="h-4 w-4 mr-2" />
                  Criar Plano Alimentar a partir deste Recordatório
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showAddMealDialog} onOpenChange={setShowAddMealDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Refeição</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Horário</Label>
              <Input
                type="time"
                value={newMealTime}
                onChange={(e) => setNewMealTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Nome da Refeição</Label>
              <Input
                placeholder={`Refeição ${meals.length + 1}`}
                value={newMealName}
                onChange={(e) => setNewMealName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddMealDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddMeal}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
