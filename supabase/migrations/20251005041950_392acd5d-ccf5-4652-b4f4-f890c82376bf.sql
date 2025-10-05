-- Remove o trigger problemático que referencia o campo 'active' inexistente
DROP TRIGGER IF EXISTS ensure_single_active_plan_trigger ON meal_plans;

-- Remove a função do trigger
DROP FUNCTION IF EXISTS public.ensure_single_active_plan();