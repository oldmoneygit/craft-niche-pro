import React, { useState, useEffect, useMemo } from 'react';
import { Search, List, Plus, FileText, CheckCircle, Copy, Trash2, Eye, Calendar } from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import { PlanoCard } from '@/components/planos/PlanoCard';
import { CreateMealPlanModal } from '@/components/planos/CreateMealPlanModal';
import { MealPlanDetailModal } from '@/components/planos/MealPlanDetailModal';
import { useMealPlansData, useDuplicateMealPlan, useDeleteMealPlan } from '@/hooks/useMealPlansData';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function PlanosAlimentares() {
  const [isDark, setIsDark] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: plans, isLoading } = useMealPlansData({ search: searchTerm, status: statusFilter });
  const duplicatePlan = useDuplicateMealPlan();
  const deletePlan = useDeleteMealPlan();
  const { toast } = useToast();

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

  // Calcular estatísticas
  const stats = useMemo(() => {
    if (!plans) return { total: 0, active: 0, thisWeek: 0 };

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());

    return {
      total: plans.length,
      active: plans.filter((p: any) => p.status === 'ativo').length,
      thisWeek: plans.filter((p: any) => {
        const created = new Date(p.created_at);
        return created >= weekStart;
      }).length
    };
  }, [plans]);

  const handleView = (planId: string) => {
    setSelectedPlanId(planId);
    setDetailModalOpen(true);
  };

  const handleDuplicate = async (planId: string) => {
    try {
      await duplicatePlan.mutateAsync(planId);
    } catch (error) {
      console.error('Erro ao duplicar:', error);
    }
  };

  const handleDelete = async (planId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este plano? Esta ação não pode ser desfeita.')) {
      try {
        await deletePlan.mutateAsync(planId);
      } catch (error) {
        console.error('Erro ao excluir:', error);
      }
    }
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

  if (isLoading) {
    return (
      <div style={{ padding: '24px', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <Skeleton className="h-12 w-64 mb-8" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '24px' }}>
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <CreateMealPlanModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
      <MealPlanDetailModal planId={selectedPlanId} open={detailModalOpen} onOpenChange={setDetailModalOpen} />
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

        {/* Header Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div></div>
          <button 
            onClick={() => setCreateModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: '#10b981',
              color: 'white',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#059669';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#10b981';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
            }}
          >
            <Plus className="w-5 h-5" />
            Criar Novo Plano
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <StatCard label="Total de Planos" value={stats.total} icon={<FileText className="w-6 h-6" />} variant="primary" />
          <StatCard label="Planos Ativos" value={stats.active} icon={<CheckCircle className="w-6 h-6" />} variant="success" />
          <StatCard label="Criados esta Semana" value={stats.thisWeek} icon={<Calendar className="w-6 h-6" />} variant="purple" />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: isDark ? '#a3a3a3' : '#6b7280' }} />
            <input
              type="text"
              placeholder="Buscar por cliente ou plano..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ ...inputStyle, paddingLeft: '44px' }}
            />
          </div>
          <select 
            style={inputStyle} 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos os status</option>
            <option value="ativo">Ativos</option>
            <option value="pausado">Pausados</option>
            <option value="concluido">Concluídos</option>
          </select>
        </div>

        {/* Planos Grid */}
        {!plans || plans.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border">
            <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum plano encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Crie seu primeiro plano alimentar para começar.
            </p>
            <Button onClick={() => setCreateModalOpen(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30">
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Plano
            </Button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '24px' }}>
            {plans.map((plan: any) => {
              const statusColors = {
                'ativo': { 
                  bg: '#10b981', 
                  border: '#10b981',
                  gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  iconColor: '#10b981',
                  shadow: 'rgba(16, 185, 129, 0.3)'
                },
                'pausado': { 
                  bg: '#f59e0b', 
                  border: '#f59e0b',
                  gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  iconColor: '#f59e0b',
                  shadow: 'rgba(245, 158, 11, 0.3)'
                },
                'concluido': { 
                  bg: '#6b7280', 
                  border: '#6b7280',
                  gradient: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                  iconColor: '#6b7280',
                  shadow: 'rgba(107, 114, 128, 0.3)'
                }
              };
              const colors = statusColors[plan.status as keyof typeof statusColors] || statusColors['ativo'];

              return (
                <div
                  key={plan.id}
                  className="group relative"
                  style={{
                    background: isDark ? 'rgba(38, 38, 38, 0.6)' : 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.5)',
                    borderRadius: '16px',
                    padding: '28px',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = `0 20px 40px ${colors.shadow}`;
                    e.currentTarget.style.borderColor = colors.border;
                    const border = e.currentTarget.querySelector('.plan-border') as HTMLElement;
                    if (border) border.style.width = '4px';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = isDark ? 'rgba(64, 64, 64, 0.3)' : 'rgba(229, 231, 235, 0.5)';
                    const border = e.currentTarget.querySelector('.plan-border') as HTMLElement;
                    if (border) border.style.width = '0';
                  }}
                >
                  {/* Borda lateral colorida */}
                  <div
                    className="plan-border"
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: '0',
                      background: colors.border,
                      transition: 'width 0.3s ease',
                      borderTopLeftRadius: '16px',
                      borderBottomLeftRadius: '16px'
                    }}
                  />

                  {/* Header com cliente e badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '48px', 
                        height: '48px', 
                        borderRadius: '50%', 
                        background: colors.gradient,
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: 'white', 
                        fontWeight: 700, 
                        fontSize: '18px',
                        boxShadow: `0 4px 12px ${colors.shadow}`
                      }}>
                        {plan.client?.name?.substring(0, 2).toUpperCase() || 'NA'}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: isDark ? '#ffffff' : '#111827', marginBottom: '4px' }}>
                          {plan.client?.name || 'Cliente'}
                        </h3>
                        <p style={{ fontSize: '13px', color: isDark ? '#a3a3a3' : '#6b7280' }}>
                          {plan.goal ? `Objetivo: ${plan.goal}` : 'Sem objetivo definido'}
                        </p>
                      </div>
                    </div>
                    {/* Badge de status com cor sólida */}
                    <div style={{ 
                      padding: '6px 14px', 
                      borderRadius: '20px', 
                      fontSize: '12px', 
                      fontWeight: 700, 
                      background: colors.bg,
                      color: 'white', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.5px',
                      boxShadow: `0 4px 12px ${colors.shadow}`
                    }}>
                      {plan.status}
                    </div>
                  </div>

                  {/* Título do plano */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: isDark ? '#ffffff' : '#111827', marginBottom: '12px' }}>
                      {plan.name}
                    </div>
                    {/* Meta rows com ícones coloridos */}
                    <div style={{ display: 'grid', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                        <Calendar style={{ width: '18px', height: '18px', color: colors.iconColor }} />
                        <span style={{ color: isDark ? '#a3a3a3' : '#6b7280' }}>Início:</span>
                        <span style={{ fontWeight: 600, color: isDark ? '#ffffff' : '#111827', marginLeft: 'auto' }}>
                          {new Date(plan.start_date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      {plan.target_kcal && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                          <FileText style={{ width: '18px', height: '18px', color: colors.iconColor }} />
                          <span style={{ color: isDark ? '#a3a3a3' : '#6b7280' }}>Meta Calórica:</span>
                          <span style={{ fontWeight: 600, color: isDark ? '#ffffff' : '#111827', marginLeft: 'auto' }}>
                            {plan.target_kcal} kcal
                          </span>
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                        <List style={{ width: '18px', height: '18px', color: colors.iconColor }} />
                        <span style={{ color: isDark ? '#a3a3a3' : '#6b7280' }}>Refeições:</span>
                        <span style={{ fontWeight: 600, color: isDark ? '#ffffff' : '#111827', marginLeft: 'auto' }}>
                          {plan.meals?.length || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Área de macros com background verde suave */}
                  {(plan.target_protein || plan.target_carbs || plan.target_fats) && (
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(3, 1fr)', 
                      gap: '12px', 
                      marginBottom: '20px', 
                      padding: '16px', 
                      background: 'rgba(16, 185, 129, 0.05)',
                      border: '1px solid rgba(16, 185, 129, 0.1)',
                      borderRadius: '12px' 
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: 700, color: isDark ? '#ffffff' : '#111827', marginBottom: '4px' }}>
                          {plan.target_protein || 0}g
                        </div>
                        <div style={{ fontSize: '11px', color: isDark ? '#a3a3a3' : '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                          Proteínas
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: 700, color: isDark ? '#ffffff' : '#111827', marginBottom: '4px' }}>
                          {plan.target_fats || 0}g
                        </div>
                        <div style={{ fontSize: '11px', color: isDark ? '#a3a3a3' : '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                          Gorduras
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: 700, color: isDark ? '#ffffff' : '#111827', marginBottom: '4px' }}>
                          {plan.target_carbs || 0}g
                        </div>
                        <div style={{ fontSize: '11px', color: isDark ? '#a3a3a3' : '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                          Carboidratos
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Botões de ação com cores específicas no hover */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', paddingTop: '20px', borderTop: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)' }}>
                    {/* Botão Ver - verde no hover */}
                    <button
                      onClick={() => handleView(plan.id)}
                      style={{
                        padding: '10px',
                        borderRadius: '10px',
                        border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)',
                        background: isDark ? 'rgba(38, 38, 38, 0.6)' : 'rgba(255, 255, 255, 0.7)',
                        color: isDark ? '#a3a3a3' : '#6b7280',
                        fontWeight: 600,
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
                        e.currentTarget.style.borderColor = '#10b981';
                        e.currentTarget.style.color = '#10b981';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = isDark ? 'rgba(38, 38, 38, 0.6)' : 'rgba(255, 255, 255, 0.7)';
                        e.currentTarget.style.borderColor = isDark ? 'rgba(64, 64, 64, 0.3)' : 'rgba(229, 231, 235, 0.8)';
                        e.currentTarget.style.color = isDark ? '#a3a3a3' : '#6b7280';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <Eye style={{ width: '16px', height: '16px' }} />
                    </button>
                    {/* Botão Duplicar - azul no hover */}
                    <button
                      onClick={() => handleDuplicate(plan.id)}
                      style={{
                        padding: '10px',
                        borderRadius: '10px',
                        border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)',
                        background: isDark ? 'rgba(38, 38, 38, 0.6)' : 'rgba(255, 255, 255, 0.7)',
                        color: isDark ? '#a3a3a3' : '#6b7280',
                        fontWeight: 600,
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                        e.currentTarget.style.borderColor = '#3b82f6';
                        e.currentTarget.style.color = '#3b82f6';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = isDark ? 'rgba(38, 38, 38, 0.6)' : 'rgba(255, 255, 255, 0.7)';
                        e.currentTarget.style.borderColor = isDark ? 'rgba(64, 64, 64, 0.3)' : 'rgba(229, 231, 235, 0.8)';
                        e.currentTarget.style.color = isDark ? '#a3a3a3' : '#6b7280';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <Copy style={{ width: '16px', height: '16px' }} />
                    </button>
                    {/* Botão Excluir - vermelho no hover */}
                    <button
                      onClick={() => handleDelete(plan.id)}
                      style={{
                        padding: '10px',
                        borderRadius: '10px',
                        border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)',
                        background: isDark ? 'rgba(38, 38, 38, 0.6)' : 'rgba(255, 255, 255, 0.7)',
                        color: isDark ? '#a3a3a3' : '#6b7280',
                        fontWeight: 600,
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                        e.currentTarget.style.borderColor = '#ef4444';
                        e.currentTarget.style.color = '#ef4444';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = isDark ? 'rgba(38, 38, 38, 0.6)' : 'rgba(255, 255, 255, 0.7)';
                        e.currentTarget.style.borderColor = isDark ? 'rgba(64, 64, 64, 0.3)' : 'rgba(229, 231, 235, 0.8)';
                        e.currentTarget.style.color = isDark ? '#a3a3a3' : '#6b7280';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <Trash2 style={{ width: '16px', height: '16px' }} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
    </>
  );
}
