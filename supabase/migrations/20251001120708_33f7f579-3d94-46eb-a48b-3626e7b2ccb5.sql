-- Criar tabela knowledge_base
CREATE TABLE IF NOT EXISTS knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('faq', 'policy', 'content', 'service', 'tone')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

-- Política: Usuários gerenciam conhecimento do próprio tenant
CREATE POLICY "Users manage own knowledge" ON knowledge_base
  FOR ALL USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid())
  );

-- Índices para performance
CREATE INDEX idx_knowledge_tenant ON knowledge_base(tenant_id, active);
CREATE INDEX idx_knowledge_keywords ON knowledge_base USING GIN(keywords);

-- Trigger para updated_at
CREATE TRIGGER update_knowledge_updated_at 
  BEFORE UPDATE ON knowledge_base
  FOR EACH ROW 
  EXECUTE PROCEDURE update_updated_at_column();