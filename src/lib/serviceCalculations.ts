/**
 * Calcula a data de término baseada na data de início e tipo de duração
 */
export const calculateEndDate = (
  startDate: Date, 
  durationType: string, 
  customDays?: number
): Date => {
  const start = new Date(startDate);
  
  const daysToAdd = {
    mensal: 30,
    trimestral: 90,
    semestral: 180,
    anual: 365,
    personalizado: customDays || 0
  }[durationType] || 0;
  
  start.setDate(start.getDate() + daysToAdd);
  return start;
};

/**
 * Calcula quantos dias faltam para o vencimento
 */
export const calculateDaysRemaining = (endDate: string | Date): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  
  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Retorna a variante da badge baseado nos dias restantes
 */
export const getDaysRemainingVariant = (daysRemaining: number): 'default' | 'secondary' | 'destructive' => {
  if (daysRemaining > 14) return 'default';
  if (daysRemaining >= 7) return 'secondary';
  return 'destructive';
};

/**
 * Retorna a cor da barra de progresso
 */
export const getProgressBarColor = (daysRemaining: number): string => {
  if (daysRemaining > 14) return 'bg-green-500';
  if (daysRemaining >= 7) return 'bg-orange-500';
  return 'bg-red-500';
};

/**
 * Calcula a porcentagem de progresso do serviço
 */
export const calculateProgress = (startDate: string | Date, endDate: string | Date): number => {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = new Date().getTime();
  
  const total = end - start;
  const elapsed = now - start;
  
  const progress = (elapsed / total) * 100;
  
  return Math.min(Math.max(progress, 0), 100);
};

/**
 * Converte valor total para equivalente mensal
 */
export const calculateMonthlyEquivalent = (
  totalValue: number, 
  durationType: string
): number => {
  const months = {
    mensal: 1,
    trimestral: 3,
    semestral: 6,
    anual: 12,
    personalizado: 1
  }[durationType] || 1;
  
  return totalValue / months;
};

/**
 * Formata data para exibição
 */
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Formata valor em Real
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

/**
 * Retorna variante da badge de modalidade
 */
export const getModalityVariant = (modality: string): 'default' | 'secondary' | 'outline' => {
  const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
    presencial: 'default',
    online: 'secondary',
    hibrido: 'outline'
  };
  return variants[modality] || 'default';
};

/**
 * Retorna variante da badge de status de pagamento
 */
export const getPaymentStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' => {
  const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
    paid: 'default',
    pending: 'secondary',
    overdue: 'destructive'
  };
  return variants[status] || 'secondary';
};
