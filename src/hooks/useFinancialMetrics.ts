import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { calculateMonthlyEquivalent } from '@/lib/serviceCalculations';

interface FinancialMetrics {
  mrr: number;
  nextMonthRevenue: number;
  pendingPayments: {
    total: number;
    count: number;
  };
  upcomingRenewals: {
    total: number;
    count: number;
  };
  loading: boolean;
}

export const useFinancialMetrics = (tenantId: string | null) => {
  const [metrics, setMetrics] = useState<FinancialMetrics>({
    mrr: 0,
    nextMonthRevenue: 0,
    pendingPayments: { total: 0, count: 0 },
    upcomingRenewals: { total: 0, count: 0 },
    loading: true
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!tenantId) return;

      try {
        // 1. Calcular MRR (Monthly Recurring Revenue)
        const { data: activeSubscriptions } = await supabase
          .from('service_subscriptions')
          .select(`
            price,
            services (duration_type)
          `)
          .eq('tenant_id', tenantId)
          .eq('status', 'active');

        const mrr = activeSubscriptions?.reduce((total, sub: any) => {
          const monthlyValue = calculateMonthlyEquivalent(
            sub.price,
            sub.services.duration_type
          );
          return total + monthlyValue;
        }, 0) || 0;

        // 2. Próximo Mês (considera renovações automáticas)
        const today = new Date();
        const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);

        const { data: nextMonthSubs } = await supabase
          .from('service_subscriptions')
          .select(`
            price,
            services (duration_type)
          `)
          .eq('tenant_id', tenantId)
          .or('status.eq.active,status.eq.expiring_soon')
          .gte('end_date', nextMonthStart.toISOString().split('T')[0]);

        const nextMonthRevenue = nextMonthSubs?.reduce((total, sub: any) => {
          return total + calculateMonthlyEquivalent(sub.price, sub.services.duration_type);
        }, 0) || 0;

        // 3. Pagamentos Pendentes
        const { data: pendingData, count: pendingCount } = await supabase
          .from('service_subscriptions')
          .select('price', { count: 'exact' })
          .eq('tenant_id', tenantId)
          .eq('payment_status', 'pending')
          .eq('status', 'active');

        const pendingTotal = pendingData?.reduce((sum, sub) => sum + (sub.price || 0), 0) || 0;

        // 4. Renovações Próximas (30 dias)
        const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

        const { data: renewalsData, count: renewalsCount } = await supabase
          .from('service_subscriptions')
          .select('price', { count: 'exact' })
          .eq('tenant_id', tenantId)
          .in('status', ['active', 'expiring_soon'])
          .gte('end_date', today.toISOString().split('T')[0])
          .lte('end_date', in30Days.toISOString().split('T')[0]);

        const renewalsTotal = renewalsData?.reduce((sum, sub) => sum + (sub.price || 0), 0) || 0;

        setMetrics({
          mrr,
          nextMonthRevenue,
          pendingPayments: { total: pendingTotal, count: pendingCount || 0 },
          upcomingRenewals: { total: renewalsTotal, count: renewalsCount || 0 },
          loading: false
        });

      } catch (error) {
        console.error('Erro ao buscar métricas financeiras:', error);
        setMetrics(prev => ({ ...prev, loading: false }));
      }
    };

    fetchMetrics();
  }, [tenantId]);

  return metrics;
};
