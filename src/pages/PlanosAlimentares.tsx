import React, { useState, useEffect, useMemo } from 'react';
import { Search, List, Plus, FileText, CheckCircle, Copy, Trash2, Eye, Calendar, Edit } from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import { PlanoCard } from '@/components/planos/PlanoCard';
import { CreateMealPlanModal } from '@/components/planos/CreateMealPlanModal';
import { MealPlanDetailModal } from '@/components/planos/MealPlanDetailModal';
import { useMealPlansData, useDuplicateMealPlan, useDeleteMealPlan } from '@/hooks/useMealPlansData';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export default function PlanosAlimentares() {
  const [isDark, setIsDark] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editPlanId, setEditPlanId] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: plans, isLoading } = useMealPlansData({ search: searchTerm, status: statusFilter });
  const duplicatePlan = useDuplicateMealPlan();
  const deletePlan = useDeleteMealPlan();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const handleEdit = (planId: string) => {
    setEditPlanId(planId);
    setCreateModalOpen(true);
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
      <CreateMealPlanModal 
        open={createModalOpen} 
        onOpenChange={(open) => {
          setCreateModalOpen(open);
          if (!open) setEditPlanId(null);
        }}
        editPlanId={editPlanId}
      />
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
            <option value="pendente">Pendentes</option>
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
              // Calcular totais dos nutrientes
              const realTotals = {
                calories: 0,
                protein: 0,
                carbs: 0,
                fats: 0
              };
              
              if (plan.meals && Array.isArray(plan.meals)) {
                plan.meals.forEach((meal: any) => {
                  if (meal.items && Array.isArray(meal.items)) {
                    meal.items.forEach((item: any) => {
                      realTotals.calories += item.kcal_total || 0;
                      realTotals.protein += item.protein_total || 0;
                      realTotals.carbs += item.carb_total || 0;
                      realTotals.fats += item.fat_total || 0;
                    });
                  }
                });
              }

              // Calcular duração em dias
              const start = new Date(plan.start_date);
              const end = plan.end_date ? new Date(plan.end_date) : new Date();
              const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

              // Função de mudança de status
              const handleStatusChange = async (newStatus: 'ativo' | 'pendente' | 'concluido') => {
                try {
                  const { error } = await supabase
                    .from('meal_plans')
                    .update({ status: newStatus })
                    .eq('id', plan.id);
                  
                  if (error) throw error;
                  
                  queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
                  toast({
                    title: "Status atualizado",
                    description: `Plano marcado como ${newStatus}`
                  });
                } catch (error) {
                  console.error('Erro ao atualizar status:', error);
                  toast({
                    variant: "destructive",
                    title: "Erro",
                    description: "Não foi possível atualizar o status"
                  });
                }
              };

              return (
                <PlanoCard
                  key={plan.id}
                  clientName={plan.client?.name || 'Cliente'}
                  clientInitials={plan.client?.name?.substring(0, 2).toUpperCase() || 'NA'}
                  objective={plan.goal || 'Sem objetivo definido'}
                  status={plan.status || 'ativo'}
                  planTitle={plan.name}
                  startDate={new Date(plan.start_date).toLocaleDateString('pt-BR')}
                  duration={duration > 0 ? duration : undefined}
                  calories={`${Math.round(realTotals.calories || plan.target_kcal || 0)} kcal`}
                  protein={`${Math.round(realTotals.protein || plan.target_protein || 0)}g`}
                  fat={`${Math.round(realTotals.fats || plan.target_fats || 0)}g`}
                  carbs={`${Math.round(realTotals.carbs || plan.target_carbs || 0)}g`}
                  targetCalories={plan.target_kcal}
                  targetProtein={plan.target_protein}
                  targetCarbs={plan.target_carbs}
                  targetFats={plan.target_fats}
                  onStatusChange={handleStatusChange}
                  onView={() => handleView(plan.id)}
                  onEdit={() => handleEdit(plan.id)}
                  onShare={() => {
                    if (plan.public_token) {
                      const url = `${window.location.origin}/public/meal-plan/${plan.public_token}`;
                      navigator.clipboard.writeText(url);
                      toast({
                        title: "Link copiado!",
                        description: "Link do plano copiado para área de transferência"
                      });
                    } else {
                      toast({
                        variant: "destructive",
                        title: "Erro",
                        description: "Este plano não possui link público"
                      });
                    }
                  }}
                  onDuplicate={() => handleDuplicate(plan.id)}
                  onDelete={() => handleDelete(plan.id)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
    </>
  );
}
