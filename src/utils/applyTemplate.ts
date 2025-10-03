import { supabase } from "@/integrations/supabase/client";

interface ApplyTemplateParams {
  templateId: string;
  clientId: string;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
}

export async function applyTemplate({
  templateId,
  clientId,
  targetCalories,
  targetProtein,
  targetCarbs,
  targetFat
}: ApplyTemplateParams) {
  // 1. Buscar template
  const { data: template } = await supabase
    .from('meal_plan_templates')
    .select('*')
    .eq('id', templateId)
    .single();
  
  if (!template) throw new Error('Template não encontrado');
  
  // 2. Calcular fator de ajuste
  const caloriesFactor = targetCalories / template.reference_calories;
  
  console.log('📊 Ajustando template:', {
    de: template.reference_calories,
    para: targetCalories,
    fator: caloriesFactor.toFixed(2)
  });
  
  // 3. Criar novo meal_plan
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, id')
    .eq('user_id', user.id)
    .single();
  
  if (!profile) {
    throw new Error('Perfil não encontrado');
  }
  
  const { data: newPlan } = await supabase
    .from('meal_plans')
    .insert({
      client_id: clientId,
      tenant_id: profile.tenant_id,
      calorie_target: targetCalories,
      protein_target_g: targetProtein,
      carb_target_g: targetCarbs,
      fat_target_g: targetFat,
      status: 'draft',
      is_active: true,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      name: template.name + ' (Aplicado)'
    } as any)
    .select()
    .single();
  
  if (!newPlan) {
    throw new Error('Erro ao criar plano');
  }
  
  // 4. Buscar estrutura do template
  const { data: templateMeals } = await supabase
    .from('meal_plan_template_meals')
    .select(`
      *,
      meal_plan_template_foods (
        food_id,
        measure_id,
        quantity
      )
    `)
    .eq('template_id', templateId)
    .order('order_index');
  
  // 5. Replicar estrutura com ajustes
  for (const templateMeal of templateMeals || []) {
    // Criar refeição
    const { data: newMeal } = await supabase
      .from('meal_plan_meals')
      .insert({
        meal_plan_id: newPlan.id,
        name: templateMeal.name,
        time: templateMeal.time,
        order_index: templateMeal.order_index
      })
      .select()
      .single();
    
    if (!newMeal) continue;
    
    // Copiar alimentos com quantidade ajustada
    if (templateMeal.meal_plan_template_foods) {
      const adjustedFoods = templateMeal.meal_plan_template_foods.map((food: any) => ({
        meal_id: newMeal.id,
        food_id: food.food_id,
        measure_id: food.measure_id,
        quantity: food.quantity * caloriesFactor // ⭐ AJUSTE PROPORCIONAL
      }));
      
      await supabase
        .from('meal_items')
        .insert(adjustedFoods);
    }
  }
  
  // 6. Incrementar contador de uso
  await supabase
    .from('meal_plan_templates')
    .update({
      times_used: (template.times_used || 0) + 1
    })
    .eq('id', templateId);
  
  return newPlan;
}
