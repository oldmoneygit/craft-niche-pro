/*
  # Sistema de Recordatório Alimentar

  1. Novas Tabelas
    - `food_records` - Registro de alimentação diária do paciente
      - `id` (uuid, primary key)
      - `client_id` (uuid, referencia clients)
      - `record_date` (date, data do registro)
      - `notes` (text, observações gerais)
      - `created_by` (uuid, referencia profiles)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `record_meals` - Refeições do recordatório
      - `id` (uuid, primary key)
      - `record_id` (uuid, referencia food_records)
      - `meal_time` (time, horário da refeição)
      - `meal_name` (text, nome da refeição)
      - `notes` (text, observações da refeição)
      - `order_index` (integer, ordem de exibição)
      - `created_at` (timestamptz)
    
    - `record_items` - Itens alimentares do recordatório
      - `id` (uuid, primary key)
      - `record_meal_id` (uuid, referencia record_meals)
      - `food_id` (uuid, referencia foods)
      - `measure_id` (uuid, referencia food_measures)
      - `quantity` (numeric, quantidade)
      - `grams_total` (numeric, total em gramas)
      - `kcal_total` (numeric, calorias totais)
      - `protein_total` (numeric, proteínas totais)
      - `carb_total` (numeric, carboidratos totais)
      - `fat_total` (numeric, gorduras totais)
      - `created_at` (timestamptz)

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas para usuários autenticados acessarem apenas seus próprios dados
    - Cascade delete para manter integridade referencial

  3. Índices
    - Otimização para queries por cliente e data
    - Índices para relacionamentos CASCADE
*/

-- Tabela principal de recordatórios
CREATE TABLE IF NOT EXISTS food_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  record_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_by uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de refeições do recordatório
CREATE TABLE IF NOT EXISTS record_meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id uuid REFERENCES food_records(id) ON DELETE CASCADE NOT NULL,
  meal_time time NOT NULL,
  meal_name text NOT NULL,
  notes text,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Tabela de itens alimentares do recordatório
CREATE TABLE IF NOT EXISTS record_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_meal_id uuid REFERENCES record_meals(id) ON DELETE CASCADE NOT NULL,
  food_id uuid REFERENCES foods(id) NOT NULL,
  measure_id uuid REFERENCES food_measures(id),
  quantity numeric NOT NULL DEFAULT 1,
  grams_total numeric NOT NULL DEFAULT 0,
  kcal_total numeric NOT NULL DEFAULT 0,
  protein_total numeric NOT NULL DEFAULT 0,
  carb_total numeric NOT NULL DEFAULT 0,
  fat_total numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_food_records_client ON food_records(client_id);
CREATE INDEX IF NOT EXISTS idx_food_records_date ON food_records(record_date);
CREATE INDEX IF NOT EXISTS idx_food_records_created_by ON food_records(created_by);
CREATE INDEX IF NOT EXISTS idx_record_meals_record ON record_meals(record_id);
CREATE INDEX IF NOT EXISTS idx_record_items_meal ON record_items(record_meal_id);
CREATE INDEX IF NOT EXISTS idx_record_items_food ON record_items(food_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_food_records_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'food_records_updated_at'
  ) THEN
    CREATE TRIGGER food_records_updated_at
      BEFORE UPDATE ON food_records
      FOR EACH ROW
      EXECUTE FUNCTION update_food_records_updated_at();
  END IF;
END $$;

-- Habilitar RLS
ALTER TABLE food_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE record_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE record_items ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para food_records
CREATE POLICY "Users can view their own food records"
  ON food_records FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Users can create their own food records"
  ON food_records FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own food records"
  ON food_records FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete their own food records"
  ON food_records FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Políticas de segurança para record_meals
CREATE POLICY "Users can view record meals from their food records"
  ON record_meals FOR SELECT
  TO authenticated
  USING (
    record_id IN (
      SELECT id FROM food_records WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create record meals in their food records"
  ON record_meals FOR INSERT
  TO authenticated
  WITH CHECK (
    record_id IN (
      SELECT id FROM food_records WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update record meals in their food records"
  ON record_meals FOR UPDATE
  TO authenticated
  USING (
    record_id IN (
      SELECT id FROM food_records WHERE created_by = auth.uid()
    )
  )
  WITH CHECK (
    record_id IN (
      SELECT id FROM food_records WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete record meals from their food records"
  ON record_meals FOR DELETE
  TO authenticated
  USING (
    record_id IN (
      SELECT id FROM food_records WHERE created_by = auth.uid()
    )
  );

-- Políticas de segurança para record_items
CREATE POLICY "Users can view record items from their food records"
  ON record_items FOR SELECT
  TO authenticated
  USING (
    record_meal_id IN (
      SELECT rm.id FROM record_meals rm
      JOIN food_records fr ON fr.id = rm.record_id
      WHERE fr.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create record items in their food records"
  ON record_items FOR INSERT
  TO authenticated
  WITH CHECK (
    record_meal_id IN (
      SELECT rm.id FROM record_meals rm
      JOIN food_records fr ON fr.id = rm.record_id
      WHERE fr.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update record items in their food records"
  ON record_items FOR UPDATE
  TO authenticated
  USING (
    record_meal_id IN (
      SELECT rm.id FROM record_meals rm
      JOIN food_records fr ON fr.id = rm.record_id
      WHERE fr.created_by = auth.uid()
    )
  )
  WITH CHECK (
    record_meal_id IN (
      SELECT rm.id FROM record_meals rm
      JOIN food_records fr ON fr.id = rm.record_id
      WHERE fr.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete record items from their food records"
  ON record_items FOR DELETE
  TO authenticated
  USING (
    record_meal_id IN (
      SELECT rm.id FROM record_meals rm
      JOIN food_records fr ON fr.id = rm.record_id
      WHERE fr.created_by = auth.uid()
    )
  );