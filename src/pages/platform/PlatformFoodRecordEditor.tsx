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

  const handleConvertToPlan = async () => {
    try {
      setIsConverting(true);
      
      console.log('🔄 Iniciando conversão do recordatório...');

      // VALIDAÇÃO 1: Apenas verificar se recordId existe
      if (!recordId) {
        toast.error('Salve o recordatório antes de criar um plano', {
          description: 'Clique em "Salvar" primeiro'
        });
        setIsConverting(false);
        return;
      }

      if (!tenantId) {
        toast.error('Tenant não identificado');
        setIsConverting(false);
        return;
      }

      console.log('📋 Buscando recordatório completo:', recordId);

      // BUSCAR DADOS DO BANCO (client_id está aqui)
      const { data: fullRecord, error: fetchError } = await supabase
        .from('food_records' as any)
        .select(`
          *,
          record_meals!inner(
            *,
            record_items!inner(
              *,
              foods!inner(name, energy_kcal, protein_g, carbohydrate_g, lipid_g),
              food_measures!inner(measure_name, grams)
            )
          )
        `)
        .eq('id', recordId)
        .single();

      if (fetchError) {
        console.error('❌ Erro ao buscar recordatório:', fetchError);
        toast.error('Erro ao carregar recordatório', {
          description: fetchError.message
        });
        setIsConverting(false);
        return;
      }

      if (!fullRecord) {
        toast.error('Recordatório não encontrado');
        setIsConverting(false);
        return;
      }

      console.log('✅ Recordatório carregado:', {
        id: (fullRecord as any).id,
        client_id: (fullRecord as any).client_id,
        date: (fullRecord as any).record_date,
        meals: (fullRecord as any).record_meals?.length,
        total_items: (fullRecord as any).record_meals?.reduce(
          (sum: number, m: any) => sum + (m.record_items?.length || 0), 0
        )
      });

      // VALIDAÇÃO 2: Verificar client_id DOS DADOS DO BANCO
      if (!(fullRecord as any).client_id) {
        toast.error('Recordatório sem cliente associado', {
          description: 'Entre em contato com o suporte'
        });
        setIsConverting(false);
        return;
      }

      // VALIDAÇÃO 3: Verificar se tem refeições
      if (!(fullRecord as any).record_meals || (fullRecord as any).record_meals.length === 0) {
        toast.error('Adicione pelo menos uma refeição', {
          description: 'O recordatório está vazio'
        });
        setIsConverting(false);
        return;
      }

      // VALIDAÇÃO 4: Verificar se tem alimentos
      const hasItems = (fullRecord as any).record_meals.some(
        (meal: any) => meal.record_items && meal.record_items.length > 0
      );

      if (!hasItems) {
        toast.error('Adicione alimentos às refeições', {
          description: 'Todas as refeições estão vazias'
        });
        setIsConverting(false);
        return;
      }

      console.log('✅ Cliente encontrado:', (fullRecord as any).client_id);

      // CALCULAR TOTAIS
      const totals = (fullRecord as any).record_meals.reduce((acc: any, meal: any) => {
        meal.record_items.forEach((item: any) => {
          acc.kcal += item.kcal_total || 0;
          acc.protein += item.protein_total || 0;
          acc.carbs += item.carb_total || 0;
          acc.fats += item.fat_total || 0;
        });
        return acc;
      }, { kcal: 0, protein: 0, carbs: 0, fats: 0 });

      console.log('📊 Totais calculados:', totals);

      // CRIAR MEAL PLAN
      const planName = `Plano - ${format(
        new Date((fullRecord as any).record_date), 
        "dd 'de' MMMM 'de' yyyy",
        { locale: ptBR }
      )}`;

      console.log('📝 Criando plano:', planName);

      const { data: { user } } = await supabase.auth.getUser();

      const { data: newPlan, error: planError } = await supabase
        .from('meal_plans')
        .insert({
          client_id: (fullRecord as any).client_id, // DO BANCO
          tenant_id: tenantId,
          name: planName,
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          calorie_target: Math.round(totals.kcal),
          protein_target_g: Math.round(totals.protein),
          carb_target_g: Math.round(totals.carbs),
          fat_target_g: Math.round(totals.fats),
          status: 'active'
        })
        .select()
        .single();

      if (planError || !newPlan) {
        console.error('❌ Erro ao criar plano:', planError);
        toast.error('Erro ao criar plano alimentar', {
          description: planError?.message || 'Erro desconhecido'
        });
        setIsConverting(false);
        return;
      }

      console.log('✅ Plano criado:', newPlan.id);

      // COPIAR REFEIÇÕES E ITENS
      let totalMealsCopied = 0;
      let totalItemsCopied = 0;

      for (const recordMeal of (fullRecord as any).record_meals) {
        
        // Criar meal
        const { data: newMeal, error: mealError } = await supabase
          .from('meals' as any)
          .insert({
            meal_plan_id: newPlan.id,
            name: recordMeal.meal_name,
            time: recordMeal.meal_time,
            order_index: recordMeal.order_index || 0
          })
          .select()
          .single();

        if (mealError || !newMeal) {
          console.error('❌ Erro ao criar meal:', mealError);
          continue;
        }

        totalMealsCopied++;

        // Criar items
        if (recordMeal.record_items && recordMeal.record_items.length > 0) {
          const mealItems = recordMeal.record_items.map((item: any) => ({
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

          const { error: itemsError } = await supabase
            .from('meal_items' as any)
            .insert(mealItems);

          if (itemsError) {
            console.error('❌ Erro ao criar items:', itemsError);
          } else {
            totalItemsCopied += mealItems.length;
            console.log(`✅ ${recordMeal.meal_name}: ${mealItems.length} itens copiados`);
          }
        }
      }

      console.log('🎉 Conversão concluída:', {
        plan_id: newPlan.id,
        meals: totalMealsCopied,
        items: totalItemsCopied
      });

      // SUCESSO
      toast.success('Plano alimentar criado com sucesso!', {
        description: `${totalMealsCopied} refeições e ${totalItemsCopied} alimentos copiados`
      });

      // Aguardar 800ms para usuário ver toast
      await new Promise(resolve => setTimeout(resolve, 800));

      // REDIRECIONAR
      navigate(`/platform/${tenantId}/planos-alimentares/${newPlan.id}`);

    } catch (error: any) {
      console.error('💥 Erro inesperado:', error);
      toast.error('Erro ao criar plano alimentar', {
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
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
