-- Script para atualizar cliente Jeferson de lima com dados completos
-- Execute este SQL no Supabase SQL Editor

UPDATE clients
SET
  goal = 'weight_loss',
  activity_level = 'sedentary',
  age = 35,
  gender = 'male',
  height_cm = 175,
  weight_kg = 85,
  dietary_restrictions = ARRAY[]::TEXT[],
  notes = 'Cliente configurado para teste do assistente IA'
WHERE name ILIKE '%Jeferson%';

-- Verificar se funcionou
SELECT
  name,
  age,
  gender,
  height_cm,
  weight_kg,
  activity_level,
  goal
FROM clients
WHERE name ILIKE '%Jeferson%';
