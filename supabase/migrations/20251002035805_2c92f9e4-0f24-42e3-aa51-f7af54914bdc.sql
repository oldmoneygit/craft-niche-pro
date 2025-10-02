-- ============================================
-- SISTEMA DE GESTÃO NUTRICIONAL - BANCO DE DADOS
-- ============================================

-- ============================================
-- TABELA: Fontes de Dados Nutricionais
-- ============================================
CREATE TABLE nutrition_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  country TEXT,
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Popular fontes padrão
INSERT INTO nutrition_sources (code, name, country, description) VALUES
  ('tbca', 'Tabela Brasileira de Composição de Alimentos (TBCA)', 'BR', 'Base de dados BRASILFOODS/USP'),
  ('taco', 'Tabela TACO (UNICAMP)', 'BR', 'Tabela Brasileira de Composição de Alimentos'),
  ('ibge', 'IBGE POF', 'BR', 'Pesquisa de Orçamentos Familiares - IBGE'),
  ('custom', 'Personalizado', 'BR', 'Alimentos adicionados pelos nutricionistas');

-- ============================================
-- TABELA: Categorias de Alimentos
-- ============================================
CREATE TABLE food_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Popular categorias padrão
INSERT INTO food_categories (name, icon, color) VALUES
  ('Cereais e Derivados', 'Wheat', '#f59e0b'),
  ('Verduras e Hortaliças', 'Salad', '#22c55e'),
  ('Frutas', 'Apple', '#ef4444'),
  ('Leguminosas', 'Bean', '#10b981'),
  ('Carnes e Derivados', 'Beef', '#dc2626'),
  ('Aves e Derivados', 'Bird', '#f97316'),
  ('Peixes e Frutos do Mar', 'Fish', '#3b82f6'),
  ('Ovos', 'Egg', '#fbbf24'),
  ('Laticínios', 'Milk', '#60a5fa'),
  ('Óleos e Gorduras', 'Droplet', '#eab308'),
  ('Açúcares e Doces', 'Candy', '#ec4899'),
  ('Bebidas', 'Coffee', '#8b5cf6'),
  ('Suplementos', 'Pill', '#a855f7'),
  ('Industrializados', 'Package', '#6b7280'),
  ('Receitas Personalizadas', 'ChefHat', '#14b8a6');

-- ============================================
-- TABELA: Alimentos
-- ============================================
CREATE TABLE foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES nutrition_sources(id),
  category_id UUID REFERENCES food_categories(id),
  name TEXT NOT NULL,
  brand TEXT,
  description TEXT,
  
  -- Composição nutricional (por 100g)
  energy_kcal DECIMAL(10,2),
  protein_g DECIMAL(10,2),
  carbohydrate_g DECIMAL(10,2),
  fiber_g DECIMAL(10,2),
  lipid_g DECIMAL(10,2),
  saturated_fat_g DECIMAL(10,2),
  sodium_mg DECIMAL(10,2),
  
  -- Campos para alimentos personalizados
  is_custom BOOLEAN DEFAULT false,
  created_by UUID REFERENCES profiles(user_id),
  source_info TEXT,
  
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_foods_name ON foods(name);
CREATE INDEX idx_foods_category ON foods(category_id);
CREATE INDEX idx_foods_source ON foods(source_id);
CREATE INDEX idx_foods_custom ON foods(is_custom, created_by);

-- ============================================
-- TABELA: Medidas/Porções de Alimentos
-- ============================================
CREATE TABLE food_measures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_id UUID REFERENCES foods(id) ON DELETE CASCADE,
  measure_name TEXT NOT NULL,
  grams DECIMAL(10,2) NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_measures_food ON food_measures(food_id);

-- ============================================
-- ATUALIZAR TABELA: meal_plans (adicionar campos nutricionais)
-- ============================================
ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS calorie_target DECIMAL(10,2);
ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS protein_target_g DECIMAL(10,2);
ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS carb_target_g DECIMAL(10,2);
ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS fat_target_g DECIMAL(10,2);
ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS goal TEXT;

-- ============================================
-- TABELA: Refeições do Plano
-- ============================================
CREATE TABLE meal_plan_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  time TEXT,
  order_index INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_meal_plan_meals_plan ON meal_plan_meals(meal_plan_id);

-- ============================================
-- TABELA: Itens da Refeição (alimentos)
-- ============================================
CREATE TABLE meal_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id UUID REFERENCES meal_plan_meals(id) ON DELETE CASCADE,
  food_id UUID REFERENCES foods(id),
  measure_id UUID REFERENCES food_measures(id),
  quantity DECIMAL(10,2) NOT NULL,
  grams_total DECIMAL(10,2),
  kcal_total DECIMAL(10,2),
  protein_total DECIMAL(10,2),
  carb_total DECIMAL(10,2),
  fat_total DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_meal_items_meal ON meal_items(meal_id);

-- ============================================
-- RLS (Row Level Security)
-- ============================================
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_measures ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plan_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_items ENABLE ROW LEVEL SECURITY;

-- Policy: Alimentos oficiais + personalizados do próprio nutricionista
CREATE POLICY "View foods" ON foods
  FOR SELECT USING (
    is_custom = false OR created_by = auth.uid()
  );

CREATE POLICY "Create custom foods" ON foods
  FOR INSERT WITH CHECK (
    is_custom = true AND created_by = auth.uid()
  );

CREATE POLICY "Update own custom foods" ON foods
  FOR UPDATE USING (
    is_custom = true AND created_by = auth.uid()
  );

CREATE POLICY "Delete own custom foods" ON foods
  FOR DELETE USING (
    is_custom = true AND created_by = auth.uid()
  );

-- Policy: Medidas de alimentos (todos podem ver)
CREATE POLICY "View food measures" ON food_measures
  FOR SELECT USING (true);

CREATE POLICY "Manage custom food measures" ON food_measures
  FOR ALL USING (
    food_id IN (
      SELECT id FROM foods WHERE created_by = auth.uid()
    )
  );

-- Policy: Refeições e itens (apenas do próprio tenant)
CREATE POLICY "Manage own meal plan meals" ON meal_plan_meals
  FOR ALL USING (
    meal_plan_id IN (
      SELECT id FROM meal_plans 
      WHERE tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Manage own meal items" ON meal_items
  FOR ALL USING (
    meal_id IN (
      SELECT id FROM meal_plan_meals 
      WHERE meal_plan_id IN (
        SELECT id FROM meal_plans 
        WHERE tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid())
      )
    )
  );

-- ============================================
-- TRIGGER: Atualizar updated_at
-- ============================================
CREATE TRIGGER update_foods_updated_at BEFORE UPDATE ON foods
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ============================================
-- POPULAR COM ALIMENTOS INICIAIS
-- ============================================
DO $$
DECLARE
  tbca_source_id UUID;
  cereais_cat UUID;
  verduras_cat UUID;
  frutas_cat UUID;
  carnes_cat UUID;
  aves_cat UUID;
  peixes_cat UUID;
  ovos_cat UUID;
  laticinios_cat UUID;
  leguminosas_cat UUID;
  acucares_cat UUID;
  bebidas_cat UUID;
BEGIN
  -- Buscar IDs
  SELECT id INTO tbca_source_id FROM nutrition_sources WHERE code = 'tbca';
  SELECT id INTO cereais_cat FROM food_categories WHERE name = 'Cereais e Derivados';
  SELECT id INTO verduras_cat FROM food_categories WHERE name = 'Verduras e Hortaliças';
  SELECT id INTO frutas_cat FROM food_categories WHERE name = 'Frutas';
  SELECT id INTO carnes_cat FROM food_categories WHERE name = 'Carnes e Derivados';
  SELECT id INTO aves_cat FROM food_categories WHERE name = 'Aves e Derivados';
  SELECT id INTO peixes_cat FROM food_categories WHERE name = 'Peixes e Frutos do Mar';
  SELECT id INTO ovos_cat FROM food_categories WHERE name = 'Ovos';
  SELECT id INTO laticinios_cat FROM food_categories WHERE name = 'Laticínios';
  SELECT id INTO leguminosas_cat FROM food_categories WHERE name = 'Leguminosas';
  SELECT id INTO acucares_cat FROM food_categories WHERE name = 'Açúcares e Doces';
  SELECT id INTO bebidas_cat FROM food_categories WHERE name = 'Bebidas';

  -- CEREAIS E DERIVADOS
  INSERT INTO foods (source_id, category_id, name, energy_kcal, protein_g, carbohydrate_g, fiber_g, lipid_g, saturated_fat_g, sodium_mg) VALUES
  (tbca_source_id, cereais_cat, 'Arroz, integral, cozido', 124, 2.6, 25.8, 2.7, 1.0, 0.3, 1),
  (tbca_source_id, cereais_cat, 'Arroz, branco, cozido', 128, 2.5, 28.1, 1.6, 0.2, 0.1, 1),
  (tbca_source_id, cereais_cat, 'Aveia, flocos, crua', 394, 13.9, 66.6, 9.1, 8.5, 1.5, 5),
  (tbca_source_id, cereais_cat, 'Pão, francês', 300, 8.0, 58.6, 2.3, 3.1, 0.6, 584),
  (tbca_source_id, cereais_cat, 'Pão, forma, integral', 253, 9.4, 49.0, 6.5, 3.5, 0.6, 489),
  (tbca_source_id, cereais_cat, 'Macarrão, cozido', 157, 5.3, 30.9, 1.6, 0.9, 0.2, 1),
  (tbca_source_id, cereais_cat, 'Batata, inglesa, cozida', 52, 1.2, 11.9, 1.3, 0.1, 0.0, 5);

  -- VERDURAS E HORTALIÇAS
  INSERT INTO foods (source_id, category_id, name, energy_kcal, protein_g, carbohydrate_g, fiber_g, lipid_g, saturated_fat_g, sodium_mg) VALUES
  (tbca_source_id, verduras_cat, 'Cenoura, crua', 34, 1.3, 7.7, 3.2, 0.2, 0.0, 35),
  (tbca_source_id, verduras_cat, 'Tomate, cru', 15, 1.1, 3.1, 1.2, 0.2, 0.0, 4),
  (tbca_source_id, verduras_cat, 'Alface, crespa', 11, 1.3, 1.7, 1.7, 0.2, 0.0, 7),
  (tbca_source_id, verduras_cat, 'Brócolis, cozido', 25, 3.6, 3.5, 3.0, 0.1, 0.0, 8),
  (tbca_source_id, verduras_cat, 'Mandioca, cozida', 125, 0.6, 30.1, 1.6, 0.3, 0.1, 14);

  -- FRUTAS
  INSERT INTO foods (source_id, category_id, name, energy_kcal, protein_g, carbohydrate_g, fiber_g, lipid_g, saturated_fat_g, sodium_mg) VALUES
  (tbca_source_id, frutas_cat, 'Banana, nanica', 92, 1.3, 23.8, 1.9, 0.1, 0.0, 0),
  (tbca_source_id, frutas_cat, 'Maçã, com casca', 63, 0.2, 16.6, 2.0, 0.2, 0.0, 1),
  (tbca_source_id, frutas_cat, 'Laranja, pêra', 37, 1.0, 8.9, 0.8, 0.1, 0.0, 1),
  (tbca_source_id, frutas_cat, 'Morango', 30, 0.9, 6.8, 1.7, 0.3, 0.0, 1),
  (tbca_source_id, frutas_cat, 'Abacate', 96, 1.2, 6.4, 6.3, 8.4, 1.8, 2);

  -- CARNES
  INSERT INTO foods (source_id, category_id, name, energy_kcal, protein_g, carbohydrate_g, fiber_g, lipid_g, saturated_fat_g, sodium_mg) VALUES
  (tbca_source_id, carnes_cat, 'Carne bovina, acém, moído, cozido', 212, 26.7, 0.0, 0.0, 10.9, 4.3, 68),
  (tbca_source_id, carnes_cat, 'Carne bovina, patinho, grelhado', 183, 32.5, 0.0, 0.0, 5.0, 1.9, 56);

  -- AVES
  INSERT INTO foods (source_id, category_id, name, energy_kcal, protein_g, carbohydrate_g, fiber_g, lipid_g, saturated_fat_g, sodium_mg) VALUES
  (tbca_source_id, aves_cat, 'Frango, peito, sem pele, grelhado', 163, 31.5, 0.0, 0.0, 3.2, 0.9, 71),
  (tbca_source_id, aves_cat, 'Frango, coxa, com pele, assada', 232, 20.0, 0.0, 0.0, 16.6, 4.7, 85);

  -- PEIXES
  INSERT INTO foods (source_id, category_id, name, energy_kcal, protein_g, carbohydrate_g, fiber_g, lipid_g, saturated_fat_g, sodium_mg) VALUES
  (tbca_source_id, peixes_cat, 'Tilápia, filé, grelhado', 96, 20.1, 0.0, 0.0, 1.7, 0.6, 52),
  (tbca_source_id, peixes_cat, 'Salmão, grelhado', 211, 23.8, 0.0, 0.0, 12.4, 2.5, 59);

  -- OVOS
  INSERT INTO foods (source_id, category_id, name, energy_kcal, protein_g, carbohydrate_g, fiber_g, lipid_g, saturated_fat_g, sodium_mg) VALUES
  (tbca_source_id, ovos_cat, 'Ovo, galinha, cozido', 155, 13.0, 1.1, 0.0, 10.6, 3.3, 140),
  (tbca_source_id, ovos_cat, 'Ovo, galinha, frito', 192, 13.6, 0.6, 0.0, 14.8, 4.0, 144);

  -- LATICÍNIOS
  INSERT INTO foods (source_id, category_id, name, energy_kcal, protein_g, carbohydrate_g, fiber_g, lipid_g, saturated_fat_g, sodium_mg) VALUES
  (tbca_source_id, laticinios_cat, 'Leite, vaca, integral', 61, 2.9, 4.6, 0.0, 3.2, 1.9, 43),
  (tbca_source_id, laticinios_cat, 'Leite, vaca, desnatado', 35, 3.4, 4.9, 0.0, 0.2, 0.1, 52),
  (tbca_source_id, laticinios_cat, 'Iogurte, natural', 51, 4.1, 1.9, 0.0, 3.0, 1.9, 58),
  (tbca_source_id, laticinios_cat, 'Queijo, minas, frescal', 264, 17.4, 3.2, 0.0, 20.2, 13.0, 215),
  (tbca_source_id, laticinios_cat, 'Queijo, muçarela', 280, 25.0, 2.2, 0.0, 19.5, 12.3, 500);

  -- LEGUMINOSAS
  INSERT INTO foods (source_id, category_id, name, energy_kcal, protein_g, carbohydrate_g, fiber_g, lipid_g, saturated_fat_g, sodium_mg) VALUES
  (tbca_source_id, leguminosas_cat, 'Feijão, carioca, cozido', 76, 4.8, 14.0, 8.5, 0.5, 0.1, 2),
  (tbca_source_id, leguminosas_cat, 'Feijão, preto, cozido', 77, 4.5, 14.0, 8.4, 0.5, 0.1, 2),
  (tbca_source_id, leguminosas_cat, 'Lentilha, cozida', 93, 6.3, 16.0, 5.1, 0.4, 0.1, 2);

  -- AÇÚCARES E DOCES
  INSERT INTO foods (source_id, category_id, name, energy_kcal, protein_g, carbohydrate_g, fiber_g, lipid_g, saturated_fat_g, sodium_mg) VALUES
  (tbca_source_id, acucares_cat, 'Açúcar, refinado', 387, 0.0, 99.9, 0.0, 0.0, 0.0, 1),
  (tbca_source_id, acucares_cat, 'Mel, abelha', 309, 0.4, 84.0, 0.2, 0.0, 0.0, 6);

  -- BEBIDAS
  INSERT INTO foods (source_id, category_id, name, energy_kcal, protein_g, carbohydrate_g, fiber_g, lipid_g, saturated_fat_g, sodium_mg) VALUES
  (tbca_source_id, bebidas_cat, 'Café, coado, sem açúcar', 2, 0.1, 0.3, 0.0, 0.0, 0.0, 1),
  (tbca_source_id, bebidas_cat, 'Suco, laranja, natural', 36, 0.5, 8.7, 0.1, 0.1, 0.0, 1);

END $$;

-- ============================================
-- POPULAR MEDIDAS CASEIRAS
-- ============================================
INSERT INTO food_measures (food_id, measure_name, grams, is_default)
SELECT id, 'colher de sopa', 30, true FROM foods WHERE name LIKE 'Arroz%cozido'
UNION ALL SELECT id, 'xícara de chá', 150, false FROM foods WHERE name LIKE 'Arroz%cozido'
UNION ALL SELECT id, 'colher de sopa', 15, true FROM foods WHERE name = 'Aveia, flocos, crua'
UNION ALL SELECT id, 'unidade', 50, true FROM foods WHERE name = 'Pão, francês'
UNION ALL SELECT id, 'fatia', 25, false FROM foods WHERE name = 'Pão, francês'
UNION ALL SELECT id, 'fatia', 30, true FROM foods WHERE name = 'Pão, forma, integral'
UNION ALL SELECT id, 'concha', 100, true FROM foods WHERE name = 'Macarrão, cozido'
UNION ALL SELECT id, 'unidade média', 150, true FROM foods WHERE name = 'Batata, inglesa, cozida'
UNION ALL SELECT id, 'unidade', 100, true FROM foods WHERE name = 'Banana, nanica'
UNION ALL SELECT id, 'unidade média', 130, true FROM foods WHERE name = 'Maçã, com casca'
UNION ALL SELECT id, 'unidade', 50, true FROM foods WHERE name = 'Ovo, galinha, cozido'
UNION ALL SELECT id, 'copo americano (200ml)', 200, true FROM foods WHERE name LIKE 'Leite%'
UNION ALL SELECT id, 'copo pequeno (150ml)', 150, false FROM foods WHERE name LIKE 'Leite%'
UNION ALL SELECT id, 'pote (170g)', 170, true FROM foods WHERE name = 'Iogurte, natural'
UNION ALL SELECT id, 'fatia', 30, true FROM foods WHERE name LIKE 'Queijo%'
UNION ALL SELECT id, 'concha', 100, true FROM foods WHERE name LIKE 'Feijão%'
UNION ALL SELECT id, 'filé médio', 120, true FROM foods WHERE name LIKE '%grelhado'
UNION ALL SELECT id, 'filé pequeno', 80, false FROM foods WHERE name LIKE '%grelhado'
UNION ALL SELECT id, 'colher de sopa', 20, true FROM foods WHERE name = 'Açúcar, refinado'
UNION ALL SELECT id, 'xícara de café (50ml)', 50, true FROM foods WHERE name LIKE 'Café%'
UNION ALL SELECT id, 'copo americano (200ml)', 200, true FROM foods WHERE name LIKE 'Suco%';