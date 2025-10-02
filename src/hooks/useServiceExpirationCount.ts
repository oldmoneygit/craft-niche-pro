import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useServiceExpirationCount = (tenantId: string | null, daysThreshold: number = 7) => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCount = async () => {
      if (!tenantId) {
        setLoading(false);
        return;
      }

      const today = new Date();
      const futureDate = new Date(today.getTime() + daysThreshold * 24 * 60 * 60 * 1000);

      const { count: expiringCount, error } = await supabase
        .from('service_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .in('status', ['active', 'expiring_soon'])
        .gte('end_date', today.toISOString().split('T')[0])
        .lte('end_date', futureDate.toISOString().split('T')[0]);

      if (!error) {
        setCount(expiringCount || 0);
      }

      setLoading(false);
    };

    fetchCount();
    
    const interval = setInterval(fetchCount, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [tenantId, daysThreshold]);

  return { count, loading };
};
