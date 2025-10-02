-- Adicionar foreign key constraint entre service_subscriptions e services
-- Isso permite que o Supabase faça JOINs automáticos entre as tabelas

-- Primeiro, verificar se já existem dados inválidos
-- (service_id que não existe na tabela services)
DO $$ 
BEGIN
  -- Deletar qualquer subscription com service_id inválido
  DELETE FROM service_subscriptions 
  WHERE service_id NOT IN (SELECT id FROM services);
END $$;

-- Adicionar a foreign key constraint
ALTER TABLE service_subscriptions
ADD CONSTRAINT service_subscriptions_service_id_fkey 
FOREIGN KEY (service_id) 
REFERENCES services(id) 
ON DELETE CASCADE;

-- Criar índice para melhorar performance das consultas com JOIN
CREATE INDEX IF NOT EXISTS idx_service_subscriptions_service_id 
ON service_subscriptions(service_id);