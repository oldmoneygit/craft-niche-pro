import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useCreateMealPlan } from '@/hooks/useMealPlansData';
import { useClientsData } from '@/hooks/useClientsData';
import { Plus, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { MEAL_TYPE_LABELS, MEAL_TYPE_ICONS } from '@/types/meal-plans';
import { useToast } from '@/hooks/use-toast';

interface CreateMealPlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DEFAULT_MEALS = [
  { key: 'breakfast', name: 'Café da Manhã', time: '07:00', icon: '☕' },
  { key: 'morning_snack', name: 'Lanche da Manhã', time: '10:00', icon: '🍎' },
  { key: 'lunch', name: 'Almoço', time: '12:30', icon: '🍽️' },
  { key: 'afternoon_snack', name: 'Lanche da Tarde', time: '15:30', icon: '🥤' },
  { key: 'dinner', name: 'Jantar', time: '19:00', icon: '🍲' },
  { key: 'supper', name: 'Ceia', time: '21:00', icon: '🥛' }
];

export function CreateMealPlanModal({ open, onOpenChange }: CreateMealPlanModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    clientId: '',
    name: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    goal: '',
    targetKcal: '',
    targetProtein: '',
    targetCarbs: '',
    targetFats: '',
    notes: ''
  });
  const [selectedMeals, setSelectedMeals] = useState<string[]>(['breakfast', 'lunch', 'dinner']);

  const { clients } = useClientsData();
  const createMealPlan = useCreateMealPlan();
  const { toast } = useToast();

  const nextStep = () => {
    // Validação da etapa 1
    if (step === 1) {
      if (!formData.clientId) {
        toast({ variant: "destructive", title: "Erro", description: "Selecione um cliente" });
        return;
      }
      if (!formData.name) {
        toast({ variant: "destructive", title: "Erro", description: "Informe o nome do plano" });
        return;
      }
      if (!formData.startDate) {
        toast({ variant: "destructive", title: "Erro", description: "Informe a data de início" });
        return;
      }
    }
    
    setStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (selectedMeals.length === 0) {
      toast({ variant: "destructive", title: "Erro", description: "Selecione pelo menos uma refeição" });
      return;
    }

    try {
      const meals = DEFAULT_MEALS
        .filter(meal => selectedMeals.includes(meal.key))
        .map((meal, index) => ({
          name: meal.name,
          time: meal.time,
          orderIndex: index
        }));

      await createMealPlan.mutateAsync({
        clientId: formData.clientId,
        name: formData.name,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        goal: formData.goal || undefined,
        targetKcal: formData.targetKcal ? Number(formData.targetKcal) : undefined,
        targetProtein: formData.targetProtein ? Number(formData.targetProtein) : undefined,
        targetCarbs: formData.targetCarbs ? Number(formData.targetCarbs) : undefined,
        targetFats: formData.targetFats ? Number(formData.targetFats) : undefined,
        notes: formData.notes || undefined,
        meals
      });

      toast({ title: "Sucesso!", description: "Plano alimentar criado com sucesso" });

      // Reset and close
      setStep(1);
      setFormData({
        clientId: '',
        name: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        goal: '',
        targetKcal: '',
        targetProtein: '',
        targetCarbs: '',
        targetFats: '',
        notes: ''
      });
      setSelectedMeals(['breakfast', 'lunch', 'dinner']);
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao criar plano:', error);
      toast({ variant: "destructive", title: "Erro", description: "Erro ao criar plano alimentar" });
    }
  };

  const toggleMeal = (mealKey: string) => {
    setSelectedMeals(prev =>
      prev.includes(mealKey)
        ? prev.filter(k => k !== mealKey)
        : [...prev, mealKey]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <div className="flex items-center justify-between mb-4">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <span className="text-3xl">🍽️</span>
              Criar Novo Plano Alimentar
            </DialogTitle>
            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full">
              Etapa {step}/3
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Etapa 1: Informações Básicas */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="client" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Cliente *</Label>
                <Select value={formData.clientId} onValueChange={value => setFormData(prev => ({ ...prev, clientId: value }))}>
                  <SelectTrigger className="w-full bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 mt-1.5">
                    <SelectValue placeholder="Selecione um cliente..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl backdrop-blur-xl z-50">
                    {clients?.map((client) => (
                      <SelectItem 
                        key={client.id} 
                        value={client.id}
                        className="hover:bg-emerald-500/10 focus:bg-emerald-500/10 cursor-pointer py-3 px-4 rounded-lg transition-colors duration-200"
                      >
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Nome do Plano *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Plano Emagrecimento"
                  className="mt-1.5 bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Data de Início *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="mt-1.5 bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <Label htmlFor="endDate" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Data de Término</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="mt-1.5 bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="goal" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Objetivo</Label>
                <Select value={formData.goal} onValueChange={value => setFormData(prev => ({ ...prev, goal: value }))}>
                  <SelectTrigger className="w-full bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 mt-1.5">
                    <SelectValue placeholder="Selecione o objetivo..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl backdrop-blur-xl z-50">
                    <SelectItem value="emagrecimento" className="hover:bg-emerald-500/10 focus:bg-emerald-500/10 cursor-pointer py-3 px-4 rounded-lg transition-colors duration-200">Emagrecimento</SelectItem>
                    <SelectItem value="ganho_massa" className="hover:bg-emerald-500/10 focus:bg-emerald-500/10 cursor-pointer py-3 px-4 rounded-lg transition-colors duration-200">Ganho de Massa</SelectItem>
                    <SelectItem value="manutencao" className="hover:bg-emerald-500/10 focus:bg-emerald-500/10 cursor-pointer py-3 px-4 rounded-lg transition-colors duration-200">Manutenção</SelectItem>
                    <SelectItem value="performance" className="hover:bg-emerald-500/10 focus:bg-emerald-500/10 cursor-pointer py-3 px-4 rounded-lg transition-colors duration-200">Performance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Observações gerais sobre o plano..."
                  rows={3}
                  className="mt-1.5 bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Etapa 2: Metas Nutricionais */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Defina as metas nutricionais diárias
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Estas informações são opcionais, mas ajudam a acompanhar melhor o progresso do cliente.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="targetKcal" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Calorias Diárias (kcal)</Label>
                  <Input
                    id="targetKcal"
                    type="number"
                    value={formData.targetKcal}
                    onChange={e => setFormData(prev => ({ ...prev, targetKcal: e.target.value }))}
                    placeholder="Ex: 1800"
                    className="mt-1.5 bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <Label htmlFor="targetProtein" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Proteínas (g)</Label>
                  <Input
                    id="targetProtein"
                    type="number"
                    value={formData.targetProtein}
                    onChange={e => setFormData(prev => ({ ...prev, targetProtein: e.target.value }))}
                    placeholder="Ex: 135"
                    className="mt-1.5 bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <Label htmlFor="targetCarbs" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Carboidratos (g)</Label>
                  <Input
                    id="targetCarbs"
                    type="number"
                    value={formData.targetCarbs}
                    onChange={e => setFormData(prev => ({ ...prev, targetCarbs: e.target.value }))}
                    placeholder="Ex: 180"
                    className="mt-1.5 bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <Label htmlFor="targetFats" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Gorduras (g)</Label>
                  <Input
                    id="targetFats"
                    type="number"
                    value={formData.targetFats}
                    onChange={e => setFormData(prev => ({ ...prev, targetFats: e.target.value }))}
                    placeholder="Ex: 60"
                    className="mt-1.5 bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Etapa 3: Refeições */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Selecione as refeições do plano
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Escolha quais refeições farão parte do plano alimentar do cliente.
                </p>
              </div>
              <div className="space-y-3">
                {DEFAULT_MEALS.map(meal => (
                  <div 
                    key={meal.key} 
                    className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-emerald-500 transition-colors cursor-pointer"
                    onClick={() => toggleMeal(meal.key)}
                  >
                    <Checkbox
                      checked={selectedMeals.includes(meal.key)}
                      onCheckedChange={() => toggleMeal(meal.key)}
                      className="w-5 h-5 rounded border-gray-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                        <span className="text-2xl">{meal.icon}</span>
                        {meal.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Horário sugerido: {meal.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navegação */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
            <div>
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={prevStep}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-all duration-300 border-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Voltar
                </Button>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-all duration-300 border-0"
              >
                Cancelar
              </Button>

              {step < 3 ? (
                <Button
                  onClick={nextStep}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/30 transition-all duration-300 border-0"
                >
                  Próxima Etapa
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={createMealPlan.isPending || selectedMeals.length === 0}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/30 transition-all duration-300 border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="w-4 h-4" />
                  Criar Plano Alimentar
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
