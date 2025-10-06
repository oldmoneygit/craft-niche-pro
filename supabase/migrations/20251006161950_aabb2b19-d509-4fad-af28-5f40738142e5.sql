-- Verificar se as tabelas já existem e criar as que faltam

-- Tabela de perguntas dos questionários
CREATE TABLE IF NOT EXISTS public.questionnaire_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  questionnaire_id UUID NOT NULL REFERENCES public.questionnaires(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('text', 'textarea', 'single_choice', 'multiple_choice', 'scale', 'yes_no', 'date', 'number')),
  options JSONB,
  is_required BOOLEAN DEFAULT false,
  order_index INTEGER NOT NULL,
  section TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de respostas individuais
CREATE TABLE IF NOT EXISTS public.response_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  response_id UUID NOT NULL REFERENCES public.questionnaire_responses(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questionnaire_questions(id) ON DELETE CASCADE,
  answer_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar campos na tabela questionnaires se não existirem
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='questionnaires' AND column_name='category') THEN
    ALTER TABLE public.questionnaires ADD COLUMN category TEXT DEFAULT 'outro';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='questionnaires' AND column_name='estimated_time') THEN
    ALTER TABLE public.questionnaires ADD COLUMN estimated_time INTEGER;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='questionnaires' AND column_name='question_count') THEN
    ALTER TABLE public.questionnaires ADD COLUMN question_count INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='questionnaires' AND column_name='is_active') THEN
    ALTER TABLE public.questionnaires ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Adicionar campos na tabela questionnaire_responses se não existirem
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='questionnaire_responses' AND column_name='started_at') THEN
    ALTER TABLE public.questionnaire_responses ADD COLUMN started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Habilitar RLS
ALTER TABLE public.questionnaire_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.response_answers ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para questionnaire_questions
CREATE POLICY "Users can view questions from their tenant questionnaires"
ON public.questionnaire_questions FOR SELECT
USING (
  questionnaire_id IN (
    SELECT id FROM public.questionnaires 
    WHERE tenant_id IN (
      SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can create questions for their tenant questionnaires"
ON public.questionnaire_questions FOR INSERT
WITH CHECK (
  questionnaire_id IN (
    SELECT id FROM public.questionnaires 
    WHERE tenant_id IN (
      SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can update questions from their tenant questionnaires"
ON public.questionnaire_questions FOR UPDATE
USING (
  questionnaire_id IN (
    SELECT id FROM public.questionnaires 
    WHERE tenant_id IN (
      SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can delete questions from their tenant questionnaires"
ON public.questionnaire_questions FOR DELETE
USING (
  questionnaire_id IN (
    SELECT id FROM public.questionnaires 
    WHERE tenant_id IN (
      SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid()
    )
  )
);

-- Políticas RLS para response_answers
CREATE POLICY "Users can view answers from their tenant responses"
ON public.response_answers FOR SELECT
USING (
  response_id IN (
    SELECT id FROM public.questionnaire_responses 
    WHERE tenant_id IN (
      SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can create answers for their tenant responses"
ON public.response_answers FOR INSERT
WITH CHECK (
  response_id IN (
    SELECT id FROM public.questionnaire_responses 
    WHERE tenant_id IN (
      SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Public can create answers with token"
ON public.response_answers FOR INSERT
WITH CHECK (
  response_id IN (
    SELECT id FROM public.questionnaire_responses 
    WHERE public_token IS NOT NULL
  )
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_questionnaire_questions_questionnaire_id 
ON public.questionnaire_questions(questionnaire_id);

CREATE INDEX IF NOT EXISTS idx_questionnaire_questions_order 
ON public.questionnaire_questions(questionnaire_id, order_index);

CREATE INDEX IF NOT EXISTS idx_response_answers_response_id 
ON public.response_answers(response_id);

CREATE INDEX IF NOT EXISTS idx_response_answers_question_id 
ON public.response_answers(question_id);