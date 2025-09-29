import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Tenant {
  id: string;
  subdomain: string;
  business_name: string;
  owner_email: string;
}

export function useTenant(tenantSubdomain: string) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchTenant() {
      try {
        const { data, error } = await supabase
          .from('tenants')
          .select('*')
          .eq('subdomain', tenantSubdomain)
          .single();

        if (error) {
          console.error('Error fetching tenant:', error);
          setTenant(null);
        } else {
          setTenant(data);
        }
      } catch (error) {
        console.error('Error:', error);
        setTenant(null);
      } finally {
        setLoading(false);
      }
    }

    fetchTenant();
  }, [tenantSubdomain]);

  return { tenant, loading };
}