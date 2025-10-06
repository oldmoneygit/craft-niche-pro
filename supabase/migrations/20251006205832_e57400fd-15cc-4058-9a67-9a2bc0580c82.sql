-- Permitir que perguntas sejam visualizadas publicamente quando há um token público válido
CREATE POLICY "Public can view questions via response token"
ON questionnaire_questions
FOR SELECT
USING (
  questionnaire_id IN (
    SELECT questionnaire_id 
    FROM questionnaire_responses 
    WHERE public_token IS NOT NULL
  )
);