import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useCreateMealPlan } from '@/hooks/useMealPlansData';
import { useClientsData } from '@/hooks/useClientsData';
import { Plus, ChevronRight, ChevronLeft, Check, Info, Calculator } from 'lucide-react';
import { MEAL_TYPE_LABELS, MEAL_TYPE_ICONS } from '@/types/meal-plans';
import { useToast } from '@/hooks/use-toast';
import { MealFoodBuilder } from './MealFoodBuilder';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import { useQueryClient } from '@tanstack/react-query';

const MEAL_TYPE_EMOJIS: Record<string, string> = {
  breakfast: '☀️',
  morning_snack: '🍎',
  lunch: '🍽️',
  afternoon_snack: '🥤',
  dinner: '🍲',
  supper: '🥛',
};

interface CreateMealPlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DEFAULT_MEALS = [
  { key: 'breakfast', name: 'Café da Manhã', time: '07:00', icon: '☕' },
  { key: 'morning_snack', name: 'Lanche da Manhã', time: '10:00', icon: '🍎' },
  { key: 'lunch', name: 'Almoço', time: '12:30', icon: '🍽️' },
  { key: 'afternoon_snack', name: 'Lanche da Tarde', time: '15:30', icon: '🥤' },
  { key: 'dinner', name: 'Jantar', time: '19:00', icon: '🍲' },
  { key: 'supper', name: 'Ceia', time: '21:00', icon: '🥛' }
];

export function CreateMealPlanModal({ open, onOpenChange }: CreateMealPlanModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    clientId: '',
    name: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    goal: '',
    targetKcal: '',
    targetProtein: '',
    targetCarbs: '',
    targetFats: '',
    notes: ''
  });
  const [selectedMeals, setSelectedMeals] = useState<string[]>(['breakfast', 'lunch', 'dinner']);
  const [mealFoods, setMealFoods] = useState<Record<string, any[]>>({
    breakfast: [],
    morning_snack: [],
    lunch: [],
    afternoon_snack: [],
    dinner: [],
    supper: [],
  });

  const { clients } = useClientsData();
  const createMealPlan = useCreateMealPlan();
  const { toast } = useToast();
  const { tenantId } = useTenantId();
  const queryClient = useQueryClient();

  // Calcular totais automaticamente
  const totalNutrients = useMemo(() => {
    let totals = { calories: 0, protein: 0, carbs: 0, fats: 0 };
    
    Object.values(mealFoods).forEach(foods => {
      foods.forEach(item => {
        totals.calories += item.calculatedNutrients.calories;
        totals.protein += item.calculatedNutrients.protein;
        totals.carbs += item.calculatedNutrients.carbs;
        totals.fats += item.calculatedNutrients.fats;
      });
    });
    
    return totals;
  }, [mealFoods]);

  const nextStep = () => {
    // Validação da etapa 1
    if (step === 1) {
      if (!formData.clientId) {
        toast({ variant: "destructive", title: "Erro", description: "Selecione um cliente" });
        return;
      }
      if (!formData.name) {
        toast({ variant: "destructive", title: "Erro", description: "Informe o nome do plano" });
        return;
      }
      if (!formData.startDate) {
        toast({ variant: "destructive", title: "Erro", description: "Informe a data de início" });
        return;
      }
    }

    // Validação da etapa 3
    if (step === 3) {
      if (selectedMeals.length === 0) {
        toast({ variant: "destructive", title: "Erro", description: "Selecione pelo menos uma refeição" });
        return;
      }
    }
    
    setStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleAddFood = (mealType: string, foodData: any) => {
    setMealFoods(prev => ({
      ...prev,
      [mealType]: [...prev[mealType], foodData]
    }));
  };

  const handleRemoveFood = (mealType: string, index: number) => {
    setMealFoods(prev => ({
      ...prev,
      [mealType]: prev[mealType].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    try {
      // 1. Criar o plano com totais calculados
      const { data: plan, error: planError } = await supabase
        .from('meal_plans')
        .insert([{
          tenant_id: tenantId,
          client_id: formData.clientId,
          name: formData.name,
          notes: formData.notes || null,
          start_date: formData.startDate,
          end_date: formData.endDate || null,
          status: 'ativo',
          goal: formData.goal || null,
          target_kcal: totalNutrients.calories || null,
          target_protein: totalNutrients.protein || null,
          target_carbs: totalNutrients.carbs || null,
          target_fats: totalNutrients.fats || null,
        }])
        .select()
        .maybeSingle();
      
      if (planError) throw planError;
      if (!plan) throw new Error('Erro ao criar plano');
      
      // 2. Criar refeições
      const mealsToCreate = DEFAULT_MEALS
        .filter(meal => selectedMeals.includes(meal.key))
        .map((meal, index) => ({
          meal_plan_id: plan.id,
          name: meal.name,
          time: meal.time,
          order_index: index,
        }));
      
      if (mealsToCreate.length > 0) {
        const { data: createdMeals, error: mealsError } = await supabase
          .from('meal_plan_meals')
          .insert(mealsToCreate)
          .select();
        
        if (mealsError) throw mealsError;
        
        // 3. Criar itens (alimentos) de cada refeição
        if (createdMeals) {
          for (const meal of createdMeals) {
            const mealKey = DEFAULT_MEALS.find(m => m.name === meal.name)?.key;
            if (!mealKey) continue;

            const foods = mealFoods[mealKey] || [];
            
            if (foods.length > 0) {
              const itemsToCreate = foods.map((item) => ({
                meal_id: meal.id,
                food_id: item.food.id,
                measure_id: item.measure?.id || null,
                quantity: item.quantity,
                kcal_total: item.calculatedNutrients.calories,
                protein_total: item.calculatedNutrients.protein,
                carb_total: item.calculatedNutrients.carbs,
                fat_total: item.calculatedNutrients.fats,
                grams_total: item.measure ? item.measure.grams * item.quantity : item.quantity,
              }));
              
              const { error: itemsError } = await supabase
                .from('meal_items')
                .insert(itemsToCreate);
              
              if (itemsError) throw itemsError;
            }
          }
        }
      }
      
      toast({ title: "Sucesso!", description: "Plano alimentar criado com sucesso" });

      // Reset and close
      setStep(1);
      setFormData({
        clientId: '',
        name: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        goal: '',
        targetKcal: '',
        targetProtein: '',
        targetCarbs: '',
        targetFats: '',
        notes: ''
      });
      setSelectedMeals(['breakfast', 'lunch', 'dinner']);
      setMealFoods({
        breakfast: [],
        morning_snack: [],
        lunch: [],
        afternoon_snack: [],
        dinner: [],
        supper: [],
      });
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao criar plano:', error);
      toast({ variant: "destructive", title: "Erro", description: "Erro ao criar plano alimentar" });
    }
  };

  const toggleMeal = (mealKey: string) => {
    setSelectedMeals(prev =>
      prev.includes(mealKey)
        ? prev.filter(k => k !== mealKey)
        : [...prev, mealKey]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <div className="flex items-center justify-between mb-4">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <span className="text-3xl">🍽️</span>
              Criar Novo Plano Alimentar
            </DialogTitle>
            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full">
              Etapa {step}/4
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Etapa 1: Informações Básicas */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="client" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Cliente *</Label>
                <Select value={formData.clientId} onValueChange={value => setFormData(prev => ({ ...prev, clientId: value }))}>
                  <SelectTrigger className="w-full bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 mt-1.5">
                    <SelectValue placeholder="Selecione um cliente..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl backdrop-blur-xl z-50">
                    {clients?.map((client) => (
                      <SelectItem 
                        key={client.id} 
                        value={client.id}
                        className="hover:bg-emerald-500/10 focus:bg-emerald-500/10 cursor-pointer py-3 px-4 rounded-lg transition-colors duration-200"
                      >
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Nome do Plano *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Plano Emagrecimento"
                  className="mt-1.5 bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Data de Início *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="mt-1.5 bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <Label htmlFor="endDate" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Data de Término</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="mt-1.5 bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="goal" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Objetivo</Label>
                <Select value={formData.goal} onValueChange={value => setFormData(prev => ({ ...prev, goal: value }))}>
                  <SelectTrigger className="w-full bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 mt-1.5">
                    <SelectValue placeholder="Selecione o objetivo..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl backdrop-blur-xl z-50">
                    <SelectItem value="emagrecimento" className="hover:bg-emerald-500/10 focus:bg-emerald-500/10 cursor-pointer py-3 px-4 rounded-lg transition-colors duration-200">Emagrecimento</SelectItem>
                    <SelectItem value="ganho_massa" className="hover:bg-emerald-500/10 focus:bg-emerald-500/10 cursor-pointer py-3 px-4 rounded-lg transition-colors duration-200">Ganho de Massa</SelectItem>
                    <SelectItem value="manutencao" className="hover:bg-emerald-500/10 focus:bg-emerald-500/10 cursor-pointer py-3 px-4 rounded-lg transition-colors duration-200">Manutenção</SelectItem>
                    <SelectItem value="performance" className="hover:bg-emerald-500/10 focus:bg-emerald-500/10 cursor-pointer py-3 px-4 rounded-lg transition-colors duration-200">Performance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Observações gerais sobre o plano..."
                  rows={3}
                  className="mt-1.5 bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Etapa 2: Metas Nutricionais */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Defina as metas nutricionais diárias
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Estas informações são opcionais, mas ajudam a acompanhar melhor o progresso do cliente.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="targetKcal" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Calorias Diárias (kcal)</Label>
                  <Input
                    id="targetKcal"
                    type="number"
                    value={formData.targetKcal}
                    onChange={e => setFormData(prev => ({ ...prev, targetKcal: e.target.value }))}
                    placeholder="Ex: 1800"
                    className="mt-1.5 bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <Label htmlFor="targetProtein" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Proteínas (g)</Label>
                  <Input
                    id="targetProtein"
                    type="number"
                    value={formData.targetProtein}
                    onChange={e => setFormData(prev => ({ ...prev, targetProtein: e.target.value }))}
                    placeholder="Ex: 135"
                    className="mt-1.5 bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <Label htmlFor="targetCarbs" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Carboidratos (g)</Label>
                  <Input
                    id="targetCarbs"
                    type="number"
                    value={formData.targetCarbs}
                    onChange={e => setFormData(prev => ({ ...prev, targetCarbs: e.target.value }))}
                    placeholder="Ex: 180"
                    className="mt-1.5 bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <Label htmlFor="targetFats" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Gorduras (g)</Label>
                  <Input
                    id="targetFats"
                    type="number"
                    value={formData.targetFats}
                    onChange={e => setFormData(prev => ({ ...prev, targetFats: e.target.value }))}
                    placeholder="Ex: 60"
                    className="mt-1.5 bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Etapa 3: Refeições */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Selecione as refeições do plano
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Escolha quais refeições farão parte do plano alimentar do cliente.
                </p>
              </div>
              <div className="space-y-3">
                {DEFAULT_MEALS.map(meal => (
                  <div 
                    key={meal.key} 
                    className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-emerald-500 transition-colors cursor-pointer"
                    onClick={() => toggleMeal(meal.key)}
                  >
                    <Checkbox
                      checked={selectedMeals.includes(meal.key)}
                      onCheckedChange={() => toggleMeal(meal.key)}
                      className="w-5 h-5 rounded border-gray-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                        <span className="text-2xl">{meal.icon}</span>
                        {meal.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Horário sugerido: {meal.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Etapa 4: Adicionar Alimentos */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">
                      Adicione alimentos às refeições
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Os valores nutricionais serão calculados automaticamente conforme você adiciona alimentos.
                    </p>
                  </div>
                </div>
              </div>

              {/* Lista de refeições selecionadas */}
              <div className="space-y-4">
                {selectedMeals.map(mealKey => {
                  const meal = DEFAULT_MEALS.find(m => m.key === mealKey);
                  if (!meal) return null;
                  
                  return (
                    <MealFoodBuilder
                      key={mealKey}
                      mealType={mealKey}
                      mealLabel={meal.name}
                      mealEmoji={MEAL_TYPE_EMOJIS[mealKey]}
                      foods={mealFoods[mealKey] || []}
                      onAddFood={(food) => handleAddFood(mealKey, food)}
                      onRemoveFood={(index) => handleRemoveFood(mealKey, index)}
                    />
                  );
                })}
              </div>

              {/* Totais Calculados */}
              <div className="mt-6 p-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                <h4 className="text-lg font-bold text-emerald-900 dark:text-emerald-100 mb-4 flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Totais Nutricionais Calculados
                </h4>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                      {totalNutrients.calories.toFixed(0)}
                    </div>
                    <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase">
                      kcal
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {totalNutrients.protein.toFixed(1)}g
                    </div>
                    <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase">
                      Proteínas
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                      {totalNutrients.carbs.toFixed(1)}g
                    </div>
                    <div className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase">
                      Carboidratos
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                      {totalNutrients.fats.toFixed(1)}g
                    </div>
                    <div className="text-xs font-semibold text-orange-700 dark:text-orange-300 uppercase">
                      Gorduras
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navegação */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
            <div>
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={prevStep}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-all duration-300 border-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Voltar
                </Button>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-all duration-300 border-0"
              >
                Cancelar
              </Button>

              {step < 4 ? (
                <Button
                  onClick={nextStep}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/30 transition-all duration-300 border-0"
                >
                  Próxima Etapa
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={createMealPlan.isPending || selectedMeals.length === 0}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/30 transition-all duration-300 border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="w-4 h-4" />
                  Criar Plano Alimentar
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
