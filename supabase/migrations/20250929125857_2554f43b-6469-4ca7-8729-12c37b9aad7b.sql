-- Permitir leitura pública da tabela tenants por subdomain
CREATE POLICY "Anyone can view tenant by subdomain" 
ON public.tenants 
FOR SELECT 
USING (true);