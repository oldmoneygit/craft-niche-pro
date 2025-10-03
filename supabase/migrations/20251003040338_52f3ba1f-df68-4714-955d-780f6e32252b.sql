-- Adicionar campos de versionamento na tabela meal_plans
ALTER TABLE meal_plans
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS replaced_by UUID REFERENCES meal_plans(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Índices para buscar versões ativas
CREATE INDEX IF NOT EXISTS idx_meal_plans_active ON meal_plans(client_id, is_active);
CREATE INDEX IF NOT EXISTS idx_meal_plans_version ON meal_plans(client_id, version);

-- Criar função para incrementar versão automaticamente
CREATE OR REPLACE FUNCTION increment_meal_plan_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Se for um novo plano para o mesmo paciente
  IF NEW.client_id IS NOT NULL THEN
    -- Buscar maior versão existente
    SELECT COALESCE(MAX(version), 0) + 1
    INTO NEW.version
    FROM meal_plans
    WHERE client_id = NEW.client_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para auto-incrementar versão (só se não existir)
DROP TRIGGER IF EXISTS set_meal_plan_version ON meal_plans;
CREATE TRIGGER set_meal_plan_version
  BEFORE INSERT ON meal_plans
  FOR EACH ROW
  EXECUTE FUNCTION increment_meal_plan_version();

-- Função para arquivar plano ativo ao criar novo
CREATE OR REPLACE FUNCTION archive_previous_meal_plan()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o novo plano está sendo marcado como ativo
  IF NEW.is_active = true THEN
    -- Desativar planos ativos anteriores do mesmo paciente
    UPDATE meal_plans
    SET 
      is_active = false,
      replaced_by = NEW.id,
      updated_at = NOW()
    WHERE 
      client_id = NEW.client_id 
      AND id != NEW.id 
      AND is_active = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para arquivar automaticamente (só se não existir)
DROP TRIGGER IF EXISTS archive_old_plan ON meal_plans;
CREATE TRIGGER archive_old_plan
  AFTER INSERT OR UPDATE ON meal_plans
  FOR EACH ROW
  EXECUTE FUNCTION archive_previous_meal_plan();

-- Comentários
COMMENT ON COLUMN meal_plans.version IS 'Versão sequencial do plano (auto-incrementa por paciente)';
COMMENT ON COLUMN meal_plans.is_active IS 'Se true, é o plano atual ativo do paciente';
COMMENT ON COLUMN meal_plans.replaced_by IS 'ID do plano que substituiu este (se arquivado)';
COMMENT ON COLUMN meal_plans.notes IS 'Anotações sobre mudanças nesta versão';