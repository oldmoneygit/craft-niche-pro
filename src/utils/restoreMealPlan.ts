import { supabase } from "@/integrations/supabase/client";

export async function restoreMealPlan(planId: string) {
  // 1. Marcar plano como ativo
  const { error: updateError } = await supabase
    .from('meal_plans')
    .update({
      is_active: true,
      status: 'ativo',
      updated_at: new Date().toISOString()
    })
    .eq('id', planId);
  
  if (updateError) throw updateError;
  
  // 2. O trigger archive_previous_meal_plan vai desativar outros automaticamente
  
  return true;
}
