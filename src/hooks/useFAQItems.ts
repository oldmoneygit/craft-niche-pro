import { useState } from 'react';

// Hook temporariamente desabilitado - tabela faq_items não existe no banco
// TODO: Criar tabela faq_items ou remover este hook

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
  const [faqItems] = useState<FAQItem[]>([]);
  const [loading] = useState(false);

  const createFAQItem = async (_data: Partial<FAQItem>) => {
    console.warn('useFAQItems: Tabela faq_items não existe');
    return null;
  };

  const updateFAQItem = async (_id: string, _data: Partial<FAQItem>) => {
    console.warn('useFAQItems: Tabela faq_items não existe');
    return null;
  };

  const deleteFAQItem = async (_id: string) => {
    console.warn('useFAQItems: Tabela faq_items não existe');
  };

  const searchFAQItems = (_query?: string): FAQItem[] => {
    return [];
  };

  const refresh = async () => {
    console.warn('useFAQItems: Tabela faq_items não existe');
  };

  return {
    faqItems,
    loading,
    createFAQItem,
    updateFAQItem,
    deleteFAQItem,
    searchFAQItems,
    refresh,
  };
};