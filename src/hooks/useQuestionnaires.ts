import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from './useTenantId';
import { toast } from 'sonner';
import { CacheMetrics } from '@/lib/cacheMetrics';
import { CacheStorage } from '@/lib/cacheStorage';

export interface Question {
  id?: string;
  question_text: string;
  question_type: 'text' | 'textarea' | 'single_choice' | 'multiple_choice' | 'scale' | 'yes_no' | 'date' | 'number';
  options?: string[];
  is_required: boolean;
  order_index: number;
  section?: string;
  scorable?: boolean;
  weight?: number;
  option_scores?: Record<string, number>;
}

export interface Questionnaire {
  id: string;
  tenant_id: string;
  title: string;
  category: string;
  description?: string;
  estimated_time?: number;
  is_active: boolean;
  question_count: number;
  created_at: string;
  updated_at: string;
  questions?: Question[];
  response_count?: number;
  completion_rate?: number;
}

export function useQuestionnaires() {
  const { tenantId } = useTenantId();
  const queryClient = useQueryClient();

  const { data: questionnaires, isLoading } = useQuery({
    queryKey: ['questionnaires', tenantId],
    queryFn: async () => {
      const startTime = Date.now();
      if (!tenantId) return [];

      // Query otimizada com JOIN para evitar N+1
      const { data, error } = await supabase
        .from('questionnaires')
        .select(`
          id,
          tenant_id,
          title,
          category,
          description,
          estimated_time,
          is_active,
          question_count,
          created_at,
          updated_at,
          questionnaire_responses(
            id,
            status
          )
        `)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) {
        CacheMetrics.trackQueryTime('questionnaires-list', startTime, error.message);
        throw error;
      }

      CacheMetrics.trackQueryTime('questionnaires-list', startTime);

      // Calcular stats na aplicação (mais eficiente que múltiplas queries)
      return data.map(q => {
        const responses = q.questionnaire_responses || [];
        const total = responses.length;
        const completed = responses.filter(r => r.status === 'completed').length;
        const completion_rate = total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
          ...q,
          response_count: completed,
          completion_rate,
          // Remover dados desnecessários para a lista
          questionnaire_responses: undefined,
        };
      });
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos (renomeado de cacheTime)
    refetchOnWindowFocus: false,
    enabled: !!tenantId,
  });

  const createQuestionnaire = useMutation({
    mutationFn: async (data: {
      title: string;
      category: string;
      description?: string;
      estimated_time?: number;
      questions: Question[];
    }) => {
      if (!tenantId) throw new Error('No tenant');

      // Criar questionário
      const { data: questionnaire, error: qError } = await supabase
        .from('questionnaires')
        .insert([{
          tenant_id: tenantId,
          title: data.title,
          category: data.category,
          description: data.description,
          estimated_time: data.estimated_time,
          is_active: true,
          question_count: data.questions.length,
          questions: [],
        }])
        .select()
        .single();

      if (qError) throw qError;

      // Criar perguntas
      const questionsToCreate = data.questions.map((q, index) => ({
        questionnaire_id: questionnaire.id,
        question_text: q.question_text,
        question_type: q.question_type,
        options: q.options || null,
        is_required: q.is_required || false,
        order_index: index,
        section: q.section || null,
        scorable: q.scorable || false,
        weight: q.weight || 1,
        option_scores: q.option_scores || {}
      }));

      const { error: questionsError } = await supabase
        .from('questionnaire_questions')
        .insert(questionsToCreate);

      if (questionsError) throw questionsError;

      return questionnaire;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionnaires'] });
      toast.success('Questionário criado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar questionário:', error);
      toast.error('Erro ao criar questionário');
    },
  });

  const updateQuestionnaire = useMutation({
    mutationFn: async (data: {
      id: string;
      title: string;
      category: string;
      description?: string;
      estimated_time?: number;
      questions: Question[];
    }) => {
      // Atualizar questionário
      const { error: qError } = await supabase
        .from('questionnaires')
        .update({
          title: data.title,
          category: data.category,
          description: data.description,
          estimated_time: data.estimated_time,
          question_count: data.questions.length,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id);

      if (qError) throw qError;

      // Deletar perguntas antigas
      await supabase
        .from('questionnaire_questions')
        .delete()
        .eq('questionnaire_id', data.id);

      // Criar novas perguntas
      const questionsToCreate = data.questions.map((q, index) => ({
        questionnaire_id: data.id,
        question_text: q.question_text,
        question_type: q.question_type,
        options: q.options || null,
        is_required: q.is_required || false,
        order_index: index,
        section: q.section || null,
        scorable: q.scorable || false,
        weight: q.weight || 1,
        option_scores: q.option_scores || {}
      }));

      const { error: questionsError } = await supabase
        .from('questionnaire_questions')
        .insert(questionsToCreate);

      if (questionsError) throw questionsError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionnaires'] });
      toast.success('Questionário atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar questionário:', error);
      toast.error('Erro ao atualizar questionário');
    },
  });

  const deleteQuestionnaire = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('questionnaires')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionnaires'] });
      toast.success('Questionário excluído com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao excluir questionário:', error);
      toast.error('Erro ao excluir questionário');
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('questionnaires')
        .update({ is_active })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionnaires'] });
      toast.success('Status atualizado!');
    },
  });

  const sendToClient = useMutation({
    mutationFn: async (data: {
      questionnaire_id: string;
      client_id: string;
      custom_message?: string;
    }) => {
      if (!tenantId) throw new Error('No tenant');

      // Criar resposta pendente
      const { data: response, error } = await supabase
        .from('questionnaire_responses')
        .insert([{
          questionnaire_id: data.questionnaire_id,
          client_id: data.client_id,
          tenant_id: tenantId,
          status: 'pending',
          public_token: crypto.randomUUID(),
          answers: {},
        }])
        .select()
        .single();

      if (error) throw error;

      // TODO: Enviar notificação/email para o cliente
      return response;
    },
    onSuccess: () => {
      toast.success('Questionário enviado ao cliente!');
    },
    onError: (error) => {
      console.error('Erro ao enviar questionário:', error);
      toast.error('Erro ao enviar questionário');
    },
  });

  return {
    questionnaires: questionnaires || [],
    isLoading,
    createQuestionnaire,
    updateQuestionnaire,
    deleteQuestionnaire,
    toggleActive,
    sendToClient,
  };
}