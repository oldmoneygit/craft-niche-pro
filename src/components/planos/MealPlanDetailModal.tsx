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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <span className="text-3xl">📋</span>
            <span className="bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
              {plan.name}
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Header com informações do cliente - Design melhorado */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-2xl p-6 border border-emerald-200/50 dark:border-emerald-800/50">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
              {plan.client.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-600" />
                {plan.client.name}
              </div>
              {plan.client.email && (
                <div className="text-sm text-gray-600 dark:text-gray-400">{plan.client.email}</div>
              )}
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-emerald-300 dark:via-emerald-700 to-transparent mb-4" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Início</div>
                <div className="font-semibold text-gray-900 dark:text-white text-sm">
                  {new Date(plan.start_date).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>
            {plan.end_date && (
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Término</div>
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">
                    {new Date(plan.end_date).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>
            )}
            {plan.goal && (
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Target className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Objetivo</div>
                  <div className="font-semibold text-gray-900 dark:text-white text-sm capitalize">{plan.goal.replace('_', ' ')}</div>
                </div>
              </div>
            )}
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Status</div>
                <div className="font-semibold text-emerald-600 text-sm capitalize">{plan.status}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Macros Totais - Design melhorado com cores */}
        <div className="grid grid-cols-4 gap-3">
          {/* KCAL - Verde */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/40 dark:to-emerald-900/40 rounded-xl p-4 border-2 border-emerald-200 dark:border-emerald-800">
            <div className="text-3xl font-extrabold text-emerald-600 mb-1">{Math.round(totals.kcal)}</div>
            <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">KCAL</div>
            {plan.target_kcal && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Meta: {plan.target_kcal}</div>
            )}
          </div>

          {/* Proteínas - Azul */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/40 rounded-xl p-4 border-2 border-blue-200 dark:border-blue-800">
            <div className="text-3xl font-extrabold text-blue-600 mb-1">{Math.round(totals.protein)}g</div>
            <div className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Proteínas</div>
            {plan.target_protein && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Meta: {plan.target_protein}g</div>
            )}
          </div>

          {/* Gorduras - Laranja */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/40 dark:to-orange-900/40 rounded-xl p-4 border-2 border-orange-200 dark:border-orange-800">
            <div className="text-3xl font-extrabold text-orange-600 mb-1">{Math.round(totals.fats)}g</div>
            <div className="text-xs font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wider">Gorduras</div>
            {plan.target_fats && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Meta: {plan.target_fats}g</div>
            )}
          </div>

          {/* Carboidratos - Roxo */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/40 rounded-xl p-4 border-2 border-purple-200 dark:border-purple-800">
            <div className="text-3xl font-extrabold text-purple-600 mb-1">{Math.round(totals.carbs)}g</div>
            <div className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">Carboidratos</div>
            {plan.target_carbs && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Meta: {plan.target_carbs}g</div>
            )}
          </div>
        </div>

        {/* Refeições - Design melhorado */}
        <div>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
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
                    className="border rounded-xl overflow-hidden bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
                  >
                    <AccordionTrigger className="hover:no-underline px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-xl shadow-lg">
                            {meal.name.includes('Café') ? '☕' : meal.name.includes('Almoço') ? '🍽️' : meal.name.includes('Jantar') ? '🍲' : '🥗'}
                          </div>
                          <div>
                            <div className="font-bold text-left text-gray-900 dark:text-white">{meal.name}</div>
                            {meal.time && (
                              <div className="text-sm text-gray-500 dark:text-gray-400 text-left">{meal.time}</div>
                            )}
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                          {Math.round(mealTotals.kcal)} kcal • {meal.items.length} {meal.items.length === 1 ? 'item' : 'itens'}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-5 pb-4">
                      <div className="space-y-2 pt-2">
                        {meal.items.length === 0 ? (
                          <div className="text-center text-gray-500 dark:text-gray-400 py-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            Nenhum alimento adicionado ainda
                          </div>
                        ) : (
                          meal.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow">
                              <div className="flex-1">
                                <div className="font-semibold text-gray-900 dark:text-white">{item.food.name}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {item.quantity} {item.measure?.measure_name || 'porção(ões)'} 
                                  <span className="text-gray-400 dark:text-gray-500"> • </span>
                                  <span className="font-medium">{item.grams_total?.toFixed(0)}g</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-emerald-600">{item.kcal_total?.toFixed(0)} kcal</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 space-x-2">
                                  <span className="text-blue-600 dark:text-blue-400 font-medium">P: {item.protein_total?.toFixed(1)}g</span>
                                  <span className="text-purple-600 dark:text-purple-400 font-medium">C: {item.carb_total?.toFixed(1)}g</span>
                                  <span className="text-orange-600 dark:text-orange-400 font-medium">G: {item.fat_total?.toFixed(1)}g</span>
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
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 rounded-xl p-5 border-2 border-amber-200 dark:border-amber-900">
            <div className="font-bold text-amber-900 dark:text-amber-400 mb-2 flex items-center gap-2">
              <span>📝</span>
              Observações
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{plan.notes}</div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-6 border-t border-gray-200 dark:border-gray-700">
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
