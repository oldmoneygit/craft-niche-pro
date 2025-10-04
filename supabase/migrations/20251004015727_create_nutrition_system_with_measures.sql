/*
  # Sistema Nutricional Completo com Medidas

  ## Resumo
  Cria sistema completo de nutrição incluindo:
  - Tabelas de alimentos e medidas
  - Sistema de medidas de referência
  - Medidas padrão (100g) para todos os alimentos
  - Medidas caseiras comuns

  ## Tabelas Criadas
  1. nutrition_sources - Fontes de dados (TBCA, TACO, etc)
  2. food_categories - Categorias de alimentos
  3. foods - Alimentos com informações nutricionais
  4. food_measures - Medidas/porções específicas por alimento
  5. reference_measures - Medidas de referência globais

  ## Segurança
  - RLS habilitado em todas as tabelas
  - Políticas restritivas de acesso
  - Alimentos oficiais visíveis para todos
  - Alimentos customizados apenas para o criador
*/

-- ============================================
-- 1. TABELA: Fontes de Dados Nutricionais
-- ============================================

CREATE TABLE IF NOT EXISTS nutrition_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  country TEXT,
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Popular fontes padrão
INSERT INTO nutrition_sources (code, name, country, description) VALUES
  ('tbca', 'Tabela Brasileira de Composição de Alimentos (TBCA)', 'BR', 'Base de dados BRASILFOODS/USP'),
  ('taco', 'Tabela TACO (UNICAMP)', 'BR', 'Tabela Brasileira de Composição de Alimentos'),
  ('ibge', 'IBGE POF', 'BR', 'Pesquisa de Orçamentos Familiares - IBGE'),
  ('custom', 'Personalizado', 'BR', 'Alimentos adicionados pelos nutricionistas')
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- 2. TABELA: Categorias de Alimentos
-- ============================================

CREATE TABLE IF NOT EXISTS food_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
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
  ('Receitas Personalizadas', 'ChefHat', '#14b8a6')
ON CONFLICT DO NOTHING;

-- ============================================
-- 3. TABELA: Alimentos
-- ============================================

CREATE TABLE IF NOT EXISTS foods (
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
  created_by UUID,
  source_info TEXT,
  
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_foods_name ON foods(name);
CREATE INDEX IF NOT EXISTS idx_foods_category ON foods(category_id);
CREATE INDEX IF NOT EXISTS idx_foods_source ON foods(source_id);
CREATE INDEX IF NOT EXISTS idx_foods_custom ON foods(is_custom, created_by);

-- ============================================
-- 4. TABELA: Medidas/Porções de Alimentos
-- ============================================

CREATE TABLE IF NOT EXISTS food_measures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_id UUID REFERENCES foods(id) ON DELETE CASCADE,
  measure_name TEXT NOT NULL,
  grams DECIMAL(10,2) NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_measures_food ON food_measures(food_id);

-- ============================================
-- 5. TABELA: Medidas de Referência
-- ============================================

CREATE TABLE IF NOT EXISTS reference_measures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  measure_type TEXT NOT NULL CHECK (measure_type IN (
    'weight', 'volume', 'spoon', 'cup', 'unit', 'slice', 'piece', 'portion', 'other'
  )),
  typical_grams DECIMAL(10,2),
  description TEXT,
  display_order INTEGER DEFAULT 999,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reference_measures_type ON reference_measures(measure_type);
CREATE INDEX IF NOT EXISTS idx_reference_measures_order ON reference_measures(display_order);

-- ============================================
-- POPULAR MEDIDAS DE REFERÊNCIA
-- ============================================

INSERT INTO reference_measures (name, measure_type, typical_grams, description, display_order) VALUES
  ('100 gramas', 'weight', 100, 'Medida padrão (100g)', 1),
  ('1 colher de chá', 'spoon', 5, 'Aproximadamente 5g', 20),
  ('1 colher de sobremesa', 'spoon', 10, 'Aproximadamente 10g', 21),
  ('1 colher de sopa', 'spoon', 15, 'Aproximadamente 15g', 22),
  ('1 colher de servir', 'spoon', 30, 'Aproximadamente 30g', 23),
  ('1/4 de xícara de chá', 'cup', 60, 'Aproximadamente 60ml', 30),
  ('1/2 xícara de chá', 'cup', 120, 'Aproximadamente 120ml', 31),
  ('1 xícara de chá', 'cup', 240, 'Aproximadamente 240ml', 32),
  ('1 unidade pequena', 'unit', 50, 'Unidade pequena (~50g)', 40),
  ('1 unidade média', 'unit', 100, 'Unidade média (~100g)', 41),
  ('1 unidade grande', 'unit', 150, 'Unidade grande (~150g)', 42),
  ('1 unidade', 'unit', 80, 'Unidade padrão (~80g)', 43),
  ('1 fatia fina', 'slice', 20, 'Fatia fina (~20g)', 50),
  ('1 fatia média', 'slice', 30, 'Fatia média (~30g)', 51),
  ('1 fatia grossa', 'slice', 50, 'Fatia grossa (~50g)', 52),
  ('1 pedaço pequeno', 'piece', 30, 'Pedaço pequeno (~30g)', 60),
  ('1 pedaço médio', 'piece', 50, 'Pedaço médio (~50g)', 61),
  ('1 pedaço grande', 'piece', 80, 'Pedaço grande (~80g)', 62),
  ('1 banda', 'portion', 120, 'Uma banda (frutas, ~120g)', 72),
  ('1 prato de sobremesa', 'portion', 150, 'Prato de sobremesa (~150g)', 73),
  ('1 prato raso', 'portion', 250, 'Prato raso (~250g)', 74),
  ('1 concha pequena', 'other', 60, 'Concha pequena (~60g)', 80),
  ('1 concha média', 'other', 100, 'Concha média (~100g)', 81),
  ('1 concha grande', 'other', 150, 'Concha grande (~150g)', 82),
  ('1 copo americano (200ml)', 'other', 200, 'Copo americano (~200ml)', 85)
ON CONFLICT DO NOTHING;

-- ============================================
-- POPULAR ALIMENTOS INICIAIS
-- ============================================

DO $$
DECLARE
  tbca_id UUID;
  cereais_id UUID;
  frutas_id UUID;
  carnes_id UUID;
  aves_id UUID;
  laticinios_id UUID;
BEGIN
  SELECT id INTO tbca_id FROM nutrition_sources WHERE code = 'tbca' LIMIT 1;
  SELECT id INTO cereais_id FROM food_categories WHERE name = 'Cereais e Derivados' LIMIT 1;
  SELECT id INTO frutas_id FROM food_categories WHERE name = 'Frutas' LIMIT 1;
  SELECT id INTO carnes_id FROM food_categories WHERE name = 'Carnes e Derivados' LIMIT 1;
  SELECT id INTO aves_id FROM food_categories WHERE name = 'Aves e Derivados' LIMIT 1;
  SELECT id INTO laticinios_id FROM food_categories WHERE name = 'Laticínios' LIMIT 1;

  -- Inserir alguns alimentos básicos
  INSERT INTO foods (source_id, category_id, name, energy_kcal, protein_g, carbohydrate_g, fiber_g, lipid_g, saturated_fat_g, sodium_mg) VALUES
  (tbca_id, cereais_id, 'Arroz, integral, cozido', 124, 2.6, 25.8, 2.7, 1.0, 0.3, 1),
  (tbca_id, cereais_id, 'Arroz, branco, cozido', 128, 2.5, 28.1, 1.6, 0.2, 0.1, 1),
  (tbca_id, cereais_id, 'Aveia, flocos, crua', 394, 13.9, 66.6, 9.1, 8.5, 1.5, 5),
  (tbca_id, frutas_id, 'Banana, nanica', 92, 1.3, 23.8, 1.9, 0.1, 0.0, 0),
  (tbca_id, frutas_id, 'Maçã, com casca', 63, 0.2, 16.6, 2.0, 0.2, 0.0, 1),
  (tbca_id, carnes_id, 'Carne bovina, patinho, grelhado', 183, 32.5, 0.0, 0.0, 5.0, 1.9, 56),
  (tbca_id, aves_id, 'Frango, peito, sem pele, grelhado', 163, 31.5, 0.0, 0.0, 3.2, 0.9, 71),
  (tbca_id, laticinios_id, 'Leite, vaca, integral', 61, 2.9, 4.6, 0.0, 3.2, 1.9, 43)
  ON CONFLICT DO NOTHING;

  -- Adicionar medida "100 gramas" para todos os alimentos
  INSERT INTO food_measures (food_id, measure_name, grams, is_default)
  SELECT id, '100 gramas', 100, true FROM foods
  ON CONFLICT DO NOTHING;

  -- Adicionar algumas medidas caseiras específicas
  INSERT INTO food_measures (food_id, measure_name, grams, is_default)
  SELECT id, 'colher de sopa', 30, false FROM foods WHERE name LIKE 'Arroz%cozido'
  UNION ALL SELECT id, 'colher de sopa', 15, false FROM foods WHERE name = 'Aveia, flocos, crua'
  UNION ALL SELECT id, 'unidade', 100, false FROM foods WHERE name = 'Banana, nanica'
  UNION ALL SELECT id, 'unidade média', 130, false FROM foods WHERE name = 'Maçã, com casca'
  UNION ALL SELECT id, 'filé médio', 120, false FROM foods WHERE name LIKE '%grelhado'
  UNION ALL SELECT id, 'copo americano (200ml)', 200, false FROM foods WHERE name LIKE 'Leite%'
  ON CONFLICT DO NOTHING;

END $$;

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_measures ENABLE ROW LEVEL SECURITY;
ALTER TABLE reference_measures ENABLE ROW LEVEL SECURITY;

-- Foods: Ver alimentos oficiais + próprios customizados
CREATE POLICY "View foods" ON foods
  FOR SELECT TO authenticated
  USING (is_custom = false OR created_by = auth.uid());

CREATE POLICY "Create custom foods" ON foods
  FOR INSERT TO authenticated
  WITH CHECK (is_custom = true AND created_by = auth.uid());

CREATE POLICY "Update own custom foods" ON foods
  FOR UPDATE TO authenticated
  USING (is_custom = true AND created_by = auth.uid());

CREATE POLICY "Delete own custom foods" ON foods
  FOR DELETE TO authenticated
  USING (is_custom = true AND created_by = auth.uid());

-- Food Measures: Todos podem ver
CREATE POLICY "View food measures" ON food_measures
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Manage custom food measures" ON food_measures
  FOR ALL TO authenticated
  USING (
    food_id IN (SELECT id FROM foods WHERE created_by = auth.uid())
  );

-- Reference Measures: Todos podem ver
CREATE POLICY "View reference measures" ON reference_measures
  FOR SELECT TO authenticated
  USING (true);
