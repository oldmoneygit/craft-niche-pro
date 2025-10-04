/*
  # Adicionar Constraint UNIQUE em food_measures

  ## Alteração
  - Adiciona constraint UNIQUE (food_id, measure_name) para evitar medidas duplicadas
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'food_measures_food_measure_unique'
  ) THEN
    ALTER TABLE food_measures 
    ADD CONSTRAINT food_measures_food_measure_unique 
    UNIQUE (food_id, measure_name);
  END IF;
END $$;
