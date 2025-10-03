import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Check, Plus, RefreshCw, Scale, Trash2, Clock, Flame } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AddFoodToMealModal } from '@/components/platform/AddFoodToMealModal';
import { EditPortionModal } from '@/components/platform/EditPortionModal';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FoodItemToEdit {
  id: string;
  food_name: string;
  current_measure: string;
  current_measure_id: string;
  current_quantity: number;
  available_measures: Array<{
    id: string;
    measure_name: string;
    grams: number;
  }>;
}

export default function PlatformMealPlanViewer() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [plan, setPlan] = useState<any>(null);
  const [meals, setMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  
  // Estados para modais
  const [addingToMeal, setAddingToMeal] = useState<string | null>(null);
  const [replacingFood, setReplacingFood] = useState<{ mealId: string; oldFoodItemId: string } | null>(null);
  const [editingPortion, setEditingPortion] = useState<FoodItemToEdit | null>(null);

  useEffect(() => {
    if (planId) loadMealPlan();
  }, [planId]);

  const loadMealPlan = async () => {
    if (!planId) return;

    try {
      setLoading(true);

      const { data: planData, error: planError } = await supabase
        .from('meal_plans')
        .select('*, clients(name)')
        .eq('id', planId)
        .single();

      if (planError) throw planError;
      setPlan(planData);

      const { data: mealsData, error: mealsError } = await supabase
        .from('meal_plan_meals')
        .select(`
          id,
          name,
          time,
          order_index,
          meal_items(
            id,
            quantity,
            kcal_total,
            protein_total,
            carb_total,
            fat_total,
            foods:food_id(id, name),
            measures:measure_id(id, measure_name, grams)
          )
        `)
        .eq('meal_plan_id', planId)
        .order('order_index');

      if (mealsError) throw mealsError;
      setMeals(mealsData || []);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar plano',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReplaceFood = async (mealId: string, oldFoodItemId: string) => {
    setReplacingFood({ mealId, oldFoodItemId });
    setAddingToMeal(mealId);
  };

  const handleEditPortion = async (mealId: string, foodItemId: string) => {
    try {
      // Buscar dados do alimento atual
      const meal = meals.find(m => m.id === mealId);
      const foodItem = meal?.meal_items.find((item: any) => item.id === foodItemId);
      
      if (!foodItem) return;

      // Buscar todas as medidas disponíveis para este alimento
      const { data: allMeasures } = await supabase
        .from('food_measures')
        .select('id, measure_name, grams')
        .eq('food_id', foodItem.foods.id);

      setEditingPortion({
        id: foodItem.id,
        food_name: foodItem.foods.name,
        current_measure: foodItem.measures.measure_name,
        current_measure_id: foodItem.measures.id,
        current_quantity: foodItem.quantity,
        available_measures: allMeasures || []
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar medidas',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleSavePortion = async (foodItemId: string, measureId: string, quantity: number) => {
    try {
      // Buscar dados do alimento e medida para recalcular
      const { data: foodData } = await supabase
        .from('foods')
        .select('energy_kcal, protein_g, carbohydrate_g, lipid_g')
        .eq('id', (await supabase.from('meal_items').select('food_id').eq('id', foodItemId).single()).data?.food_id)
        .single();

      const { data: measureData } = await supabase
        .from('food_measures')
        .select('grams')
        .eq('id', measureId)
        .single();

      if (!foodData || !measureData) throw new Error('Dados não encontrados');

      // Calcular totais
      const totalGrams = quantity * measureData.grams;
      const multiplier = totalGrams / 100;

      await supabase
        .from('meal_items')
        .update({
          measure_id: measureId,
          quantity: quantity,
          grams_total: totalGrams,
          kcal_total: Math.round(foodData.energy_kcal * multiplier),
          protein_total: Math.round(foodData.protein_g * multiplier * 10) / 10,
          carb_total: Math.round(foodData.carbohydrate_g * multiplier * 10) / 10,
          fat_total: Math.round(foodData.lipid_g * multiplier * 10) / 10
        })
        .eq('id', foodItemId);

      await loadMealPlan();
      toast({
        title: 'Porção atualizada',
        description: 'As quantidades foram recalculadas'
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar porção',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleRemoveFood = async (mealId: string, foodItemId: string) => {
    if (!confirm('Tem certeza que deseja remover este alimento?')) return;

    try {
      await supabase
        .from('meal_items')
        .delete()
        .eq('id', foodItemId);

      await loadMealPlan();
      toast({
        title: 'Alimento removido',
        description: 'O item foi excluído do plano'
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao remover',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleAddOrReplaceFood = async (item: any) => {
    try {
      const mealId = addingToMeal;
      if (!mealId) return;

      if (replacingFood) {
        // Substituir alimento existente
        await supabase
          .from('meal_items')
          .update({
            food_id: item.food_id,
            measure_id: item.measure_id,
            quantity: item.quantity,
            grams_total: item.grams_total,
            kcal_total: item.kcal_total,
            protein_total: item.protein_total,
            carb_total: item.carb_total,
            fat_total: item.fat_total
          })
          .eq('id', replacingFood.oldFoodItemId);

        toast({
          title: 'Alimento substituído',
          description: `Trocado para ${item.food.name}`
        });
        setReplacingFood(null);
      } else {
        // Adicionar novo alimento
        await supabase
          .from('meal_items')
          .insert({
            meal_id: mealId,
            food_id: item.food_id,
            measure_id: item.measure_id,
            quantity: item.quantity,
            grams_total: item.grams_total,
            kcal_total: item.kcal_total,
            protein_total: item.protein_total,
            carb_total: item.carb_total,
            fat_total: item.fat_total
          });

        toast({
          title: 'Alimento adicionado',
          description: `${item.food.name} foi adicionado à refeição`
        });
      }

      setAddingToMeal(null);
      await loadMealPlan();
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const getTotals = () => {
    return meals.reduce((acc, meal) => {
      meal.meal_items?.forEach((item: any) => {
        acc.kcal += item.kcal_total || 0;
        acc.protein += item.protein_total || 0;
        acc.carb += item.carb_total || 0;
        acc.fat += item.fat_total || 0;
      });
      return acc;
    }, { kcal: 0, protein: 0, carb: 0, fat: 0 });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Carregando plano...</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Plano não encontrado</p>
      </div>
    );
  }

  const totals = getTotals();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="container max-w-6xl mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">{plan.name || plan.title}</h1>
              <p className="text-sm text-muted-foreground">{plan.clients?.name}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {!editMode ? (
              <Button onClick={() => setEditMode(true)} className="gap-2">
                <Edit className="h-4 w-4" />
                Editar Plano
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditMode(false);
                    loadMealPlan();
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    setEditMode(false);
                    toast({
                      title: 'Plano atualizado',
                      description: 'As alterações foram salvas com sucesso'
                    });
                  }}
                  className="gap-2"
                >
                  <Check className="h-4 w-4" />
                  Salvar Alterações
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Modo de edição ativo */}
      {editMode && (
        <div className="container max-w-6xl mx-auto px-4 pt-4">
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertDescription className="text-yellow-800">
              ✏️ Modo de edição ativo. Faça as alterações necessárias e clique em "Salvar Alterações".
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Conteúdo principal */}
      <main className="container max-w-6xl mx-auto p-4 pb-24">
        {/* Meta e totais */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Meta</p>
                <p className="text-2xl font-bold">{plan.calorie_target || '-'} kcal</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Total</p>
                <p className="text-2xl font-bold text-primary">{totals.kcal.toFixed(0)} kcal</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Proteínas</p>
                <p className="text-lg font-semibold">{totals.protein.toFixed(1)}g</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Carbos</p>
                <p className="text-lg font-semibold">{totals.carb.toFixed(1)}g</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Refeições */}
        <div className="space-y-4">
          {meals.map((meal) => {
            const mealTotals = meal.meal_items?.reduce((acc: any, item: any) => {
              acc.kcal += item.kcal_total || 0;
              acc.protein += item.protein_total || 0;
              acc.carb += item.carb_total || 0;
              acc.fat += item.fat_total || 0;
              return acc;
            }, { kcal: 0, protein: 0, carb: 0, fat: 0 });

            return (
              <Card key={meal.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b">
                    <div>
                      <h3 className="text-xl font-bold">{meal.name}</h3>
                      {meal.time && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <Clock className="w-4 h-4" />
                          {meal.time}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <Flame className="w-5 h-5 text-orange-500" />
                        <p className="text-2xl font-bold text-primary">
                          {mealTotals.kcal.toFixed(0)}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">kcal</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {meal.meal_items?.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-3 border-b last:border-0 group"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{item.foods.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} {item.measures.measure_name} • {item.kcal_total} kcal
                          </p>
                        </div>

                        {editMode && (
                          <div className="flex gap-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleReplaceFood(meal.id, item.id)}
                              title="Trocar alimento"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEditPortion(meal.id, item.id)}
                              title="Ajustar porção"
                            >
                              <Scale className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleRemoveFood(meal.id, item.id)}
                              title="Remover"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {editMode && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAddingToMeal(meal.id)}
                      className="gap-2 mt-3 w-full"
                    >
                      <Plus className="h-4 w-4" />
                      Adicionar alimento
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>

      {/* Modais */}
      <AddFoodToMealModal
        isOpen={!!addingToMeal}
        onClose={() => {
          setAddingToMeal(null);
          setReplacingFood(null);
        }}
        onAddFood={handleAddOrReplaceFood}
      />

      <EditPortionModal
        foodItem={editingPortion}
        open={!!editingPortion}
        onClose={() => setEditingPortion(null)}
        onSave={handleSavePortion}
      />
    </div>
  );
}
