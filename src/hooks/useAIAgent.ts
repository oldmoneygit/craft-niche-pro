import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Apenas para MVP - em produção usar backend
});

export const useAIAgent = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const searchKnowledgeWithAI = async (query: string, tenantId: string) => {
    if (!tenantId || !query.trim()) return null;

    setIsProcessing(true);
    try {
      // 1. Buscar toda base de conhecimento do tenant
      const { data: knowledge, error } = await supabase
        .from('knowledge_base')
        .select('id, category, title, content, usage_count')
        .eq('tenant_id', tenantId)
        .eq('active', true);

      if (error) throw error;

      // Se não tem conhecimento cadastrado
      if (!knowledge || knowledge.length === 0) {
        return {
          answer: "Ainda não tenho informações cadastradas para responder isso. Quer agendar uma consulta para conversarmos?",
          usedKnowledge: null
        };
      }

      // 2. Preparar contexto estruturado para OpenAI
      const knowledgeContext = knowledge
        .map(k => `[CATEGORIA: ${k.category}]\nTÍTULO: ${k.title}\nCONTEÚDO: ${k.content}`)
        .join('\n\n---\n\n');

      // 3. Chamar OpenAI com instruções específicas
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Você é o assistente virtual de um nutricionista. Sua função é ajudar pacientes e leads com informações básicas.

REGRAS OBRIGATÓRIAS:
1. Use APENAS as informações fornecidas no CONHECIMENTO abaixo
2. Se a pergunta não está coberta no conhecimento, responda: "Para te responder corretamente, preciso que você agende uma consulta com o nutricionista"
3. NUNCA invente informações nutricionais ou médicas
4. Seja acolhedor, use linguagem simples e amigável
5. Para dúvidas complexas ou específicas, sempre sugira agendamento
6. Se mencionar preços, horários ou políticas, use EXATAMENTE o que está no conhecimento
7. Responda em português brasileiro, de forma natural

CONHECIMENTO DO NUTRICIONISTA:
${knowledgeContext}

Se a pergunta for sobre agendamento, preços ou disponibilidade, use as informações da categoria "policy" ou "service".`
          },
          {
            role: "user",
            content: query
          }
        ],
        temperature: 0.7,
        max_tokens: 350
      });

      const answer = response.choices[0].message.content;

      // 4. Tentar identificar qual conhecimento foi usado (análise simples)
      let usedKnowledgeId = null;
      for (const k of knowledge) {
        if (answer && answer.toLowerCase().includes(k.title.toLowerCase().split(' ')[0])) {
          usedKnowledgeId = k.id;
          // Incrementar contador de uso
          await supabase
            .from('knowledge_base')
            .update({ usage_count: k.usage_count + 1 })
            .eq('id', k.id);
          break;
        }
      }

      return {
        answer,
        usedKnowledge: usedKnowledgeId
      };

    } catch (error) {
      console.error('Error with AI search:', error);
      return {
        answer: "Desculpe, tive um problema técnico. Tente novamente em instantes.",
        usedKnowledge: null
      };
    } finally {
      setIsProcessing(false);
    }
  };

  // Função auxiliar para detectar intenção de agendamento
  const detectSchedulingIntent = (message: string): boolean => {
    const schedulingKeywords = [
      'agendar', 'marcar', 'consulta', 'horário', 'disponível',
      'livre', 'atendimento', 'quando', 'dia', 'hora'
    ];
    const lowerMessage = message.toLowerCase();
    return schedulingKeywords.some(kw => lowerMessage.includes(kw));
  };

  return {
    searchKnowledgeWithAI,
    detectSchedulingIntent,
    isProcessing
  };
};
