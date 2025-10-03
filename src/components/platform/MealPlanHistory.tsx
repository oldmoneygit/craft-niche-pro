import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Clock, 
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  RotateCcw,
  GitCompare,
  CheckCircle2,
  Archive
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MealPlanHistoryProps {
  clientId: string;
  currentPlanId?: string;
  onViewPlan: (planId: string) => void;
  onRestorePlan: (planId: string) => void;
  onComparePlans: (planId1: string, planId2: string) => void;
}

export function MealPlanHistory({ 
  clientId, 
  currentPlanId,
  onViewPlan,
  onRestorePlan,
  onComparePlans
}: MealPlanHistoryProps) {
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedForCompare, setSelectedForCompare] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    loadHistory();
  }, [clientId]);
  
  const loadHistory = async () => {
    setIsLoading(true);
    
    const { data, error } = await supabase
      .from('meal_plans')
      .select(`
        id,
        version,
        is_active,
        status,
        calorie_target,
        protein_target_g,
        carb_target_g,
        fat_target_g,
        notes,
        created_at,
        updated_at,
        tenant_id,
        replaced_by
      `)
      .eq('client_id', clientId)
      .order('version', { ascending: false });
    
    if (error) {
      console.error('Erro ao carregar histórico:', error);
      toast({
        title: "Erro ao carregar histórico",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setPlans(data || []);
    }
    
    setIsLoading(false);
  };
  
  const handleCompareSelect = (planId: string) => {
    if (selectedForCompare === planId) {
      setSelectedForCompare(null);
    } else if (selectedForCompare === null) {
      setSelectedForCompare(planId);
    } else {
      // Tem dois selecionados, comparar
      onComparePlans(selectedForCompare, planId);
      setSelectedForCompare(null);
    }
  };
  
  const getCaloriesTrend = (plan: any) => {
    const target = plan.calorie_target || 2000;
    const actual = plan.calorie_target || 2000; // Por enquanto, usa o target
    const diff = actual - target;
    const percentage = (diff / target) * 100;
    
    if (Math.abs(percentage) < 5) {
      return { icon: Minus, color: 'text-green-600', label: 'No alvo' };
    } else if (diff > 0) {
      return { icon: TrendingUp, color: 'text-orange-600', label: `+${percentage.toFixed(1)}%` };
    } else {
      return { icon: TrendingDown, color: 'text-blue-600', label: `${percentage.toFixed(1)}%` };
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Histórico de Planos</h3>
          <p className="text-sm text-muted-foreground">
            {plans.length} {plans.length === 1 ? 'versão' : 'versões'}
          </p>
        </div>
        
        {selectedForCompare && (
          <Badge variant="secondary" className="gap-1">
            <GitCompare className="h-3 w-3" />
            Selecione outro para comparar
          </Badge>
        )}
      </div>
      
      {/* Timeline */}
      {isLoading ? (
        <p className="text-center text-muted-foreground py-8">Carregando...</p>
      ) : plans.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Archive className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Nenhum plano encontrado para este cliente.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="relative space-y-4">
          {/* Linha vertical da timeline */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
          
          {plans.map((plan) => {
            const trend = getCaloriesTrend(plan);
            const TrendIcon = trend.icon;
            const isSelected = selectedForCompare === plan.id;
            
            return (
              <Card 
                key={plan.id}
                className={`ml-12 relative ${
                  plan.is_active 
                    ? 'border-primary shadow-md' 
                    : 'border-muted'
                } ${
                  isSelected 
                    ? 'ring-2 ring-primary' 
                    : ''
                }`}
              >
                {/* Marcador na timeline */}
                <div className={`absolute -left-[2.3rem] top-6 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  plan.is_active 
                    ? 'bg-primary border-primary' 
                    : 'bg-background border-border'
                }`}>
                  {plan.is_active && (
                    <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                  )}
                </div>
                
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        Versão {plan.version}
                        {plan.is_active && (
                          <Badge variant="default" className="text-xs">
                            Ativo
                          </Badge>
                        )}
                        {plan.status === 'draft' && (
                          <Badge variant="secondary" className="text-xs">
                            Rascunho
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(plan.created_at), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </CardDescription>
                    </div>
                    
                    <div className={`flex items-center gap-1 text-sm ${trend.color}`}>
                      <TrendIcon className="h-4 w-4" />
                      <span className="font-medium">{trend.label}</span>
                    </div>
                  </div>
                  
                  {plan.notes && (
                    <p className="text-sm text-muted-foreground mt-2 italic">
                      "{plan.notes}"
                    </p>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {/* Macros resumidos */}
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Calorias</p>
                      <p className="font-medium">
                        {Math.round(plan.calorie_target || 0)} kcal
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Proteínas</p>
                      <p className="font-medium">
                        {(plan.protein_target_g || 0).toFixed(1)}g
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Carbos</p>
                      <p className="font-medium">
                        {(plan.carb_target_g || 0).toFixed(1)}g
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Gorduras</p>
                      <p className="font-medium">
                        {(plan.fat_target_g || 0).toFixed(1)}g
                      </p>
                    </div>
                  </div>
                  
                  {/* Ações */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewPlan(plan.id)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Visualizar
                    </Button>
                    
                    <Button
                      size="sm"
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => handleCompareSelect(plan.id)}
                    >
                      <GitCompare className="h-4 w-4" />
                    </Button>
                    
                    {!plan.is_active && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onRestorePlan(plan.id)}
                        title="Restaurar como plano ativo"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
