-- Corrigir constraint de status da tabela leads
-- Permitir todos os status possíveis: pending, contacted, scheduled, converted, lost

-- Remover constraint antiga se existir
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;

-- Criar constraint correta com todos os status
ALTER TABLE leads ADD CONSTRAINT leads_status_check 
  CHECK (status IN ('pending', 'contacted', 'scheduled', 'converted', 'lost'));

-- Verificar constraint criada
SELECT 
  constraint_name, 
  check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'leads_status_check';
