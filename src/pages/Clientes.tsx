import { useState } from 'react';
import { 
  Users, UserPlus, UserCheck, Clock, 
  Search, Filter, FileText, Calendar, Trash2, User,
  Mail, X, AlertCircle, Loader2
} from 'lucide-react';
import { useClientsData } from '@/hooks/useClientsData';
import type { ClientWithStats } from '@/hooks/useClientsData';
import './Clientes.css';

export function Clientes() {
  const [selectedClient, setSelectedClient] = useState<ClientWithStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('info');

  const { 
    clients, 
    stats: clientStats, 
    isLoading, 
    error,
    deleteClient 
  } = useClientsData(searchQuery);

  const stats = [
    { label: 'Total de Clientes', value: clientStats?.total || 0, icon: Users, variant: 'total' },
    { label: 'Novos Este Mês', value: clientStats?.newThisMonth || 0, icon: UserPlus, variant: 'new' },
    { label: 'Ativos', value: clientStats?.active || 0, icon: UserCheck, variant: 'active' },
    { label: 'Inativos', value: clientStats?.inactive || 0, icon: Clock, variant: 'inactive' }
  ];

  const handleOpenModal = (client: ClientWithStats) => {
    setSelectedClient(client);
  };

  const handleCloseModal = () => {
    setSelectedClient(null);
    setActiveTab('info');
  };

  const handleDeleteClient = async (clientId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      await deleteClient.mutateAsync(clientId);
    }
  };

  const handleViewPlan = (clientId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('View plan:', clientId);
    // TODO: Implementar navegação para planos
  };

  const handleSchedule = (clientId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Schedule:', clientId);
    // TODO: Implementar navegação para agendamentos
  };

  // Format date helper
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Não informado';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Calculate age
  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="clientes-page">
      {/* Header */}
      <div className="page-header">
        <h1>Clientes</h1>
        <p>Gerencie todos os seus pacientes em um só lugar</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`stat-card ${stat.variant}`}>
              <div className="stat-content">
                <h3>{stat.label}</h3>
                <div className="value">{stat.value}</div>
              </div>
              <div className="stat-icon">
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="search-section">
        <div className="search-bar">
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nome, email ou telefone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-header">
          <Filter size={20} />
          <h3>Filtros</h3>
        </div>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Filtrar por Plano</label>
            <select>
              <option>Todos os planos</option>
              <option>Mensal</option>
              <option>Trimestral</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Planos Expirando</label>
            <select>
              <option>Todos</option>
              <option>Próximos 7 dias</option>
              <option>Próximos 30 dias</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="clients-list">
          {[1, 2, 3].map((i) => (
            <div key={i} className="client-card animate-pulse">
              <div className="client-main">
                <div className="client-avatar" style={{ background: '#e5e7eb' }}></div>
                <div className="client-info" style={{ flex: 1 }}>
                  <div style={{ height: '20px', background: '#e5e7eb', borderRadius: '4px', width: '60%', marginBottom: '8px' }}></div>
                  <div style={{ height: '16px', background: '#e5e7eb', borderRadius: '4px', width: '40%' }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={{ 
          background: 'rgba(239, 68, 68, 0.1)', 
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          padding: '24px',
          margin: '24px 0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#ef4444' }}>
            <AlertCircle size={24} />
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
                Erro ao carregar clientes
              </h3>
              <p style={{ fontSize: '14px' }}>{error.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && clients && clients.length === 0 && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          borderRadius: '16px',
          padding: '48px',
          textAlign: 'center',
          margin: '24px 0'
        }}>
          <Users size={64} style={{ color: '#d1d5db', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', marginBottom: '8px' }}>
            {searchQuery ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
          </h3>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
            {searchQuery 
              ? 'Tente ajustar sua pesquisa ou limpar os filtros'
              : 'Comece adicionando seu primeiro cliente'
            }
          </p>
          {!searchQuery && (
            <button 
              className="fab" 
              style={{ position: 'relative', marginTop: '16px' }}
              title="Adicionar novo cliente"
            >
              <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Clients List */}
      {!isLoading && !error && clients && clients.length > 0 && (
        <div className="clients-list">
          {clients.map((client) => {
            const age = calculateAge(client.birth_date);
            const avatar = client.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
            
            return (
            <div key={client.id} className="client-card">
              <div className="client-main" onClick={() => handleOpenModal(client)}>
                <div className="client-avatar">{avatar}</div>
                <div className="client-info">
                  <h4>{client.name}</h4>
                  <div className="client-meta">
                    {age && (
                      <span>
                        <User size={14} />
                        {age} anos
                      </span>
                    )}
                    {client.email ? (
                      <span>
                        <Mail size={14} />
                        {client.email}
                      </span>
                    ) : (
                      <span>
                        <Mail size={14} />
                        Sem email
                      </span>
                    )}
                  </div>
                  {client.services && client.services.length > 0 && (
                    <div className="client-badges">
                      {client.services.map((service, idx) => (
                        <span key={idx} className="badge">
                          {service.name} • {service.daysRemaining}d
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="client-actions">
                <button 
                  className="action-btn"
                  onClick={(e) => handleViewPlan(client.id, e)}
                  title="Ver plano"
                >
                  <FileText size={18} />
                </button>
                <button 
                  className="action-btn"
                  onClick={(e) => handleSchedule(client.id, e)}
                  title="Agendar consulta"
                >
                  <Calendar size={18} />
                </button>
                <button 
                  className="action-btn"
                  onClick={(e) => handleDeleteClient(client.id, e)}
                  title="Excluir cliente"
                  disabled={deleteClient.isPending}
                >
                  {deleteClient.isPending ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Trash2 size={18} />
                  )}
                </button>
                <button 
                  className="action-btn view"
                  onClick={() => handleOpenModal(client)}
                  title="Ver perfil"
                >
                  <User size={18} />
                </button>
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* FAB */}
      <button className="fab" title="Adicionar novo cliente">
        <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
        </svg>
      </button>

      {/* Modal */}
      {selectedClient && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-header-content">
                <div className="modal-avatar">
                  {selectedClient.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'}
                </div>
                <div>
                  <h2>{selectedClient.name}</h2>
                  <p>Cliente desde {formatDate(selectedClient.created_at)}</p>
                </div>
              </div>
              <button className="modal-close" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-tabs">
              <button 
                className={`tab ${activeTab === 'info' ? 'active' : ''}`}
                onClick={() => setActiveTab('info')}
              >
                Informações
              </button>
              <button 
                className={`tab ${activeTab === 'services' ? 'active' : ''}`}
                onClick={() => setActiveTab('services')}
              >
                Serviços
              </button>
              <button 
                className={`tab ${activeTab === 'plan' ? 'active' : ''}`}
                onClick={() => setActiveTab('plan')}
              >
                Plano Alimentar
              </button>
              <button 
                className={`tab ${activeTab === 'questionnaires' ? 'active' : ''}`}
                onClick={() => setActiveTab('questionnaires')}
              >
                Questionários
              </button>
              <button 
                className={`tab ${activeTab === 'appointments' ? 'active' : ''}`}
                onClick={() => setActiveTab('appointments')}
              >
                Consultas
              </button>
              <button 
                className={`tab ${activeTab === 'anamnesis' ? 'active' : ''}`}
                onClick={() => setActiveTab('anamnesis')}
              >
                Anamneses
              </button>
            </div>

            <div className="modal-body">
              {activeTab === 'info' && (
                <div className="info-grid">
                  <div className="info-item">
                    <h4>Telefone</h4>
                    <p>{selectedClient.phone || 'Não informado'}</p>
                  </div>
                  <div className="info-item">
                    <h4>Email</h4>
                    <p>{selectedClient.email || 'Não informado'}</p>
                  </div>
                  <div className="info-item">
                    <h4>Idade</h4>
                    <p>{calculateAge(selectedClient.birth_date) ? `${calculateAge(selectedClient.birth_date)} anos` : 'Não informado'}</p>
                  </div>
                  <div className="info-item">
                    <h4>Data de Nascimento</h4>
                    <p>{formatDate(selectedClient.birth_date)}</p>
                  </div>
                  <div className="info-item">
                    <h4>Peso Atual</h4>
                    <p>{selectedClient.weight_kg ? `${selectedClient.weight_kg} kg` : 'Não informado'}</p>
                  </div>
                  <div className="info-item">
                    <h4>Altura</h4>
                    <p>{selectedClient.height_cm ? `${selectedClient.height_cm} cm` : 'Não informado'}</p>
                  </div>
                  <div className="info-item">
                    <h4>Objetivo</h4>
                    <p>
                      {selectedClient.goal === 'weight_loss' && 'Perder Peso'}
                      {selectedClient.goal === 'muscle_gain' && 'Ganhar Massa'}
                      {selectedClient.goal === 'maintenance' && 'Manutenção'}
                      {selectedClient.goal === 'health' && 'Saúde'}
                      {!selectedClient.goal && 'Não informado'}
                    </p>
                  </div>
                  <div className="info-item">
                    <h4>Nível de Atividade</h4>
                    <p>
                      {selectedClient.activity_level === 'sedentary' && 'Sedentário'}
                      {selectedClient.activity_level === 'light' && 'Leve'}
                      {selectedClient.activity_level === 'moderate' && 'Moderado'}
                      {selectedClient.activity_level === 'intense' && 'Intenso'}
                      {selectedClient.activity_level === 'very_intense' && 'Muito Intenso'}
                      {!selectedClient.activity_level && 'Não informado'}
                    </p>
                  </div>
                  {selectedClient.notes && (
                    <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                      <h4>Observações</h4>
                      <p>{selectedClient.notes}</p>
                    </div>
                  )}
                </div>
              )}
              {activeTab !== 'info' && (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                  Conteúdo em desenvolvimento...
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
