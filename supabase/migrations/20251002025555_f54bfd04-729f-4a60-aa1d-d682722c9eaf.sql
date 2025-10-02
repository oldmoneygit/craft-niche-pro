-- Criar apenas os índices se não existirem
CREATE INDEX IF NOT EXISTS idx_service_subscriptions_client_id 
ON public.service_subscriptions(client_id);

CREATE INDEX IF NOT EXISTS idx_service_subscriptions_service_id 
ON public.service_subscriptions(service_id);

CREATE INDEX IF NOT EXISTS idx_service_subscriptions_end_date 
ON public.service_subscriptions(end_date);

CREATE INDEX IF NOT EXISTS idx_service_subscriptions_status 
ON public.service_subscriptions(status);

CREATE INDEX IF NOT EXISTS idx_service_subscriptions_tenant_end_date 
ON public.service_subscriptions(tenant_id, end_date);