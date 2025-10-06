import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useMealPlanDetail } from '@/hooks/useMealPlansData';
import { Skeleton } from '@/components/ui/skeleton';
import { X, User, Calendar, Target, TrendingUp } from 'lucide-react';
import type { MealPlanWithDetails } from '@/types/meal-plans';

interface MealPlanDetailModalProps {
  planId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MealPlanDetailModal({ planId, open, onOpenChange }: MealPlanDetailModalProps) {
  const { data: plan, isLoading } = useMealPlanDetail(planId);

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <Skeleton className="h-8 w-64" />
          </DialogHeader>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!plan) return null;

  // Calcular totais reais dos itens
  const totals = plan.meals.reduce((acc, meal) => {
    meal.items.forEach(item => {
      acc.kcal += item.kcal_total || 0;
      acc.protein += item.protein_total || 0;
      acc.carbs += item.carb_total || 0;
      acc.fats += item.fat_total || 0;
    });
    return acc;
  }, { kcal: 0, protein: 0, carbs: 0, fats: 0 });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <span className="text-primary">📋</span>
            {plan.name}
          </DialogTitle>
        </DialogHeader>

        {/* Header com informações do cliente */}
        <div className="bg-primary/5 rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
              {plan.client.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-lg flex items-center gap-2">
                <User className="w-4 h-4" />
                {plan.client.name}
              </div>
              {plan.client.email && (
                <div className="text-sm text-muted-foreground">{plan.client.email}</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-primary" />
              <div>
                <div className="text-muted-foreground">Início</div>
                <div className="font-medium">
                  {new Date(plan.start_date).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>
            {plan.end_date && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-primary" />
                <div>
                  <div className="text-muted-foreground">Término</div>
                  <div className="font-medium">
                    {new Date(plan.end_date).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>
            )}
            {plan.goal && (
              <div className="flex items-center gap-2 text-sm">
                <Target className="w-4 h-4 text-primary" />
                <div>
                  <div className="text-muted-foreground">Objetivo</div>
                  <div className="font-medium capitalize">{plan.goal.replace('_', ' ')}</div>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-primary" />
              <div>
                <div className="text-muted-foreground">Status</div>
                <div className="font-medium capitalize">{plan.status}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Macros Totais */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-card rounded-lg p-4 border">
            <div className="text-3xl font-bold text-primary">{Math.round(totals.kcal)}</div>
            <div className="text-sm text-muted-foreground">kcal</div>
            {plan.target_kcal && (
              <div className="text-xs text-muted-foreground">Meta: {plan.target_kcal}</div>
            )}
          </div>
          <div className="bg-card rounded-lg p-4 border">
            <div className="text-3xl font-bold text-blue-600">{Math.round(totals.protein)}</div>
            <div className="text-sm text-muted-foreground">Proteínas (g)</div>
            {plan.target_protein && (
              <div className="text-xs text-muted-foreground">Meta: {plan.target_protein}g</div>
            )}
          </div>
          <div className="bg-card rounded-lg p-4 border">
            <div className="text-3xl font-bold text-amber-600">{Math.round(totals.carbs)}</div>
            <div className="text-sm text-muted-foreground">Carboidratos (g)</div>
            {plan.target_carbs && (
              <div className="text-xs text-muted-foreground">Meta: {plan.target_carbs}g</div>
            )}
          </div>
          <div className="bg-card rounded-lg p-4 border">
            <div className="text-3xl font-bold text-orange-600">{Math.round(totals.fats)}</div>
            <div className="text-sm text-muted-foreground">Gorduras (g)</div>
            {plan.target_fats && (
              <div className="text-xs text-muted-foreground">Meta: {plan.target_fats}g</div>
            )}
          </div>
        </div>

        {/* Refeições */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Refeições</h3>
          <Accordion type="single" collapsible className="w-full">
            {plan.meals
              .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
              .map((meal) => {
                const mealTotals = meal.items.reduce((acc, item) => {
                  acc.kcal += item.kcal_total || 0;
                  acc.protein += item.protein_total || 0;
                  acc.carbs += item.carb_total || 0;
                  acc.fats += item.fat_total || 0;
                  return acc;
                }, { kcal: 0, protein: 0, carbs: 0, fats: 0 });

                return (
                  <AccordionItem key={meal.id} value={meal.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-3">
                          <div className="text-xl">{meal.name.includes('Café') ? '☕' : meal.name.includes('Almoço') ? '🍽️' : meal.name.includes('Jantar') ? '🍲' : '🥗'}</div>
                          <div>
                            <div className="font-semibold text-left">{meal.name}</div>
                            {meal.time && (
                              <div className="text-sm text-muted-foreground text-left">{meal.time}</div>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {Math.round(mealTotals.kcal)} kcal • {meal.items.length} {meal.items.length === 1 ? 'item' : 'itens'}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-2">
                        {meal.items.length === 0 ? (
                          <div className="text-center text-muted-foreground py-4">
                            Nenhum alimento adicionado ainda
                          </div>
                        ) : (
                          meal.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                              <div className="flex-1">
                                <div className="font-medium">{item.food.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {item.quantity} {item.measure?.measure_name || 'porção(ões)'} ({item.grams_total?.toFixed(0)}g)
                                </div>
                              </div>
                              <div className="text-right text-sm">
                                <div className="font-semibold">{item.kcal_total?.toFixed(0)} kcal</div>
                                <div className="text-muted-foreground text-xs">
                                  P: {item.protein_total?.toFixed(1)}g • C: {item.carb_total?.toFixed(1)}g • G: {item.fat_total?.toFixed(1)}g
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
          </Accordion>
        </div>

        {/* Observações */}
        {plan.notes && (
          <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4 border border-amber-200 dark:border-amber-900">
            <div className="font-semibold mb-2">Observações</div>
            <div className="text-sm text-muted-foreground whitespace-pre-wrap">{plan.notes}</div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
