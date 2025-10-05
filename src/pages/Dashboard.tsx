import { 
  Calendar, Users, CheckCircle, Clock, 
  DollarSign, AlertTriangle, Bell 
} from 'lucide-react';
import './Dashboard.css';

interface StatCard {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ElementType;
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
  const stats: StatCard[] = [
    {
      label: 'HOJE',
      value: 0,
      change: 'Consultas agendadas',
      icon: Calendar,
      variant: 'today'
    },
    {
      label: 'ESTE MÊS',
      value: 3,
      change: 'Novos clientes',
      changeType: 'positive',
      icon: Users,
      variant: 'month'
    },
    {
      label: 'CONFIRMAÇÕES',
      value: 0,
      change: 'Pendentes (48h)',
      icon: CheckCircle,
      variant: 'pending'
    },
    {
      label: 'INATIVOS',
      value: 2,
      change: '30+ dias sem consulta',
      changeType: 'negative',
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
      variant: 'services'
    },
    {
      title: 'Confirmações Pendentes',
      description: 'Consultas nas próximas 48h que ainda não foram confirmadas',
      icon: CheckCircle,
      variant: 'confirmations',
      count: 0
    },
    {
      title: 'Lembretes Pendentes',
      description: 'Consultas nas próximas 72h precisam de lembrete',
      icon: Bell,
      variant: 'reminders',
      count: 0
    }
  ];

  const inactiveClients: InactiveClient[] = [
    {
      id: '1',
      name: 'Jeferson de lima',
      phone: '19981669495',
      avatar: 'J'
    },
    {
      id: '2',
      name: 'MARCAO DA MASSA',
      phone: '19981661010',
      avatar: 'M'
    }
  ];

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
          <p>Hoje você tem <strong>0</strong> consultas agendadas</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`stat-card ${stat.variant}`}>
              <div className="stat-header">
                <div className="stat-label">{stat.label}</div>
                <div className="stat-icon">
                  <Icon size={24} />
                </div>
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className={`stat-change ${stat.changeType || ''}`}>
                {stat.changeType === 'positive' && (
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                  </svg>
                )}
                {stat.change}
              </div>
            </div>
          );
        })}
      </div>

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
