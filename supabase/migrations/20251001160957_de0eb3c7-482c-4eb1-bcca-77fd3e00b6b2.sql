-- Add score column to questionnaire_responses
ALTER TABLE questionnaire_responses 
ADD COLUMN IF NOT EXISTS score INTEGER CHECK (score >= 0 AND score <= 100);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_responses_score ON questionnaire_responses(score);

-- Add comment
COMMENT ON COLUMN questionnaire_responses.score IS 'Final calculated score (0-100) based on weighted question responses';