import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, ArrowLeft, UtensilsCrossed } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AddFoodToMealModal } from '@/components/platform/AddFoodToMealModal';
import { calculateMealTotals, calculateDayTotals, formatNutrient } from '@/lib/nutritionCalculations';
import { useTenantId } from '@/hooks/useTenantId';
import PlatformPageWrapper from '@/core/layouts/PlatformPageWrapper';

export default function PlatformMealPlanEditor() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { tenantId } = useTenantId();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  
  const [planData, setPlanData] = useState({
    title: '',
    client_id: '',
    calorie_target: 2000,
    protein_target_g: 150,
    carb_target_g: 250,
    fat_target_g: 65,
    goal: ''
  });

  const [meals, setMeals] = useState([
    { name: 'Café da Manhã', time: '08:00', order_index: 1, items: [] },
    { name: 'Lanche da Manhã', time: '10:00', order_index: 2, items: [] },
    { name: 'Almoço', time: '12:00', order_index: 3, items: [] },
    { name: 'Lanche da Tarde', time: '15:00', order_index: 4, items: [] },
    { name: 'Jantar', time: '19:00', order_index: 5, items: [] },
    { name: 'Ceia', time: '22:00', order_index: 6, items: [] }
  ]);

  const [activeMealIndex, setActiveMealIndex] = useState<number | null>(null);
  const [showAddFoodModal, setShowAddFoodModal] = useState(false);

  // Carregar clientes
  useEffect(() => {
    if (tenantId) {
      fetchClients();
    }
  }, [tenantId]);

  const fetchClients = async () => {
    const { data } = await supabase
      .from('clients')
      .select('id, name')
      .eq('tenant_id', tenantId)
      .order('name');
    setClients(data || []);
  };

  // Calcular totais do dia
  const dayTotals = calculateDayTotals(meals);

  const handleAddMeal = () => {
    setMeals([
      ...meals,
      {
        name: `Refeição ${meals.length + 1}`,
        time: '',
        order_index: meals.length + 1,
        items: []
      }
    ]);
  };

  const handleRemoveMeal = (index: number) => {
    setMeals(meals.filter((_, i) => i !== index));
  };

  const handleAddFood = (mealIndex: number) => {
    setActiveMealIndex(mealIndex);
    setShowAddFoodModal(true);
  };

  const handleFoodAdded = (item: any) => {
    if (activeMealIndex === null) return;
    
    setMeals(meals.map((meal, i) => 
      i === activeMealIndex 
        ? { ...meal, items: [...meal.items, item] }
        : meal
    ));
    setShowAddFoodModal(false);
  };

  const handleRemoveFood = (mealIndex: number, itemIndex: number) => {
    setMeals(meals.map((meal, i) =>
      i === mealIndex
        ? { ...meal, items: meal.items.filter((_, j) => j !== itemIndex) }
        : meal
    ));
  };

  const handleSave = async () => {
    if (!planData.title || !planData.client_id) {
      toast({
        title: 'Preencha todos os campos obrigatórios',
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);

    try {
      // Salvar plano
      const { data: plan, error: planError } = await supabase
        .from('meal_plans')
        .upsert({
          id: planId || undefined,
          tenant_id: tenantId,
          title: planData.title,
          client_id: planData.client_id,
          calorie_target: planData.calorie_target,
          protein_target_g: planData.protein_target_g,
          carb_target_g: planData.carb_target_g,
          fat_target_g: planData.fat_target_g,
          goal: planData.goal,
          active: true,
          name: planData.title,
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          plan_data: { breakfast: [], lunch: [], dinner: [], snacks: [] }
        })
        .select()
        .single();

      if (planError) throw planError;

      // Deletar refeições antigas se estiver editando
      if (planId) {
        await supabase
          .from('meal_plan_meals')
          .delete()
          .eq('meal_plan_id', planId);
      }

      // Salvar refeições
      for (const meal of meals) {
        const { data: mealData, error: mealError } = await supabase
          .from('meal_plan_meals')
          .insert({
            meal_plan_id: plan.id,
            name: meal.name,
            time: meal.time,
            order_index: meal.order_index
          })
          .select()
          .single();

        if (mealError) throw mealError;

        // Salvar itens da refeição
        if (meal.items.length > 0) {
          const { error: itemsError } = await supabase
            .from('meal_items')
            .insert(
              meal.items.map((item: any) => ({
                meal_id: mealData.id,
                food_id: item.food_id,
                measure_id: item.measure_id,
                quantity: item.quantity,
                grams_total: item.grams_total,
                kcal_total: item.kcal_total,
                protein_total: item.protein_total,
                carb_total: item.carb_total,
                fat_total: item.fat_total
              }))
            );

          if (itemsError) throw itemsError;
        }
      }

      toast({
        title: '✓ Plano salvo com sucesso!',
        description: 'O plano alimentar foi salvo e está disponível para o cliente.'
      });

      navigate(-1);

    } catch (error: any) {
      toast({
        title: 'Erro ao salvar plano',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <PlatformPageWrapper>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate(-1)}
                variant="ghost"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">
                  {planId ? 'Editar' : 'Novo'} Plano Alimentar
                </h1>
                <p className="text-muted-foreground">Monte o plano nutricional do seu cliente</p>
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
            >
              <Save className="w-5 h-5 mr-2" />
              {saving ? 'Salvando...' : 'Salvar Plano'}
            </Button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna Esquerda: Configurações */}
            <div className="lg:col-span-1 space-y-6">
              {/* Card de Configurações */}
              <div className="bg-card rounded-lg border p-6 sticky top-6">
                <h2 className="font-bold text-lg mb-4">Configurações do Plano</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label>Título do Plano *</Label>
                    <Input
                      value={planData.title}
                      onChange={(e) => setPlanData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ex: Plano de Emagrecimento - João"
                    />
                  </div>

                  <div>
                    <Label>Cliente *</Label>
                    <select
                      value={planData.client_id}
                      onChange={(e) => setPlanData(prev => ({ ...prev, client_id: e.target.value }))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">Selecionar cliente...</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label>Objetivo</Label>
                    <select
                      value={planData.goal}
                      onChange={(e) => setPlanData(prev => ({ ...prev, goal: e.target.value }))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">Selecione...</option>
                      <option value="emagrecimento">Emagrecimento</option>
                      <option value="ganho_massa">Ganho de Massa</option>
                      <option value="manutencao">Manutenção</option>
                      <option value="saude">Saúde e Bem-estar</option>
                    </select>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3">Metas Diárias</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <Label>Calorias (kcal)</Label>
                        <Input
                          type="number"
                          value={planData.calorie_target}
                          onChange={(e) => setPlanData(prev => ({ ...prev, calorie_target: parseInt(e.target.value) }))}
                        />
                      </div>

                      <div>
                        <Label>Proteínas (g)</Label>
                        <Input
                          type="number"
                          value={planData.protein_target_g}
                          onChange={(e) => setPlanData(prev => ({ ...prev, protein_target_g: parseInt(e.target.value) }))}
                        />
                      </div>

                      <div>
                        <Label>Carboidratos (g)</Label>
                        <Input
                          type="number"
                          value={planData.carb_target_g}
                          onChange={(e) => setPlanData(prev => ({ ...prev, carb_target_g: parseInt(e.target.value) }))}
                        />
                      </div>

                      <div>
                        <Label>Gorduras (g)</Label>
                        <Input
                          type="number"
                          value={planData.fat_target_g}
                          onChange={(e) => setPlanData(prev => ({ ...prev, fat_target_g: parseInt(e.target.value) }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Resumo do Dia */}
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3">Total do Dia</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Calorias:</span>
                        <span className="font-bold">
                          {dayTotals.kcal.toFixed(0)} / {planData.calorie_target} kcal
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Proteínas:</span>
                        <span className="font-bold">
                          {formatNutrient(dayTotals.protein)} / {formatNutrient(planData.protein_target_g)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Carboidratos:</span>
                        <span className="font-bold">
                          {formatNutrient(dayTotals.carb)} / {formatNutrient(planData.carb_target_g)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Gorduras:</span>
                        <span className="font-bold">
                          {formatNutrient(dayTotals.fat)} / {formatNutrient(planData.fat_target_g)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna Direita: Refeições */}
            <div className="lg:col-span-2 space-y-4">
              {meals.map((meal: any, mealIndex: number) => {
                const mealTotals = calculateMealTotals(meal.items);
                
                return (
                  <div key={mealIndex} className="bg-card rounded-lg border p-6">
                    {/* Header da Refeição */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1">
                        <UtensilsCrossed className="w-5 h-5 text-primary" />
                        <Input
                          value={meal.name}
                          onChange={(e) => {
                            setMeals(meals.map((m: any, i: number) =>
                              i === mealIndex ? { ...m, name: e.target.value } : m
                            ));
                          }}
                          className="font-semibold"
                        />
                        <Input
                          type="time"
                          value={meal.time}
                          onChange={(e) => {
                            setMeals(meals.map((m: any, i: number) =>
                              i === mealIndex ? { ...m, time: e.target.value } : m
                            ));
                          }}
                          className="w-32"
                        />
                      </div>
                      {meals.length > 1 && (
                        <Button
                          onClick={() => handleRemoveMeal(mealIndex)}
                          variant="ghost"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>

                    {/* Lista de Alimentos */}
                    <div className="space-y-2 mb-4">
                      {meal.items.map((item: any, itemIndex: number) => (
                        <div
                          key={itemIndex}
                          className="flex items-center justify-between p-3 bg-accent/20 rounded-lg border"
                        >
                          <div className="flex-1">
                            <p className="font-medium">
                              {item.food?.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {item.quantity} {item.measure?.measure_name} ({item.grams_total.toFixed(0)}g)
                            </p>
                          </div>
                          <div className="text-right mr-4">
                            <p className="font-bold">{item.kcal_total.toFixed(0)} kcal</p>
                            <p className="text-xs text-muted-foreground">
                              P: {formatNutrient(item.protein_total)} | 
                              C: {formatNutrient(item.carb_total)} | 
                              G: {formatNutrient(item.fat_total)}
                            </p>
                          </div>
                          <Button
                            onClick={() => handleRemoveFood(mealIndex, itemIndex)}
                            variant="ghost"
                            size="sm"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Totais da Refeição */}
                    {meal.items.length > 0 && (
                      <div className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                        <div className="grid grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-muted-foreground">Total</p>
                            <p className="font-bold">{mealTotals.kcal.toFixed(0)} kcal</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Proteínas</p>
                            <p className="font-bold">{formatNutrient(mealTotals.protein)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Carbos</p>
                            <p className="font-bold">{formatNutrient(mealTotals.carb)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Gorduras</p>
                            <p className="font-bold">{formatNutrient(mealTotals.fat)}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Botão Adicionar Alimento */}
                    <Button
                      onClick={() => handleAddFood(mealIndex)}
                      variant="outline"
                      className="w-full border-dashed"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Alimento
                    </Button>
                  </div>
                );
              })}

              {/* Botão Adicionar Refeição */}
              <Button
                onClick={handleAddMeal}
                variant="outline"
                className="w-full border-dashed border-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Nova Refeição
              </Button>
            </div>
          </div>
        </div>

        {/* Modal de Adicionar Alimento */}
        <AddFoodToMealModal
          isOpen={showAddFoodModal}
          onClose={() => setShowAddFoodModal(false)}
          onAddFood={handleFoodAdded}
        />
      </div>
    </PlatformPageWrapper>
  );
}
