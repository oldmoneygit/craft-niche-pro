import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from './useTenantId';
import { startOfMonth, startOfToday, endOfToday, subDays, addDays } from 'date-fns';

export interface DashboardStats {
  todayAppointments: number;
  monthNewClients: number;
  pendingConfirmations: number;
  inactiveClients: number;
  expiringServices: number;
  inactiveClientsList: Array<{
    id: string;
    name: string;
    phone: string;
    avatar: string;
    lastAppointment?: string;
  }>;
}

export const useDashboardStats = () => {
  const { tenantId } = useTenantId();

  return useQuery({
    queryKey: ['dashboard-stats', tenantId],
    queryFn: async () => {
      if (!tenantId) throw new Error('Tenant ID not found');

      const today = startOfToday();
      const todayEnd = endOfToday();
      const monthStart = startOfMonth(new Date());
      const thirtyDaysAgo = subDays(new Date(), 30);
      const next48Hours = addDays(new Date(), 2);
      const next7Days = addDays(new Date(), 7);

      // 1. Consultas hoje
      const { count: todayCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .gte('datetime', today.toISOString())
        .lte('datetime', todayEnd.toISOString());

      // 2. Novos clientes este mês
      const { count: newClientsCount } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .gte('created_at', monthStart.toISOString());

      // 3. Confirmações pendentes (próximas 48h)
      const { count: pendingCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .eq('status', 'agendado')
        .gte('datetime', new Date().toISOString())
        .lte('datetime', next48Hours.toISOString());

      // 4. Clientes inativos (sem consulta há 30+ dias)
      const { data: allClients } = await supabase
        .from('clients')
        .select(`
          id,
          name,
          phone,
          appointments (
            datetime
          )
        `)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      const inactiveClientsList = (allClients || [])
        .filter(client => {
          const lastAppointment = client.appointments?.[0]?.datetime;
          if (!lastAppointment) return true;
          return new Date(lastAppointment) < thirtyDaysAgo;
        })
        .map(client => ({
          id: client.id,
          name: client.name,
          phone: client.phone || '',
          avatar: client.name.charAt(0).toUpperCase(),
          lastAppointment: client.appointments?.[0]?.datetime
        }));

      // 5. Serviços vencendo (próximos 7 dias)
      const { count: expiringCount } = await supabase
        .from('service_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .eq('status', 'active')
        .gte('end_date', new Date().toISOString())
        .lte('end_date', next7Days.toISOString());

      return {
        todayAppointments: todayCount || 0,
        monthNewClients: newClientsCount || 0,
        pendingConfirmations: pendingCount || 0,
        inactiveClients: inactiveClientsList.length,
        expiringServices: expiringCount || 0,
        inactiveClientsList: inactiveClientsList.slice(0, 5) // Top 5
      };
    },
    enabled: !!tenantId,
    refetchInterval: 60000 // Refetch a cada 1 minuto
  });
};
