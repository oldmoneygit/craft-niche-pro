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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Planos Alimentares
            </h1>
            <p className="text-gray-400">
              Crie e gerencie planos alimentares para seus clientes
            </p>
          </div>
          <button 
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-green-500/50 transition-all hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Criar Novo Plano
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total de Planos */}
          <div className="group bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border-2 border-gray-700 hover:border-blue-500 transition-all shadow-lg hover:shadow-blue-500/20">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Total de Planos
              </span>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-5xl font-bold text-white mb-2">
              {stats.total || 0}
            </div>
            <div className="text-sm text-gray-400">
              Todos os planos criados
            </div>
          </div>

          {/* Planos Ativos */}
          <div className="group bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border-2 border-gray-700 hover:border-green-500 transition-all shadow-lg hover:shadow-green-500/20">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Planos Ativos
              </span>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-5xl font-bold text-white mb-2">
              {stats.active || 0}
            </div>
            <div className="text-sm text-gray-400">
              Em uso pelos clientes
            </div>
          </div>

          {/* Criados esta Semana */}
          <div className="group bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border-2 border-gray-700 hover:border-purple-500 transition-all shadow-lg hover:shadow-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Criados esta Semana
              </span>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-5xl font-bold text-white mb-2">
              {stats.thisWeek || 0}
            </div>
            <div className="text-sm text-gray-400">
              Novos nesta semana
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border-2 border-gray-700 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por cliente ou plano..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none text-base pl-10"
            />
          </div>
        </div>

        {/* Filter Dropdown */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border-2 border-gray-700 p-4">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-transparent text-gray-400 focus:outline-none text-base"
          >
            <option value="all">Todos os status</option>
            <option value="ativo">Ativos</option>
            <option value="pendente">Pendentes</option>
            <option value="concluido">Concluídos</option>
          </select>
        </div>

        {/* Planos Grid */}
        {!plans || plans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-dashed border-gray-700">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6">
              <FileText className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Nenhum plano encontrado
            </h3>
            <p className="text-gray-400 mb-6 text-center max-w-md">
              Crie seu primeiro plano alimentar para começar.
            </p>
            <button 
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-green-500/50 transition-all hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Criar Primeiro Plano
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
