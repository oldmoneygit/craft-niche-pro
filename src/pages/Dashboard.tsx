import { useState } from 'react';
import { 
  Calendar, Users, CheckCircle, Clock, 
  DollarSign, AlertTriangle, Bell, LucideIcon
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { DashboardStatCard } from '@/components/dashboard/DashboardStatCard';
import { DashboardDetailsModal } from '@/components/dashboard/DashboardDetailsModal';
import { startOfMonth, startOfToday, endOfToday, addDays } from 'date-fns';
import './Dashboard.css';

interface StatCard {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  variant: 'today' | 'month' | 'pending' | 'inactive';
}

interface Alert {
  title: string;
  description: string;
  icon: React.ElementType;
  variant: 'financial' | 'services' | 'confirmations' | 'reminders';
  count?: number;
}

interface InactiveClient {
  id: string;
  name: string;
  phone: string;
  avatar: string;
}

export function Dashboard() {
  const { tenantId } = useTenantId();
  const { data: dashboardData, isLoading, error } = useDashboardStats();
  const [modalState, setModalState] = useState<{ isOpen: boolean; type: 'today' | 'month' | 'pending' | 'inactive' | null; title: string }>({
    isOpen: false,
    type: null,
    title: ''
  });

  // Query para consultas de hoje
  const { data: todayAppointments = [] } = useQuery({
    queryKey: ['today-appointments', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const today = startOfToday();
      const todayEnd = endOfToday();
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          datetime,
          status,
          type,
          clients (name)
        `)
        .eq('tenant_id', tenantId)
        .gte('datetime', today.toISOString())
        .lte('datetime', todayEnd.toISOString())
        .order('datetime', { ascending: true });
      
      if (error) throw error;
      return data.map(apt => ({
        ...apt,
        client_name: apt.clients?.name || 'Cliente não encontrado'
      }));
    },
    enabled: !!tenantId && modalState.type === 'today'
  });

  // Query para novos clientes do mês
  const { data: monthNewClients = [] } = useQuery({
    queryKey: ['month-new-clients', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const monthStart = startOfMonth(new Date());
      
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, phone, created_at')
        .eq('tenant_id', tenantId)
        .gte('created_at', monthStart.toISOString())
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId && modalState.type === 'month'
  });

  // Query para confirmações pendentes
  const { data: pendingConfirmations = [] } = useQuery({
    queryKey: ['pending-confirmations', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const next48Hours = addDays(new Date(), 2);
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          datetime,
          status,
          clients (name)
        `)
        .eq('tenant_id', tenantId)
        .eq('status', 'agendado')
        .gte('datetime', new Date().toISOString())
        .lte('datetime', next48Hours.toISOString())
        .order('datetime', { ascending: true });
      
      if (error) throw error;
      return data.map(apt => ({
        ...apt,
        client_name: apt.clients?.name || 'Cliente não encontrado'
      }));
    },
    enabled: !!tenantId && modalState.type === 'pending'
  });

  const handleCardClick = (type: 'today' | 'month' | 'pending' | 'inactive', title: string) => {
    setModalState({ isOpen: true, type, title });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, type: null, title: '' });
  };

  const getModalData = () => {
    switch (modalState.type) {
      case 'today':
        return todayAppointments;
      case 'month':
        return monthNewClients;
      case 'pending':
        return pendingConfirmations;
      case 'inactive':
        return dashboardData?.inactiveClientsList || [];
      default:
        return [];
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <div className="header-left">
            <h1>Bem-vindo de volta! 👋</h1>
            <p>Carregando dados...</p>
          </div>
        </div>
        
        <div className="stats-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="stat-card today animate-pulse">
              <div className="stat-header">
                <div className="stat-label" style={{ background: '#e5e7eb', height: '20px', width: '80px', borderRadius: '4px' }}></div>
                <div className="stat-icon" style={{ background: '#e5e7eb', borderRadius: '50%' }}></div>
              </div>
              <div className="stat-value" style={{ background: '#e5e7eb', height: '32px', width: '60px', borderRadius: '4px' }}></div>
              <div className="stat-change" style={{ background: '#e5e7eb', height: '16px', width: '120px', borderRadius: '4px' }}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <div className="header-left">
            <h1>Bem-vindo de volta! 👋</h1>
            <p style={{ color: '#ef4444' }}>Erro ao carregar dados: {error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  const stats: StatCard[] = [
    {
      label: 'HOJE',
      value: dashboardData?.todayAppointments || 0,
      change: 'Consultas agendadas',
      icon: Calendar,
      variant: 'today',
      changeType: 'neutral'
    },
    {
      label: 'ESTE MÊS',
      value: dashboardData?.monthNewClients || 0,
      change: 'Novos clientes',
      changeType: dashboardData?.monthNewClients ? 'positive' : 'neutral',
      icon: Users,
      variant: 'month'
    },
    {
      label: 'CONFIRMAÇÕES',
      value: dashboardData?.pendingConfirmations || 0,
      change: 'Pendentes (48h)',
      icon: CheckCircle,
      variant: 'pending',
      changeType: 'neutral'
    },
    {
      label: 'INATIVOS',
      value: dashboardData?.inactiveClients || 0,
      change: '30+ dias sem consulta',
      changeType: dashboardData?.inactiveClients ? 'negative' : 'neutral',
      icon: Clock,
      variant: 'inactive'
    }
  ];

  const alerts: Alert[] = [
    {
      title: 'Visão Financeira',
      description: 'Receita, previsões e indicadores financeiros',
      icon: DollarSign,
      variant: 'financial'
    },
    {
      title: 'Vencimento de Serviços',
      description: 'Serviços contratados próximos do vencimento (7 dias)',
      icon: AlertTriangle,
      variant: 'services',
      count: dashboardData?.expiringServices || 0
    },
    {
      title: 'Confirmações Pendentes',
      description: 'Consultas nas próximas 48h que ainda não foram confirmadas',
      icon: CheckCircle,
      variant: 'confirmations',
      count: dashboardData?.pendingConfirmations || 0
    },
    {
      title: 'Lembretes Pendentes',
      description: 'Consultas nas próximas 72h precisam de lembrete',
      icon: Bell,
      variant: 'reminders',
      count: 0
    }
  ];

  const inactiveClients: InactiveClient[] = dashboardData?.inactiveClientsList || [];

  const handleContactClient = (clientId: string) => {
    console.log('Contacting client:', clientId);
    // TODO: Implementar lógica de contato
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Bem-vindo de volta! 👋</h1>
          <p>Hoje você tem <strong>{dashboardData?.todayAppointments || 0}</strong> consultas agendadas</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <DashboardStatCard
            key={index}
            label={stat.label}
            value={stat.value}
            description={stat.change}
            trend={stat.changeType}
            icon={stat.icon}
            variant={stat.variant}
            onClick={() => handleCardClick(
              stat.variant,
              stat.variant === 'today' ? 'Consultas de Hoje' :
              stat.variant === 'month' ? 'Novos Clientes Este Mês' :
              stat.variant === 'pending' ? 'Confirmações Pendentes' :
              'Pacientes Inativos'
            )}
          />
        ))}
      </div>

      {/* Details Modal */}
      {modalState.isOpen && modalState.type && (
        <DashboardDetailsModal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          title={modalState.title}
          type={modalState.type}
          data={getModalData()}
        />
      )}

      {/* Alerts Section */}
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Alertas e Notificações</h2>
        </div>

        <div className="alerts-grid">
          {alerts.map((alert, index) => {
            const Icon = alert.icon;
            return (
              <div key={index} className={`alert-card ${alert.variant}`}>
                <div className="alert-header">
                  <div className="alert-icon">
                    <Icon size={20} />
                  </div>
                  <div>
                    <div className="alert-title">{alert.title}</div>
                  </div>
                  {alert.count !== undefined && (
                    <div className="alert-count">{alert.count}</div>
                  )}
                </div>
                <div className="alert-description">{alert.description}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Inactive Clients */}
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Pacientes Inativos ({inactiveClients.length})</h2>
        </div>

        <div className="clients-list">
          {inactiveClients.map((client) => (
            <div key={client.id} className="client-item">
              <div className="client-info">
                <div className="client-avatar">{client.avatar}</div>
                <div className="client-details">
                  <h4>{client.name}</h4>
                  <p>{client.phone}</p>
                </div>
              </div>
              <button 
                className="client-action"
                onClick={() => handleContactClient(client.id)}
              >
                Entrar em Contato
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
