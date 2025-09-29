-- Atualizar políticas RLS da tabela meal_plans para usar profiles ao invés de owner_email

-- Deletar políticas antigas
DROP POLICY IF EXISTS "Users can view meal plans from their tenant" ON public.meal_plans;
DROP POLICY IF EXISTS "Users can insert meal plans to their tenant" ON public.meal_plans;
DROP POLICY IF EXISTS "Users can update meal plans from their tenant" ON public.meal_plans;
DROP POLICY IF EXISTS "Users can delete meal plans from their tenant" ON public.meal_plans;

-- Criar novas políticas usando o padrão das outras tabelas
CREATE POLICY "Authenticated users can view meal plans from their tenant" 
ON public.meal_plans 
FOR SELECT 
USING (tenant_id IN ( SELECT p.tenant_id
   FROM profiles p
  WHERE (p.user_id = auth.uid())));

CREATE POLICY "Authenticated users can insert meal plans to their tenant" 
ON public.meal_plans 
FOR INSERT 
WITH CHECK (tenant_id IN ( SELECT p.tenant_id
   FROM profiles p
  WHERE (p.user_id = auth.uid())));

CREATE POLICY "Authenticated users can update meal plans from their tenant" 
ON public.meal_plans 
FOR UPDATE 
USING (tenant_id IN ( SELECT p.tenant_id
   FROM profiles p
  WHERE (p.user_id = auth.uid())));

CREATE POLICY "Authenticated users can delete meal plans from their tenant" 
ON public.meal_plans 
FOR DELETE 
USING (tenant_id IN ( SELECT p.tenant_id
   FROM profiles p
  WHERE (p.user_id = auth.uid())));