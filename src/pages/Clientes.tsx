import { useState } from 'react';
import { 
  Users, UserPlus, UserCheck, Clock, 
  Search, Filter, FileText, Calendar, Trash2, User,
  Mail, Plus, AlertCircle, Loader2
} from 'lucide-react';
import { useClientsData } from '@/hooks/useClientsData';
import type { ClientWithStats } from '@/hooks/useClientsData';
import { StatCardClientes } from '@/components/clientes/StatCardClientes';
import { ClientDetailsModal } from '@/components/clientes/ClientDetailsModal';
import { CreateClientModal } from '@/components/clientes/CreateClientModal';
import './Clientes.css';

export function Clientes() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<ClientWithStats | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { 
    clients, 
    stats: clientStats, 
    isLoading, 
    error,
    deleteClient 
  } = useClientsData(searchQuery);

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

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '??';
  };

  return (
    <div className="clientes-page">
      {/* Header */}
      <div className="page-header">
        <h1>Clientes</h1>
        <p>Gerencie todos os seus pacientes em um só lugar</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCardClientes
          title="TOTAL DE CLIENTES"
          value={clientStats?.total || 0}
          icon={Users}
          variant="total"
        />
        <StatCardClientes
          title="NOVOS ESTE MÊS"
          value={clientStats?.newThisMonth || 0}
          icon={UserPlus}
          variant="new"
        />
        <StatCardClientes
          title="ATIVOS"
          value={clientStats?.active || 0}
          icon={UserCheck}
          variant="active"
        />
        <StatCardClientes
          title="INATIVOS"
          value={clientStats?.inactive || 0}
          icon={Clock}
          variant="inactive"
        />
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
            <div 
              key={i} 
              className="client-card animate-pulse"
              style={{
                background: 'var(--bg-card)',
                backdropFilter: 'blur(20px)'
              }}
            >
              <div className="client-main">
                <div 
                  className="client-avatar" 
                  style={{ background: '#e5e7eb' }}
                ></div>
                <div className="client-info" style={{ flex: 1 }}>
                  <div style={{ 
                    height: '20px', 
                    background: '#e5e7eb', 
                    borderRadius: '4px', 
                    width: '60%', 
                    marginBottom: '8px' 
                  }}></div>
                  <div style={{ 
                    height: '16px', 
                    background: '#e5e7eb', 
                    borderRadius: '4px', 
                    width: '40%' 
                  }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div 
          className="p-6 rounded-2xl border flex items-center gap-3 mb-6"
          style={{ 
            background: 'rgba(239, 68, 68, 0.1)', 
            borderColor: '#ef4444'
          }}
        >
          <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
          <div>
            <h3 className="text-base font-semibold text-red-700 mb-1">
              Erro ao carregar clientes
            </h3>
            <p className="text-sm text-red-600">{error.message}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && clients && clients.length === 0 && (
        <div 
          className="p-12 rounded-2xl text-center"
          style={{
            background: 'var(--bg-card)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--border)'
          }}
        >
          <Users size={64} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <h3 
            className="text-lg font-semibold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            {searchQuery ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
          </h3>
          <p 
            className="mb-6"
            style={{ color: 'var(--text-muted)' }}
          >
            {searchQuery 
              ? 'Tente ajustar sua pesquisa ou limpar os filtros'
              : 'Comece adicionando seu primeiro cliente'
            }
          </p>
          {!searchQuery && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              }}
            >
              Adicionar Cliente
            </button>
          )}
        </div>
      )}

      {/* Clients List */}
      {!isLoading && !error && clients && clients.length > 0 && (
        <div className="clients-list">
          {clients.map((client) => {
            const age = calculateAge(client.birth_date);
            const avatar = getInitials(client.name);
            
            return (
              <div 
                key={client.id} 
                className="client-card"
                onClick={() => setSelectedClient(client)}
              >
                <div className="client-main">
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
                      <span>
                        <Mail size={14} />
                        {client.email || 'Sem email'}
                      </span>
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedClient(client);
                    }}
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
      <button 
        onClick={() => setIsCreateModalOpen(true)}
        className="fab" 
        title="Adicionar novo cliente"
      >
        <Plus size={28} />
      </button>

      {/* Modals */}
      {selectedClient && (
        <ClientDetailsModal 
          client={selectedClient} 
          onClose={() => setSelectedClient(null)} 
        />
      )}

      {isCreateModalOpen && (
        <CreateClientModal 
          onClose={() => setIsCreateModalOpen(false)} 
        />
      )}
    </div>
  );
}
