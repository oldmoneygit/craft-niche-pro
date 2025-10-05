import { useState } from 'react';
import { 
  Users, UserPlus, UserCheck, Clock, 
  Search, Filter, FileText, Calendar, Trash2, User,
  Mail, X
} from 'lucide-react';
import './Clientes.css';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  birthDate: string;
  avatar: string;
  createdAt: string;
  services?: Array<{
    name: string;
    daysRemaining: number;
  }>;
}

export function Clientes() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('info');

  const clients: Client[] = [
    {
      id: '1',
      name: 'Pamela Nascimento de Lima',
      email: 'pamnascimentosl@gmail.com',
      phone: '+55 61 3224 4073',
      age: 24,
      birthDate: '15/03/2001',
      avatar: 'PN',
      createdAt: '02/10/2025',
      services: []
    },
    {
      id: '2',
      name: 'Jeferson de lima',
      email: 'jefersoncemep@gmail.com',
      phone: '19981669495',
      age: 24,
      birthDate: '10/05/2001',
      avatar: 'JD',
      createdAt: '15/09/2025',
      services: []
    },
    {
      id: '3',
      name: 'MARCAO DA MASSA',
      email: '',
      phone: '19981661010',
      age: 28,
      birthDate: '20/01/1997',
      avatar: 'MD',
      createdAt: '01/08/2025',
      services: [
        { name: 'Mensal', daysRemaining: 28 },
        { name: 'Acompanhamento Trimestral', daysRemaining: 88 }
      ]
    }
  ];

  const stats = [
    { label: 'Total de Clientes', value: 3, icon: Users, variant: 'total' },
    { label: 'Novos Este Mês', value: 3, icon: UserPlus, variant: 'new' },
    { label: 'Ativos', value: 1, icon: UserCheck, variant: 'active' },
    { label: 'Inativos', value: 2, icon: Clock, variant: 'inactive' }
  ];

  const handleOpenModal = (client: Client) => {
    setSelectedClient(client);
  };

  const handleCloseModal = () => {
    setSelectedClient(null);
    setActiveTab('info');
  };

  const handleDeleteClient = (clientId: string) => {
    console.log('Delete client:', clientId);
  };

  const handleViewPlan = (clientId: string) => {
    console.log('View plan:', clientId);
  };

  const handleSchedule = (clientId: string) => {
    console.log('Schedule:', clientId);
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

      {/* Clients List */}
      <div className="clients-list">
        {clients.map((client) => (
          <div key={client.id} className="client-card">
            <div className="client-main" onClick={() => handleOpenModal(client)}>
              <div className="client-avatar">{client.avatar}</div>
              <div className="client-info">
                <h4>{client.name}</h4>
                <div className="client-meta">
                  <span>
                    <User size={14} />
                    {client.age} anos
                  </span>
                  {client.email && (
                    <span>
                      <Mail size={14} />
                      {client.email}
                    </span>
                  )}
                  {!client.email && (
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
                onClick={() => handleViewPlan(client.id)}
                title="Ver plano"
              >
                <FileText size={18} />
              </button>
              <button 
                className="action-btn"
                onClick={() => handleSchedule(client.id)}
                title="Agendar consulta"
              >
                <Calendar size={18} />
              </button>
              <button 
                className="action-btn"
                onClick={() => handleDeleteClient(client.id)}
                title="Excluir cliente"
              >
                <Trash2 size={18} />
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
        ))}
      </div>

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
                <div className="modal-avatar">{selectedClient.avatar}</div>
                <div>
                  <h2>{selectedClient.name}</h2>
                  <p>Cliente desde {selectedClient.createdAt}</p>
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
                    <p>{selectedClient.phone}</p>
                  </div>
                  <div className="info-item">
                    <h4>Email</h4>
                    <p>{selectedClient.email || 'Não informado'}</p>
                  </div>
                  <div className="info-item">
                    <h4>Idade</h4>
                    <p>{selectedClient.age} anos</p>
                  </div>
                  <div className="info-item">
                    <h4>Data de Nascimento</h4>
                    <p>{selectedClient.birthDate}</p>
                  </div>
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
