-- Tabela de questionários (templates criados pelo nutricionista)
CREATE TABLE questionnaires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de respostas (preenchidas por pacientes)
CREATE TABLE questionnaire_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  questionnaire_id UUID REFERENCES questionnaires(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  answers JSONB NOT NULL,
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  public_token TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own questionnaires" ON questionnaires
  FOR ALL USING (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users manage own responses" ON questionnaire_responses
  FOR ALL USING (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
  ));

-- Policy pública para pacientes responderem (via token)
CREATE POLICY "Public can view questionnaire by token" ON questionnaire_responses
  FOR SELECT USING (true);

CREATE POLICY "Public can update response by token" ON questionnaire_responses
  FOR UPDATE USING (true);

-- Índices
CREATE INDEX idx_questionnaires_tenant ON questionnaires(tenant_id, active);
CREATE INDEX idx_responses_client ON questionnaire_responses(client_id);
CREATE INDEX idx_responses_token ON questionnaire_responses(public_token);

-- Trigger updated_at
CREATE TRIGGER update_questionnaires_updated_at 
  BEFORE UPDATE ON questionnaires
  FOR EACH ROW 
  EXECUTE PROCEDURE update_updated_at_column();