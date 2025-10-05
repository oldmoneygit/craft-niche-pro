import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAppointmentsBadge = (): number => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        // Buscar tenant_id do usuário logado
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('tenant_id')
          .eq('user_id', user.id)
          .single();

        if (!profile?.tenant_id) return;

        // Buscar contagem de agendamentos pendentes
        const { count } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', profile.tenant_id)
          .eq('status', 'agendado');

        setCount(count || 0);
      } catch (error) {
        console.error('Error fetching appointments count:', error);
      }
    };

    fetchCount();

    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return count;
};
