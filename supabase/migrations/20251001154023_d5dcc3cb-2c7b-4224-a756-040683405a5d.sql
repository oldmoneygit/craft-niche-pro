-- 1. Remover policies antigas e criar novas para questionnaire_responses
DROP POLICY IF EXISTS "Public can update response by token" ON questionnaire_responses;
DROP POLICY IF EXISTS "Public can view questionnaire by token" ON questionnaire_responses;
DROP POLICY IF EXISTS "Public can select response by token" ON questionnaire_responses;

-- Permitir UPDATE público de respostas via token válido
CREATE POLICY "Public can update response by token" ON questionnaire_responses
  FOR UPDATE 
  USING (public_token IS NOT NULL)
  WITH CHECK (public_token IS NOT NULL);

-- Permitir SELECT público de respostas via token
CREATE POLICY "Public can select response by token" ON questionnaire_responses
  FOR SELECT 
  USING (public_token IS NOT NULL);

-- 2. Criar policies para operações públicas na tabela clients
CREATE POLICY "Public can search clients by phone for linking" ON clients
  FOR SELECT
  USING (true);

CREATE POLICY "Public can insert clients" ON clients
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update clients" ON clients
  FOR UPDATE
  USING (true)
  WITH CHECK (true);