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
          <Button 
            onClick={() => setCreateModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Novo Plano
          </Button>
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
            <Button onClick={() => setCreateModalOpen(true)} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Plano
            </Button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '24px' }}>
            {plans.map((plan: any) => (
              <div
                key={plan.id}
                style={{
                  background: isDark ? 'rgba(38, 38, 38, 0.6)' : 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)',
                  borderRadius: '16px',
                  padding: '28px',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '18px' }}>
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
                  <div style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, background: plan.status === 'ativo' ? '#10b981' : '#6b7280', color: 'white', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {plan.status}
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: isDark ? '#ffffff' : '#111827', marginBottom: '12px' }}>
                    {plan.name}
                  </div>
                  <div style={{ display: 'grid', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                      <Calendar style={{ width: '18px', height: '18px', color: '#10b981' }} />
                      <span style={{ color: isDark ? '#a3a3a3' : '#6b7280' }}>Início:</span>
                      <span style={{ fontWeight: 600, color: isDark ? '#ffffff' : '#111827', marginLeft: 'auto' }}>
                        {new Date(plan.start_date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    {plan.target_kcal && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                        <FileText style={{ width: '18px', height: '18px', color: '#10b981' }} />
                        <span style={{ color: isDark ? '#a3a3a3' : '#6b7280' }}>Meta Calórica:</span>
                        <span style={{ fontWeight: 600, color: isDark ? '#ffffff' : '#111827', marginLeft: 'auto' }}>
                          {plan.target_kcal} kcal
                        </span>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                      <List style={{ width: '18px', height: '18px', color: '#10b981' }} />
                      <span style={{ color: isDark ? '#a3a3a3' : '#6b7280' }}>Refeições:</span>
                      <span style={{ fontWeight: 600, color: isDark ? '#ffffff' : '#111827', marginLeft: 'auto' }}>
                        {plan.meals?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', paddingTop: '20px', borderTop: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)' }}>
                  <button
                    onClick={() => handleView(plan.id)}
                    style={{
                      padding: '10px',
                      borderRadius: '10px',
                      border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)',
                      background: 'transparent',
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
                  >
                    <Eye style={{ width: '16px', height: '16px' }} />
                  </button>
                  <button
                    onClick={() => handleDuplicate(plan.id)}
                    style={{
                      padding: '10px',
                      borderRadius: '10px',
                      border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)',
                      background: 'transparent',
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
                  >
                    <Copy style={{ width: '16px', height: '16px' }} />
                  </button>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    style={{
                      padding: '10px',
                      borderRadius: '10px',
                      border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)',
                      background: 'transparent',
                      color: '#ef4444',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <Trash2 style={{ width: '16px', height: '16px' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
}
