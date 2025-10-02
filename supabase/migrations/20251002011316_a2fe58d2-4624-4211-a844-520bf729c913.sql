-- TABELA 1: Serviços cadastrados
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  duration_type TEXT CHECK (duration_type IN ('mensal', 'trimestral', 'semestral', 'anual', 'personalizado')),
  duration_days INT,
  modality TEXT CHECK (modality IN ('presencial', 'online', 'hibrido')),
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- TABELA 2: Contratações (cliente vinculado ao serviço)
CREATE TABLE public.service_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  client_id UUID NOT NULL,
  service_id UUID NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expiring_soon', 'expired', 'cancelled', 'renewed')),
  price DECIMAL(10,2),
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'overdue')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- TABELA 3: Log de notificações enviadas
CREATE TABLE public.service_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES public.service_subscriptions(id) ON DELETE CASCADE,
  notification_type TEXT CHECK (notification_type IN ('7_days', '3_days', 'expiry_day', 'custom')),
  sent_at TIMESTAMPTZ DEFAULT now(),
  whatsapp_sent BOOLEAN DEFAULT false,
  message_content TEXT
);

-- RLS (Row Level Security)
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_notifications ENABLE ROW LEVEL SECURITY;

-- Policies para services
CREATE POLICY "Users manage own services" ON public.services
  FOR ALL USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid()));

-- Policies para service_subscriptions
CREATE POLICY "Users manage own subscriptions" ON public.service_subscriptions
  FOR ALL USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid()));

-- Policies para service_notifications
CREATE POLICY "Users view own notifications" ON public.service_notifications
  FOR SELECT USING (
    subscription_id IN (
      SELECT id FROM public.service_subscriptions 
      WHERE tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid())
    )
  );

-- Índices para performance
CREATE INDEX idx_subscriptions_status ON public.service_subscriptions(status, end_date);
CREATE INDEX idx_subscriptions_client ON public.service_subscriptions(client_id);
CREATE INDEX idx_services_active ON public.services(active);
CREATE INDEX idx_services_tenant ON public.services(tenant_id);
CREATE INDEX idx_subscriptions_tenant ON public.service_subscriptions(tenant_id);

-- Trigger para atualizar updated_at em services
CREATE TRIGGER update_services_updated_at 
  BEFORE UPDATE ON public.services
  FOR EACH ROW 
  EXECUTE PROCEDURE public.update_updated_at_column();

-- Trigger para atualizar updated_at em service_subscriptions
CREATE TRIGGER update_subscriptions_updated_at 
  BEFORE UPDATE ON public.service_subscriptions
  FOR EACH ROW 
  EXECUTE PROCEDURE public.update_updated_at_column();

-- Comentários nas tabelas
COMMENT ON TABLE public.services IS 'Serviços/pacotes oferecidos pelo nutricionista';
COMMENT ON TABLE public.service_subscriptions IS 'Contratações de serviços por clientes';
COMMENT ON TABLE public.service_notifications IS 'Log de notificações enviadas sobre vencimentos';