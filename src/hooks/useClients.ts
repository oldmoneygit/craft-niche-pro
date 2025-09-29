import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Client {
  id: string;
  tenant_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  birth_date: string | null;
  weight_current: number | null;
  height: number | null;
  goal: string | null;
  allergies: string | null;
  created_at: string;
  updated_at: string;
}

export function useClients(tenantId: string | undefined) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchClients = async () => {
    if (!user || !tenantId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching clients:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os clientes.',
          variant: 'destructive',
        });
      } else {
        setClients(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Erro',
        description: 'Erro inesperado ao carregar clientes.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [tenantId, user]);

  const createClient = async (clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'> & { name: string }) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([clientData])
        .select()
        .single();

      if (error) {
        console.error('Error creating client:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível criar o cliente.',
          variant: 'destructive',
        });
        return null;
      }

      setClients(prev => [data, ...prev]);
      toast({
        title: 'Sucesso',
        description: 'Cliente criado com sucesso!',
      });
      return data;
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Erro',
        description: 'Erro inesperado ao criar cliente.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating client:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível atualizar o cliente.',
          variant: 'destructive',
        });
        return null;
      }

      setClients(prev => prev.map(client => 
        client.id === id ? data : client
      ));
      toast({
        title: 'Sucesso',
        description: 'Cliente atualizado com sucesso!',
      });
      return data;
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Erro',
        description: 'Erro inesperado ao atualizar cliente.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteClient = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting client:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível deletar o cliente.',
          variant: 'destructive',
        });
        return false;
      }

      setClients(prev => prev.filter(client => client.id !== id));
      toast({
        title: 'Sucesso',
        description: 'Cliente deletado com sucesso!',
      });
      return true;
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Erro',
        description: 'Erro inesperado ao deletar cliente.',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    clients,
    loading,
    createClient,
    updateClient,
    deleteClient,
    refetch: fetchClients,
  };
}