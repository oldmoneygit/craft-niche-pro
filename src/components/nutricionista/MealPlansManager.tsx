import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Apple, 
  Plus, 
  Edit, 
  Send, 
  Copy, 
  FileText,
  Clock,
  Target,
  Zap,
  Search
} from "lucide-react";
import { mockNutriData } from "@/lib/mockDataNutricionista";

const MealPlansManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewPlan, setShowNewPlan] = useState(false);
  const { mealPlans, templates, patients } = mockNutriData;

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Emagrecimento": return "bg-warning/10 text-warning border-warning/20";
      case "Controle Glicêmico": return "bg-info/10 text-info border-info/20";
      case "Ganho de Massa": return "bg-success/10 text-success border-success/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const NewPlanModal = () => (
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Criar Novo Plano Alimentar</DialogTitle>
      </DialogHeader>
      <div className="space-y-6 mt-4">
        {/* Informações Básicas */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Paciente</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o paciente" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id.toString()}>
                    {patient.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Tipo de Plano</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="emagrecimento">Emagrecimento</SelectItem>
                <SelectItem value="ganho">Ganho de Massa</SelectItem>
                <SelectItem value="manutencao">Manutenção</SelectItem>
                <SelectItem value="diabetes">Controle Glicêmico</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Calorias Totais</Label>
            <Input placeholder="Ex: 1400" />
          </div>
          <div>
            <Label>Proteínas (%)</Label>
            <Input placeholder="Ex: 25" />
          </div>
          <div>
            <Label>Carboidratos (%)</Label>
            <Input placeholder="Ex: 45" />
          </div>
        </div>

        {/* Refeições */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Refeições</h3>
          
          {[
            { name: "Café da Manhã", time: "07:00" },
            { name: "Lanche da Manhã", time: "10:00" },
            { name: "Almoço", time: "12:30" },
            { name: "Lanche da Tarde", time: "15:30" },
            { name: "Jantar", time: "19:00" },
            { name: "Ceia", time: "21:30" }
          ].map((meal, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">{meal.name}</h4>
                <Badge variant="outline">{meal.time}</Badge>
              </div>
              <Textarea 
                placeholder={`Alimentos para ${meal.name.toLowerCase()}...`}
                className="h-20"
              />
              <div className="grid grid-cols-3 gap-2 mt-2">
                <Input placeholder="Calorias" />
                <Input placeholder="Proteínas (g)" />
                <Input placeholder="Carbs (g)" />
              </div>
            </Card>
          ))}
        </div>

        <div>
          <Label>Observações Gerais</Label>
          <Textarea 
            placeholder="Orientações específicas, restrições, suplementação..."
            className="h-24"
          />
        </div>

        <div className="flex gap-2">
          <Button className="action-primary flex-1">
            <Plus className="h-4 w-4 mr-2" />
            Criar Plano
          </Button>
          <Button variant="outline">
            <Send className="h-4 w-4 mr-2" />
            Criar e Enviar
          </Button>
          <Button variant="outline" onClick={() => setShowNewPlan(false)}>
            Cancelar
          </Button>
        </div>
      </div>
    </DialogContent>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Planos Alimentares</h2>
          <p className="text-muted-foreground">Crie e gerencie dietas personalizadas</p>
        </div>
        <Dialog open={showNewPlan} onOpenChange={setShowNewPlan}>
          <DialogTrigger asChild>
            <Button className="action-primary">
              <Plus className="h-4 w-4 mr-2" />
              Novo Plano
            </Button>
          </DialogTrigger>
          <NewPlanModal />
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Planos Ativos */}
        <div className="lg:col-span-2 space-y-6">
          {/* Busca */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar planos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Lista de Planos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Planos Ativos ({mealPlans.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mealPlans.map((plan) => {
                  const patient = patients.find(p => p.id === plan.patientId);
                  return (
                    <Card key={plan.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{plan.name}</h3>
                            <Badge className={getTypeColor(plan.type)}>
                              {plan.type}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              {plan.calories} kcal
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {plan.createdDate}
                            </div>
                            <div className="flex items-center gap-1">
                              <Apple className="h-3 w-3" />
                              {patient?.name}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-success">
                            <Send className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Preview das refeições */}
                      <div className="grid grid-cols-3 gap-2 mt-4">
                        <div className="bg-muted/50 p-2 rounded text-xs">
                          <div className="font-medium">Café da Manhã</div>
                          <div className="text-muted-foreground">350 kcal</div>
                        </div>
                        <div className="bg-muted/50 p-2 rounded text-xs">
                          <div className="font-medium">Almoço</div>
                          <div className="text-muted-foreground">450 kcal</div>
                        </div>
                        <div className="bg-muted/50 p-2 rounded text-xs">
                          <div className="font-medium">Jantar</div>
                          <div className="text-muted-foreground">400 kcal</div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Templates */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Templates Rápidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {templates.map((template) => (
                  <Card key={template.id} className="p-3 hover:bg-muted/50 cursor-pointer transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{template.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={getTypeColor(template.type)}>
                            {template.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {template.calories} kcal
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
              
              <Button variant="outline" className="w-full mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Novo Template
              </Button>
            </CardContent>
          </Card>

          {/* Estatísticas */}
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Planos Ativos</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Templates</span>
                <span className="font-medium">5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Enviados Hoje</span>
                <span className="font-medium">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Média Calórica</span>
                <span className="font-medium">1,650 kcal</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MealPlansManager;