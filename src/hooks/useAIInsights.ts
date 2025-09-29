import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useClientConfig } from '@/core/contexts/ClientConfigContext';
import { useTenant } from '@/hooks/useTenant';

export interface AIInsight {
  id: string;
  type: 'no_return' | 'missed_appointments' | 'positive_evolution' | 'pending_messages';
  title: string;
  description: string;
  priority: 1 | 2 | 3;
  clientData?: any;
  count?: number;
}

export const useAIInsights = () => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const { clientConfig } = useClientConfig();
  const { tenant } = useTenant(clientConfig?.subdomain || '');

  const generateInsights = async () => {
    if (!tenant?.id) return;

    setLoading(true);
    try {
      const insights: AIInsight[] = [];

      // 1. Clientes sem retorno há mais de 14 dias
      const { data: noReturnClients, error: noReturnError } = await supabase
        .from('clients')
        .select(`
          id, name, email, phone,
          appointments!inner(datetime, status)
        `)
        .eq('tenant_id', tenant.id)
        .lt('appointments.datetime', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
        .order('appointments.datetime', { ascending: false })
        .limit(1, { foreignTable: 'appointments' });

      if (!noReturnError && noReturnClients && noReturnClients.length > 0) {
        insights.push({
          id: 'no_return',
          type: 'no_return',
          title: 'Clientes sem retorno',
          description: `${noReturnClients.length} cliente${noReturnClients.length > 1 ? 's' : ''} há mais de 14 dias sem consulta`,
          priority: 1,
          clientData: noReturnClients,
          count: noReturnClients.length,
        });
      }

      // 2. Múltiplas faltas (2+ consultas perdidas)
      const { data: missedAppointments, error: missedError } = await supabase
        .from('appointments')
        .select(`
          client_id,
          clients!inner(id, name, email, phone)
        `)
        .eq('tenant_id', tenant.id)
        .eq('status', 'faltou');

      if (!missedError && missedAppointments) {
        const clientMissedCount = missedAppointments.reduce((acc: any, appointment: any) => {
          const clientId = appointment.client_id;
          acc[clientId] = (acc[clientId] || 0) + 1;
          return acc;
        }, {});

        const multipleAbsences = Object.entries(clientMissedCount)
          .filter(([_, count]) => (count as number) >= 2)
          .map(([clientId, count]) => {
            const appointment = missedAppointments.find(a => a.client_id === clientId);
            return {
              ...appointment?.clients,
              missedCount: count,
            };
          });

        if (multipleAbsences.length > 0) {
          insights.push({
            id: 'missed_appointments',
            type: 'missed_appointments',
            title: 'Alertas de falta',
            description: `${multipleAbsences.length} cliente${multipleAbsences.length > 1 ? 's' : ''} com 2+ consultas perdidas`,
            priority: 1,
            clientData: multipleAbsences,
            count: multipleAbsences.length,
          });
        }
      }

      // 3. Evolução positiva (placeholder - sem dados de peso ainda)
      insights.push({
        id: 'positive_evolution',
        type: 'positive_evolution',
        title: 'Evolução positiva',
        description: 'Acompanhar evolução dos clientes (recurso em desenvolvimento)',
        priority: 3,
        count: 0,
      });

      // 4. Mensagens pendentes (placeholder - sem sistema de comunicação ativo ainda)
      insights.push({
        id: 'pending_messages',
        type: 'pending_messages',
        title: 'Mensagens pendentes',
        description: 'Comunicações aguardando resposta (recurso em desenvolvimento)',
        priority: 2,
        count: 0,
      });

      setInsights(insights.filter(insight => insight.count! > 0 || insight.type === 'positive_evolution' || insight.type === 'pending_messages'));
    } catch (error) {
      console.error('Error generating AI insights:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateInsights();
  }, [tenant?.id]);

  return {
    insights,
    loading,
    refresh: generateInsights,
  };
};