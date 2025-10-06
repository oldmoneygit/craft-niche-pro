-- Create questionnaire_templates table
CREATE TABLE IF NOT EXISTS questionnaire_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  template_data JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for tenant_id
CREATE INDEX IF NOT EXISTS idx_questionnaire_templates_tenant ON questionnaire_templates(tenant_id);

-- Create index for category
CREATE INDEX IF NOT EXISTS idx_questionnaire_templates_category ON questionnaire_templates(category);

-- Create index for is_default
CREATE INDEX IF NOT EXISTS idx_questionnaire_templates_default ON questionnaire_templates(is_default);

-- Enable RLS
ALTER TABLE questionnaire_templates ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view default templates and their own templates
CREATE POLICY "Users can view templates" ON questionnaire_templates
  FOR SELECT
  USING (
    is_default = true 
    OR tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

-- Policy: Users can create their own templates
CREATE POLICY "Users can create templates" ON questionnaire_templates
  FOR INSERT
  WITH CHECK (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- Policy: Users can update their own templates
CREATE POLICY "Users can update templates" ON questionnaire_templates
  FOR UPDATE
  USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- Policy: Users can delete their own templates
CREATE POLICY "Users can delete templates" ON questionnaire_templates
  FOR DELETE
  USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- Insert some default templates
INSERT INTO questionnaire_templates (name, description, category, template_data, is_default)
VALUES
  (
    'Avaliação de Hábitos Alimentares',
    'Questionário completo para avaliar hábitos alimentares do paciente',
    'habitos',
    '{
      "title": "Avaliação de Hábitos Alimentares",
      "description": "Por favor, responda as perguntas sobre seus hábitos alimentares",
      "questions": [
        {
          "text": "Quantas refeições você faz por dia?",
          "type": "single_choice",
          "options": ["1-2 refeições", "3-4 refeições", "5-6 refeições", "Mais de 6"],
          "required": true
        },
        {
          "text": "Com que frequência você consome frutas e vegetais?",
          "type": "single_choice",
          "options": ["Raramente", "1-2 vezes por semana", "3-5 vezes por semana", "Diariamente"],
          "required": true
        },
        {
          "text": "Você costuma comer fora de casa?",
          "type": "single_choice",
          "options": ["Nunca", "Raramente", "1-2 vezes por semana", "3 ou mais vezes por semana"],
          "required": true
        },
        {
          "text": "Descreva seus principais desafios em relação à alimentação",
          "type": "textarea",
          "required": true
        }
      ]
    }'::jsonb,
    true
  ),
  (
    'Frequência Alimentar',
    'Avaliação de frequência de consumo de alimentos',
    'recordatorio',
    '{
      "title": "Questionário de Frequência Alimentar",
      "description": "Responda com que frequência você consome os seguintes alimentos",
      "questions": [
        {
          "text": "Com que frequência você consome carnes vermelhas?",
          "type": "single_choice",
          "options": ["Nunca", "1x por semana", "2-3x por semana", "4-6x por semana", "Diariamente"],
          "required": true
        },
        {
          "text": "Com que frequência você consome peixes?",
          "type": "single_choice",
          "options": ["Nunca", "1x por semana", "2-3x por semana", "4-6x por semana", "Diariamente"],
          "required": true
        },
        {
          "text": "Com que frequência você consome laticínios?",
          "type": "single_choice",
          "options": ["Nunca", "1x por semana", "2-3x por semana", "4-6x por semana", "Diariamente"],
          "required": true
        },
        {
          "text": "Com que frequência você consome alimentos ultraprocessados?",
          "type": "single_choice",
          "options": ["Nunca", "1x por semana", "2-3x por semana", "4-6x por semana", "Diariamente"],
          "required": true
        }
      ]
    }'::jsonb,
    true
  ),
  (
    'Satisfação com Atendimento',
    'Avalie sua satisfação com o atendimento nutricional',
    'satisfacao',
    '{
      "title": "Avaliação de Satisfação",
      "description": "Sua opinião é muito importante para melhorarmos nosso atendimento",
      "questions": [
        {
          "text": "Como você avalia a qualidade do atendimento?",
          "type": "scale",
          "required": true
        },
        {
          "text": "O plano alimentar atendeu suas expectativas?",
          "type": "scale",
          "required": true
        },
        {
          "text": "Você recomendaria nossos serviços?",
          "type": "scale",
          "required": true
        },
        {
          "text": "Deixe seus comentários e sugestões",
          "type": "textarea",
          "required": false
        }
      ]
    }'::jsonb,
    true
  ),
  (
    'Sintomas Gastrointestinais',
    'Avaliação de sintomas digestivos e gastrointestinais',
    'anamnese',
    '{
      "title": "Questionário de Sintomas Gastrointestinais",
      "description": "Ajude-nos a entender melhor seus sintomas digestivos",
      "questions": [
        {
          "text": "Você apresenta algum destes sintomas?",
          "type": "multiple_choice",
          "options": ["Azia", "Refluxo", "Gases", "Inchaço abdominal", "Constipação", "Diarreia", "Náuseas"],
          "required": true
        },
        {
          "text": "Com que frequência esses sintomas ocorrem?",
          "type": "single_choice",
          "options": ["Raramente", "1-2x por semana", "3-4x por semana", "Diariamente"],
          "required": true
        },
        {
          "text": "Os sintomas pioram após consumir algum alimento específico?",
          "type": "single_choice",
          "options": ["Sim", "Não", "Não sei"],
          "required": true
        },
        {
          "text": "Se sim, quais alimentos?",
          "type": "text",
          "required": false
        }
      ]
    }'::jsonb,
    true
  )
ON CONFLICT DO NOTHING;