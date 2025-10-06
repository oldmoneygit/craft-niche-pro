import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from './useTenantId';
import type { Database } from '@/types/database.types';
import { useToast } from './use-toast';
import { startOfMonth, subDays } from 'date-fns';

type Client = Database['public']['Tables']['clients']['Row'];
type ClientInsert = Database['public']['Tables']['clients']['Insert'];
type ClientUpdate = Database['public']['Tables']['clients']['Update'];

export interface ClientWithStats extends Client {
  appointments_count?: number;
  last_appointment?: string;
  services?: Array<{
    name: string;
    daysRemaining: number;
    status: string;
  }>;
}

export const useClientsData = (searchQuery: string = '') => {
  const { tenantId } = useTenantId();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch clients
  const { data: clients, isLoading, error } = useQuery({
    queryKey: ['clients', tenantId, searchQuery],
    queryFn: async () => {
      if (!tenantId) throw new Error('Tenant ID not found');

      let query = supabase
        .from('clients')
        .select(`
          *,
          appointments(count),
          service_subscriptions(
            id,
            status,
            start_date,
            end_date,
            services(name)
          )
        `)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      // Apply search filter
      if (searchQuery.trim()) {
        query = query.or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data to include stats
      return (data || []).map(client => {
        const services = client.service_subscriptions
          ?.filter(sub => sub.status === 'active')
          .map(sub => {
            const endDate = new Date(sub.end_date);
            const today = new Date();
            const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            return {
              name: sub.services?.name || 'Serviço',
              daysRemaining,
              status: sub.status
            };
          }) || [];

        return {
          ...client,
          appointments_count: client.appointments?.[0]?.count || 0,
          services
        };
      }) as ClientWithStats[];
    },
    enabled: !!tenantId,
  });

  // Client stats
  const { data: stats } = useQuery({
    queryKey: ['client-stats', tenantId],
    queryFn: async () => {
      if (!tenantId) throw new Error('Tenant ID not found');

      const monthStart = startOfMonth(new Date());
      const thirtyDaysAgo = subDays(new Date(), 30);

      // Total clients
      const { count: total } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId);

      // New clients this month
      const { count: newThisMonth } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .gte('created_at', monthStart.toISOString());

      // Active clients (with appointment in last 30 days)
      const { data: activeClients } = await supabase
        .from('appointments')
        .select('client_id')
        .eq('tenant_id', tenantId)
        .gte('datetime', thirtyDaysAgo.toISOString());

      const uniqueActiveClients = new Set(activeClients?.map(a => a.client_id) || []).size;

      // Inactive = total - active
      const inactive = (total || 0) - uniqueActiveClients;

      return {
        total: total || 0,
        newThisMonth: newThisMonth || 0,
        active: uniqueActiveClients,
        inactive
      };
    },
    enabled: !!tenantId,
  });

  // Create client
  const createClient = useMutation({
    mutationFn: async (newClient: ClientInsert) => {
      if (!tenantId) throw new Error('Tenant ID not found');

      const { data, error } = await supabase
        .from('clients')
        .insert([{ ...newClient, tenant_id: tenantId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client-stats'] });
      toast({
        title: 'Cliente criado com sucesso!',
        description: 'O novo cliente foi adicionado à sua lista.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar cliente',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update client
  const updateClient = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ClientUpdate }) => {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: 'Cliente atualizado!',
        description: 'As informações foram salvas com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar cliente',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete client
  const deleteClient = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client-stats'] });
      toast({
        title: 'Cliente removido',
        description: 'O cliente foi excluído com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao excluir cliente',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    clients,
    stats,
    isLoading,
    error,
    createClient,
    updateClient,
    deleteClient,
  };
};
