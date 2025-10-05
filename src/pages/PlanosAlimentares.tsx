import React, { useState, useEffect } from 'react';
import { Search, List, Plus, FileText, CheckCircle, Bookmark, Info, BarChart3, Calendar as CalendarIcon, Edit } from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import { PlanoCard } from '@/components/planos/PlanoCard';

export default function PlanosAlimentares() {
  const [activeTab, setActiveTab] = useState<'list' | 'new'>('list');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme') || 
                    document.body.getAttribute('data-theme') ||
                    (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
      setIsDark(theme === 'dark');
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-theme', 'class'] });

    return () => observer.disconnect();
  }, []);

  const planos = [
    {
      clientName: 'Ana Carolina Lima',
      clientInitials: 'AC',
      objective: 'Emagrecimento',
      status: 'active' as const,
      planTitle: 'Plano Alimentar Personalizado',
      createdDate: '15/09/2025',
      duration: '30 dias',
      calories: '1.800 kcal',
      protein: '135g',
      fat: '60g',
      carbs: '180g'
    },
    {
      clientName: 'Marcão da Massa',
      clientInitials: 'MM',
      objective: 'Ganho de massa',
      status: 'active' as const,
      planTitle: 'Plano Bulking Controlado',
      createdDate: '10/09/2025',
      duration: '90 dias',
      calories: '3.200 kcal',
      protein: '240g',
      fat: '90g',
      carbs: '400g',
      avatarColor: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
    },
    {
      clientName: 'Pamela Nascimento',
      clientInitials: 'PN',
      objective: 'Manutenção',
      status: 'pending' as const,
      planTitle: 'Plano de Manutenção Saudável',
      createdDate: '05/10/2025',
      duration: '30 dias',
      calories: '2.000 kcal',
      protein: '150g',
      fat: '67g',
      carbs: '200g',
      avatarColor: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    }
  ];

  const tabStyle = (isActive: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    background: isActive ? '#10b981' : 'transparent',
    color: isActive ? 'white' : (isDark ? '#a3a3a3' : '#6b7280'),
    fontWeight: 600,
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  });

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)',
    background: isDark ? 'rgba(20, 20, 20, 0.9)' : '#ffffff',
    backdropFilter: 'blur(10px)',
    color: isDark ? '#ffffff' : '#111827',
    fontSize: '14px',
    transition: 'all 0.3s ease'
  };

  return (
    <div style={{ padding: '24px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>
            Planos Alimentares
          </h1>
          <p style={{ fontSize: '15px', opacity: 0.7 }}>
            Crie e gerencie planos alimentares para seus clientes
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', background: isDark ? 'rgba(38, 38, 38, 0.6)' : 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', padding: '6px', borderRadius: '12px', border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)' }}>
          <button onClick={() => setActiveTab('list')} style={tabStyle(activeTab === 'list')}>
            <List style={{ width: '18px', height: '18px' }} />
            Meus Planos
          </button>
          <button onClick={() => setActiveTab('new')} style={tabStyle(activeTab === 'new')}>
            <Plus style={{ width: '18px', height: '18px' }} />
            Criar Novo Plano
          </button>
        </div>

        {/* Tab: Lista */}
        {activeTab === 'list' && (
          <>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              <StatCard label="Total de Planos" value={12} icon={<FileText className="w-6 h-6" />} variant="primary" />
              <StatCard label="Planos Ativos" value={8} icon={<CheckCircle className="w-6 h-6" />} variant="success" />
              <StatCard label="Templates Salvos" value={5} icon={<Bookmark className="w-6 h-6" />} variant="purple" />
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: isDark ? '#a3a3a3' : '#6b7280' }} />
                <input
                  type="text"
                  placeholder="Buscar por cliente ou plano..."
                  style={{ ...inputStyle, paddingLeft: '44px' }}
                />
              </div>
              <select style={inputStyle}>
                <option>Todos os status</option>
                <option>Ativos</option>
                <option>Pendentes</option>
                <option>Expirados</option>
              </select>
              <select style={inputStyle}>
                <option>Todos os objetivos</option>
                <option>Emagrecimento</option>
                <option>Ganho de massa</option>
                <option>Manutenção</option>
              </select>
            </div>

            {/* Planos Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '24px' }}>
              {planos.map((plano, index) => (
                <PlanoCard key={index} {...plano} />
              ))}
            </div>
          </>
        )}

        {/* Tab: Novo Plano */}
        {activeTab === 'new' && (
          <>
            {/* Informações Básicas */}
            <div style={{ background: isDark ? 'rgba(38, 38, 38, 0.6)' : 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)', borderRadius: '16px', padding: '32px', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: isDark ? '#ffffff' : '#111827', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Info style={{ width: '18px', height: '18px', color: '#10b981' }} />
                </div>
                Informações do Plano
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: isDark ? '#ffffff' : '#111827', marginBottom: '8px' }}>
                    Selecionar Cliente
                  </label>
                  <select style={inputStyle}>
                    <option>Escolha um cliente...</option>
                    <option>Ana Carolina Lima</option>
                    <option>Marcão da Massa</option>
                    <option>Pamela Nascimento de Lima</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: isDark ? '#ffffff' : '#111827', marginBottom: '8px' }}>
                    Nome do Plano
                  </label>
                  <input type="text" placeholder="Ex: Plano Emagrecimento" style={inputStyle} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: isDark ? '#ffffff' : '#111827', marginBottom: '8px' }}>
                    Objetivo
                  </label>
                  <select style={inputStyle}>
                    <option>Selecione o objetivo...</option>
                    <option>Emagrecimento</option>
                    <option>Ganho de massa</option>
                    <option>Manutenção</option>
                    <option>Performance</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: isDark ? '#ffffff' : '#111827', marginBottom: '8px' }}>
                    Duração (dias)
                  </label>
                  <input type="number" placeholder="Ex: 30" style={inputStyle} />
                </div>
              </div>
            </div>

            {/* Metas Nutricionais */}
            <div style={{ background: isDark ? 'rgba(38, 38, 38, 0.6)' : 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)', borderRadius: '16px', padding: '32px', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: isDark ? '#ffffff' : '#111827', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BarChart3 style={{ width: '18px', height: '18px', color: '#10b981' }} />
                </div>
                Metas Nutricionais
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {[
                  { label: 'Calorias Totais (kcal)', placeholder: 'Ex: 1800' },
                  { label: 'Proteínas (g)', placeholder: 'Ex: 135' },
                  { label: 'Carboidratos (g)', placeholder: 'Ex: 180' },
                  { label: 'Gorduras (g)', placeholder: 'Ex: 60' }
                ].map(({ label, placeholder }) => (
                  <div key={label}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: isDark ? '#ffffff' : '#111827', marginBottom: '8px' }}>
                      {label}
                    </label>
                    <input type="number" placeholder={placeholder} style={inputStyle} />
                  </div>
                ))}
              </div>
            </div>

            {/* Cardápio Semanal */}
            <div style={{ background: isDark ? 'rgba(38, 38, 38, 0.6)' : 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)', borderRadius: '16px', padding: '32px', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: isDark ? '#ffffff' : '#111827', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CalendarIcon style={{ width: '18px', height: '18px', color: '#10b981' }} />
                </div>
                Cardápio Semanal
              </h2>

              {/* Segunda-feira */}
              <div style={{ background: isDark ? 'rgba(20, 20, 20, 0.9)' : '#ffffff', border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)', borderRadius: '12px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)' }}>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: isDark ? '#ffffff' : '#111827' }}>
                    📅 Segunda-feira
                  </div>
                  <button style={{ padding: '6px 12px', borderRadius: '8px', border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)', background: 'transparent', color: isDark ? '#a3a3a3' : '#6b7280', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                    Copiar para outros dias
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {['☀️ Café da Manhã - 07:00', '🍎 Lanche da Manhã - 10:00', '🍽️ Almoço - 12:30'].map((meal) => (
                    <div key={meal} style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '16px', borderRadius: '10px', borderLeft: '3px solid #10b981' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: isDark ? '#ffffff' : '#111827', marginBottom: '12px' }}>
                        {meal}
                      </div>
                      <textarea
                        rows={3}
                        placeholder="Digite os alimentos desta refeição..."
                        style={{ ...inputStyle, resize: 'vertical' }}
                      />
                    </div>
                  ))}
                </div>

                <button style={{ width: '100%', padding: '10px', marginTop: '12px', borderRadius: '10px', border: isDark ? '2px dashed rgba(64, 64, 64, 0.3)' : '2px dashed rgba(229, 231, 235, 0.8)', background: 'transparent', color: isDark ? '#a3a3a3' : '#6b7280', fontWeight: 600, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Plus style={{ width: '16px', height: '16px' }} />
                  Adicionar Refeição
                </button>
              </div>
            </div>

            {/* Orientações */}
            <div style={{ background: isDark ? 'rgba(38, 38, 38, 0.6)' : 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)', borderRadius: '16px', padding: '32px', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: isDark ? '#ffffff' : '#111827', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Edit style={{ width: '18px', height: '18px', color: '#10b981' }} />
                </div>
                Orientações Adicionais
              </h2>

              <textarea
                placeholder="Adicione orientações, dicas de preparo, substituições possíveis, etc..."
                rows={5}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            {/* Ações */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button style={{ padding: '12px 24px', borderRadius: '12px', border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)', background: 'transparent', color: isDark ? '#a3a3a3' : '#6b7280', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
                Salvar como Template
              </button>
              <button style={{ padding: '12px 24px', borderRadius: '12px', border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)', background: 'transparent', color: isDark ? '#a3a3a3' : '#6b7280', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
                Cancelar
              </button>
              <button style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: '#10b981', color: 'white', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Criar Plano Alimentar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
