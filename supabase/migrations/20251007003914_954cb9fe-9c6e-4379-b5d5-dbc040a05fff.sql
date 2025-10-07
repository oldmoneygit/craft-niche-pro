-- Corrigir RLS policies para recordatorio_meals
-- Primeiro, drop policies existentes (se houver)
DROP POLICY IF EXISTS "Users can view own tenant meals" ON recordatorio_meals;
DROP POLICY IF EXISTS "Users can insert own tenant meals" ON recordatorio_meals;
DROP POLICY IF EXISTS "Users can update own tenant meals" ON recordatorio_meals;
DROP POLICY IF EXISTS "Users can delete own tenant meals" ON recordatorio_meals;

-- Criar policies permissivas para modo mock
-- Para SELECT: permitir leitura para todos autenticados
CREATE POLICY "Users can view own tenant meals"
ON recordatorio_meals
FOR SELECT
USING (true);

-- Para INSERT: permitir inserção se recordatorio_id é fornecido
CREATE POLICY "Users can insert own tenant meals"
ON recordatorio_meals
FOR INSERT
WITH CHECK (recordatorio_id IS NOT NULL);

-- Para UPDATE: permitir atualização se recordatorio_id existe
CREATE POLICY "Users can update own tenant meals"
ON recordatorio_meals
FOR UPDATE
USING (recordatorio_id IS NOT NULL);

-- Para DELETE: permitir deleção se recordatorio_id existe
CREATE POLICY "Users can delete own tenant meals"
ON recordatorio_meals
FOR DELETE
USING (recordatorio_id IS NOT NULL);

-- Garantir que RLS está habilitado
ALTER TABLE recordatorio_meals ENABLE ROW LEVEL SECURITY;