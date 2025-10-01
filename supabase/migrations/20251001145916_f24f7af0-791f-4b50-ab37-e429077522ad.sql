-- Adicionar campos para identificação do respondente
ALTER TABLE questionnaire_responses 
ADD COLUMN IF NOT EXISTS respondent_name TEXT,
ADD COLUMN IF NOT EXISTS respondent_phone TEXT,
ADD COLUMN IF NOT EXISTS respondent_email TEXT;

-- Criar índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_responses_phone ON questionnaire_responses(respondent_phone);