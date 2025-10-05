import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard as Edit, Check, Plus, RefreshCw, Scale, Trash2, Clock, Flame, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { InlineFoodSearch } from '@/components/platform/InlineFoodSearch';
import { EditPortionModal } from '@/components/platform/EditPortionModal';
import { SaveTemplateModal } from '@/components/platform/SaveTemplateModal';
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
  const [isSaving, setIsSaving] = useState(false);
  
  // ⭐ Backup para o botão cancelar
  const [originalMeals, setOriginalMeals] = useState<any[]>([]);
  
  // Estados para modais
  const [replacingFood, setReplacingFood] = useState<{ mealId: string; oldFoodItemId: string } | null>(null);
  const [editingPortion, setEditingPortion] = useState<FoodItemToEdit | null>(null);
  const [showSearchForMeal, setShowSearchForMeal] = useState<string | null>(null);
  const [addingToMeal, setAddingToMeal] = useState<string | null>(null);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);

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
      
      // ⭐ Criar backup (deep copy) para reverter mudanças
      setOriginalMeals(JSON.parse(JSON.stringify(mealsData || [])));
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
      // Buscar dados do alimento atual para recalcular
      const meal = meals.find(m => m.meal_items.some((item: any) => item.id === foodItemId));
      const foodItem = meal?.meal_items.find((item: any) => item.id === foodItemId);
      
      if (!foodItem) return;

      // Buscar dados nutricionais do alimento
      const { data: foodData } = await supabase
        .from('foods')
        .select('energy_kcal, protein_g, carbohydrate_g, lipid_g')
        .eq('id', foodItem.foods.id)
        .single();

      const { data: measureData } = await supabase
        .from('food_measures')
        .select('grams, measure_name')
        .eq('id', measureId)
        .single();

      if (!foodData || !measureData) throw new Error('Dados não encontrados');

      // Recalcular totais
      const totalGrams = quantity * measureData.grams;
      const multiplier = totalGrams / 100;

      // ⭐ ATUALIZAR APENAS ESTADO LOCAL (não salvar no banco ainda)
      setMeals(meals.map(m => ({
        ...m,
        meal_items: m.meal_items.map((item: any) => 
          item.id === foodItemId ? {
            ...item,
            measure_id: measureId,
            quantity: quantity,
            grams_total: totalGrams,
            kcal_total: Math.round(foodData.energy_kcal * multiplier),
            protein_total: Math.round(foodData.protein_g * multiplier * 10) / 10,
            carb_total: Math.round(foodData.carbohydrate_g * multiplier * 10) / 10,
            fat_total: Math.round(foodData.lipid_g * multiplier * 10) / 10,
            measures: {
              ...item.measures,
              id: measureId,
              measure_name: measureData.measure_name,
              grams: measureData.grams
            }
          } : item
        )
      })));

      toast({
        title: 'Porção atualizada',
        description: 'Clique em "Salvar Alterações" para confirmar',
        duration: 2000
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
      // ⭐ ATUALIZAR APENAS ESTADO LOCAL (não deletar do banco ainda)
      setMeals(meals.map(m => 
        m.id === mealId ? {
          ...m,
          meal_items: m.meal_items.filter((item: any) => item.id !== foodItemId)
        } : m
      ));

      toast({
        title: 'Alimento removido',
        description: 'Clique em "Salvar Alterações" para confirmar',
        duration: 2000
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao remover',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleAddFood = async (mealId: string, item: any) => {
    try {
      console.log('📥 Recebendo item do InlineFoodSearch:', item);

      const tempId = `temp-${Date.now()}`;

      const newItem = {
        id: tempId,
        quantity: item.quantity,
        grams_total: item.grams_total || item.grams || 0,
        kcal_total: item.kcal_total || item.kcal || 0,
        protein_total: item.protein_total || item.protein || 0,
        carb_total: item.carb_total || item.carbs || 0,
        fat_total: item.fat_total || item.fat || 0,
        foods: {
          name: item.food?.name || item.food_name || 'Alimento',
          id: item.food?.id || item.food_id
        },
        measures: {
          measure_name: item.measure?.measure_name || item.measure_name || 'gramas',
          id: item.measure?.id || item.measure_id
        },
        food_id: item.food?.id || item.food_id,
        measure_id: item.measure?.id || item.measure_id,
        _isNew: true
      };

      console.log('✅ Item criado para adicionar:', newItem);

      setMeals(meals.map(m =>
        m.id === mealId ? {
          ...m,
          meal_items: [
            ...(m.meal_items || []),
            newItem
          ]
        } : m
      ));

      toast({
        title: 'Alimento adicionado',
        description: 'Clique em "Salvar Alterações" para confirmar',
        duration: 2000
      });

      setShowSearchForMeal(null);
    } catch (error: any) {
      toast({
        title: 'Erro ao adicionar',
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

  // ⭐ ENTRAR EM MODO DE EDIÇÃO (salvar backup)
  const handleEnterEditMode = () => {
    // Criar backup antes de permitir edições
    setOriginalMeals(JSON.parse(JSON.stringify(meals)));
    setEditMode(true);
    
    toast({
      title: 'Modo de edição ativo',
      description: 'Faça as alterações necessárias e clique em "Salvar Alterações".'
    });
  };

  // ⭐ CANCELAR EDIÇÕES (reverter para backup)
  const handleCancelEdit = () => {
    // Restaurar estado original (desfazer todas as mudanças)
    setMeals(JSON.parse(JSON.stringify(originalMeals)));
    setEditMode(false);
    
    // Recarregar do banco para garantir dados frescos
    loadMealPlan();
    
    toast({
      title: 'Edições canceladas',
      description: 'Todas as alterações foram descartadas.'
    });
  };

  // ⭐ SALVAR ALTERAÇÕES (persistir todas as mudanças no banco)
  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      console.log('💾 Salvando alterações no banco...');

      // 🗑️ ETAPA 0: Excluir refeições vazias (sem alimentos)
      const emptyMeals = meals.filter(meal => 
        !meal.meal_items || meal.meal_items.length === 0
      );
      
      if (emptyMeals.length > 0) {
        console.log(`🗑️ Excluindo ${emptyMeals.length} refeição(ões) vazia(s)...`);
        
        for (const emptyMeal of emptyMeals) {
          // Só tentar deletar se não for temporária
          if (!emptyMeal.id.startsWith('temp-')) {
            await supabase
              .from('meal_plan_meals')
              .delete()
              .eq('id', emptyMeal.id);
            
            console.log(`✅ Refeição "${emptyMeal.name}" excluída`);
          }
        }
        
        // Remover do estado local também
        const filteredMeals = meals.filter(meal => 
          meal.meal_items && meal.meal_items.length > 0
        );
        setMeals(filteredMeals);
        
        toast({
          title: '🗑️ Refeições vazias excluídas',
          description: `${emptyMeals.length} refeição(ões) sem alimentos foi(ram) removida(s)`
        });
      }

      // Recarregar refeições após exclusão
      const remainingMeals = meals.filter(meal => 
        meal.meal_items && meal.meal_items.length > 0
      );

      // Para cada refeição restante, sincronizar meal_items
      for (const meal of remainingMeals) {
        // 1. Buscar IDs existentes no banco
        const { data: existingItems } = await supabase
          .from('meal_items')
          .select('id')
          .eq('meal_id', meal.id);

        const existingIds = new Set(existingItems?.map(item => item.id) || []);
        const currentIds = new Set(
          meal.meal_items
            ?.filter((item: any) => !item.id.startsWith('temp-'))
            .map((item: any) => item.id) || []
        );

        // 2. Deletar itens removidos
        const idsToDelete = [...existingIds].filter(id => !currentIds.has(id));
        if (idsToDelete.length > 0) {
          console.log('🗑️ Deletando:', idsToDelete);
          await supabase
            .from('meal_items')
            .delete()
            .in('id', idsToDelete);
        }

        // 3. Inserir novos itens e atualizar existentes
        for (const item of meal.meal_items || []) {
          const itemData = {
            meal_id: meal.id,
            food_id: item.food_id,
            measure_id: item.measure_id,
            quantity: item.quantity,
            grams_total: item.grams_total,
            kcal_total: item.kcal_total,
            protein_total: item.protein_total,
            carb_total: item.carb_total,
            fat_total: item.fat_total
          };

          if (item.id.startsWith('temp-') || item._isNew) {
            // Inserir novo
            console.log('➕ Inserindo novo item:', item.foods?.name);
            await supabase.from('meal_items').insert(itemData);
          } else if (existingIds.has(item.id)) {
            // Atualizar existente
            console.log('✏️ Atualizando item:', item.foods?.name);
            await supabase
              .from('meal_items')
              .update(itemData)
              .eq('id', item.id);
          }
        }
      }

      // 4. Recalcular e atualizar totais do plano
      const totals = getTotals();
      await supabase
        .from('meal_plans')
        .update({
          target_kcal: Math.round(totals.kcal),
          target_protein: Math.round(totals.protein * 10) / 10,
          target_carbs: Math.round(totals.carb * 10) / 10,
          target_fats: Math.round(totals.fat * 10) / 10,
          updated_at: new Date().toISOString()
        })
        .eq('id', planId);

      console.log('✅ Todas as alterações salvas!');

      // Atualizar backup e sair do modo de edição
      setOriginalMeals(JSON.parse(JSON.stringify(meals)));
      setEditMode(false);

      toast({
        title: '✅ Plano salvo com sucesso!',
        description: `${totals.kcal.toFixed(0)} kcal | P: ${totals.protein.toFixed(0)}g | C: ${totals.carb.toFixed(0)}g | G: ${totals.fat.toFixed(0)}g`
      });

      // Recarregar do banco para sincronizar
      await loadMealPlan();
    } catch (error: any) {
      console.error('❌ Erro ao salvar:', error);
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
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
              <>
                <Button variant="outline" onClick={() => setShowSaveTemplateModal(true)} className="gap-2">
                  <Save className="h-4 w-4" />
                  Salvar como Template
                </Button>
              <Button onClick={handleEnterEditMode} className="gap-2">
                <Edit className="h-4 w-4" />
                Editar Plano
              </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className="gap-2"
                >
                  <Check className="h-4 w-4" />
                  {isSaving ? 'Salvando...' : 'Salvar Alterações'}
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
                <p className="text-2xl font-bold">{plan.target_kcal || '-'} kcal</p>
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
                          <p className="font-medium">{item.foods?.name || 'Alimento sem nome'}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} {item.measures?.measure_name || 'gramas'} • {item.kcal_total || 0} kcal
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
                    showSearchForMeal === meal.id ? (
                      <div className="mt-4 p-4 border-2 border-primary/20 rounded-lg bg-primary/5">
                        <InlineFoodSearch
                          onAddFood={(item) => handleAddFood(meal.id, item)}
                          placeholder="Buscar e adicionar alimento... (⌘K)"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowSearchForMeal(null)}
                          className="w-full mt-2"
                        >
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowSearchForMeal(meal.id)}
                        className="gap-2 mt-3 w-full"
                      >
                        <Plus className="h-4 w-4" />
                        Adicionar alimento
                      </Button>
                    )
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>

      {/* Modais */}
      <EditPortionModal
        foodItem={editingPortion}
        open={!!editingPortion}
        onClose={() => setEditingPortion(null)}
        onSave={handleSavePortion}
      />

      <SaveTemplateModal
        open={showSaveTemplateModal}
        onClose={() => setShowSaveTemplateModal(false)}
        mealPlanId={planId!}
        currentPlan={{
          target_kcal: totals.kcal,
          target_protein: totals.protein,
          target_carbs: totals.carb,
          target_fats: totals.fat,
          goal: plan.goal
        }}
      />
    </div>
  );
}
