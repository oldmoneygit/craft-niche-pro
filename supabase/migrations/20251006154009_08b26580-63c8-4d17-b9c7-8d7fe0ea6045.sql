
-- Remove a constraint antiga
ALTER TABLE public.meal_plans 
DROP CONSTRAINT IF EXISTS meal_plans_status_check;

-- Adiciona a nova constraint com 'pendente' incluído
ALTER TABLE public.meal_plans 
ADD CONSTRAINT meal_plans_status_check 
CHECK (status = ANY (ARRAY['ativo'::text, 'pendente'::text, 'concluido'::text, 'pausado'::text]));
