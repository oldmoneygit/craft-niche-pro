-- Remover planos alimentares órfãos (sem cliente válido)
DELETE FROM meal_plans 
WHERE client_id NOT IN (SELECT id FROM clients);

-- Adicionar foreign key entre meal_plans e clients
ALTER TABLE meal_plans 
ADD CONSTRAINT meal_plans_client_id_fkey 
FOREIGN KEY (client_id) 
REFERENCES clients(id) 
ON DELETE CASCADE;