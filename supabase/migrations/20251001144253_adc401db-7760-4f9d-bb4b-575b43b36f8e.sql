-- Permitir leitura pública de questionnaires via token
CREATE POLICY "Public can view questionnaires via token" ON questionnaires
  FOR SELECT USING (
    id IN (
      SELECT questionnaire_id 
      FROM questionnaire_responses 
      WHERE public_token IS NOT NULL
    )
  );