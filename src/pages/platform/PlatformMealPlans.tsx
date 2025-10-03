import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed, Plus, Send, Trash2, CreditCard as Edit, Copy, FileText, ChevronDown, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import { useToast } from '@/hooks/use-toast';
import { useClientConfig } from '@/core/contexts/ClientConfigContext';
import PlatformPageWrapper from '@/core/layouts/PlatformPageWrapper';
import { TemplateLibraryModal } from '@/components/platform/TemplateLibraryModal';
import { SelectClientForTemplateModal } from '@/components/platform/SelectClientForTemplateModal';

export default function PlatformMealPlans() {
  const { tenantId } = useTenantId();
  const { clientConfig } = useClientConfig();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedTemplateName, setSelectedTemplateName] = useState<string>("");
  const [showTemplatesDropdown, setShowTemplatesDropdown] = useState(false);

  useEffect(() => {
    if (tenantId) fetchPlans();
  }, [tenantId]);

  // Recarregar quando a página voltar ao foco
  useEffect(() => {
    const handleFocus = () => {
      if (tenantId) fetchPlans();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [tenantId]);

  const handleApplyTemplate = async (templateId: string, templateName: string) => {
    setSelectedTemplateId(templateId);
    setSelectedTemplateName(templateName);
  };

  const handleSelectClient = (clientId: string) => {
    if (selectedTemplateId) {
      navigate(`/platform/${clientConfig?.subdomain}/planos-alimentares/novo?templateId=${selectedTemplateId}&client=${clientId}`);
      setSelectedTemplateId(null);
      setSelectedTemplateName("");
    }
  };


  const fetchPlans = async () => {
    if (!tenantId) return;

    setLoading(true);
    console.log('Fetching plans for tenant:', tenantId);
    
    const { data, error } = await supabase
      .from('meal_plans')
      .select(`
        *,
        clients(id, name, phone)
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    console.log('Meal plans data:', data);
    console.log('Meal plans error:', error);
    
    if (error) {
      console.error('Error fetching plans:', error);
      toast({ title: "Erro ao carregar planos", variant: "destructive" });
    }

    setPlans((data as any[]) || []);
    setLoading(false);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Deletar plano "${title}"?`)) return;

    const { error } = await supabase
      .from('meal_plans')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: "Erro", description: "Não foi possível deletar", variant: "destructive" });
    } else {
      toast({ title: "Deletado", description: "Plano removido com sucesso" });
      fetchPlans();
    }
  };

  const handleSendToClient = async (plan: any) => {
    if (!plan.public_token) {
      // Gerar token se não existir
      const token = `${plan.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await supabase
        .from('meal_plans')
        .update({ public_token: token } as any)
        .eq('id', plan.id);
      
      plan.public_token = token;
    }

    const publicLink = `${window.location.origin}/plano/${plan.public_token}`;
    const message = `Olá ${plan.clients.name}! 🥗\n\nSeu plano alimentar está pronto:\n\n${publicLink}\n\nQualquer dúvida, estou à disposição!`;
    
    const whatsappLink = `https://wa.me/55${plan.clients.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappLink, '_blank');

    toast({ title: "WhatsApp aberto", description: "Envie o plano para o cliente" });
  };

  const handleDuplicate = async (planId: string) => {
    // Buscar plano completo
    const { data: originalPlan } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (!originalPlan) return;

    // Criar cópia
    const { data: newPlan, error } = await supabase
      .from('meal_plans')
      .insert({
        tenant_id: originalPlan.tenant_id,
        client_id: originalPlan.client_id,
        title: `${originalPlan.title} (Cópia)`,
        active: false,
        calories_target: originalPlan.calories_target,
        notes: originalPlan.notes
      } as any)
      .select()
      .single();

    if (error || !newPlan) {
      toast({ title: "Erro ao duplicar", variant: "destructive" });
      return;
    }

    // Duplicar refeições
    const { data: meals } = await supabase
      .from('meals' as any)
      .select('*, meal_foods(*)')
      .eq('meal_plan_id', planId);

    if (meals) {
      for (const meal of meals as any[]) {
        const { data: newMeal } = await supabase
          .from('meals' as any)
          .insert({
            meal_plan_id: newPlan.id,
            name: meal.name,
            time: meal.time,
            order_index: meal.order_index
          } as any)
          .select()
          .single();

        if (newMeal && meal.meal_foods) {
          const foods = meal.meal_foods.map((f: any) => ({
            meal_id: (newMeal as any).id,
            name: f.name,
            quantity: f.quantity,
            calories: f.calories,
            order_index: f.order_index
          }));

          await supabase.from('meal_foods' as any).insert(foods as any);
        }
      }
    }

    toast({ title: "Plano duplicado", description: "Você pode editá-lo agora" });
    fetchPlans();
  };

  return (
    <PlatformPageWrapper title="Planos Alimentares">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <UtensilsCrossed className="w-7 h-7" />
              Planos Alimentares
            </h2>
            <p className="text-muted-foreground mt-1">
              Crie e gerencie planos alimentares para seus clientes
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchPlans}
              className="border border-border px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-accent"
              title="Atualizar lista"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
              </svg>
            </button>
            
            
            <button
              onClick={() => setShowTemplateLibrary(true)}
              className="border border-blue-500 text-blue-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-50"
            >
              <TrendingUp className="w-4 h-4" />
              Usar Template
            </button>
            <button
              onClick={() => navigate(`/platform/${clientConfig?.subdomain}/planos-alimentares/novo`)}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" />
              Criar do Zero
            </button>
          </div>
        </div>

        {/* Lista de planos */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Carregando...</div>
        ) : plans.length === 0 ? (
          <div className="text-center py-12">
            <UtensilsCrossed className="w-16 h-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground">Nenhum plano criado ainda</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.map(plan => (
              <div key={plan.id} className="bg-card rounded-lg shadow p-5 border-l-4 border-primary">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{plan.title}</h3>
                    <p className="text-sm text-muted-foreground">{plan.clients?.name}</p>
                    {plan.active && (
                      <span className="inline-block mt-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                        Plano Ativo
                      </span>
                    )}
                    {plan.calories_target && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Meta: {plan.calories_target} kcal/dia
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => navigate(`/platform/${clientConfig?.subdomain}/planos-alimentares/${plan.id}`)}
                    className="px-3 py-2 border border-border rounded hover:bg-accent text-sm flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleSendToClient(plan)}
                    className="px-3 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 text-sm flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Enviar
                  </button>
                  <button
                    onClick={() => handleDuplicate(plan.id)}
                    className="px-3 py-2 border border-blue-500 text-blue-600 rounded hover:bg-blue-50 text-sm flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Duplicar
                  </button>
                  <button
                    onClick={() => handleDelete(plan.id, plan.title)}
                    className="px-3 py-2 border border-destructive text-destructive rounded hover:bg-destructive/10 text-sm flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Deletar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <TemplateLibraryModal
        open={showTemplateLibrary}
        onClose={() => setShowTemplateLibrary(false)}
        onSelectTemplate={(templateId, templateName) => handleApplyTemplate(templateId, templateName)}
      />

      <SelectClientForTemplateModal
        open={!!selectedTemplateId}
        onClose={() => {
          setSelectedTemplateId(null);
          setSelectedTemplateName("");
        }}
        onSelectClient={handleSelectClient}
        templateName={selectedTemplateName}
      />

    </PlatformPageWrapper>
  );
}
