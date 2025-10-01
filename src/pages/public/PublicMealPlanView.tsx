import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { UtensilsCrossed, Clock, Flame, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function PublicMealPlanView() {
  const { token } = useParams<{ token: string }>();
  const [plan, setPlan] = useState<any>(null);
  const [meals, setMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) fetchPlan();
  }, [token]);

  const fetchPlan = async () => {
    try {
      const { data: planData, error: planError } = await supabase
        .from('meal_plans')
        .select('*, clients(name)')
        .eq('public_token', token)
        .single();

      if (planError || !planData) {
        setError('Plano não encontrado');
        setLoading(false);
        return;
      }

      setPlan(planData);

      const { data: mealsData } = await supabase
        .from('meals')
        .select('*, meal_foods(*)')
        .eq('meal_plan_id', planData.id)
        .order('order_index');

      setMeals(mealsData || []);
      setLoading(false);

    } catch (err) {
      setError('Erro ao carregar plano');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="text-center">
          <UtensilsCrossed className="w-12 h-12 text-green-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Carregando plano alimentar...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ops!</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const totalCalories = meals.reduce((sum, meal) => {
    const mealCals = meal.meal_foods.reduce((s: number, f: any) => s + (f.calories || 0), 0);
    return sum + mealCals;
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
          <div className="text-center">
            <UtensilsCrossed className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{plan.title}</h1>
            <p className="text-gray-600">Plano de {plan.clients?.name}</p>
            
            {plan.calories_target && (
              <div className="mt-4 inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full">
                <Flame className="w-5 h-5 text-green-700" />
                <span className="font-semibold text-green-900">
                  Meta: {plan.calories_target} kcal/dia
                </span>
              </div>
            )}
          </div>

          {plan.notes && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 mb-1">Observações:</p>
              <p className="text-blue-800 whitespace-pre-wrap">{plan.notes}</p>
            </div>
          )}
        </div>

        {/* Refeições */}
        <div className="space-y-4">
          {meals.map((meal, idx) => (
            <div key={meal.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4 pb-3 border-b">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{meal.name}</h3>
                  {meal.time && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                      <Clock className="w-4 h-4" />
                      {meal.time}
                    </div>
                  )}
                </div>
                {meal.meal_foods.reduce((s: number, f: any) => s + (f.calories || 0), 0) > 0 && (
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      {meal.meal_foods.reduce((s: number, f: any) => s + (f.calories || 0), 0)}
                    </p>
                    <p className="text-xs text-gray-500">kcal</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {meal.meal_foods
                  .sort((a: any, b: any) => a.order_index - b.order_index)
                  .map((food: any) => (
                    <div key={food.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{food.name}</p>
                        <p className="text-sm text-gray-600">{food.quantity}</p>
                      </div>
                      {food.calories && (
                        <span className="text-sm font-semibold text-gray-700">
                          {food.calories} kcal
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer com total */}
        {totalCalories > 0 && (
          <div className="bg-green-500 text-white rounded-lg shadow-lg p-6 mt-6">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Total do Dia</span>
              <span className="text-3xl font-bold">{totalCalories} kcal</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
