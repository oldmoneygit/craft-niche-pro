-- Create tenant_config table for multi-tenant customization
CREATE TABLE IF NOT EXISTS public.tenant_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  business_type TEXT DEFAULT 'nutrition',
  enabled_features JSONB DEFAULT '["clients","appointments","meal_plans","questionnaires","ai_chat"]'::jsonb,
  custom_fields JSONB DEFAULT '{}'::jsonb,
  branding JSONB DEFAULT '{"primary_color":"#10b981","logo_url":null}'::jsonb,
  ai_config JSONB DEFAULT '{"enabled":true,"personality":"professional"}'::jsonb,
  terminology JSONB DEFAULT '{"client_singular":"Paciente","client_plural":"Pacientes","appointment_singular":"Consulta","appointment_plural":"Consultas"}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id)
);

-- Enable RLS
ALTER TABLE public.tenant_config ENABLE ROW LEVEL SECURITY;

-- Policies for tenant_config
CREATE POLICY "Users can view their tenant config" ON public.tenant_config
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update their tenant config" ON public.tenant_config
  FOR UPDATE USING (
    tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert their tenant config" ON public.tenant_config
  FOR INSERT WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid())
  );

-- Trigger for updated_at
CREATE TRIGGER update_tenant_config_updated_at 
  BEFORE UPDATE ON public.tenant_config
  FOR EACH ROW 
  EXECUTE PROCEDURE public.update_updated_at_column();

-- Insert default config for existing gabriel-gandin tenant
INSERT INTO public.tenant_config (tenant_id, business_type, enabled_features, terminology)
SELECT id, 'nutrition', 
  '["clients","appointments","meal_plans","questionnaires","ai_chat"]'::jsonb,
  '{"client_singular":"Paciente","client_plural":"Pacientes","appointment_singular":"Consulta","appointment_plural":"Consultas"}'::jsonb
FROM public.tenants 
WHERE subdomain = 'gabriel-gandin'
ON CONFLICT (tenant_id) DO NOTHING;