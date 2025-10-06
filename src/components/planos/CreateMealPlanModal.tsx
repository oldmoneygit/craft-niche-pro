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
import { Plus, ChevronRight, ChevronLeft } from 'lucide-react';
import { MEAL_TYPE_LABELS, MEAL_TYPE_ICONS } from '@/types/meal-plans';

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

  const handleSubmit = async () => {
    if (!formData.clientId || !formData.name) {
      return;
    }

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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <span className="text-primary">✨</span>
            Criar Novo Plano Alimentar
            <span className="text-sm text-muted-foreground ml-auto">Etapa {step}/3</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Etapa 1: Informações Básicas */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="client">Cliente *</Label>
                <Select value={formData.clientId} onValueChange={value => setFormData(prev => ({ ...prev, clientId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients?.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="name">Nome do Plano *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Plano Emagrecimento"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Data de Início *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">Data de Término</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="goal">Objetivo</Label>
                <Select value={formData.goal} onValueChange={value => setFormData(prev => ({ ...prev, goal: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o objetivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emagrecimento">Emagrecimento</SelectItem>
                    <SelectItem value="ganho_massa">Ganho de Massa</SelectItem>
                    <SelectItem value="manutencao">Manutenção</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Observações gerais sobre o plano..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Etapa 2: Metas Nutricionais */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="targetKcal">Calorias Diárias (kcal)</Label>
                  <Input
                    id="targetKcal"
                    type="number"
                    value={formData.targetKcal}
                    onChange={e => setFormData(prev => ({ ...prev, targetKcal: e.target.value }))}
                    placeholder="Ex: 1800"
                  />
                </div>
                <div>
                  <Label htmlFor="targetProtein">Proteínas (g)</Label>
                  <Input
                    id="targetProtein"
                    type="number"
                    value={formData.targetProtein}
                    onChange={e => setFormData(prev => ({ ...prev, targetProtein: e.target.value }))}
                    placeholder="Ex: 135"
                  />
                </div>
                <div>
                  <Label htmlFor="targetCarbs">Carboidratos (g)</Label>
                  <Input
                    id="targetCarbs"
                    type="number"
                    value={formData.targetCarbs}
                    onChange={e => setFormData(prev => ({ ...prev, targetCarbs: e.target.value }))}
                    placeholder="Ex: 180"
                  />
                </div>
                <div>
                  <Label htmlFor="targetFats">Gorduras (g)</Label>
                  <Input
                    id="targetFats"
                    type="number"
                    value={formData.targetFats}
                    onChange={e => setFormData(prev => ({ ...prev, targetFats: e.target.value }))}
                    placeholder="Ex: 60"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Etapa 3: Refeições */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Selecione as refeições que farão parte do plano:
              </p>
              <div className="space-y-2">
                {DEFAULT_MEALS.map(meal => (
                  <div key={meal.key} className="flex items-center space-x-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                    <Checkbox
                      checked={selectedMeals.includes(meal.key)}
                      onCheckedChange={() => toggleMeal(meal.key)}
                    />
                    <div className="flex-1">
                      <div className="font-medium flex items-center gap-2">
                        <span>{meal.icon}</span>
                        {meal.name}
                      </div>
                      <div className="text-sm text-muted-foreground">Horário sugerido: {meal.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navegação */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setStep(prev => Math.max(1, prev - 1))}
              disabled={step === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Voltar
            </Button>

            {step < 3 ? (
              <Button
                onClick={() => setStep(prev => Math.min(3, prev + 1))}
                disabled={step === 1 && (!formData.clientId || !formData.name)}
              >
                Próximo
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={createMealPlan.isPending || selectedMeals.length === 0}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-1" />
                Criar Plano
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
