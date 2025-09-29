-- Atualizar políticas RLS das tabelas message_templates e communications para usar profiles

-- Atualizar message_templates
DROP POLICY IF EXISTS "Users can view templates from their tenant" ON public.message_templates;
DROP POLICY IF EXISTS "Users can insert templates to their tenant" ON public.message_templates;
DROP POLICY IF EXISTS "Users can update templates from their tenant" ON public.message_templates;
DROP POLICY IF EXISTS "Users can delete templates from their tenant" ON public.message_templates;

CREATE POLICY "Authenticated users can view templates from their tenant" 
ON public.message_templates 
FOR SELECT 
USING (tenant_id IN ( SELECT p.tenant_id FROM profiles p WHERE (p.user_id = auth.uid())));

CREATE POLICY "Authenticated users can insert templates to their tenant" 
ON public.message_templates 
FOR INSERT 
WITH CHECK (tenant_id IN ( SELECT p.tenant_id FROM profiles p WHERE (p.user_id = auth.uid())));

CREATE POLICY "Authenticated users can update templates from their tenant" 
ON public.message_templates 
FOR UPDATE 
USING (tenant_id IN ( SELECT p.tenant_id FROM profiles p WHERE (p.user_id = auth.uid())));

CREATE POLICY "Authenticated users can delete templates from their tenant" 
ON public.message_templates 
FOR DELETE 
USING (tenant_id IN ( SELECT p.tenant_id FROM profiles p WHERE (p.user_id = auth.uid())));

-- Atualizar communications
DROP POLICY IF EXISTS "Users can view communications from their tenant" ON public.communications;
DROP POLICY IF EXISTS "Users can insert communications to their tenant" ON public.communications;

CREATE POLICY "Authenticated users can view communications from their tenant" 
ON public.communications 
FOR SELECT 
USING (tenant_id IN ( SELECT p.tenant_id FROM profiles p WHERE (p.user_id = auth.uid())));

CREATE POLICY "Authenticated users can insert communications to their tenant" 
ON public.communications 
FOR INSERT 
WITH CHECK (tenant_id IN ( SELECT p.tenant_id FROM profiles p WHERE (p.user_id = auth.uid())));

CREATE POLICY "Authenticated users can update communications from their tenant" 
ON public.communications 
FOR UPDATE 
USING (tenant_id IN ( SELECT p.tenant_id FROM profiles p WHERE (p.user_id = auth.uid())));

CREATE POLICY "Authenticated users can delete communications from their tenant" 
ON public.communications 
FOR DELETE 
USING (tenant_id IN ( SELECT p.tenant_id FROM profiles p WHERE (p.user_id = auth.uid())));