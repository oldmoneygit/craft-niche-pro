import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from './useTenant';
import { useToast } from '@/hooks/use-toast';

export interface Communication {
  id: string;
  tenant_id: string;
  client_id: string;
  type: 'email' | 'whatsapp' | 'sms';
  direction: 'sent' | 'received';
  content: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  template_used?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface MessageTemplate {
  id: string;
  tenant_id: string;
  name: string;
  type: 'welcome' | 'reminder' | 'follow_up' | 'custom';
  subject?: string;
  content: string;
  variables: string[];
  created_at: string;
  updated_at: string;
}

export function useCommunications() {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const { tenant } = useTenant();
  const { toast } = useToast();

  const fetchCommunications = async () => {
    if (!tenant?.id) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('communications')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCommunications((data as any) || []);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar comunicações',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    if (!tenant?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates((data as any) || []);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar templates',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const sendCommunication = async (communication: Omit<Communication, 'id' | 'tenant_id' | 'created_at'>) => {
    if (!tenant?.id) return null;

    try {
      const { data, error } = await supabase
        .from('communications')
        .insert([{ ...communication, tenant_id: tenant.id }])
        .select()
        .single();

      if (error) throw error;

      setCommunications(prev => [data as any, ...prev]);
      toast({
        title: 'Mensagem enviada',
        description: 'A comunicação foi registrada com sucesso.',
      });
      return data;
    } catch (error: any) {
      toast({
        title: 'Erro ao enviar mensagem',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const createTemplate = async (template: Omit<MessageTemplate, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>) => {
    if (!tenant?.id) return null;

    try {
      const { data, error } = await supabase
        .from('message_templates')
        .insert([{ ...template, tenant_id: tenant.id }])
        .select()
        .single();

      if (error) throw error;

      setTemplates(prev => [data as any, ...prev]);
      toast({
        title: 'Template criado',
        description: 'O template foi criado com sucesso.',
      });
      return data;
    } catch (error: any) {
      toast({
        title: 'Erro ao criar template',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateTemplate = async (id: string, updates: Partial<Omit<MessageTemplate, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>>) => {
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setTemplates(prev => prev.map(template => template.id === id ? data as any : template));
      toast({
        title: 'Template atualizado',
        description: 'As alterações foram salvas.',
      });
      return data;
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar template',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('message_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTemplates(prev => prev.filter(template => template.id !== id));
      toast({
        title: 'Template excluído',
        description: 'O template foi removido com sucesso.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir template',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (tenant?.id) {
      fetchCommunications();
      fetchTemplates();
    }
  }, [tenant?.id]);

  return {
    communications,
    templates,
    loading,
    sendCommunication,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    refetch: () => {
      fetchCommunications();
      fetchTemplates();
    },
  };
}