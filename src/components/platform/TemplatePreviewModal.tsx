import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Users, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TemplatePreviewModalProps {
  open: boolean;
  onClose: () => void;
  templateId: string | null;
  onUseTemplate: (templateId: string, templateName: string) => void;
  onEditTemplate: (templateId: string) => void;
}

export function TemplatePreviewModal({
  open,
  onClose,
  templateId,
  onUseTemplate,
  onEditTemplate
}: TemplatePreviewModalProps) {
  const [template, setTemplate] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && templateId) {
      loadTemplateDetails();
    }
  }, [open, templateId]);

  const loadTemplateDetails = async () => {
    if (!templateId) return;

    setIsLoading(true);
    try {
      const { data: templateData, error: templateError } = await supabase
        .from('meal_plan_templates')
        .select(`
          id,
          name,
          description,
          reference_calories,
          reference_protein,
          reference_carbs,
          reference_fat,
          tags,
          times_used,
          created_at,
          meal_plan_template_meals (
            id,
            name,
            time,
            order_index,
            meal_plan_template_foods (
              id,
              quantity,
              food_id,
              measure_id,
              foods (
                id,
                name,
                energy_kcal,
                protein_g,
                carbohydrate_g,
                lipid_g,
                source
              )
            )
          )
        `)
        .eq('id', templateId)
        .single();

      if (templateError) throw templateError;

      const measureIds = new Set<string>();
      templateData.meal_plan_template_meals?.forEach((meal: any) => {
        meal.meal_plan_template_foods?.forEach((food: any) => {
          if (food.measure_id) measureIds.add(food.measure_id);
        });
      });

      const { data: measuresData, error: measuresError } = await supabase
        .from('food_measures')
        .select('id, measure_name, grams')
        .in('id', Array.from(measureIds));

      if (measuresError) throw measuresError;

      const measuresMap = new Map(
        measuresData?.map(m => [m.id, m]) || []
      );

      templateData.meal_plan_template_meals?.forEach((meal: any) => {
        meal.meal_plan_template_foods?.forEach((food: any) => {
          food.measures = measuresMap.get(food.measure_id) || null;
        });
      });

      if (templateData.meal_plan_template_meals) {
        templateData.meal_plan_template_meals.sort((a: any, b: any) =>
          a.order_index - b.order_index
        );
      }

      setTemplate(templateData);

    } catch (error: any) {
      console.error('Erro ao carregar detalhes:', error);
      toast({
        title: "Erro ao carregar template",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMealTotals = (foods: any[]) => {
    return foods.reduce((totals, food) => {
      const grams = food.quantity * (food.measures?.grams || 100);
      const multiplier = grams / 100;

      return {
        kcal: totals.kcal + ((food.foods?.energy_kcal || 0) * multiplier),
        protein: totals.protein + ((food.foods?.protein_g || 0) * multiplier),
        carbs: totals.carbs + ((food.foods?.carbohydrate_g || 0) * multiplier),
        fat: totals.fat + ((food.foods?.lipid_g || 0) * multiplier)
      };
    }, { kcal: 0, protein: 0, carbs: 0, fat: 0 });
  };

  if (!template && !isLoading) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">Preview do Template</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : template ? (
          <>
            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold">{template.name}</h2>
                    {template.description && (
                      <p className="text-muted-foreground mt-1">
                        {template.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{template.times_used}x usado</span>
                    </div>
                  </div>
                </div>

                {template.tags && template.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {template.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm font-medium mb-3">Valores de Referência</p>
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Calorias</p>
                        <p className="text-2xl font-bold text-green-600">
                          {template.reference_calories}
                        </p>
                        <p className="text-xs text-muted-foreground">kcal</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Proteínas</p>
                        <p className="text-2xl font-bold">
                          {template.reference_protein.toFixed(1)}
                        </p>
                        <p className="text-xs text-muted-foreground">g</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Carboidratos</p>
                        <p className="text-2xl font-bold">
                          {template.reference_carbs.toFixed(1)}
                        </p>
                        <p className="text-xs text-muted-foreground">g</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Gorduras</p>
                        <p className="text-2xl font-bold">
                          {template.reference_fat.toFixed(1)}
                        </p>
                        <p className="text-xs text-muted-foreground">g</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Refeições ({template.meal_plan_template_meals?.length || 0})</h3>

                {template.meal_plan_template_meals?.map((meal: any) => {
                  const totals = calculateMealTotals(meal.meal_plan_template_foods || []);

                  return (
                    <Card key={meal.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-lg">{meal.name}</h4>
                            {meal.time && (
                              <p className="text-sm text-muted-foreground">
                                {meal.time}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">
                              {Math.round(totals.kcal)} kcal
                            </p>
                            <p className="text-xs text-muted-foreground">
                              P: {totals.protein.toFixed(1)}g •
                              C: {totals.carbs.toFixed(1)}g •
                              G: {totals.fat.toFixed(1)}g
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {meal.meal_plan_template_foods?.map((food: any) => {
                            const grams = food.quantity * (food.measures?.grams || 100);
                            const kcal = ((food.foods?.energy_kcal || 0) * grams) / 100;

                            return (
                              <div
                                key={food.id}
                                className="flex justify-between items-center py-2 border-b last:border-0"
                              >
                                <div className="flex-1">
                                  <p className="font-medium">{food.foods?.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {food.quantity} {food.measures?.measure_name} ({grams.toFixed(0)}g)
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">{Math.round(kcal)} kcal</p>
                                  {food.foods?.source && (
                                    <Badge
                                      variant="secondary"
                                      className={
                                        food.foods.source.includes('TACO')
                                          ? 'bg-green-100 text-green-800'
                                          : 'bg-blue-100 text-blue-800'
                                      }
                                    >
                                      {food.foods.source.includes('TACO') ? 'TACO' : 'OFF'}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  onEditTemplate(templateId!);
                  onClose();
                }}
                className="gap-2"
              >
                <Pencil className="h-4 w-4" />
                Editar Template
              </Button>
              <Button
                onClick={() => {
                  onUseTemplate(templateId!, template.name);
                  onClose();
                }}
                className="gap-2"
              >
                Usar Template
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
