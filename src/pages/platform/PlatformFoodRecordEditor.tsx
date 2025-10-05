import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, Trash2, Clock, Save, Loader2, Utensils, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { QuickFoodInput } from '@/components/platform/QuickFoodInput';
import { RecordFoodItem } from '@/components/platform/RecordFoodItem';
import { FoodDetailsModal } from '@/components/platform/FoodDetailsModal';
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
  source_code?: string;
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
  const [isConverting, setIsConverting] = useState(false);
  const [showAddMealDialog, setShowAddMealDialog] = useState(false);
  const [newMealTime, setNewMealTime] = useState('08:00');
  const [newMealName, setNewMealName] = useState('');
  const [selectedFoodForDetails, setSelectedFoodForDetails] = useState<FoodItem | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [expandedMealIndex, setExpandedMealIndex] = useState<number | null>(null);

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
              foods (name, source),
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
          order: item.order_index || 0,
          source_code: item.foods?.source || 'off'
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
      .select('name, source')
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
      order: meals[mealIndex].items.length,
      source_code: food?.source || 'off'
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

  const handleUpdateFood = async (mealIndex: number, itemIndex: number, updates: { measure_id?: string; quantity?: number }) => {
    const updatedMeals = [...meals];
    const item = updatedMeals[mealIndex].items[itemIndex];

    // Se mudou a medida, buscar novos dados
    if (updates.measure_id && updates.measure_id !== item.measure_id) {
      const { data: measure } = await supabase
        .from('food_measures')
        .select('measure_name, grams')
        .eq('id', updates.measure_id)
        .single();

      if (measure) {
        item.measure_id = updates.measure_id;
        item.measure_name = measure.measure_name;
        
        // Buscar dados nutricionais do alimento
        const { data: food } = await supabase
          .from('foods')
          .select('energy_kcal, protein_g, carbohydrate_g, lipid_g')
          .eq('id', item.food_id)
          .single();

        if (food) {
          const qty = updates.quantity || item.quantity;
          const gramsTotal = measure.grams * qty;
          const multiplier = gramsTotal / 100;

          item.quantity = qty;
          item.grams = gramsTotal;
          item.kcal = (food.energy_kcal || 0) * multiplier;
          item.protein = (food.protein_g || 0) * multiplier;
          item.carb = (food.carbohydrate_g || 0) * multiplier;
          item.fat = (food.lipid_g || 0) * multiplier;
        }
      }
    } else if (updates.quantity && updates.quantity !== item.quantity) {
      // Só mudou quantidade, recalcular com a mesma medida
      const { data: measure } = await supabase
        .from('food_measures')
        .select('grams')
        .eq('id', item.measure_id)
        .single();

      const { data: food } = await supabase
        .from('foods')
        .select('energy_kcal, protein_g, carbohydrate_g, lipid_g')
        .eq('id', item.food_id)
        .single();

      if (measure && food) {
        const gramsTotal = measure.grams * updates.quantity;
        const multiplier = gramsTotal / 100;

        item.quantity = updates.quantity;
        item.grams = gramsTotal;
        item.kcal = (food.energy_kcal || 0) * multiplier;
        item.protein = (food.protein_g || 0) * multiplier;
        item.carb = (food.carbohydrate_g || 0) * multiplier;
        item.fat = (food.lipid_g || 0) * multiplier;
      }
    }

    setMeals(updatedMeals);
  };

  const handleShowFoodDetails = (item: FoodItem) => {
    setSelectedFoodForDetails(item);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsModalOpen(false);
    setSelectedFoodForDetails(null);
  };

  const toggleMeal = (index: number) => {
    setExpandedMealIndex(expandedMealIndex === index ? null : index);
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

  const fillTemplateData = async () => {
    try {
      toast.info('Preenchendo recordatório com dados de teste...');

      // Buscar alguns alimentos do banco
      const { data: foods, error: foodsError } = await supabase
        .from('foods')
        .select('id, name, energy_kcal, protein_g, carbohydrate_g, lipid_g, source')
        .eq('active', true)
        .limit(10);

      if (foodsError || !foods || foods.length < 5) {
        toast.error('Não há alimentos suficientes no banco');
        console.error('Erro ao buscar alimentos:', foodsError);
        return;
      }

      console.log('🍎 Alimentos encontrados:', foods.length);

      // Criar estrutura de exemplo
      const templateMeals = [
        {
          time: '08:00',
          name: 'Café da Manhã',
          foodIndexes: [0, 1]
        },
        {
          time: '10:00',
          name: 'Lanche da Manhã',
          foodIndexes: [2]
        },
        {
          time: '12:30',
          name: 'Almoço',
          foodIndexes: [3, 4, 5]
        },
        {
          time: '15:00',
          name: 'Lanche da Tarde',
          foodIndexes: [6]
        },
        {
          time: '19:00',
          name: 'Jantar',
          foodIndexes: [7, 8]
        }
      ];

      // Criar meals e items
      for (const [index, mealTemplate] of templateMeals.entries()) {
        console.log(`📝 Criando refeição: ${mealTemplate.name}`);

        const { data: newMeal, error: mealError } = await supabase
          .from('record_meals' as any)
          .insert({
            food_record_id: recordId,
            time: mealTemplate.time,
            name: mealTemplate.name,
            order_index: index,
            notes: ''
          })
          .select()
          .single();

        if (mealError || !newMeal) {
          console.error('❌ Erro ao criar meal:', mealError);
          continue;
        }

        // Adicionar items
        for (const foodIndex of mealTemplate.foodIndexes) {
          if (foodIndex >= foods.length) continue;

          const food = foods[foodIndex];
          
          // Buscar primeira medida disponível para este alimento
          const { data: measures } = await supabase
            .from('food_measures')
            .select('id, measure_name, grams')
            .eq('food_id', food.id)
            .limit(1);

          if (!measures || measures.length === 0) {
            console.warn(`⚠️ Alimento ${food.name} sem medidas`);
            continue;
          }

          const measure = measures[0];
          const quantity = 1;
          const gramsTotal = quantity * measure.grams;
          
          // Calcular valores nutricionais
          const kcalTotal = (food.energy_kcal / 100) * gramsTotal;
          const proteinTotal = (food.protein_g / 100) * gramsTotal;
          const carbTotal = (food.carbohydrate_g / 100) * gramsTotal;
          const fatTotal = (food.lipid_g / 100) * gramsTotal;

          const { error: itemError } = await supabase
            .from('record_items' as any)
            .insert({
              record_meal_id: (newMeal as any).id,
              food_id: food.id,
              measure_id: measure.id,
              quantity: quantity,
              grams_total: gramsTotal,
              kcal_total: kcalTotal,
              protein_total: proteinTotal,
              carb_total: carbTotal,
              fat_total: fatTotal
            });

          if (itemError) {
            console.error('❌ Erro ao criar item:', itemError);
          } else {
            console.log(`✅ Item adicionado: ${food.name}`);
          }
        }
      }

      toast.success('Template preenchido com sucesso!');
      
      // Recarregar dados
      await loadRecord();

    } catch (error: any) {
      console.error('💥 Erro ao preencher template:', error);
      toast.error('Erro ao preencher template: ' + (error.message || 'Desconhecido'));
    }
  };

  const handleConvertToPlan = async () => {
    try {
      setIsConverting(true);
      
      console.log('🔄 ETAPA 1: Validando recordId');
      console.log('recordId:', recordId);

      if (!recordId) {
        toast.error('Salve o recordatório antes de criar um plano', {
          description: 'Clique em "Salvar" primeiro'
        });
        setIsConverting(false);
        return;
      }

      console.log('🔄 ETAPA 2: Buscando recordatório completo');

      const { data: fullRecord, error: fetchError } = await supabase
        .from('food_records' as any)
        .select(`
          *,
          record_meals!food_record_id(
            id,
            name,
            time,
            order_index,
            record_items(
              id,
              food_id,
              measure_id,
              quantity,
              grams_total,
              kcal_total,
              protein_total,
              carb_total,
              fat_total
            )
          )
        `)
        .eq('id', recordId)
        .single();

      console.log('📊 Query resultado:', {
        data: fullRecord,
        error: fetchError
      });

      if (fetchError) {
        console.error('❌ Erro na query:', fetchError);
        toast.error('Erro ao buscar recordatório: ' + fetchError.message);
        setIsConverting(false);
        return;
      }

      if (!fullRecord) {
        toast.error('Recordatório não encontrado');
        setIsConverting(false);
        return;
      }

      console.log('✅ Recordatório carregado:', {
        client_id: (fullRecord as any).client_id,
        meals: (fullRecord as any).record_meals?.length,
        total_items: (fullRecord as any).record_meals?.reduce(
          (sum: number, m: any) => sum + (m.record_items?.length || 0), 0
        )
      });

      console.log('🔄 ETAPA 3: Validando dados');

      if (!(fullRecord as any).client_id) {
        toast.error('Recordatório sem cliente');
        setIsConverting(false);
        return;
      }

      if (!(fullRecord as any).record_meals || (fullRecord as any).record_meals.length === 0) {
        toast.error('Adicione pelo menos uma refeição');
        setIsConverting(false);
        return;
      }

      const hasItems = (fullRecord as any).record_meals.some(
        (m: any) => m.record_items && m.record_items.length > 0
      );

      if (!hasItems) {
        toast.error('Adicione alimentos às refeições');
        setIsConverting(false);
        return;
      }

      console.log('🔄 ETAPA 4: Calculando totais');

      const totals = (fullRecord as any).record_meals.reduce((acc: any, meal: any) => {
        meal.record_items.forEach((item: any) => {
          acc.kcal += item.kcal_total || 0;
          acc.protein += item.protein_total || 0;
          acc.carbs += item.carb_total || 0;
          acc.fats += item.fat_total || 0;
        });
        return acc;
      }, { kcal: 0, protein: 0, carbs: 0, fats: 0 });

      console.log('📊 Totais:', totals);

      console.log('🔄 ETAPA 5: Criando meal_plan');

      const { data: { user } } = await supabase.auth.getUser();

      const { data: newPlan, error: planError } = await supabase
        .from('meal_plans')
        .insert({
          client_id: (fullRecord as any).client_id,
          tenant_id: tenantId,
          name: `Plano - ${format(
            new Date((fullRecord as any).record_date), 
            "dd 'de' MMMM 'de' yyyy",
            { locale: ptBR }
          )}`,
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          calorie_target: Math.round(totals.kcal),
          protein_target_g: Math.round(totals.protein),
          carb_target_g: Math.round(totals.carbs),
          fat_target_g: Math.round(totals.fats),
          status: 'ativo'
        })
        .select()
        .single();

      console.log('📊 Plano criado:', {
        data: newPlan,
        error: planError
      });

      if (planError) {
        console.error('❌ Erro ao criar plano:', planError);
        toast.error('Erro ao criar plano: ' + planError.message);
        setIsConverting(false);
        return;
      }

      console.log('🔄 ETAPA 6: Copiando refeições');

      for (const meal of (fullRecord as any).record_meals) {
        const { data: newMeal, error: mealError } = await supabase
          .from('meals' as any)
          .insert({
            meal_plan_id: (newPlan as any).id,
            name: meal.name,
            time: meal.time,
            order_index: meal.order_index || 0
          })
          .select()
          .single();

        if (mealError) {
          console.error('❌ Erro ao criar meal:', mealError);
          continue;
        }

        console.log(`✅ Meal "${meal.name}" criada`);

        const items = meal.record_items.map((item: any) => ({
          meal_id: (newMeal as any).id,
          food_id: item.food_id,
          measure_id: item.measure_id,
          quantity: item.quantity,
          grams_total: item.grams_total,
          kcal_total: item.kcal_total,
          protein_total: item.protein_total,
          carb_total: item.carb_total,
          fat_total: item.fat_total
        }));

        await supabase.from('meal_items' as any).insert(items);
        console.log(`✅ ${items.length} itens copiados`);
      }

      console.log('🎉 Conversão concluída com sucesso!');

      toast.success('Plano criado com sucesso!');
      
      await new Promise(r => setTimeout(r, 1000));
      
      navigate(`/platform/${tenantId}/planos-alimentares/${(newPlan as any).id}`);

    } catch (error: any) {
      console.error('💥 Erro inesperado:', error);
      toast.error('Erro: ' + (error.message || 'Desconhecido'));
    } finally {
      setIsConverting(false);
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
    return <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#18181b] flex items-center justify-center">
      <p className="text-gray-400">Carregando...</p>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#18181b]">
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

        {/* Botão Template - APENAS PARA DESENVOLVIMENTO */}
        {recordId && (
          <div className="mb-4 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
            <p className="text-yellow-400 text-sm mb-2">
              🧪 Modo Desenvolvimento - Preencher com dados de teste
            </p>
            <Button
              onClick={fillTemplateData}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              Preencher Recordatório Template
            </Button>
          </div>
        )}

        {/* Meals */}
        <div className="space-y-3 mb-6">
          {meals.map((meal, mealIndex) => {
            const isExpanded = expandedMealIndex === mealIndex;
            const mealKcal = Math.round(meal.items.reduce((sum, item) => sum + item.kcal, 0));
            
            return (
              <Card key={mealIndex} className="bg-gray-800 border-gray-700">
                {/* Header da Refeição - Sempre visível */}
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-750 transition-colors"
                  onClick={() => toggleMeal(mealIndex)}
                >
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <span className="font-semibold text-white text-base">
                        {meal.time} - {meal.name}
                      </span>
                      <div className="text-sm text-gray-400 mt-0.5">
                        {mealKcal} kcal
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveMeal(mealIndex);
                      }}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-gray-400 hover:text-white"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Conteúdo da Refeição - Expansível com animação */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <QuickFoodInput
                      onAdd={(foodData) => handleAddFood(mealIndex, foodData)}
                      placeholder="🔍 Digite alimento..."
                    />

                    <div className="space-y-3">
                      {meal.items.map((item, itemIndex) => (
                      <RecordFoodItem
                        key={item.id}
                        item={item}
                        onRemove={() => handleRemoveFood(mealIndex, itemIndex)}
                        onShowDetails={() => handleShowFoodDetails(item)}
                        onUpdate={(updates) => handleUpdateFood(mealIndex, itemIndex, updates)}
                      />
                      ))}
                    </div>

                    {meal.items.length > 0 && (
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
                    )}
                  </div>
                )}
              </Card>
            );
          })}
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
          <Card className="mt-6 bg-gray-800/80 border-gray-700">
            <CardContent className="p-6">
              <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wide mb-4">
                Resumo do Dia
              </h3>
              
              <div className="grid grid-cols-4 gap-4 mb-6">
                {/* Total Kcal - LARANJA */}
                <div className="text-center">
                  <div className="text-orange-400 font-bold text-4xl">
                    {Math.round(totals.kcal)}
                  </div>
                  <div className="text-orange-400/60 text-xs mt-1 font-medium">
                    kcal
                  </div>
                </div>
                
                {/* Proteínas - AZUL */}
                <div className="text-center">
                  <div className="text-blue-400 font-bold text-3xl">
                    {Math.round(totals.protein)}g
                  </div>
                  <div className="text-blue-400/60 text-xs mt-1 font-medium">
                    Proteínas
                  </div>
                </div>
                
                {/* Carboidratos - ROXO */}
                <div className="text-center">
                  <div className="text-purple-400 font-bold text-3xl">
                    {Math.round(totals.carb)}g
                  </div>
                  <div className="text-purple-400/60 text-xs mt-1 font-medium">
                    Carboidratos
                  </div>
                </div>
                
                {/* Gorduras - AMARELO */}
                <div className="text-center">
                  <div className="text-yellow-400 font-bold text-3xl">
                    {Math.round(totals.fat)}g
                  </div>
                  <div className="text-yellow-400/60 text-xs mt-1 font-medium">
                    Gorduras
                  </div>
                </div>
              </div>
              
              <button 
                onClick={handleConvertToPlan}
                disabled={isConverting || !recordId}
                className="w-full bg-green-600 hover:bg-green-700 
                           text-white font-semibold py-3 rounded-lg 
                           transition-colors flex items-center justify-center gap-2
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConverting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Criando plano...
                  </>
                ) : (
                  <>
                    <Utensils className="w-5 h-5" />
                    Criar Plano Alimentar a partir deste Recordatório
                  </>
                )}
              </button>
            </CardContent>
          </Card>
        )}
        
        {/* Modal de Detalhes */}
        <FoodDetailsModal 
          food={selectedFoodForDetails}
          isOpen={isDetailsModalOpen}
          onClose={handleCloseDetails}
        />
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
