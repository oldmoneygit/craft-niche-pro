-- Adicionar novas colunas à tabela meal_plans
ALTER TABLE meal_plans 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS calories_target INTEGER,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS public_token TEXT;

-- Adicionar constraint unique ao public_token
DO $$
BEGIN
  ALTER TABLE meal_plans ADD CONSTRAINT meal_plans_public_token_key UNIQUE (public_token);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Criar índice para public_token
CREATE INDEX IF NOT EXISTS idx_meal_plans_token ON meal_plans(public_token);

-- Criar tabela meals (refeições)
CREATE TABLE IF NOT EXISTS meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  time TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Criar tabela meal_foods (alimentos)
CREATE TABLE IF NOT EXISTS meal_foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id UUID REFERENCES meals(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  quantity TEXT NOT NULL,
  calories INTEGER,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS para meals
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own meals" ON meals;
CREATE POLICY "Users manage own meals" ON meals
  FOR ALL USING (meal_plan_id IN (
    SELECT id FROM meal_plans WHERE tenant_id IN (
      SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
    )
  ));

DROP POLICY IF EXISTS "Public can view meals by token" ON meals;
CREATE POLICY "Public can view meals by token" ON meals
  FOR SELECT USING (meal_plan_id IN (
    SELECT id FROM meal_plans WHERE public_token IS NOT NULL
  ));

-- RLS para meal_foods
ALTER TABLE meal_foods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own meal foods" ON meal_foods;
CREATE POLICY "Users manage own meal foods" ON meal_foods
  FOR ALL USING (meal_id IN (
    SELECT id FROM meals WHERE meal_plan_id IN (
      SELECT id FROM meal_plans WHERE tenant_id IN (
        SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
      )
    )
  ));

DROP POLICY IF EXISTS "Public can view meal foods by token" ON meal_foods;
CREATE POLICY "Public can view meal foods by token" ON meal_foods
  FOR SELECT USING (meal_id IN (
    SELECT id FROM meals WHERE meal_plan_id IN (
      SELECT id FROM meal_plans WHERE public_token IS NOT NULL
    )
  ));

-- Policy adicional para meal_plans (acesso público por token)
DROP POLICY IF EXISTS "Public can view meal plan by token" ON meal_plans;
CREATE POLICY "Public can view meal plan by token" ON meal_plans
  FOR SELECT USING (public_token IS NOT NULL);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_meals_plan ON meals(meal_plan_id, order_index);
CREATE INDEX IF NOT EXISTS idx_meal_foods_meal ON meal_foods(meal_id, order_index);

-- Função para garantir apenas 1 plano ativo por cliente
CREATE OR REPLACE FUNCTION ensure_single_active_plan()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.active = true THEN
    UPDATE meal_plans 
    SET active = false 
    WHERE client_id = NEW.client_id 
      AND id != NEW.id 
      AND active = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para garantir apenas 1 plano ativo
DROP TRIGGER IF EXISTS ensure_single_active_plan_trigger ON meal_plans;
CREATE TRIGGER ensure_single_active_plan_trigger
  BEFORE INSERT OR UPDATE ON meal_plans
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_active_plan();