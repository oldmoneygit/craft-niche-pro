-- Tabela de templates
CREATE TABLE meal_plan_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  created_by UUID NOT NULL,
  
  name VARCHAR(200) NOT NULL,
  description TEXT,
  
  -- Parâmetros do perfil original (referência)
  reference_calories INTEGER NOT NULL,
  reference_protein DECIMAL(6,2) NOT NULL,
  reference_carbs DECIMAL(6,2) NOT NULL,
  reference_fat DECIMAL(6,2) NOT NULL,
  
  -- Metadados
  objective VARCHAR(50),
  tags TEXT[],
  
  -- Contador de uso
  times_used INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de refeições do template
CREATE TABLE meal_plan_template_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES meal_plan_templates(id) ON DELETE CASCADE,
  
  name VARCHAR(100) NOT NULL,
  time TIME,
  order_index INTEGER NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de alimentos do template
CREATE TABLE meal_plan_template_foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id UUID NOT NULL REFERENCES meal_plan_template_meals(id) ON DELETE CASCADE,
  
  food_id UUID NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
  measure_id UUID NOT NULL REFERENCES food_measures(id) ON DELETE CASCADE,
  
  quantity DECIMAL(10,2) NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_templates_tenant ON meal_plan_templates(tenant_id);
CREATE INDEX idx_templates_creator ON meal_plan_templates(created_by);
CREATE INDEX idx_template_meals ON meal_plan_template_meals(template_id);
CREATE INDEX idx_template_foods ON meal_plan_template_foods(meal_id);

-- RLS Policies
ALTER TABLE meal_plan_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plan_template_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plan_template_foods ENABLE ROW LEVEL SECURITY;

-- Políticas para templates
CREATE POLICY "Users can view templates from their tenant"
  ON meal_plan_templates FOR SELECT
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create templates in their tenant"
  ON meal_plan_templates FOR INSERT
  WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update templates in their tenant"
  ON meal_plan_templates FOR UPDATE
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete templates in their tenant"
  ON meal_plan_templates FOR DELETE
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
  ));

-- Políticas para refeições do template
CREATE POLICY "Users can view template meals"
  ON meal_plan_template_meals FOR SELECT
  USING (template_id IN (
    SELECT id FROM meal_plan_templates
    WHERE tenant_id IN (
      SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can create template meals"
  ON meal_plan_template_meals FOR INSERT
  WITH CHECK (template_id IN (
    SELECT id FROM meal_plan_templates
    WHERE tenant_id IN (
      SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can update template meals"
  ON meal_plan_template_meals FOR UPDATE
  USING (template_id IN (
    SELECT id FROM meal_plan_templates
    WHERE tenant_id IN (
      SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can delete template meals"
  ON meal_plan_template_meals FOR DELETE
  USING (template_id IN (
    SELECT id FROM meal_plan_templates
    WHERE tenant_id IN (
      SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
    )
  ));

-- Políticas para alimentos do template
CREATE POLICY "Users can view template foods"
  ON meal_plan_template_foods FOR SELECT
  USING (meal_id IN (
    SELECT id FROM meal_plan_template_meals
  ));

CREATE POLICY "Users can create template foods"
  ON meal_plan_template_foods FOR INSERT
  WITH CHECK (meal_id IN (
    SELECT id FROM meal_plan_template_meals
  ));

CREATE POLICY "Users can update template foods"
  ON meal_plan_template_foods FOR UPDATE
  USING (meal_id IN (
    SELECT id FROM meal_plan_template_meals
  ));

CREATE POLICY "Users can delete template foods"
  ON meal_plan_template_foods FOR DELETE
  USING (meal_id IN (
    SELECT id FROM meal_plan_template_meals
  ));

-- Trigger para updated_at
CREATE TRIGGER update_meal_plan_templates_updated_at
  BEFORE UPDATE ON meal_plan_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();