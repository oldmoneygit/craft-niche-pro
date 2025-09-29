import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useMealPlans } from '@/hooks/useMealPlans';

interface MealPlan {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: string;
  plan_data: {
    breakfast: MealItem[];
    lunch: MealItem[];
    dinner: MealItem[];
    snacks: MealItem[];
  };
}

interface MealItem {
  id: string;
  name: string;
  portion: string;
  calories: number;
  notes?: string;
}

interface MealPlanEditorProps {
  clientId: string;
  tenantId: string;
  mealPlan?: MealPlan;
  onSave: () => void;
  onCancel: () => void;
}

export default function MealPlanEditor({ clientId, tenantId, mealPlan, onSave, onCancel }: MealPlanEditorProps) {
  const { toast } = useToast();
  const { createMealPlan, updateMealPlan } = useMealPlans();
  
  const [formData, setFormData] = useState({
    name: mealPlan?.name || '',
    start_date: mealPlan?.start_date || '',
    end_date: mealPlan?.end_date || '',
    status: mealPlan?.status || 'ativo'
  });

  const [planData, setPlanData] = useState({
    breakfast: mealPlan?.plan_data.breakfast || [],
    lunch: mealPlan?.plan_data.lunch || [],
    dinner: mealPlan?.plan_data.dinner || [],
    snacks: mealPlan?.plan_data.snacks || []
  });

  const [activeTab, setActiveTab] = useState('breakfast');
  const [newMeal, setNewMeal] = useState({
    name: '',
    portion: '',
    calories: 0,
    notes: ''
  });

  const addMeal = (mealType: keyof typeof planData) => {
    if (!newMeal.name.trim()) return;
    
    const meal: MealItem = {
      id: crypto.randomUUID(),
      name: newMeal.name,
      portion: newMeal.portion,
      calories: newMeal.calories,
      notes: newMeal.notes
    };

    setPlanData(prev => ({
      ...prev,
      [mealType]: [...prev[mealType], meal]
    }));

    setNewMeal({ name: '', portion: '', calories: 0, notes: '' });
  };

  const removeMeal = (mealType: keyof typeof planData, mealId: string) => {
    setPlanData(prev => ({
      ...prev,
      [mealType]: prev[mealType].filter(meal => meal.id !== mealId)
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome do plano é obrigatório',
        variant: 'destructive'
      });
      return;
    }

    try {
      const mealPlanData = {
        name: formData.name,
        client_id: clientId,
        start_date: formData.start_date,
        end_date: formData.end_date,
        status: formData.status as 'ativo' | 'concluido' | 'pausado',
        plan_data: {
          breakfast: planData.breakfast.map(m => m.name),
          lunch: planData.lunch.map(m => m.name),
          dinner: planData.dinner.map(m => m.name),
          snacks: planData.snacks.map(m => m.name)
        }
      };

      if (mealPlan?.id) {
        await updateMealPlan(mealPlan.id, mealPlanData);
      } else {
        await createMealPlan(mealPlanData);
      }

      toast({
        title: 'Sucesso',
        description: 'Plano alimentar salvo com sucesso'
      });

      onSave();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar plano alimentar',
        variant: 'destructive'
      });
    }
  };

  const getTotalCalories = (meals: MealItem[]) => {
    return meals.reduce((total, meal) => total + meal.calories, 0);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{mealPlan ? 'Editar' : 'Criar'} Plano Alimentar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nome do Plano</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Plano de Emagrecimento"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                <option value="ativo">Ativo</option>
                <option value="pausado">Pausado</option>
                <option value="concluido">Concluído</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Data de Início</label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Data de Fim</label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Refeições</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="breakfast">
                Café da Manhã
                <Badge className="ml-2">{getTotalCalories(planData.breakfast)} kcal</Badge>
              </TabsTrigger>
              <TabsTrigger value="lunch">
                Almoço
                <Badge className="ml-2">{getTotalCalories(planData.lunch)} kcal</Badge>
              </TabsTrigger>
              <TabsTrigger value="dinner">
                Jantar
                <Badge className="ml-2">{getTotalCalories(planData.dinner)} kcal</Badge>
              </TabsTrigger>
              <TabsTrigger value="snacks">
                Lanches
                <Badge className="ml-2">{getTotalCalories(planData.snacks)} kcal</Badge>
              </TabsTrigger>
            </TabsList>

            {(['breakfast', 'lunch', 'dinner', 'snacks'] as const).map((mealType) => (
              <TabsContent key={mealType} value={mealType} className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Adicionar Alimento</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <Input
                      placeholder="Nome do alimento"
                      value={newMeal.name}
                      onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
                    />
                    <Input
                      placeholder="Porção (ex: 100g)"
                      value={newMeal.portion}
                      onChange={(e) => setNewMeal({ ...newMeal, portion: e.target.value })}
                    />
                    <Input
                      type="number"
                      placeholder="Calorias"
                      value={newMeal.calories}
                      onChange={(e) => setNewMeal({ ...newMeal, calories: Number(e.target.value) })}
                    />
                    <Button onClick={() => addMeal(mealType)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Observações (opcional)"
                    value={newMeal.notes}
                    onChange={(e) => setNewMeal({ ...newMeal, notes: e.target.value })}
                    className="mt-3"
                  />
                </div>

                <div className="space-y-2">
                  {planData[mealType].map((meal) => (
                    <div key={meal.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{meal.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {meal.portion} • {meal.calories} kcal
                          {meal.notes && ` • ${meal.notes}`}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMeal(mealType, meal.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {planData[mealType].length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum alimento adicionado ainda
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button className="action-primary" onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Salvar Plano
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}