import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from './useTenantId';

export const useLeadsNotifications = () => {
  const { tenantId } = useTenantId();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!tenantId) return;

    fetchPendingCount();

    // Realtime subscription para novos leads
    const subscription = supabase
      .channel('leads-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
          filter: `tenant_id=eq.${tenantId}`
        },
        () => {
          fetchPendingCount();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [tenantId]);

  const fetchPendingCount = async () => {
    if (!tenantId) return;

    const { count } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('status', 'pending');

    setPendingCount(count || 0);
  };

  return { pendingCount };
};