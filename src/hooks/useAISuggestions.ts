import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useClientConfig } from '@/core/contexts/ClientConfigContext';
import { useTenant } from '@/hooks/useTenant';
import { useToast } from '@/hooks/use-toast';

export interface AISuggestion {
  id: string;
  tenant_id: string;
  type: 'no_return' | 'positive_evolution' | 'missed_appointments' | 'pending_messages';
  priority: 1 | 2 | 3; // 1=alta, 2=média, 3=baixa
  data: any;
  resolved: boolean;
  created_at: string;
  updated_at: string;
}

export const useAISuggestions = () => {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const { clientConfig } = useClientConfig();
  const { tenant } = useTenant(clientConfig?.subdomain || '');
  const { toast } = useToast();

  const fetchSuggestions = async () => {
    if (!tenant?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_suggestions')
        .select('*')
        .eq('tenant_id', tenant.id)
        .eq('resolved', false)
        .order('priority', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSuggestions((data || []) as AISuggestion[]);
    } catch (error) {
      console.error('Error fetching AI suggestions:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as sugestões da IA",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [tenant?.id]);

  const createSuggestion = async (data: Omit<AISuggestion, 'id' | 'tenant_id' | 'created_at' | 'updated_at' | 'resolved'>) => {
    if (!tenant?.id) return null;

    try {
      const { data: newSuggestion, error } = await supabase
        .from('ai_suggestions')
        .insert({
          ...data,
          tenant_id: tenant.id,
        })
        .select()
        .single();

      if (error) throw error;

      setSuggestions(prev => [newSuggestion as AISuggestion, ...prev]);
      return newSuggestion;
    } catch (error) {
      console.error('Error creating AI suggestion:', error);
      return null;
    }
  };

  const markAsResolved = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ai_suggestions')
        .update({ resolved: true })
        .eq('id', id);

      if (error) throw error;

      setSuggestions(prev => prev.filter(s => s.id !== id));
      toast({
        title: "Sugestão resolvida",
        description: "A sugestão foi marcada como resolvida",
      });
    } catch (error) {
      console.error('Error resolving suggestion:', error);
      toast({
        title: "Erro",
        description: "Não foi possível resolver a sugestão",
        variant: "destructive",
      });
    }
  };

  const ignoreSuggestion = async (id: string) => {
    await markAsResolved(id);
  };

  const postponeSuggestion = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ai_suggestions')
        .update({ 
          created_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // +24h
        })
        .eq('id', id);

      if (error) throw error;

      setSuggestions(prev => prev.filter(s => s.id !== id));
      toast({
        title: "Sugestão adiada",
        description: "A sugestão aparecerá novamente amanhã",
      });
    } catch (error) {
      console.error('Error postponing suggestion:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adiar a sugestão",
        variant: "destructive",
      });
    }
  };

  return {
    suggestions,
    loading,
    createSuggestion,
    markAsResolved,
    ignoreSuggestion,
    postponeSuggestion,
    refresh: fetchSuggestions,
  };
};