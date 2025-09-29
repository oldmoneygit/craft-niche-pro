import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useTenantId = () => {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTenantId = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setTenantId(null);
          setLoading(false);
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('tenant_id')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setTenantId(profile?.tenant_id || null);
      } catch (error) {
        console.error('Error fetching tenant_id:', error);
        setTenantId(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTenantId();
  }, []);

  return { tenantId, loading };
};