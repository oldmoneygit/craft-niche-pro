import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from './useTenantId';
import { toast } from '@/hooks/use-toast';

export interface Lead {
  id: string;
  tenant_id: string;
  name: string;
  email: string | null;
  phone: string;
  preferred_time_description: string | null;
  preferred_datetime: string | null;
  status: 'pending' | 'contacted' | 'scheduled' | 'converted' | 'lost';
  source: string;
  notes: string | null;
  conversation_summary: string | null;
  created_at: string;
  updated_at: string | null;
}

export const useLeads = () => {
  const { tenantId } = useTenantId();
  const queryClient = useQueryClient();

  const { data: leads, isLoading, error } = useQuery({
    queryKey: ['leads', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Lead[];
    },
    enabled: !!tenantId
  });

  const updateLeadStatus = useMutation({
    mutationFn: async ({ leadId, newStatus }: { leadId: string; newStatus: string }) => {
      const updates: any = { status: newStatus };
      
      const { error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', leadId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({ title: 'Status atualizado com sucesso!' });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar status',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const createLead = useMutation({
    mutationFn: async (newLead: { name: string; phone: string; email?: string; preferred_time_description?: string; notes?: string; status: string; source: string }) => {
      if (!tenantId) throw new Error('Tenant ID não encontrado');
      
      const { error } = await supabase
        .from('leads')
        .insert([{ ...newLead, tenant_id: tenantId }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({ title: 'Lead adicionado com sucesso!' });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao adicionar lead',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const deleteLead = useMutation({
    mutationFn: async (leadId: string) => {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({ title: 'Lead excluído com sucesso!' });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir lead',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  return {
    leads,
    isLoading,
    error,
    updateLeadStatus,
    createLead,
    deleteLead
  };
};
