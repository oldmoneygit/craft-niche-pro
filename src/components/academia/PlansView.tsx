import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, DollarSign, Clock, CheckCircle, Edit } from "lucide-react";
import { academiaPlans } from "@/lib/academiaMockData";

export function PlansView() {
  const [plans, setPlans] = useState(academiaPlans);

  const togglePlanStatus = (planId: number) => {
    setPlans(plans.map(plan => 
      plan.id === planId ? { ...plan, active: !plan.active } : plan
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Planos e Mensalidades</h2>
          <p className="text-muted-foreground">Gerencie os planos oferecidos pela academia</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Plano
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className={`relative ${!plan.active ? 'opacity-60' : ''}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={plan.active}
                    onCheckedChange={() => togglePlanStatus(plan.id)}
                  />
                  <Badge variant={plan.active ? "default" : "secondary"}>
                    {plan.active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold text-green-600">
                  R$ {plan.price.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{plan.duration}</span>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Benefícios Inclusos:</h4>
                <ul className="space-y-1">
                  {plan.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Edit className="h-3 w-3" />
                      Editar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Editar Plano: {plan.name}</DialogTitle>
                      <DialogDescription>
                        Modifique as informações do plano
                      </DialogDescription>
                    </DialogHeader>
                    <div className="text-center py-8 text-muted-foreground">
                      <Edit className="h-12 w-12 mx-auto mb-4" />
                      <p>Formulário de edição em desenvolvimento</p>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button size="sm" disabled={!plan.active}>
                  Vender Plano
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Plans Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas dos Planos</CardTitle>
          <CardDescription>Performance dos planos no último mês</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">156</div>
              <div className="text-sm text-muted-foreground">Planos Mensais Ativos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">78</div>
              <div className="text-sm text-muted-foreground">Planos Anuais Ativos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">13</div>
              <div className="text-sm text-muted-foreground">Planos Pendentes Renovação</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}