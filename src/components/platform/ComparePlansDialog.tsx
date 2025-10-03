import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ComparePlansDialogProps {
  open: boolean;
  onClose: () => void;
  planId1: string;
  planId2: string;
}

export function ComparePlansDialog({ 
  open, 
  onClose, 
  planId1, 
  planId2 
}: ComparePlansDialogProps) {
  const [plan1, setPlan1] = useState<any>(null);
  const [plan2, setPlan2] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (open) {
      loadPlans();
    }
  }, [open, planId1, planId2]);
  
  const loadPlans = async () => {
    setIsLoading(true);
    
    const { data: plans } = await supabase
      .from('meal_plans')
      .select(`
        id,
        version,
        is_active,
        calorie_target,
        protein_target_g,
        carb_target_g,
        fat_target_g,
        created_at,
        meal_plan_meals (
          id,
          name,
          meal_items (
            quantity,
            foods (name),
            food_measures (measure_name, grams)
          )
        )
      `)
      .in('id', [planId1, planId2]);
    
    if (plans) {
      const p1 = plans.find(p => p.id === planId1);
      const p2 = plans.find(p => p.id === planId2);
      setPlan1(p1);
      setPlan2(p2);
    }
    
    setIsLoading(false);
  };
  
  const getDifference = (val1: number, val2: number) => {
    const diff = val2 - val1;
    const percentage = ((diff / val1) * 100).toFixed(1);
    
    if (Math.abs(diff) < 1) {
      return { icon: Minus, color: 'text-muted-foreground', text: 'Igual' };
    } else if (diff > 0) {
      return { 
        icon: TrendingUp, 
        color: 'text-green-600', 
        text: `+${diff.toFixed(1)} (+${percentage}%)`
      };
    } else {
      return { 
        icon: TrendingDown, 
        color: 'text-red-600', 
        text: `${diff.toFixed(1)} (${percentage}%)`
      };
    }
  };
  
  if (isLoading || !plan1 || !plan2) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <p className="text-center py-8">Carregando comparação...</p>
        </DialogContent>
      </Dialog>
    );
  }
  
  const caloriesDiff = getDifference(plan1.calorie_target || 0, plan2.calorie_target || 0);
  const proteinDiff = getDifference(plan1.protein_target_g || 0, plan2.protein_target_g || 0);
  const carbsDiff = getDifference(plan1.carb_target_g || 0, plan2.carb_target_g || 0);
  const fatDiff = getDifference(plan1.fat_target_g || 0, plan2.fat_target_g || 0);
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Comparação: Versão {plan1.version} vs Versão {plan2.version}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Comparação de macros */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Valores Nutricionais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {/* Header */}
                <div className="font-medium text-sm text-muted-foreground">
                  Nutriente
                </div>
                <div className="font-medium text-sm text-muted-foreground text-center">
                  Versão {plan1.version}
                </div>
                <div className="font-medium text-sm text-muted-foreground text-center">
                  Versão {plan2.version}
                </div>
                
                {/* Calorias */}
                <div className="flex items-center gap-2">
                  <span>Calorias</span>
                  <div className={`flex items-center gap-1 ml-auto text-xs ${caloriesDiff.color}`}>
                    <caloriesDiff.icon className="h-3 w-3" />
                    <span>{caloriesDiff.text}</span>
                  </div>
                </div>
                <div className="text-center font-medium">
                  {Math.round(plan1.calorie_target || 0)} kcal
                </div>
                <div className="text-center font-medium">
                  {Math.round(plan2.calorie_target || 0)} kcal
                </div>
                
                {/* Proteínas */}
                <div className="flex items-center gap-2">
                  <span>Proteínas</span>
                  <div className={`flex items-center gap-1 ml-auto text-xs ${proteinDiff.color}`}>
                    <proteinDiff.icon className="h-3 w-3" />
                    <span>{proteinDiff.text}</span>
                  </div>
                </div>
                <div className="text-center font-medium">
                  {(plan1.protein_target_g || 0).toFixed(1)}g
                </div>
                <div className="text-center font-medium">
                  {(plan2.protein_target_g || 0).toFixed(1)}g
                </div>
                
                {/* Carboidratos */}
                <div className="flex items-center gap-2">
                  <span>Carboidratos</span>
                  <div className={`flex items-center gap-1 ml-auto text-xs ${carbsDiff.color}`}>
                    <carbsDiff.icon className="h-3 w-3" />
                    <span>{carbsDiff.text}</span>
                  </div>
                </div>
                <div className="text-center font-medium">
                  {(plan1.carb_target_g || 0).toFixed(1)}g
                </div>
                <div className="text-center font-medium">
                  {(plan2.carb_target_g || 0).toFixed(1)}g
                </div>
                
                {/* Gorduras */}
                <div className="flex items-center gap-2">
                  <span>Gorduras</span>
                  <div className={`flex items-center gap-1 ml-auto text-xs ${fatDiff.color}`}>
                    <fatDiff.icon className="h-3 w-3" />
                    <span>{fatDiff.text}</span>
                  </div>
                </div>
                <div className="text-center font-medium">
                  {(plan1.fat_target_g || 0).toFixed(1)}g
                </div>
                <div className="text-center font-medium">
                  {(plan2.fat_target_g || 0).toFixed(1)}g
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Comparação de refeições */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Estrutura das Refeições</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Versão 1 */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    Versão {plan1.version}
                    {plan1.is_active && <Badge variant="default" className="text-xs">Ativo</Badge>}
                  </h4>
                  <div className="space-y-3">
                    {plan1.meal_plan_meals?.map((meal: any) => (
                      <div key={meal.id} className="text-sm">
                        <p className="font-medium">{meal.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {meal.meal_items?.length || 0} alimentos
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Versão 2 */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    Versão {plan2.version}
                    {plan2.is_active && <Badge variant="default" className="text-xs">Ativo</Badge>}
                  </h4>
                  <div className="space-y-3">
                    {plan2.meal_plan_meals?.map((meal: any) => (
                      <div key={meal.id} className="text-sm">
                        <p className="font-medium">{meal.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {meal.meal_items?.length || 0} alimentos
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
