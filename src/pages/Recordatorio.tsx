import React, { useState, useEffect } from 'react';
import { Search, List, Plus, User, Clock, Edit, Trash2, Eye, ArrowLeft, Utensils } from 'lucide-react';
import { useRecordatorio, Recordatorio as RecordatorioType } from '@/hooks/useRecordatorio';
import { useClientsData } from '@/hooks/useClientsData';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MealInput {
  meal_type: string;
  time: string;
  foods: string;
  order_index: number;
}

export default function Recordatorio() {
  const [activeTab, setActiveTab] = useState<'list' | 'new' | 'view'>('list');
  const [isDark, setIsDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [periodFilter, setPeriodFilter] = useState('all');
  
  // Form state
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState('');
  const [hydration, setHydration] = useState('');
  const [notes, setNotes] = useState('');
  const [meals, setMeals] = useState<MealInput[]>([{
    meal_type: 'breakfast',
    time: '07:00',
    foods: '',
    order_index: 0
  }]);
  
  // View state
  const [viewingRecordatorio, setViewingRecordatorio] = useState<RecordatorioType | null>(null);
  
  const { recordatorios, loading, createRecordatorio, deleteRecordatorio, getRecordatorioById } = useRecordatorio();
  const { clients } = useClientsData();

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

  // Filtrar recordatórios
  const filteredRecordatorios = recordatorios.filter(rec => {
    // Filtro de busca
    if (searchQuery && !rec.patient_name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filtro de período
    if (periodFilter !== 'all') {
      const recDate = new Date(rec.record_date);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - recDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (periodFilter === 'week' && diffDays > 7) return false;
      if (periodFilter === 'month' && diffDays > 30) return false;
      if (periodFilter === '3months' && diffDays > 90) return false;
    }
    
    return true;
  });

  // Handlers
  const handleAddMeal = () => {
    setMeals([...meals, {
      meal_type: 'lunch',
      time: '12:00',
      foods: '',
      order_index: meals.length
    }]);
  };

  const handleRemoveMeal = (index: number) => {
    setMeals(meals.filter((_, i) => i !== index));
  };

  const handleUpdateMeal = (index: number, field: keyof MealInput, value: string) => {
    const newMeals = [...meals];
    newMeals[index] = { ...newMeals[index], [field]: value };
    setMeals(newMeals);
  };

  const handleSaveRecordatorio = async () => {
    if (!selectedPatientId) {
      alert('Por favor, selecione um paciente');
      return;
    }

    const selectedClient = clients.find(c => c.id === selectedPatientId);
    if (!selectedClient) return;

    const validMeals = meals.filter(m => m.foods.trim() !== '');
    if (validMeals.length === 0) {
      alert('Adicione pelo menos uma refeição com alimentos');
      return;
    }

    try {
      await createRecordatorio({
        patient_id: selectedPatientId,
        patient_name: selectedClient.name,
        type: 'r24h', // Sempre R24h por padrão
        record_date: recordDate,
        notes,
        meals: validMeals
      });

      // Reset form
      setSelectedPatientId('');
      setRecordDate(new Date().toISOString().split('T')[0]);
      setWeight('');
      setHydration('');
      setNotes('');
      setMeals([{
        meal_type: 'breakfast',
        time: '07:00',
        foods: '',
        order_index: 0
      }]);
      
      // Voltar para lista
      setActiveTab('list');
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  const handleViewRecordatorio = async (id: string) => {
    const recordatorio = await getRecordatorioById(id);
    if (recordatorio) {
      setViewingRecordatorio(recordatorio);
      setActiveTab('view');
    }
  };

  const handleDeleteRecordatorio = async (id: string, name: string) => {
    if (window.confirm(`Deseja realmente excluir o recordatório de ${name}?`)) {
      await deleteRecordatorio(id);
    }
  };

  const formatRecordDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch {
      return dateString;
    }
  };

  const getMealTypeEmoji = (type: string) => {
    const emojis: Record<string, string> = {
      breakfast: '☀️',
      morning_snack: '🥤',
      lunch: '🍽️',
      afternoon_snack: '🍎',
      dinner: '🌙',
      supper: '🌃',
      other: '🍴'
    };
    return emojis[type] || '🍴';
  };

  const getMealTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      breakfast: 'Café da Manhã',
      morning_snack: 'Lanche da Manhã',
      lunch: 'Almoço',
      afternoon_snack: 'Lanche da Tarde',
      dinner: 'Jantar',
      supper: 'Ceia',
      other: 'Outro'
    };
    return labels[type] || 'Refeição';
  };

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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select 
                style={inputStyle}
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
              >
                <option value="all">Todos os períodos</option>
                <option value="week">Última semana</option>
                <option value="month">Último mês</option>
                <option value="3months">Últimos 3 meses</option>
              </select>
            </div>

            {/* Lista */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: isDark ? '#a3a3a3' : '#6b7280' }}>
                Carregando recordatórios...
              </div>
            ) : filteredRecordatorios.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: isDark ? '#a3a3a3' : '#6b7280' }}>
                Nenhum recordatório encontrado
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredRecordatorios.map((record) => (
                  <div key={record.id} style={{
                    background: isDark ? 'rgba(38, 38, 38, 0.6)' : 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)',
                    borderRadius: '16px',
                    padding: '24px',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ 
                          width: '48px', 
                          height: '48px', 
                          borderRadius: '50%', 
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          color: 'white', 
                          fontWeight: 700, 
                          fontSize: '18px' 
                        }}>
                          {record.patient_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 style={{ fontSize: '18px', fontWeight: 700, color: isDark ? '#ffffff' : '#111827', marginBottom: '4px' }}>
                            {record.patient_name}
                          </h3>
                          <p style={{ fontSize: '13px', color: isDark ? '#a3a3a3' : '#6b7280' }}>
                            {record.type === 'r24h' ? 'R24h - Recordatório 24 horas' : 'R3D - Recordatório 3 dias'}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', fontSize: '13px', fontWeight: 600 }}>
                          {formatRecordDate(record.record_date)}
                        </div>
                        <button 
                          onClick={() => handleViewRecordatorio(record.id)}
                          title="Visualizar"
                          style={{ 
                            width: '36px', 
                            height: '36px', 
                            borderRadius: '8px', 
                            border: 'none', 
                            background: 'rgba(16, 185, 129, 0.1)', 
                            color: '#10b981', 
                            cursor: 'pointer', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <Eye style={{ width: '18px', height: '18px' }} />
                        </button>
                        <button 
                          onClick={() => handleDeleteRecordatorio(record.id, record.patient_name)}
                          title="Excluir"
                          style={{ 
                            width: '36px', 
                            height: '36px', 
                            borderRadius: '8px', 
                            border: 'none', 
                            background: 'rgba(239, 68, 68, 0.1)', 
                            color: '#ef4444', 
                            cursor: 'pointer', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <Trash2 style={{ width: '18px', height: '18px' }} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Métricas */}
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px' }}>
                      <span style={{ color: isDark ? '#a3a3a3' : '#6b7280' }}>
                        <strong>{record.meals_count || 0}</strong> refeições registradas
                      </span>
                      {record.total_calories && (
                        <span style={{ color: isDark ? '#a3a3a3' : '#6b7280' }}>
                          <strong>{record.total_calories}</strong> kcal
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                    Selecionar Paciente *
                  </label>
                  <select 
                    style={inputStyle}
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                  >
                    <option value="">Escolha um paciente...</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: isDark ? '#ffffff' : '#111827', marginBottom: '8px' }}>
                    Data do Recordatório *
                  </label>
                  <input 
                    type="date" 
                    value={recordDate}
                    onChange={(e) => setRecordDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    style={inputStyle} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: isDark ? '#ffffff' : '#111827', marginBottom: '8px' }}>
                    Peso Atual (kg)
                  </label>
                  <input 
                    type="number" 
                    placeholder="Ex: 72.5" 
                    step="0.1" 
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    style={inputStyle} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: isDark ? '#ffffff' : '#111827', marginBottom: '8px' }}>
                    Hidratação (litros)
                  </label>
                  <input 
                    type="number" 
                    placeholder="Ex: 2.5" 
                    step="0.1"
                    value={hydration}
                    onChange={(e) => setHydration(e.target.value)}
                    style={inputStyle} 
                  />
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

              {meals.map((meal, index) => (
                <div key={index} style={{ background: isDark ? 'rgba(20, 20, 20, 0.9)' : '#ffffff', border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: isDark ? '#ffffff' : '#111827' }}>
                        {getMealTypeEmoji(meal.meal_type)} {getMealTypeLabel(meal.meal_type)}
                      </div>
                      <input 
                        type="time" 
                        value={meal.time}
                        onChange={(e) => handleUpdateMeal(index, 'time', e.target.value)}
                        style={{ ...inputStyle, width: '120px', marginTop: '8px' }} 
                      />
                    </div>
                    <button 
                      onClick={() => handleRemoveMeal(index)}
                      style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Trash2 style={{ width: '18px', height: '18px' }} />
                    </button>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <select 
                      style={inputStyle}
                      value={meal.meal_type}
                      onChange={(e) => handleUpdateMeal(index, 'meal_type', e.target.value)}
                    >
                      <option value="breakfast">Café da Manhã</option>
                      <option value="morning_snack">Lanche da Manhã</option>
                      <option value="lunch">Almoço</option>
                      <option value="afternoon_snack">Lanche da Tarde</option>
                      <option value="dinner">Jantar</option>
                      <option value="supper">Ceia</option>
                      <option value="other">Outro</option>
                    </select>
                  </div>

                  <textarea
                    placeholder="Liste os alimentos consumidos, com quantidades (ex: Pão integral 2 fatias, Queijo branco 30g, Café com leite 200ml)"
                    value={meal.foods}
                    onChange={(e) => handleUpdateMeal(index, 'foods', e.target.value)}
                    rows={3}
                    style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
                  />
                </div>
              ))}

              <button 
                onClick={handleAddMeal}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: isDark ? '2px dashed rgba(64, 64, 64, 0.3)' : '2px dashed rgba(229, 231, 235, 0.8)', background: 'transparent', color: isDark ? '#a3a3a3' : '#6b7280', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
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
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ ...inputStyle, resize: 'vertical', minHeight: '100px' }}
              />
            </div>

            {/* Ações */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setActiveTab('list')}
                style={{ padding: '12px 24px', borderRadius: '12px', border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)', background: 'transparent', color: isDark ? '#a3a3a3' : '#6b7280', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveRecordatorio}
                disabled={loading}
                style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: loading ? '#6b7280' : '#10b981', color: 'white', fontWeight: 600, fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: loading ? 0.6 : 1 }}
              >
                {loading ? 'Salvando...' : 'Salvar Recordatório'}
              </button>
            </div>
          </>
        )}

        {/* Tab: Visualizar */}
        {activeTab === 'view' && viewingRecordatorio && (
          <>
            {/* Header com botão voltar */}
            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                onClick={() => setActiveTab('list')}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  border: 'none',
                  background: isDark ? 'rgba(38, 38, 38, 0.6)' : 'rgba(255, 255, 255, 0.9)',
                  color: isDark ? '#ffffff' : '#111827',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease'
                }}
              >
                <ArrowLeft style={{ width: '20px', height: '20px' }} />
              </button>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>
                  Recordatório de {viewingRecordatorio.patient_name}
                </h2>
                <p style={{ fontSize: '14px', opacity: 0.7 }}>
                  {viewingRecordatorio.type === 'r24h' ? 'Recordatório 24 horas' : 'Recordatório 3 dias'} • {formatRecordDate(viewingRecordatorio.record_date)}
                </p>
              </div>
            </div>

            {/* Info Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{
                background: isDark ? 'rgba(38, 38, 38, 0.6)' : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)',
                borderRadius: '16px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '13px', color: isDark ? '#a3a3a3' : '#6b7280', marginBottom: '8px' }}>
                  Status
                </div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: viewingRecordatorio.status === 'analyzed' ? '#10b981' : '#f59e0b' }}>
                  {viewingRecordatorio.status === 'analyzed' ? '✅ Analisado' : '⏳ Pendente'}
                </div>
              </div>

              <div style={{
                background: isDark ? 'rgba(38, 38, 38, 0.6)' : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)',
                borderRadius: '16px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '13px', color: isDark ? '#a3a3a3' : '#6b7280', marginBottom: '8px' }}>
                  Refeições
                </div>
                <div style={{ fontSize: '24px', fontWeight: 700 }}>
                  {viewingRecordatorio.meals?.length || 0}
                </div>
              </div>

              {viewingRecordatorio.total_calories && (
                <div style={{
                  background: isDark ? 'rgba(38, 38, 38, 0.6)' : 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)',
                  borderRadius: '16px',
                  padding: '20px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '13px', color: isDark ? '#a3a3a3' : '#6b7280', marginBottom: '8px' }}>
                    Calorias Totais
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: '#3b82f6' }}>
                    {viewingRecordatorio.total_calories} kcal
                  </div>
                </div>
              )}
            </div>

            {/* Macros (se analisado) */}
            {viewingRecordatorio.status === 'analyzed' && viewingRecordatorio.total_protein && (
              <div style={{
                background: isDark ? 'rgba(38, 38, 38, 0.6)' : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
                  Análise Nutricional
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '13px', color: isDark ? '#a3a3a3' : '#6b7280', marginBottom: '4px' }}>
                      Proteínas
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: '#ef4444' }}>
                      {viewingRecordatorio.total_protein?.toFixed(1)}g
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', color: isDark ? '#a3a3a3' : '#6b7280', marginBottom: '4px' }}>
                      Carboidratos
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: '#3b82f6' }}>
                      {viewingRecordatorio.total_carbs?.toFixed(1)}g
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', color: isDark ? '#a3a3a3' : '#6b7280', marginBottom: '4px' }}>
                      Gorduras
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: '#f59e0b' }}>
                      {viewingRecordatorio.total_fat?.toFixed(1)}g
                    </div>
                  </div>
                  {viewingRecordatorio.total_fiber && (
                    <div>
                      <div style={{ fontSize: '13px', color: isDark ? '#a3a3a3' : '#6b7280', marginBottom: '4px' }}>
                        Fibras
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: '#10b981' }}>
                        {viewingRecordatorio.total_fiber?.toFixed(1)}g
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Refeições */}
            <div style={{
              background: isDark ? 'rgba(38, 38, 38, 0.6)' : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)',
              borderRadius: '16px',
              padding: '32px',
              marginBottom: '24px'
            }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: 700, 
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Utensils style={{ width: '18px', height: '18px', color: '#10b981' }} />
                </div>
                Refeições Registradas
              </h3>

              {viewingRecordatorio.meals && viewingRecordatorio.meals.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {viewingRecordatorio.meals.map((meal, index) => (
                    <div key={meal.id || index} style={{
                      background: isDark ? 'rgba(20, 20, 20, 0.9)' : '#ffffff',
                      border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)',
                      borderRadius: '12px',
                      padding: '20px'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '12px'
                      }}>
                        <div style={{ fontSize: '16px', fontWeight: 700 }}>
                          {getMealTypeEmoji(meal.meal_type)} {getMealTypeLabel(meal.meal_type)}
                        </div>
                        {meal.time && (
                          <div style={{ 
                            padding: '4px 12px', 
                            borderRadius: '6px', 
                            background: 'rgba(59, 130, 246, 0.1)', 
                            color: '#3b82f6', 
                            fontSize: '13px',
                            fontWeight: 600
                          }}>
                            {meal.time}
                          </div>
                        )}
                      </div>
                      
                      <div style={{ 
                        fontSize: '14px', 
                        color: isDark ? '#d1d5db' : '#374151',
                        lineHeight: '1.6',
                        whiteSpace: 'pre-line'
                      }}>
                        {meal.foods}
                      </div>

                      {/* Nutrição da refeição (se analisada) */}
                      {meal.calories && (
                        <div style={{ 
                          marginTop: '12px',
                          paddingTop: '12px',
                          borderTop: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)',
                          display: 'flex',
                          gap: '16px',
                          flexWrap: 'wrap',
                          fontSize: '13px',
                          color: isDark ? '#a3a3a3' : '#6b7280'
                        }}>
                          <span><strong>{meal.calories}</strong> kcal</span>
                          {meal.protein && <span>P: <strong>{meal.protein.toFixed(1)}</strong>g</span>}
                          {meal.carbs && <span>C: <strong>{meal.carbs.toFixed(1)}</strong>g</span>}
                          {meal.fat && <span>G: <strong>{meal.fat.toFixed(1)}</strong>g</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: isDark ? '#a3a3a3' : '#6b7280' }}>
                  Nenhuma refeição registrada
                </div>
              )}
            </div>

            {/* Observações */}
            {viewingRecordatorio.notes && (
              <div style={{
                background: isDark ? 'rgba(38, 38, 38, 0.6)' : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>
                  Observações
                </h3>
                <p style={{ 
                  fontSize: '14px', 
                  color: isDark ? '#d1d5db' : '#374151',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-line'
                }}>
                  {viewingRecordatorio.notes}
                </p>
              </div>
            )}

            {/* Ações */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setActiveTab('list')}
                style={{ 
                  padding: '12px 24px', 
                  borderRadius: '12px', 
                  border: 'none', 
                  background: '#10b981', 
                  color: 'white', 
                  fontWeight: 600, 
                  fontSize: '14px', 
                  cursor: 'pointer' 
                }}
              >
                Voltar para Lista
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
