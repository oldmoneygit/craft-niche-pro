-- Criar função para garantir que todos os alimentos tenham medida em gramas
CREATE OR REPLACE FUNCTION ensure_gram_measure()
RETURNS void AS $$
DECLARE
  food_record RECORD;
BEGIN
  FOR food_record IN SELECT id FROM foods WHERE active = true
  LOOP
    -- Verifica se já existe medida em gramas para este alimento
    IF NOT EXISTS (
      SELECT 1 FROM food_measures 
      WHERE food_id = food_record.id 
      AND (measure_name ILIKE '%grama%' OR measure_name ILIKE '%gram%')
    ) THEN
      -- Adiciona medida padrão em gramas
      INSERT INTO food_measures (food_id, measure_name, grams, is_default)
      VALUES (food_record.id, 'gramas (100g)', 100, false);
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Executar função para adicionar medidas em gramas onde não existem
SELECT ensure_gram_measure();

-- Criar trigger para garantir que novos alimentos sempre tenham medida em gramas
CREATE OR REPLACE FUNCTION add_default_gram_measure()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO food_measures (food_id, measure_name, grams, is_default)
  VALUES (NEW.id, 'gramas (100g)', 100, false);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger que roda após inserir um novo alimento
DROP TRIGGER IF EXISTS trigger_add_default_gram_measure ON foods;
CREATE TRIGGER trigger_add_default_gram_measure
  AFTER INSERT ON foods
  FOR EACH ROW
  EXECUTE FUNCTION add_default_gram_measure();