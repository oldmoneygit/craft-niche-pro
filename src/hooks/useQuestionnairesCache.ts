import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from './useTenantId';
import { toast } from 'sonner';
import { CacheStorage } from '@/lib/cacheStorage';
import { CacheMetrics } from '@/lib/cacheMetrics';

// Configurações de cache otimizadas por tipo de dados
export const CACHE_CONFIGS = {
  questionnaires: {
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 30 * 60 * 1000, // 30 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  },
  templates: {
    staleTime: 30 * 60 * 1000, // 30 minutos
    cacheTime: 2 * 60 * 60 * 1000, // 2 horas
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  },
  responses: {
    staleTime: 2 * 60 * 1000, // 2 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
  },
  details: {
    staleTime: 10 * 60 * 1000, // 10 minutos
    cacheTime: 30 * 60 * 1000, // 30 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  }
};

// Hook para lista de questionários (metadados básicos)
export const useQuestionnairesList = () => {
  const { tenantId } = useTenantId();
  
  return useQuery({
    queryKey: ['questionnaires-list', tenantId],
    queryFn: async () => {
      const startTime = Date.now();
      if (!tenantId) return [];
      
      const { data, error } = await supabase
        .from('questionnaires')
        .select(`
          id,
          title,
          category,
          description,
          estimated_time,
          is_active,
          created_at,
          updated_at,
          question_count,
          questionnaire_responses(
            id,
            status
          )
        `)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      CacheMetrics.trackQueryTime('questionnaires-list', startTime);
      
      // Calcular stats na aplicação (mais eficiente)
      return data.map(q => ({
        ...q,
        response_count: q.questionnaire_responses?.filter((r: any) => r.status === 'completed').length || 0,
        completion_rate: calculateCompletionRate(q.questionnaire_responses || []),
      }));
    },
    ...CACHE_CONFIGS.questionnaires,
    enabled: !!tenantId,
  });
};

// Hook para detalhes completos de um questionário
export const useQuestionnaireDetails = (questionnaireId: string) => {
  return useQuery({
    queryKey: ['questionnaire-details', questionnaireId],
    queryFn: async () => {
      const startTime = Date.now();
      if (!questionnaireId) return null;
      
      const { data, error } = await supabase
        .from('questionnaires')
        .select(`
          *,
          questionnaire_questions(
            id,
            question_text,
            question_type,
            options,
            is_required,
            order_index,
            section,
            scorable,
            weight,
            option_scores
          )
        `)
        .eq('id', questionnaireId)
        .single();

      if (error) throw error;
      
      CacheMetrics.trackQueryTime('questionnaire-details', startTime);
      
      return {
        ...data,
        questions: data.questionnaire_questions?.sort((a: any, b: any) => a.order_index - b.order_index) || []
      };
    },
    ...CACHE_CONFIGS.details,
    enabled: !!questionnaireId,
  });
};

// Hook para templates (com cache persistente)
export const useQuestionnaireTemplates = () => {
  return useQuery({
    queryKey: ['questionnaire-templates'],
    queryFn: async () => {
      const startTime = Date.now();
      
      // Tentar buscar do cache primeiro
      const cachedData = CacheStorage.get('questionnaire-templates');
      if (cachedData) {
        CacheMetrics.trackCacheHit('questionnaire-templates');
        return cachedData;
      }
      
      CacheMetrics.trackCacheMiss('questionnaire-templates');
      
      const { data, error } = await supabase
        .from('questionnaire_templates')
        .select('*')
        .order('name');

      if (error) throw error;
      
      CacheMetrics.trackQueryTime('questionnaire-templates', startTime);
      
      // Salvar no cache
      CacheStorage.set('questionnaire-templates', data);
      
      return data;
    },
    ...CACHE_CONFIGS.templates,
    initialData: () => CacheStorage.get('questionnaire-templates'),
  });
};

// Hook para respostas de um questionário
export const useQuestionnaireResponses = (questionnaireId: string) => {
  return useQuery({
    queryKey: ['questionnaire-responses', questionnaireId],
    queryFn: async () => {
      const startTime = Date.now();
      if (!questionnaireId) return [];
      
      const { data, error } = await supabase
        .from('questionnaire_responses')
        .select(`
          *,
          clients(name, email, phone)
        `)
        .eq('questionnaire_id', questionnaireId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      CacheMetrics.trackQueryTime('questionnaire-responses', startTime);
      
      return data;
    },
    ...CACHE_CONFIGS.responses,
    enabled: !!questionnaireId,
  });
};

// Hook para prefetch inteligente
export const useQuestionnairePrefetch = () => {
  const queryClient = useQueryClient();
  const { tenantId } = useTenantId();

  const prefetchTemplates = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: ['questionnaire-templates'],
      queryFn: async () => {
        const cachedData = CacheStorage.get('questionnaire-templates');
        if (cachedData) return cachedData;
        
        const { data, error } = await supabase
          .from('questionnaire_templates')
          .select('*')
          .order('name');

        if (error) throw error;
        
        CacheStorage.set('questionnaire-templates', data);
        return data;
      },
      staleTime: 30 * 60 * 1000,
    });
  }, [queryClient]);

  const prefetchQuestionnaire = useCallback((id: string) => {
    queryClient.prefetchQuery({
      queryKey: ['questionnaire-details', id],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('questionnaires')
          .select(`
            *,
            questionnaire_questions(
              id,
              question_text,
              question_type,
              options,
              is_required,
              order_index,
              section,
              scorable,
              weight,
              option_scores
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        
        return {
          ...data,
          questions: data.questionnaire_questions?.sort((a: any, b: any) => a.order_index - b.order_index) || []
        };
      },
      staleTime: 10 * 60 * 1000,
    });
  }, [queryClient]);

  // Prefetch na inicialização
  useEffect(() => {
    if (tenantId) {
      prefetchTemplates();
    }
  }, [tenantId, prefetchTemplates]);

  return { prefetchTemplates, prefetchQuestionnaire };
};

// Hook para invalidação inteligente de cache
export const useQuestionnaireCache = () => {
  const queryClient = useQueryClient();

  const invalidateOnCreate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['questionnaires-list'] });
    queryClient.invalidateQueries({ queryKey: ['questionnaires-stats'] });
  }, [queryClient]);

  const invalidateOnUpdate = useCallback((questionnaireId: string) => {
    queryClient.invalidateQueries({ queryKey: ['questionnaire-details', questionnaireId] });
    queryClient.invalidateQueries({ queryKey: ['questionnaires-list'] });
  }, [queryClient]);

  const invalidateOnDelete = useCallback((questionnaireId: string) => {
    queryClient.removeQueries({ queryKey: ['questionnaire-details', questionnaireId] });
    queryClient.invalidateQueries({ queryKey: ['questionnaires-list'] });
  }, [queryClient]);

  const invalidateResponses = useCallback((questionnaireId: string) => {
    queryClient.invalidateQueries({ queryKey: ['questionnaire-responses', questionnaireId] });
  }, [queryClient]);

  return {
    invalidateOnCreate,
    invalidateOnUpdate,
    invalidateOnDelete,
    invalidateResponses,
  };
};

// Função auxiliar para calcular taxa de conclusão
const calculateCompletionRate = (responses: any[]): number => {
  if (!responses.length) return 0;
  
  const completed = responses.filter(r => r.status === 'completed').length;
  return Math.round((completed / responses.length) * 100);
};
