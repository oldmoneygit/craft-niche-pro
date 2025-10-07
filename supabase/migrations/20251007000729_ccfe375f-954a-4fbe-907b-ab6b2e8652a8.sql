-- Tabela principal de recordatórios
CREATE TABLE recordatorios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  patient_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('r24h', 'r3d')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'analyzed')),
  record_date DATE NOT NULL,
  notes TEXT,
  
  -- Análise nutricional (preenchido após análise)
  total_calories INTEGER,
  total_protein DECIMAL(10,2),
  total_carbs DECIMAL(10,2),
  total_fat DECIMAL(10,2),
  total_fiber DECIMAL(10,2),
  analysis_notes TEXT,
  analyzed_at TIMESTAMP WITH TIME ZONE,
  analyzed_by UUID,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de refeições
CREATE TABLE recordatorio_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recordatorio_id UUID REFERENCES recordatorios(id) ON DELETE CASCADE,
  meal_type TEXT NOT NULL CHECK (meal_type IN (
    'breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 
    'dinner', 'supper', 'other'
  )),
  time TIME,
  foods TEXT NOT NULL,
  
  -- Análise (opcional, preenchido após análise detalhada)
  calories INTEGER,
  protein DECIMAL(10,2),
  carbs DECIMAL(10,2),
  fat DECIMAL(10,2),
  
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_recordatorios_tenant ON recordatorios(tenant_id);
CREATE INDEX idx_recordatorios_patient ON recordatorios(patient_id);
CREATE INDEX idx_recordatorios_status ON recordatorios(status);
CREATE INDEX idx_recordatorio_meals_recordatorio ON recordatorio_meals(recordatorio_id);

-- Habilitar RLS
ALTER TABLE recordatorios ENABLE ROW LEVEL SECURITY;
ALTER TABLE recordatorio_meals ENABLE ROW LEVEL SECURITY;

-- Policies para recordatorios
CREATE POLICY "Users can view own tenant recordatorios" ON recordatorios
  FOR SELECT USING (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own tenant recordatorios" ON recordatorios
  FOR INSERT WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update own tenant recordatorios" ON recordatorios
  FOR UPDATE USING (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own tenant recordatorios" ON recordatorios
  FOR DELETE USING (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
  ));

-- Policies para recordatorio_meals
CREATE POLICY "Users can view own tenant meals" ON recordatorio_meals
  FOR SELECT USING (recordatorio_id IN (
    SELECT id FROM recordatorios WHERE tenant_id IN (
      SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can insert own tenant meals" ON recordatorio_meals
  FOR INSERT WITH CHECK (recordatorio_id IN (
    SELECT id FROM recordatorios WHERE tenant_id IN (
      SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can update own tenant meals" ON recordatorio_meals
  FOR UPDATE USING (recordatorio_id IN (
    SELECT id FROM recordatorios WHERE tenant_id IN (
      SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can delete own tenant meals" ON recordatorio_meals
  FOR DELETE USING (recordatorio_id IN (
    SELECT id FROM recordatorios WHERE tenant_id IN (
      SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
    )
  ));

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_recordatorios_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recordatorios_updated_at
  BEFORE UPDATE ON recordatorios
  FOR EACH ROW
  EXECUTE FUNCTION update_recordatorios_updated_at();