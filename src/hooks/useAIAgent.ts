import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAIAgent = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const searchKnowledgeWithAI = async (query: string, tenantId: string) => {
    if (!tenantId || !query.trim()) return null;

    setIsProcessing(true);
    try {
      // Chamar edge function que faz a integração com OpenAI de forma segura
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { message: query, tenantId }
      });

      if (error) {
        console.error('Error calling ai-chat function:', error);
        throw error;
      }

      return {
        answer: data.answer,
        usedKnowledge: data.usedKnowledge
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
