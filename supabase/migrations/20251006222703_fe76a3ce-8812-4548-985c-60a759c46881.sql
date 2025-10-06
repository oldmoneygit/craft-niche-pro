-- Função para corrigir respostas antigas com chaves incorretas
CREATE OR REPLACE FUNCTION fix_questionnaire_responses()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  response_record RECORD;
  question_record RECORD;
  old_answers jsonb;
  new_answers jsonb;
  answer_value text;
  option_key text;
BEGIN
  -- Iterar sobre todas as respostas completadas
  FOR response_record IN 
    SELECT id, questionnaire_id, answers 
    FROM questionnaire_responses 
    WHERE status = 'completed'
  LOOP
    old_answers := response_record.answers;
    new_answers := '{}'::jsonb;
    
    -- Para cada pergunta do questionário
    FOR question_record IN 
      SELECT id, options 
      FROM questionnaire_questions 
      WHERE questionnaire_id = response_record.questionnaire_id 
      ORDER BY order_index
    LOOP
      -- Procurar a resposta nas chaves antigas
      FOR option_key IN SELECT jsonb_object_keys(old_answers)
      LOOP
        answer_value := old_answers->>option_key;
        
        -- Se a chave não é um UUID de pergunta válido (não existe na tabela questionnaire_questions)
        -- mas o valor da resposta existe nas opções da pergunta, é uma resposta antiga incorreta
        IF NOT EXISTS (SELECT 1 FROM questionnaire_questions WHERE id::text = option_key)
           AND question_record.options::jsonb ? answer_value THEN
          
          -- Adicionar ao novo objeto com a chave correta (ID da pergunta)
          new_answers := new_answers || jsonb_build_object(question_record.id::text, answer_value);
        END IF;
      END LOOP;
    END LOOP;
    
    -- Se encontramos respostas para corrigir, atualizar
    IF new_answers != '{}'::jsonb THEN
      UPDATE questionnaire_responses 
      SET answers = new_answers 
      WHERE id = response_record.id;
    END IF;
  END LOOP;
END;
$$;

-- Executar a correção
SELECT fix_questionnaire_responses();

-- Remover a função após uso
DROP FUNCTION fix_questionnaire_responses();