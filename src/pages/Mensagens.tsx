import { useState } from 'react';
import { 
  MessageCircle, MessageSquare, FileText, Clock,
  Settings, Plus, Search
} from 'lucide-react';
import './Mensagens.css';

type TabType = 'history' | 'templates' | 'conversations' | 'analytics';

export function Mensagens() {
  const [activeTab, setActiveTab] = useState<TabType>('history');
  const [searchQuery, setSearchQuery] = useState('');

  const stats = [
    {
      label: 'Mensagens',
      value: '0',
      icon: MessageCircle,
      variant: 'messages',
      color: '#8b5cf6'
    },
    {
      label: 'Conversas Ativas',
      value: '2',
      icon: MessageSquare,
      variant: 'conversations',
      color: '#10b981'
    },
    {
      label: 'Templates',
      value: '3',
      icon: FileText,
      variant: 'templates',
      color: '#ec4899'
    },
    {
      label: 'Tempo Resposta',
      value: '< 2min',
      icon: Clock,
      variant: 'response-time',
      color: '#f59e0b'
    }
  ];

  const handleNewMessage = () => {
    console.log('New message');
  };

  const handleSettings = () => {
    console.log('Settings');
  };

  return (
    <div className="mensagens-page">
      {/* Header */}
      <div className="mensagens-header">
        <div className="header-left">
          <h1>Mensagens</h1>
          <p>Gerencie conversas e mensagens com seus clientes</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-config" onClick={handleSettings}>
            <Settings size={18} />
            Configurações
          </button>
          <button className="btn btn-new" onClick={handleNewMessage}>
            <Plus size={18} />
            Nova Mensagem
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`stat-card ${stat.variant}`}>
              <div className="stat-header">
                <div className="stat-icon">
                  <Icon size={24} />
                </div>
              </div>
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value">{stat.value}</div>
            </div>
          );
        })}
      </div>

      {/* Content Section */}
      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">Histórico de Comunicação</h2>

          {/* Tabs */}
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              Histórico
            </button>
            <button
              className={`tab ${activeTab === 'templates' ? 'active' : ''}`}
              onClick={() => setActiveTab('templates')}
            >
              Templates
            </button>
            <button
              className={`tab ${activeTab === 'conversations' ? 'active' : ''}`}
              onClick={() => setActiveTab('conversations')}
            >
              Conversas
            </button>
            <button
              className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              Analytics
            </button>
          </div>

          {/* Search Bar */}
          <div className="search-bar">
            <Search size={20} />
            <input
              type="text"
              placeholder="Buscar comunicações..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Empty State */}
        <div className="empty-state">
          <MessageCircle size={80} />
          <h3>Nenhuma comunicação encontrada</h3>
          <p>Suas conversas e mensagens aparecerão aqui</p>
        </div>
      </div>
    </div>
  );
}
