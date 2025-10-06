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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-border/50 bg-[#fafafa] dark:bg-[#1a1a1a]">
        <DialogHeader className="border-b border-border pb-4">
          <DialogTitle className="text-2xl font-bold flex items-center gap-3 text-foreground">
            <span className="text-3xl">📋</span>
            <span className="text-primary font-bold">
              {plan.name}
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Header com informações do cliente - Design melhorado */}
        <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-primary/20">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
              {plan.client.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-lg text-foreground flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                {plan.client.name}
              </div>
              {plan.client.email && (
                <div className="text-sm text-muted-foreground">{plan.client.email}</div>
              )}
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent mb-4" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-medium">Início</div>
                <div className="font-semibold text-foreground text-sm">
                  {new Date(plan.start_date).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>
            {plan.end_date && (
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Término</div>
                  <div className="font-semibold text-foreground text-sm">
                    {new Date(plan.end_date).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>
            )}
            {plan.goal && (
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Target className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Objetivo</div>
                  <div className="font-semibold text-foreground text-sm capitalize">{plan.goal.replace('_', ' ')}</div>
                </div>
              </div>
            )}
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-medium">Status</div>
                <div className="font-semibold text-primary text-sm capitalize">{plan.status}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Macros Totais - Design melhorado com cores */}
        <div className="grid grid-cols-4 gap-3">
          {/* KCAL - Verde */}
          <div className="bg-card/40 backdrop-blur-sm rounded-xl p-4 border-2 border-primary/30">
            <div className="text-3xl font-extrabold text-primary mb-1">{Math.round(totals.kcal)}</div>
            <div className="text-xs font-bold text-primary uppercase tracking-wider">KCAL</div>
            {plan.target_kcal && (
              <div className="text-xs text-muted-foreground mt-1">Meta: {plan.target_kcal}</div>
            )}
          </div>

          {/* Proteínas - Azul */}
          <div className="bg-card/40 backdrop-blur-sm rounded-xl p-4 border-2 border-secondary/30">
            <div className="text-3xl font-extrabold text-secondary mb-1">{Math.round(totals.protein)}g</div>
            <div className="text-xs font-bold text-secondary uppercase tracking-wider">Proteínas</div>
            {plan.target_protein && (
              <div className="text-xs text-muted-foreground mt-1">Meta: {plan.target_protein}g</div>
            )}
          </div>

          {/* Gorduras - Laranja */}
          <div className="bg-card/40 backdrop-blur-sm rounded-xl p-4 border-2 border-warning/30">
            <div className="text-3xl font-extrabold text-warning mb-1">{Math.round(totals.fats)}g</div>
            <div className="text-xs font-bold text-warning uppercase tracking-wider">Gorduras</div>
            {plan.target_fats && (
              <div className="text-xs text-muted-foreground mt-1">Meta: {plan.target_fats}g</div>
            )}
          </div>

          {/* Carboidratos - Roxo */}
          <div className="bg-card/40 backdrop-blur-sm rounded-xl p-4 border-2 border-accent/30">
            <div className="text-3xl font-extrabold text-accent mb-1">{Math.round(totals.carbs)}g</div>
            <div className="text-xs font-bold text-accent uppercase tracking-wider">Carboidratos</div>
            {plan.target_carbs && (
              <div className="text-xs text-muted-foreground mt-1">Meta: {plan.target_carbs}g</div>
            )}
          </div>
        </div>

        {/* Refeições - Design melhorado */}
        <div>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
            <span className="text-2xl">🍽️</span>
            <span>Refeições</span>
          </h3>
          <Accordion type="single" collapsible className="w-full space-y-2">
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
                  <AccordionItem 
                    key={meal.id} 
                    value={meal.id}
                    className="border border-border/50 rounded-xl overflow-hidden bg-card/40 backdrop-blur-sm hover:shadow-lg transition-shadow"
                  >
                    <AccordionTrigger className="hover:no-underline px-5 py-4 hover:bg-accent/5">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl shadow-lg">
                            {meal.name.includes('Café') ? '☕' : meal.name.includes('Almoço') ? '🍽️' : meal.name.includes('Jantar') ? '🍲' : '🥗'}
                          </div>
                          <div>
                            <div className="font-bold text-left text-foreground">{meal.name}</div>
                            {meal.time && (
                              <div className="text-sm text-muted-foreground text-left">{meal.time}</div>
                            )}
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-primary">
                          {Math.round(mealTotals.kcal)} kcal • {meal.items.length} {meal.items.length === 1 ? 'item' : 'itens'}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-5 pb-4">
                      <div className="space-y-2 pt-2">
                        {meal.items.length === 0 ? (
                          <div className="text-center text-muted-foreground py-8 bg-muted/50 rounded-lg">
                            Nenhum alimento adicionado ainda
                          </div>
                        ) : (
                          meal.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-4 bg-card/30 backdrop-blur-sm rounded-lg border border-border/50 hover:shadow-sm transition-shadow">
                              <div className="flex-1">
                                <div className="font-semibold text-foreground">{item.food.name}</div>
                                <div className="text-sm text-muted-foreground mt-1">
                                  {item.quantity} {item.measure?.measure_name || 'porção(ões)'} 
                                  <span className="text-muted-foreground/70"> • </span>
                                  <span className="font-medium">{item.grams_total?.toFixed(0)}g</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-primary">{item.kcal_total?.toFixed(0)} kcal</div>
                                <div className="text-xs text-muted-foreground mt-1 space-x-2">
                                  <span className="text-secondary font-medium">P: {item.protein_total?.toFixed(1)}g</span>
                                  <span className="text-accent font-medium">C: {item.carb_total?.toFixed(1)}g</span>
                                  <span className="text-warning font-medium">G: {item.fat_total?.toFixed(1)}g</span>
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

        {/* Observações - Design melhorado */}
        {plan.notes && (
          <div className="bg-card/40 backdrop-blur-sm rounded-xl p-5 border-2 border-warning/30">
            <div className="font-bold text-warning mb-2 flex items-center gap-2">
              <span>📝</span>
              Observações
            </div>
            <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{plan.notes}</div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-6 border-t border-border">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="font-semibold"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
