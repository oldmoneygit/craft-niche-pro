-- Create meal_plans table
CREATE TABLE public.meal_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  client_id UUID NOT NULL,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  plan_data JSONB NOT NULL DEFAULT '{"breakfast": [], "lunch": [], "dinner": [], "snacks": []}'::jsonb,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'concluido', 'pausado')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for meal_plans
CREATE POLICY "Users can view meal plans from their tenant" 
ON public.meal_plans 
FOR SELECT 
USING (tenant_id IN ( SELECT tenants.id FROM tenants WHERE (tenants.owner_email = (auth.jwt() ->> 'email'::text))));

CREATE POLICY "Users can insert meal plans to their tenant" 
ON public.meal_plans 
FOR INSERT 
WITH CHECK (tenant_id IN ( SELECT tenants.id FROM tenants WHERE (tenants.owner_email = (auth.jwt() ->> 'email'::text))));

CREATE POLICY "Users can update meal plans from their tenant" 
ON public.meal_plans 
FOR UPDATE 
USING (tenant_id IN ( SELECT tenants.id FROM tenants WHERE (tenants.owner_email = (auth.jwt() ->> 'email'::text))));

CREATE POLICY "Users can delete meal plans from their tenant" 
ON public.meal_plans 
FOR DELETE 
USING (tenant_id IN ( SELECT tenants.id FROM tenants WHERE (tenants.owner_email = (auth.jwt() ->> 'email'::text))));

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_meal_plans_updated_at
BEFORE UPDATE ON public.meal_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create communications table for WhatsApp preparation
CREATE TABLE public.communications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  client_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('email', 'whatsapp', 'sms')),
  direction TEXT NOT NULL CHECK (direction IN ('sent', 'received')),
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
  template_used TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for communications
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for communications
CREATE POLICY "Users can view communications from their tenant" 
ON public.communications 
FOR SELECT 
USING (tenant_id IN ( SELECT tenants.id FROM tenants WHERE (tenants.owner_email = (auth.jwt() ->> 'email'::text))));

CREATE POLICY "Users can insert communications to their tenant" 
ON public.communications 
FOR INSERT 
WITH CHECK (tenant_id IN ( SELECT tenants.id FROM tenants WHERE (tenants.owner_email = (auth.jwt() ->> 'email'::text))));

-- Create message templates table
CREATE TABLE public.message_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('welcome', 'reminder', 'follow_up', 'custom')),
  subject TEXT,
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb, -- Available variables like {client_name}, {meal_plan_name}
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for message templates
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for message templates
CREATE POLICY "Users can view templates from their tenant" 
ON public.message_templates 
FOR SELECT 
USING (tenant_id IN ( SELECT tenants.id FROM tenants WHERE (tenants.owner_email = (auth.jwt() ->> 'email'::text))));

CREATE POLICY "Users can insert templates to their tenant" 
ON public.message_templates 
FOR INSERT 
WITH CHECK (tenant_id IN ( SELECT tenants.id FROM tenants WHERE (tenants.owner_email = (auth.jwt() ->> 'email'::text))));

CREATE POLICY "Users can update templates from their tenant" 
ON public.message_templates 
FOR UPDATE 
USING (tenant_id IN ( SELECT tenants.id FROM tenants WHERE (tenants.owner_email = (auth.jwt() ->> 'email'::text))));

CREATE POLICY "Users can delete templates from their tenant" 
ON public.message_templates 
FOR DELETE 
USING (tenant_id IN ( SELECT tenants.id FROM tenants WHERE (tenants.owner_email = (auth.jwt() ->> 'email'::text))));

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_message_templates_updated_at
BEFORE UPDATE ON public.message_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default message templates for gabriel-gandin tenant
INSERT INTO public.message_templates (tenant_id, name, type, subject, content, variables) VALUES
(
  (SELECT id FROM tenants WHERE subdomain = 'gabriel-gandin'),
  'Boas-vindas',
  'welcome',
  'Bem-vindo(a) ao meu consultório!',
  'Olá {client_name}! Seja muito bem-vindo(a) ao meu consultório de nutrição. Estou aqui para te ajudar a alcançar seus objetivos de saúde e bem-estar.',
  '["client_name"]'::jsonb
),
(
  (SELECT id FROM tenants WHERE subdomain = 'gabriel-gandin'),
  'Envio de Plano Alimentar',
  'custom',
  'Seu novo plano alimentar está pronto!',
  'Olá {client_name}! Seu plano alimentar "{meal_plan_name}" está pronto. Confira todos os detalhes e não hesite em entrar em contato se tiver dúvidas.',
  '["client_name", "meal_plan_name"]'::jsonb
),
(
  (SELECT id FROM tenants WHERE subdomain = 'gabriel-gandin'),
  'Lembrete de Consulta',
  'reminder',
  'Lembrete: Consulta agendada para amanhã',
  'Olá {client_name}! Este é um lembrete de que você tem uma consulta agendada para amanhã às {appointment_time}. Nos vemos em breve!',
  '["client_name", "appointment_time"]'::jsonb
);