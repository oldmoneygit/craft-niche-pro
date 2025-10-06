-- Add scoring fields to questionnaire_questions table
ALTER TABLE questionnaire_questions
ADD COLUMN IF NOT EXISTS scorable BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS weight INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS option_scores JSONB DEFAULT '{}'::jsonb;

-- Add comment to explain the fields
COMMENT ON COLUMN questionnaire_questions.scorable IS 'Indica se esta pergunta deve ser pontuada';
COMMENT ON COLUMN questionnaire_questions.weight IS 'Peso da pergunta na pontuação final (1-10)';
COMMENT ON COLUMN questionnaire_questions.option_scores IS 'Pontuação de cada opção em formato {"opcao": pontos}';