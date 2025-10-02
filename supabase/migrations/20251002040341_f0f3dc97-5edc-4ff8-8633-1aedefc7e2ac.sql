-- Corrigir RLS para nutrition_sources e food_categories
ALTER TABLE nutrition_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_categories ENABLE ROW LEVEL SECURITY;

-- Permitir leitura pública (são tabelas de referência)
CREATE POLICY "Anyone can view nutrition sources" ON nutrition_sources
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view food categories" ON food_categories
  FOR SELECT USING (true);