import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from './useTenantId';
import { useToast } from '@/hooks/use-toast';

export interface FAQItem {
  id: string;
  tenant_id: string;
  question: string;
  answer: string;
  category: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const useFAQItems = () => {
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { tenantId, loading: tenantLoading } = useTenantId();
  const { toast } = useToast();

  const fetchFAQItems = async () => {
    if (!tenantId || tenantLoading) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('faq_items')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFaqItems(data || []);
    } catch (error) {
      console.error('Error fetching FAQ items:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as perguntas frequentes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!tenantLoading && tenantId) {
      fetchFAQItems();
    }
  }, [tenantId, tenantLoading]);

  const createFAQItem = async (data: Omit<FAQItem, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>) => {
    if (!tenantId) return null;

    try {
      const { data: newItem, error } = await supabase
        .from('faq_items')
        .insert({
          ...data,
          tenant_id: tenantId,
        })
        .select()
        .single();

      if (error) throw error;

      setFaqItems(prev => [newItem, ...prev]);
      toast({
        title: "Sucesso",
        description: "Pergunta frequente criada com sucesso",
      });
      return newItem;
    } catch (error) {
      console.error('Error creating FAQ item:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a pergunta frequente",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateFAQItem = async (id: string, data: Partial<FAQItem>) => {
    try {
      const { data: updatedItem, error } = await supabase
        .from('faq_items')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setFaqItems(prev => prev.map(item => item.id === id ? updatedItem : item));
      toast({
        title: "Sucesso",
        description: "Pergunta frequente atualizada com sucesso",
      });
      return updatedItem;
    } catch (error) {
      console.error('Error updating FAQ item:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a pergunta frequente",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteFAQItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('faq_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setFaqItems(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Sucesso",
        description: "Pergunta frequente excluída com sucesso",
      });
    } catch (error) {
      console.error('Error deleting FAQ item:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a pergunta frequente",
        variant: "destructive",
      });
    }
  };

  const searchFAQItems = (query: string): FAQItem[] => {
    if (!query.trim()) return faqItems.filter(item => item.active);

    const normalizedQuery = query
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Remove accents

    return faqItems.filter(item => {
      if (!item.active) return false;
      
      const normalizedQuestion = item.question
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      
      const normalizedAnswer = item.answer
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      return normalizedQuestion.includes(normalizedQuery) || 
             normalizedAnswer.includes(normalizedQuery);
    });
  };

  return {
    faqItems,
    loading,
    createFAQItem,
    updateFAQItem,
    deleteFAQItem,
    searchFAQItems,
    refresh: fetchFAQItems,
  };
};