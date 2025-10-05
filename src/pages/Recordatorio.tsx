import React, { useState, useEffect } from 'react';
import { Search, List, Plus, User, Clock, Edit, Trash2 } from 'lucide-react';
import { RecordatorioCard } from '@/components/recordatorio/RecordatorioCard';

export default function Recordatorio() {
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

  const recordatorios = [
    {
      clientName: 'Ana Carolina Lima',
      clientInitials: 'AC',
      clientPlan: 'Plano: Acompanhamento Mensal',
      date: '15/09/2025',
      meals: 5,
      calories: '1.847 kcal',
      protein: '98g',
      water: '2.1 L',
      avatarColor: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    },
    {
      clientName: 'Marcão da Massa',
      clientInitials: 'MM',
      clientPlan: 'Plano: Acompanhamento Trimestral',
      date: '14/09/2025',
      meals: 6,
      calories: '2.934 kcal',
      protein: '187g',
      water: '3.5 L',
      avatarColor: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
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
            Recordatório Alimentar
          </h1>
          <p style={{ fontSize: '15px', opacity: 0.7 }}>
            Registre o que seus pacientes realmente comem
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', background: isDark ? 'rgba(38, 38, 38, 0.6)' : 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', padding: '6px', borderRadius: '12px', border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)' }}>
          <button onClick={() => setActiveTab('list')} style={tabStyle(activeTab === 'list')}>
            <List style={{ width: '18px', height: '18px' }} />
            Gerenciar Recordatórios
          </button>
          <button onClick={() => setActiveTab('new')} style={tabStyle(activeTab === 'new')}>
            <Plus style={{ width: '18px', height: '18px' }} />
            Novo Recordatório
          </button>
        </div>

        {/* Tab: Lista */}
        {activeTab === 'list' && (
          <>
            {/* Filters */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: isDark ? '#a3a3a3' : '#6b7280' }} />
                <input
                  type="text"
                  placeholder="Buscar por cliente..."
                  style={{ ...inputStyle, paddingLeft: '44px' }}
                />
              </div>
              <select style={inputStyle}>
                <option>Todos os períodos</option>
                <option>Última semana</option>
                <option>Último mês</option>
                <option>Últimos 3 meses</option>
              </select>
            </div>

            {/* Lista */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {recordatorios.map((record, index) => (
                <RecordatorioCard key={index} {...record} />
              ))}
            </div>
          </>
        )}

        {/* Tab: Novo */}
        {activeTab === 'new' && (
          <>
            {/* Informações do Paciente */}
            <div style={{ background: isDark ? 'rgba(38, 38, 38, 0.6)' : 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)', borderRadius: '16px', padding: '32px', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: isDark ? '#ffffff' : '#111827', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User style={{ width: '18px', height: '18px', color: '#10b981' }} />
                </div>
                Informações do Paciente
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: isDark ? '#ffffff' : '#111827', marginBottom: '8px' }}>
                    Selecionar Paciente
                  </label>
                  <select style={inputStyle}>
                    <option>Escolha um paciente...</option>
                    <option>Ana Carolina Lima</option>
                    <option>Marcão da Massa</option>
                    <option>Pamela Nascimento de Lima</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: isDark ? '#ffffff' : '#111827', marginBottom: '8px' }}>
                    Data do Recordatório
                  </label>
                  <input type="date" defaultValue="2025-10-05" style={inputStyle} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: isDark ? '#ffffff' : '#111827', marginBottom: '8px' }}>
                    Peso Atual (kg)
                  </label>
                  <input type="number" placeholder="Ex: 72.5" step="0.1" style={inputStyle} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: isDark ? '#ffffff' : '#111827', marginBottom: '8px' }}>
                    Hidratação (litros)
                  </label>
                  <input type="number" placeholder="Ex: 2.5" step="0.1" style={inputStyle} />
                </div>
              </div>
            </div>

            {/* Refeições */}
            <div style={{ background: isDark ? 'rgba(38, 38, 38, 0.6)' : 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)', borderRadius: '16px', padding: '32px', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: isDark ? '#ffffff' : '#111827', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock style={{ width: '18px', height: '18px', color: '#10b981' }} />
                </div>
                Refeições do Dia
              </h2>

              {/* Café da Manhã */}
              <div style={{ background: isDark ? 'rgba(20, 20, 20, 0.9)' : '#ffffff', border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: isDark ? '#ffffff' : '#111827' }}>
                      ☀️ Café da Manhã
                    </div>
                    <input type="time" defaultValue="07:00" style={{ ...inputStyle, width: '120px', marginTop: '8px' }} />
                  </div>
                  <button style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Trash2 style={{ width: '18px', height: '18px' }} />
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                  <input type="text" placeholder="Alimento (ex: Pão integral)" style={inputStyle} />
                  <input type="number" placeholder="Qtd" style={inputStyle} />
                  <select style={inputStyle}>
                    <option>Unidade</option>
                    <option>g</option>
                    <option>ml</option>
                    <option>colher</option>
                    <option>xícara</option>
                  </select>
                  <button style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: 'transparent', color: isDark ? '#a3a3a3' : '#6b7280', cursor: 'pointer' }}>
                    <Trash2 style={{ width: '16px', height: '16px' }} />
                  </button>
                </div>

                <button style={{ padding: '8px 16px', borderRadius: '8px', border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)', background: 'transparent', color: isDark ? '#a3a3a3' : '#6b7280', fontWeight: 600, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Plus style={{ width: '16px', height: '16px' }} />
                  Adicionar Alimento
                </button>
              </div>

              <button style={{ width: '100%', padding: '12px', borderRadius: '12px', border: isDark ? '2px dashed rgba(64, 64, 64, 0.3)' : '2px dashed rgba(229, 231, 235, 0.8)', background: 'transparent', color: isDark ? '#a3a3a3' : '#6b7280', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Plus style={{ width: '20px', height: '20px' }} />
                Adicionar Nova Refeição
              </button>
            </div>

            {/* Observações */}
            <div style={{ background: isDark ? 'rgba(38, 38, 38, 0.6)' : 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)', borderRadius: '16px', padding: '32px', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: isDark ? '#ffffff' : '#111827', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Edit style={{ width: '18px', height: '18px', color: '#10b981' }} />
                </div>
                Observações e Notas
              </h2>

              <textarea
                placeholder="Adicione observações sobre sintomas, comportamento alimentar, contexto emocional, etc..."
                rows={5}
                style={{ ...inputStyle, resize: 'vertical', minHeight: '100px' }}
              />
            </div>

            {/* Ações */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button style={{ padding: '12px 24px', borderRadius: '12px', border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)', background: 'transparent', color: isDark ? '#a3a3a3' : '#6b7280', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
                Cancelar
              </button>
              <button style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: '#10b981', color: 'white', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Salvar Recordatório
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
