import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useTenantId = () => {
  // 🔧 MOCK TEMPORÁRIO - Remover quando implementar autenticação
  const MOCK_TENANT_ID = '2429b7ea-da52-4fbb-8bbe-c678facfd260';
  
  const [tenantId, setTenantId] = useState<string | null>(MOCK_TENANT_ID);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Mock: retornar imediatamente com tenant_id hardcoded
    console.log('🔧 [useTenantId] MODO MOCK - tenant_id:', MOCK_TENANT_ID);
    setTenantId(MOCK_TENANT_ID);
    setLoading(false);
    
    /* TODO: Restaurar quando implementar autenticação
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
    */
  }, []);

  return { tenantId, loading };
};