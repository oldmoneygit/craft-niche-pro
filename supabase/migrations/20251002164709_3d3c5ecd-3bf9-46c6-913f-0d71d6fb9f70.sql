-- Adicionar campo para observações do nutricionista na tabela foods
ALTER TABLE public.foods 
ADD COLUMN IF NOT EXISTS nutritionist_notes TEXT;