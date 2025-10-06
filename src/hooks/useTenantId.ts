import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useTenantId = () => {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTenantId = async () => {
      try {
        console.log('🔍 [useTenantId] Buscando usuário autenticado...');
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.error('❌ [useTenantId] Nenhum usuário autenticado encontrado!');
          setTenantId(null);
          setLoading(false);
          return;
        }

        console.log('✅ [useTenantId] Usuário encontrado:', user.id);

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('tenant_id')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('❌ [useTenantId] Erro ao buscar profile:', error);
          throw error;
        }
        
        console.log('✅ [useTenantId] Profile encontrado:', profile);
        console.log('✅ [useTenantId] tenant_id:', profile?.tenant_id);
        
        setTenantId(profile?.tenant_id || null);
      } catch (error) {
        console.error('❌ [useTenantId] Erro geral:', error);
        setTenantId(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTenantId();
  }, []);

  return { tenantId, loading };
};