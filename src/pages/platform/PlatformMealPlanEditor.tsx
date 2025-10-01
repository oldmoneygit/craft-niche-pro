import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, GripVertical, Save, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import { useToast } from '@/hooks/use-toast';
import { useClientConfig } from '@/core/contexts/ClientConfigContext';
import PlatformPageWrapper from '@/core/layouts/PlatformPageWrapper';

interface Food {
  id: string;
  name: string;
  quantity: string;
  calories?: number;
}

interface Meal {
  id: string;
  name: string;
  time?: string;
  foods: Food[];
}

export default function PlatformMealPlanEditor() {
  const { planId } = useParams<{ planId: string }>();
  const { tenantId } = useTenantId();
  const { clientConfig } = useClientConfig();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    client_id: '',
    calories_target: '',
    notes: '',
    active: false
  });
  
  const [meals, setMeals] = useState<Meal[]>([]);

  const isNew = planId === 'novo';

  useEffect(() => {
    if (tenantId) {
      fetchClients();
      if (!isNew) fetchPlan();
      else setLoading(false);
    }
  }, [tenantId, planId]);

  const fetchClients = async () => {
    const { data } = await supabase
      .from('clients')
      .select('id, name')
      .eq('tenant_id', tenantId)
      .order('name');
    
    setClients(data || []);
  };

  const fetchPlan = async () => {
    if (!planId) return;

    const { data: plan } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (plan) {
      setFormData({
        title: plan.title,
        client_id: plan.client_id,
        calories_target: plan.calories_target ? String(plan.calories_target) : '',
        notes: plan.notes || '',
        active: plan.active
      });

      // Buscar refeições
      const { data: mealsData } = await supabase
        .from('meals' as any)
        .select('*, meal_foods(*)')
        .eq('meal_plan_id', planId)
        .order('order_index');

      if (mealsData) {
        setMeals(mealsData.map((m: any) => ({
          id: m.id,
          name: m.name,
          time: m.time,
          foods: m.meal_foods.sort((a: any, b: any) => a.order_index - b.order_index)
        })));
      }
    }

    setLoading(false);
  };

  const addMeal = () => {
    setMeals([...meals, {
      id: `temp-${Date.now()}`,
      name: '',
      time: '',
      foods: []
    }]);
  };

  const removeMeal = (mealId: string) => {
    setMeals(meals.filter(m => m.id !== mealId));
  };

  const updateMeal = (mealId: string, field: string, value: any) => {
    setMeals(meals.map(m => 
      m.id === mealId ? { ...m, [field]: value } : m
    ));
  };

  const addFood = (mealId: string) => {
    setMeals(meals.map(m => 
      m.id === mealId 
        ? { ...m, foods: [...m.foods, { id: `temp-${Date.now()}`, name: '', quantity: '' }] }
        : m
    ));
  };

  const removeFood = (mealId: string, foodId: string) => {
    setMeals(meals.map(m =>
      m.id === mealId
        ? { ...m, foods: m.foods.filter(f => f.id !== foodId) }
        : m
    ));
  };

  const updateFood = (mealId: string, foodId: string, field: string, value: any) => {
    setMeals(meals.map(m =>
      m.id === mealId
        ? { ...m, foods: m.foods.map(f => f.id === foodId ? { ...f, [field]: value } : f) }
        : m
    ));
  };

  const handleSave = async () => {
    if (!formData.title || !formData.client_id) {
      toast({ title: "Campos obrigatórios", description: "Título e cliente são obrigatórios", variant: "destructive" });
      return;
    }

    setSaving(true);

    try {
      let currentPlanId = planId;

      // Criar ou atualizar plano
      if (isNew) {
        const { data: newPlan, error } = await supabase
          .from('meal_plans')
          .insert({
            tenant_id: tenantId,
            title: formData.title,
            client_id: formData.client_id,
            calories_target: formData.calories_target ? parseInt(formData.calories_target) : null,
            notes: formData.notes,
            active: formData.active
          } as any)
          .select()
          .single();

        if (error) throw error;
        currentPlanId = newPlan.id;
      } else {
        const { error } = await supabase
          .from('meal_plans')
          .update({
            title: formData.title,
            client_id: formData.client_id,
            calories_target: formData.calories_target ? parseInt(formData.calories_target) : null,
            notes: formData.notes,
            active: formData.active
          } as any)
          .eq('id', planId);

        if (error) throw error;

        // Deletar refeições antigas
        await supabase.from('meals' as any).delete().eq('meal_plan_id', planId);
      }

      // Criar refeições
      for (let i = 0; i < meals.length; i++) {
        const meal = meals[i];
        
        const { data: newMeal, error: mealError } = await supabase
          .from('meals' as any)
          .insert({
            meal_plan_id: currentPlanId,
            name: meal.name,
            time: meal.time,
            order_index: i
          } as any)
          .select()
          .single();

        if (mealError) throw mealError;

        // Criar alimentos
        if (meal.foods.length > 0) {
          const foods = meal.foods.map((f, idx) => ({
            meal_id: (newMeal as any).id,
            name: f.name,
            quantity: f.quantity,
            calories: f.calories,
            order_index: idx
          }));

          const { error: foodsError } = await supabase
            .from('meal_foods' as any)
            .insert(foods as any);

          if (foodsError) throw foodsError;
        }
      }

      toast({ title: "Salvo!", description: "Plano alimentar salvo com sucesso" });
      navigate(`/platform/${clientConfig?.subdomain}/planos-alimentares`);

    } catch (error) {
      console.error('Error saving plan:', error);
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PlatformPageWrapper><div className="p-6">Carregando...</div></PlatformPageWrapper>;

  return (
    <PlatformPageWrapper title={isNew ? 'Novo Plano Alimentar' : 'Editar Plano'}>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/platform/${clientConfig?.subdomain}/planos-alimentares`)}
            className="p-2 hover:bg-accent rounded"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold">
            {isNew ? 'Novo Plano Alimentar' : 'Editar Plano'}
          </h2>
        </div>

        {/* Form básico */}
        <div className="bg-card rounded-lg shadow p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Título do Plano *</label>
              <input
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="Ex: Plano de Emagrecimento - Junho 2025"
                className="w-full border rounded-lg p-2 bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cliente *</label>
              <select
                value={formData.client_id}
                onChange={e => setFormData({...formData, client_id: e.target.value})}
                className="w-full border rounded-lg p-2 bg-background"
              >
                <option value="">Selecione um cliente</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Meta de Calorias (opcional)</label>
              <input
                type="number"
                value={formData.calories_target}
                onChange={e => setFormData({...formData, calories_target: e.target.value})}
                placeholder="Ex: 1800"
                className="w-full border rounded-lg p-2 bg-background"
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={e => setFormData({...formData, active: e.target.checked})}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Marcar como plano ativo</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Observações Gerais</label>
            <textarea
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              placeholder="Ex: Evitar frituras, beber 2L de água por dia..."
              rows={3}
              className="w-full border rounded-lg p-2 bg-background"
            />
          </div>
        </div>

        {/* Refeições */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Refeições</h3>
            <button
              onClick={addMeal}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" />
              Adicionar Refeição
            </button>
          </div>

          {meals.map((meal, mealIdx) => (
            <div key={meal.id} className="bg-card rounded-lg shadow p-5 space-y-4">
              <div className="flex items-start gap-3">
                <GripVertical className="w-5 h-5 text-muted-foreground mt-2 cursor-move" />
                
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      value={meal.name}
                      onChange={e => updateMeal(meal.id, 'name', e.target.value)}
                      placeholder="Nome da refeição (ex: Café da Manhã)"
                      className="border-2 border-border rounded-lg p-2 font-medium bg-background"
                    />
                    <input
                      type="time"
                      value={meal.time || ''}
                      onChange={e => updateMeal(meal.id, 'time', e.target.value)}
                      className="border-2 border-border rounded-lg p-2 bg-background"
                    />
                  </div>

                  {/* Alimentos */}
                  <div className="space-y-2">
                    {meal.foods.map((food, foodIdx) => (
                      <div key={food.id} className="flex items-center gap-2 bg-accent p-2 rounded">
                        <input
                          value={food.name}
                          onChange={e => updateFood(meal.id, food.id, 'name', e.target.value)}
                          placeholder="Alimento"
                          className="flex-1 border rounded p-2 text-sm bg-background"
                        />
                        <input
                          value={food.quantity}
                          onChange={e => updateFood(meal.id, food.id, 'quantity', e.target.value)}
                          placeholder="Quantidade"
                          className="w-32 border rounded p-2 text-sm bg-background"
                        />
                        <input
                          type="number"
                          value={food.calories || ''}
                          onChange={e => updateFood(meal.id, food.id, 'calories', e.target.value ? parseInt(e.target.value) : undefined)}
                          placeholder="kcal"
                          className="w-20 border rounded p-2 text-sm bg-background"
                        />
                        <button
                          onClick={() => removeFood(meal.id, food.id)}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    <button
                      onClick={() => addFood(meal.id)}
                      className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar Alimento
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => removeMeal(meal.id)}
                  className="p-2 text-destructive hover:bg-destructive/10 rounded"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}

          {meals.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>Nenhuma refeição adicionada</p>
              <p className="text-sm mt-1">Clique em "Adicionar Refeição" para começar</p>
            </div>
          )}
        </div>

        {/* Botões de ação */}
        <div className="flex gap-3 sticky bottom-4">
          <button
            onClick={() => navigate(`/platform/${clientConfig?.subdomain}/planos-alimentares`)}
            className="flex-1 border-2 border-border rounded-lg py-3 font-semibold hover:bg-accent"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-primary text-primary-foreground rounded-lg py-3 font-semibold hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Salvando...' : 'Salvar Plano'}
          </button>
        </div>
      </div>
    </PlatformPageWrapper>
  );
}
