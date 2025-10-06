import { useState } from 'react';

// Hook temporariamente desabilitado - tabela ai_suggestions não existe no banco
// TODO: Criar tabela ai_suggestions ou remover este hook

export interface AISuggestion {
  id: string;
  tenant_id: string;
  type: 'no_return' | 'positive_evolution' | 'missed_appointments' | 'pending_messages';
  priority: 1 | 2 | 3;
  data: any;
  resolved: boolean;
  created_at: string;
  updated_at: string;
}

export const useAISuggestions = () => {
  const [suggestions] = useState<AISuggestion[]>([]);
  const [loading] = useState(false);

  const createSuggestion = async () => {
    console.warn('useAISuggestions: Tabela ai_suggestions não existe');
    return null;
  };

  const markAsResolved = async () => {
    console.warn('useAISuggestions: Tabela ai_suggestions não existe');
  };

  const ignoreSuggestion = async () => {
    console.warn('useAISuggestions: Tabela ai_suggestions não existe');
  };

  const postponeSuggestion = async () => {
    console.warn('useAISuggestions: Tabela ai_suggestions não existe');
  };

  const refresh = async () => {
    console.warn('useAISuggestions: Tabela ai_suggestions não existe');
  };

  return {
    suggestions,
    loading,
    createSuggestion,
    markAsResolved,
    ignoreSuggestion,
    postponeSuggestion,
    refresh,
  };
};
