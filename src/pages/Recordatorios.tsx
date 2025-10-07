import { useState, useEffect } from 'react';
import { Plus, ClipboardList, Clock, CheckCircle2, TrendingUp, Sun, Moon } from 'lucide-react';
import { useRecordatorios, RecordatorioMeal } from '@/hooks/useRecordatorios';
import { RecordatorioCard } from '@/components/recordatorio/RecordatorioCard';
import { useClientsData } from '@/hooks/useClientsData';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import './Questionarios.css';

type FilterType = 'all' | 'pending' | 'analyzed' | 'r24h' | 'r3d';

export default function Recordatorios() {
  const [isDark, setIsDark] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecordatorioId, setSelectedRecordatorioId] = useState<string | null>(null);

  // Form state
  const [patientId, setPatientId] = useState('');
  const [type, setType] = useState<'r24h' | 'r3d'>('r24h');
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [meals, setMeals] = useState<Omit<RecordatorioMeal, 'id'>[]>([
    { meal_type: 'breakfast', time: '08:00', foods: '', order_index: 0 }
  ]);

  const { recordatorios, isLoading, createRecordatorio, deleteRecordatorio } = useRecordatorios();
  const { clients } = useClientsData();

  // Theme detection
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

  // Filter recordatorios
  const filteredRecordatorios = recordatorios.filter(rec => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'pending') return rec.status === 'pending';
    if (activeFilter === 'analyzed') return rec.status === 'analyzed';
    if (activeFilter === 'r24h') return rec.type === 'r24h';
    if (activeFilter === 'r3d') return rec.type === 'r3d';
    return true;
  });

  // Calculate stats
  const totalRecordatorios = recordatorios.length;
  const pendingCount = recordatorios.filter(r => r.status === 'pending').length;
  const analyzedCount = recordatorios.filter(r => r.status === 'analyzed').length;
  const avgCalories = recordatorios
    .filter(r => r.total_calories)
    .reduce((sum, r) => sum + (r.total_calories || 0), 0) / (analyzedCount || 1);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    document.body.setAttribute('data-theme', newTheme);
  };

  const addMeal = () => {
    setMeals([...meals, { 
      meal_type: 'lunch', 
      time: '12:00', 
      foods: '', 
      order_index: meals.length 
    }]);
  };

  const updateMeal = (index: number, updated: Omit<RecordatorioMeal, 'id'>) => {
    const newMeals = [...meals];
    newMeals[index] = updated;
    setMeals(newMeals);
  };

  const removeMeal = (index: number) => {
    setMeals(meals.filter((_, i) => i !== index));
  };

  const handleCreateNew = () => {
    setIsCreateModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!patientId) {
      toast({ title: 'Erro', description: 'Selecione um paciente', variant: 'destructive' });
      return;
    }

    if (meals.length === 0) {
      toast({ title: 'Erro', description: 'Adicione pelo menos uma refeição', variant: 'destructive' });
      return;
    }

    const selectedClient = clients.find(c => c.id === patientId);
    if (!selectedClient) return;

    await createRecordatorio.mutateAsync({
      patient_id: patientId,
      patient_name: selectedClient.name,
      type,
      record_date: recordDate,
      notes,
      meals
    });

    // Reset form
    setPatientId('');
    setType('r24h');
    setRecordDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setMeals([{ meal_type: 'breakfast', time: '08:00', foods: '', order_index: 0 }]);
    setIsCreateModalOpen(false);
  };

  const handleView = (id: string) => {
    setSelectedRecordatorioId(id);
    setIsViewModalOpen(true);
  };

  const handleAnalyze = (id: string) => {
    toast({ title: 'Em breve', description: 'Funcionalidade de análise será implementada' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este recordatório?')) return;
    await deleteRecordatorio.mutateAsync(id);
  };

  const selectedRecordatorio = recordatorios.find(r => r.id === selectedRecordatorioId);

  const mealTypeLabels: Record<string, string> = {
    breakfast: 'Café da Manhã',
    morning_snack: 'Lanche da Manhã',
    lunch: 'Almoço',
    afternoon_snack: 'Lanche da Tarde',
    dinner: 'Jantar',
    supper: 'Ceia',
    other: 'Outro'
  };

  return (
    <div className="questionnaires-page">
      <div className="container">
        {/* HEADER */}
        <div className="header">
          <div className="header-content">
            <h1>Recordatórios Alimentares</h1>
            <p>Gerencie registros alimentares dos seus pacientes</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-primary" onClick={handleCreateNew}>
              <Plus size={20} />
              Novo Recordatório
            </button>
            <button className="theme-toggle" onClick={toggleTheme}>
              <Sun className="sun-icon" size={20} />
              <Moon className="moon-icon" size={20} />
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="stats">
          <div className="stat-card total">
            <div className="stat-icon">
              <ClipboardList size={24} />
            </div>
            <div className="stat-value">{totalRecordatorios}</div>
            <div className="stat-label">Total de Recordatórios</div>
          </div>

          <div className="stat-card warning">
            <div className="stat-icon">
              <Clock size={24} />
            </div>
            <div className="stat-value">{pendingCount}</div>
            <div className="stat-label">Aguardando Análise</div>
          </div>

          <div className="stat-card success">
            <div className="stat-icon">
              <CheckCircle2 size={24} />
            </div>
            <div className="stat-value">{analyzedCount}</div>
            <div className="stat-label">Analisados</div>
          </div>

          <div className="stat-card info">
            <div className="stat-icon">
              <TrendingUp size={24} />
            </div>
            <div className="stat-value">{Math.round(avgCalories)}</div>
            <div className="stat-label">Média Calórica (kcal/dia)</div>
          </div>
        </div>

        {/* FILTROS */}
        <div className="filters">
          <button 
            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            Todos
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveFilter('pending')}
          >
            Pendentes
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'analyzed' ? 'active' : ''}`}
            onClick={() => setActiveFilter('analyzed')}
          >
            Analisados
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'r24h' ? 'active' : ''}`}
            onClick={() => setActiveFilter('r24h')}
          >
            R24h
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'r3d' ? 'active' : ''}`}
            onClick={() => setActiveFilter('r3d')}
          >
            R3D
          </button>
        </div>

        {/* GRID */}
        {isLoading ? (
          <div className="loading-state">Carregando...</div>
        ) : filteredRecordatorios.length === 0 ? (
          <div className="empty-state">
            <ClipboardList size={48} />
            <h3>Nenhum recordatório encontrado</h3>
            <p>Crie seu primeiro recordatório alimentar</p>
          </div>
        ) : (
          <div className="questionnaires-grid">
            {filteredRecordatorios.map(recordatorio => (
              <RecordatorioCard
                key={recordatorio.id}
                recordatorio={recordatorio}
                onView={handleView}
                onAnalyze={handleAnalyze}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Recordatório Alimentar</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="patient">Paciente *</Label>
              <Select value={patientId} onValueChange={setPatientId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um paciente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Recordatório *</Label>
              <Select value={type} onValueChange={(v) => setType(v as 'r24h' | 'r3d')} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="r24h">R24h - Recordatório 24 horas</SelectItem>
                  <SelectItem value="r3d">R3D - Recordatório 3 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Data do Registro *</Label>
              <Input
                type="date"
                value={recordDate}
                onChange={(e) => setRecordDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Refeições Registradas</Label>
              <div className="space-y-3">
                {meals.map((meal, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Refeição {index + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMeal(index)}
                      >
                        🗑️
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label>Tipo</Label>
                        <Select
                          value={meal.meal_type}
                          onValueChange={(v) => updateMeal(index, { ...meal, meal_type: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(mealTypeLabels).map(([value, label]) => (
                              <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label>Horário</Label>
                        <Input
                          type="time"
                          value={meal.time}
                          onChange={(e) => updateMeal(index, { ...meal, time: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label>Alimentos Consumidos</Label>
                      <Textarea
                        placeholder="Ex: Pão integral (2 fatias), Queijo branco (30g), Café com leite (200ml)"
                        value={meal.foods}
                        onChange={(e) => updateMeal(index, { ...meal, foods: e.target.value })}
                        rows={3}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" onClick={addMeal} className="w-full">
                + Adicionar Refeição
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                placeholder="Observações sobre o recordatório..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createRecordatorio.isPending}>
                {createRecordatorio.isPending ? 'Salvando...' : 'Criar Recordatório'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* VIEW MODAL */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Recordatório de {selectedRecordatorio?.patient_name}</DialogTitle>
          </DialogHeader>

          {selectedRecordatorio && (
            <div className="space-y-6">
              {/* INFO HEADER */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-sm text-muted-foreground mb-1">Tipo</div>
                  <div className="text-xl font-bold">
                    {selectedRecordatorio.type === 'r24h' ? 'R24h' : 'R3D'}
                  </div>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-sm text-muted-foreground mb-1">Data</div>
                  <div className="text-xl font-bold">
                    {format(new Date(selectedRecordatorio.record_date), 'dd/MM/yyyy')}
                  </div>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-sm text-muted-foreground mb-1">Status</div>
                  <div className="text-xl font-bold">
                    {selectedRecordatorio.status === 'analyzed' ? '✅ Analisado' : '⏳ Pendente'}
                  </div>
                </div>
              </div>

              {/* REFEIÇÕES */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Refeições Registradas</h3>
                <div className="space-y-3">
                  {selectedRecordatorio.meals?.map((meal, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold">{mealTypeLabels[meal.meal_type]}</h4>
                        <span className="text-sm text-muted-foreground">{meal.time}</span>
                      </div>
                      <p className="text-sm whitespace-pre-line">{meal.foods}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ANÁLISE NUTRICIONAL */}
              {selectedRecordatorio.status === 'analyzed' && selectedRecordatorio.total_calories && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Análise Nutricional</h3>
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="p-4 border rounded-lg text-center">
                      <div className="text-sm text-muted-foreground mb-1">Calorias</div>
                      <div className="text-2xl font-bold">{selectedRecordatorio.total_calories}</div>
                      <div className="text-xs text-muted-foreground">kcal</div>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <div className="text-sm text-muted-foreground mb-1">Proteínas</div>
                      <div className="text-2xl font-bold">{selectedRecordatorio.total_protein?.toFixed(1)}</div>
                      <div className="text-xs text-muted-foreground">gramas</div>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <div className="text-sm text-muted-foreground mb-1">Carboidratos</div>
                      <div className="text-2xl font-bold">{selectedRecordatorio.total_carbs?.toFixed(1)}</div>
                      <div className="text-xs text-muted-foreground">gramas</div>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <div className="text-sm text-muted-foreground mb-1">Gorduras</div>
                      <div className="text-2xl font-bold">{selectedRecordatorio.total_fat?.toFixed(1)}</div>
                      <div className="text-xs text-muted-foreground">gramas</div>
                    </div>
                  </div>

                  {selectedRecordatorio.analysis_notes && (
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Observações da Análise</h4>
                      <p className="text-sm">{selectedRecordatorio.analysis_notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={() => setIsViewModalOpen(false)}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
