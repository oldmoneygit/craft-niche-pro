/*
  # Adicionar Colunas de Perfil Nutricional aos Clientes

  1. Novas Colunas
    - Dados biométricos: age, gender, height_cm, weight_kg, activity_level
    - Objetivo: goal, target_weight_kg
    - Restrições: dietary_restrictions, allergies, dislikes
    - Preferências: meal_preferences, budget
    - Histórico médico: medical_conditions, medications
    - Observações: notes

  2. Índices
    - idx_clients_age: para busca por idade
    - idx_clients_goal: para busca por objetivo
    - idx_clients_activity_level: para busca por nível de atividade

  3. Segurança
    - Mantém RLS existente
    - Comentários em todas as colunas para documentação

  IMPORTANTE: Execute este SQL no Supabase SQL Editor
*/

-- Adicionar colunas biométricas
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other')),
ADD COLUMN IF NOT EXISTS height_cm DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'intense', 'very_intense'));

-- Adicionar colunas de objetivo
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS goal TEXT CHECK (goal IN ('maintenance', 'weight_loss', 'muscle_gain', 'health')),
ADD COLUMN IF NOT EXISTS target_weight_kg DECIMAL(5,2);

-- Adicionar colunas de restrições (usando arrays)
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS dietary_restrictions TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS allergies TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS dislikes TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Adicionar colunas de preferências
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS meal_preferences TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS budget TEXT CHECK (budget IN ('low', 'medium', 'high'));

-- Adicionar colunas de histórico médico
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS medical_conditions TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS medications TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Adicionar observações
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_clients_age ON clients(age);
CREATE INDEX IF NOT EXISTS idx_clients_goal ON clients(goal);
CREATE INDEX IF NOT EXISTS idx_clients_activity_level ON clients(activity_level);

-- Comentários das colunas (documentação)
COMMENT ON COLUMN clients.age IS 'Idade do cliente em anos';
COMMENT ON COLUMN clients.gender IS 'Sexo do cliente: male, female, other';
COMMENT ON COLUMN clients.height_cm IS 'Altura em centímetros';
COMMENT ON COLUMN clients.weight_kg IS 'Peso em quilogramas';
COMMENT ON COLUMN clients.activity_level IS 'Nível de atividade física: sedentary, light, moderate, intense, very_intense';
COMMENT ON COLUMN clients.goal IS 'Objetivo nutricional: maintenance, weight_loss, muscle_gain, health';
COMMENT ON COLUMN clients.target_weight_kg IS 'Peso alvo em quilogramas (opcional)';
COMMENT ON COLUMN clients.dietary_restrictions IS 'Restrições alimentares (ex: vegetarian, vegan, lactose_intolerant)';
COMMENT ON COLUMN clients.allergies IS 'Alergias alimentares';
COMMENT ON COLUMN clients.dislikes IS 'Alimentos que não gosta';
COMMENT ON COLUMN clients.meal_preferences IS 'Preferências alimentares (ex: brazilian, low_carb)';
COMMENT ON COLUMN clients.budget IS 'Orçamento para alimentação: low, medium, high';
COMMENT ON COLUMN clients.medical_conditions IS 'Condições médicas relevantes';
COMMENT ON COLUMN clients.medications IS 'Medicamentos em uso';
COMMENT ON COLUMN clients.notes IS 'Observações do nutricionista';
