-- Tabela de leads capturados pela IA
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  preferred_datetime TIMESTAMPTZ,
  preferred_time_description TEXT,
  source TEXT DEFAULT 'ai_chat',
  conversation_summary TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'scheduled', 'rejected')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own leads" ON leads
  FOR ALL USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid())
  );

CREATE INDEX idx_leads_tenant_status ON leads(tenant_id, status);
CREATE INDEX idx_leads_created ON leads(created_at DESC);

CREATE TRIGGER update_leads_updated_at 
  BEFORE UPDATE ON leads
  FOR EACH ROW 
  EXECUTE PROCEDURE update_updated_at_column();