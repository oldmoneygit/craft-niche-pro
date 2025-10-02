-- Adicionar foreign key para client_id
ALTER TABLE public.service_subscriptions
ADD CONSTRAINT fk_service_subscriptions_client 
FOREIGN KEY (client_id) 
REFERENCES public.clients(id) 
ON DELETE CASCADE;