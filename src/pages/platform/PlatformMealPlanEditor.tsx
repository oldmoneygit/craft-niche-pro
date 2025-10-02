import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ArrowLeft, Plus, Trash2, Target, TrendingUp, ChartBar as BarChart3, Clock, Save } from 'lucide-react';
import { InlineFoodSearch } from '@/components/platform/InlineFoodSearch';
import { CategoryBrowser } from '@/components/platform/CategoryBrowser';
import { QuickPortionDialog } from '@/components/platform/QuickPortionDialog';
import { AIAssistant } from '@/components/platform/AIAssistant';
import { formatNutrient } from '@/lib/nutritionCalculations';
import { ClientProfile } from '@/types/clientProfile';

interface Meal {
  id: string;
  name: string;
  time: string;
  items: any[];
}

export default function PlatformMealPlanEditor() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { tenantId } = useTenantId();
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get('client');

  const [planName, setPlanName] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [meals, setMeals] = useState<Meal[]>([
    { id: '1', name: 'Café da Manhã', time: '09:00', items: [] }
  ]);
  const [goals, setGoals] = useState({
    kcal: 2000,
    protein: 150,
    carb: 250,
    fat: 67
  });
  const [saving, setSaving] = useState(false);
  const [selectedFoodForPortion, setSelectedFoodForPortion] = useState<{
    food: any;
    mealId: string;
  } | null>(null);
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);

  const totals = meals.reduce((acc, meal) => {
    meal.items.forEach(item => {
      acc.kcal += item.kcal_total || 0;
      acc.protein += item.protein_total || 0;
      acc.carb += item.carb_total || 0;
      acc.fat += item.fat_total || 0;
    });
    return acc;
  }, { kcal: 0, protein: 0, carb: 0, fat: 0 });

  const progress = {
    kcal: Math.min(100, (totals.kcal / goals.kcal) * 100),
    protein: Math.min(100, (totals.protein / goals.protein) * 100),
    carb: Math.min(100, (totals.carb / goals.carb) * 100),
    fat: Math.min(100, (totals.fat / goals.fat) * 100)
  };

  const handleAddMeal = () => {
    const newMeal: Meal = {
      id: Date.now().toString(),
      name: 'Nova Refeição',
      time: '12:00',
      items: []
    };
    setMeals([...meals, newMeal]);
  };

  const handleRemoveMeal = (mealId: string) => {
    setMeals(meals.filter(m => m.id !== mealId));
  };

  useEffect(() => {
    if (clientId) {
      supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single()
        .then(({ data }) => {
          if (data) {
            setClientProfile({
              id: data.id,
              name: data.name,
              age: data.age || 30,
              gender: data.gender || 'other',
              height_cm: data.height_cm || 170,
              weight_kg: data.weight_kg || 70,
              activity_level: data.activity_level || 'moderate',
              goal: data.goal || 'maintenance',
              dietary_restrictions: data.dietary_restrictions || [],
              allergies: data.allergies || [],
              dislikes: data.dislikes || [],
              meal_preferences: data.meal_preferences || [],
              budget: data.budget || 'medium',
              medical_conditions: data.medical_conditions || [],
              medications: data.medications || [],
              notes: data.notes || ''
            });
          }
        });
    }
  }, [clientId]);

  const handleApplyGeneratedPlan = async (plan: any) => {
    setGoals({
      kcal: plan.targetCalories,
      protein: plan.macros.protein_g,
      carb: plan.macros.carb_g,
      fat: plan.macros.fat_g
    });

    const newMeals = plan.meals.map((meal: any) => ({
      id: Date.now().toString() + Math.random(),
      name: meal.name,
      time: getDefaultTimeForMeal(meal.name),
      items: []
    }));

    setMeals(newMeals);

    toast({
      title: 'Plano base criado!',
      description: 'Agora use os templates ou adicione alimentos manualmente'
    });
  };

  const getDefaultTimeForMeal = (name: string): string => {
    const lower = name.toLowerCase();
    if (lower.includes('café')) return '08:00';
    if (lower.includes('lanche') && lower.includes('manhã')) return '10:00';
    if (lower.includes('almoço')) return '12:00';
    if (lower.includes('lanche') && lower.includes('tarde')) return '15:00';
    if (lower.includes('jantar')) return '19:00';
    return '12:00';
  };

  const handleAddFoodToMeal = (mealId: string, item: any) => {
    setMeals(meals.map(meal => {
      if (meal.id === mealId) {
        return { ...meal, items: [...meal.items, { ...item, id: Date.now().toString() }] };
      }
      return meal;
    }));

    toast({
      title: 'Alimento adicionado',
      description: `${item.quantity} ${item.measure.measure_name} de ${item.food.name}`
    });
  };

  const handleRemoveItem = (mealId: string, itemId: string) => {
    setMeals(meals.map(meal => {
      if (meal.id === mealId) {
        return { ...meal, items: meal.items.filter(i => i.id !== itemId) };
      }
      return meal;
    }));
  };

  const handleSave = async () => {
    if (!planName.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Digite um nome para o plano alimentar',
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);
    try {
      const { data: plan, error: planError } = await supabase
        .from('meal_plans')
        .insert({
          tenant_id: tenantId,
          client_id: clientId,
          title: planName,
          description: planDescription,
          calorie_target: goals.kcal,
          protein_target_g: goals.protein,
          carb_target_g: goals.carb,
          fat_target_g: goals.fat,
          status: 'active'
        })
        .select()
        .single();

      if (planError) throw planError;

      for (const meal of meals) {
        const { data: mealData, error: mealError } = await supabase
          .from('meal_plan_meals')
          .insert({
            meal_plan_id: plan.id,
            name: meal.name,
            time: meal.time,
            order_index: meals.indexOf(meal)
          })
          .select()
          .single();

        if (mealError) throw mealError;

        for (const item of meal.items) {
          await supabase
            .from('meal_plan_items')
            .insert({
              meal_id: mealData.id,
              food_id: item.food_id,
              measure_id: item.measure_id,
              quantity: item.quantity
            });
        }
      }

      toast({
        title: 'Plano salvo com sucesso!',
        description: 'O plano alimentar foi criado'
      });
      navigate(-1);
    } catch (error) {
      console.error('Error saving plan:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Tente novamente',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const Sidebar = () => (
    <div className="space-y-6 p-6">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Metas Diárias</h3>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-muted-foreground">Calorias (kcal)</label>
            <Input
              type="number"
              value={goals.kcal}
              onChange={(e) => setGoals({ ...goals, kcal: parseInt(e.target.value) || 0 })}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Proteínas (g)</label>
            <Input
              type="number"
              value={goals.protein}
              onChange={(e) => setGoals({ ...goals, protein: parseInt(e.target.value) || 0 })}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Carboidratos (g)</label>
            <Input
              type="number"
              value={goals.carb}
              onChange={(e) => setGoals({ ...goals, carb: parseInt(e.target.value) || 0 })}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Gorduras (g)</label>
            <Input
              type="number"
              value={goals.fat}
              onChange={(e) => setGoals({ ...goals, fat: parseInt(e.target.value) || 0 })}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Progresso</h3>
        </div>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Calorias</span>
              <span className="font-medium">{totals.kcal.toFixed(0)} / {goals.kcal}</span>
            </div>
            <Progress value={progress.kcal} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Proteínas</span>
              <span className="font-medium">{totals.protein.toFixed(1)}g / {goals.protein}g</span>
            </div>
            <Progress value={progress.protein} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Carboidratos</span>
              <span className="font-medium">{totals.carb.toFixed(1)}g / {goals.carb}g</span>
            </div>
            <Progress value={progress.carb} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Gorduras</span>
              <span className="font-medium">{totals.fat.toFixed(1)}g / {goals.fat}g</span>
            </div>
            <Progress value={progress.fat} />
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Distribuição Macro</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-blue-500/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {((totals.protein * 4 / totals.kcal) * 100 || 0).toFixed(0)}%
            </p>
            <p className="text-xs text-muted-foreground">Proteína</p>
          </div>
          <div className="bg-green-500/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-600">
              {((totals.carb * 4 / totals.kcal) * 100 || 0).toFixed(0)}%
            </p>
            <p className="text-xs text-muted-foreground">Carbos</p>
          </div>
          <div className="bg-orange-500/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-orange-600">
              {((totals.fat * 9 / totals.kcal) * 100 || 0).toFixed(0)}%
            </p>
            <p className="text-xs text-muted-foreground">Gorduras</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Novo Plano Alimentar</h1>
              <p className="text-sm text-muted-foreground">
                {meals.reduce((acc, m) => acc + m.items.length, 0)} alimentos adicionados
              </p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving} size="lg">
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Plano'}
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="hidden lg:block w-80 xl:w-96 border-r overflow-y-auto">
          <Sidebar />
        </aside>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-4 lg:p-8 space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Nome do Plano
                  </label>
                  <Input
                    placeholder="Ex: Plano de Emagrecimento - João"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Observações (opcional)
                  </label>
                  <Textarea
                    placeholder="Adicione observações sobre este plano..."
                    value={planDescription}
                    onChange={(e) => setPlanDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {clientProfile && (
              <AIAssistant
                clientProfile={clientProfile}
                onApplyPlan={handleApplyGeneratedPlan}
              />
            )}

            <div className="space-y-4">
              {meals.map((meal) => (
                <Card key={meal.id}>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <Clock className="w-5 h-5 text-muted-foreground" />
                        <Input
                          value={meal.name}
                          onChange={(e) => {
                            setMeals(meals.map(m =>
                              m.id === meal.id ? { ...m, name: e.target.value } : m
                            ));
                          }}
                          className="font-semibold text-lg border-none shadow-none focus-visible:ring-0 px-0"
                        />
                        <Input
                          type="time"
                          value={meal.time}
                          onChange={(e) => {
                            setMeals(meals.map(m =>
                              m.id === meal.id ? { ...m, time: e.target.value } : m
                            ));
                          }}
                          className="w-32"
                        />
                      </div>
                      {meals.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveMeal(meal.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>

                    {meal.items.length > 0 && (
                      <div className="space-y-2">
                        {meal.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 group hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex-1">
                              <p className="font-medium mb-1">
                                {item.quantity} {item.measure.measure_name} de {item.food.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {item.kcal_total.toFixed(0)} kcal |
                                P: {formatNutrient(item.protein_total)} |
                                C: {formatNutrient(item.carb_total)} |
                                G: {formatNutrient(item.fat_total)}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveItem(meal.id, item.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {meal.items.length > 0 && (
                      <div className="pt-3 border-t">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">Total da refeição:</span>
                          <span>
                            {meal.items.reduce((acc, i) => acc + (i.kcal_total || 0), 0).toFixed(0)} kcal |
                            P: {formatNutrient(meal.items.reduce((acc, i) => acc + (i.protein_total || 0), 0))} |
                            C: {formatNutrient(meal.items.reduce((acc, i) => acc + (i.carb_total || 0), 0))} |
                            G: {formatNutrient(meal.items.reduce((acc, i) => acc + (i.fat_total || 0), 0))}
                          </span>
                        </div>
                      </div>
                    )}

                    <InlineFoodSearch
                      onAddFood={(item) => handleAddFoodToMeal(meal.id, item)}
                      placeholder="Buscar e adicionar alimento... (⌘K)"
                    />

                    <div className="pt-2">
                      <CategoryBrowser
                        onSelectFood={(food) => {
                          setSelectedFoodForPortion({ food, mealId: meal.id });
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button
                variant="outline"
                onClick={handleAddMeal}
                className="w-full border-dashed border-2 h-12"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Nova Refeição
              </Button>
            </div>
          </div>
        </main>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              size="lg"
              className="lg:hidden fixed bottom-6 right-6 rounded-full shadow-lg z-30"
            >
              <Target className="w-5 h-5 mr-2" />
              Metas
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
            <Sidebar />
          </SheetContent>
        </Sheet>
      </div>

      {selectedFoodForPortion && (
        <QuickPortionDialog
          food={selectedFoodForPortion.food}
          isOpen={!!selectedFoodForPortion}
          onClose={() => setSelectedFoodForPortion(null)}
          onConfirm={(item) => {
            handleAddFoodToMeal(selectedFoodForPortion.mealId, item);
            setSelectedFoodForPortion(null);
          }}
        />
      )}
    </div>
  );
}
