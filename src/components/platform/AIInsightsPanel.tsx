import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAIInsights } from '@/hooks/useAIInsights';
import { useAISuggestions } from '@/hooks/useAISuggestions';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertTriangle, 
  TrendingUp, 
  Calendar, 
  MessageSquare, 
  Eye, 
  X, 
  Clock,
  RefreshCw
} from 'lucide-react';

const INSIGHT_ICONS = {
  no_return: Calendar,
  missed_appointments: AlertTriangle,
  positive_evolution: TrendingUp,
  pending_messages: MessageSquare,
};

const PRIORITY_COLORS = {
  1: 'destructive',
  2: 'default',
  3: 'secondary',
} as const;

const PRIORITY_LABELS = {
  1: 'Alta',
  2: 'Média',
  3: 'Baixa',
};

export default function AIInsightsPanel() {
  const { insights, loading, refresh } = useAIInsights();
  const { ignoreSuggestion, postponeSuggestion, createSuggestion } = useAISuggestions();
  const navigate = useNavigate();
  const { clientId } = useParams();
  const { toast } = useToast();

  const handleViewClients = (insight: any) => {
    if (!insight.clientData || insight.clientData.length === 0) {
      toast({
        title: "Nenhum cliente",
        description: "Não há clientes para visualizar",
      });
      return;
    }
    
    // Navegar para página de clientes com filtro
    navigate(`/platform/${clientId}/clients`, {
      state: { 
        filterType: insight.type,
        clientIds: insight.clientData.map((c: any) => c.id),
        insightTitle: insight.title
      }
    });
  };

  const handleIgnore = async (insight: any) => {
    // Create a suggestion to track the ignore action
    await createSuggestion({
      type: insight.type,
      priority: insight.priority,
      data: { insight_id: insight.id, action: 'ignored' },
    });
  };

  const handlePostpone = async (insight: any) => {
    // Create a suggestion to track the postpone action
    await createSuggestion({
      type: insight.type,
      priority: insight.priority,
      data: { insight_id: insight.id, action: 'postponed' },
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            Carregando Insights da IA...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Insights da IA</h3>
        <Button variant="outline" size="sm" onClick={refresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {insights.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nenhum insight encontrado no momento. Tudo parece estar funcionando bem!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {insights.map(insight => {
            const Icon = INSIGHT_ICONS[insight.type];
            return (
              <Card key={insight.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        insight.priority === 1 
                          ? 'bg-destructive/10 text-destructive' 
                          : insight.priority === 2 
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{insight.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{insight.description}</p>
                      </div>
                    </div>
                    
                    <Badge variant={PRIORITY_COLORS[insight.priority]}>
                      Prioridade {PRIORITY_LABELS[insight.priority]}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2">
                    {insight.count! > 0 && (
                      <Button variant="default" size="sm" onClick={() => handleViewClients(insight)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Clientes ({insight.count})
                      </Button>
                    )}
                    
                    <Button variant="outline" size="sm" onClick={() => handleIgnore(insight)}>
                      <X className="w-4 h-4 mr-2" />
                      Ignorar
                    </Button>
                    
                    <Button variant="outline" size="sm" onClick={() => handlePostpone(insight)}>
                      <Clock className="w-4 h-4 mr-2" />
                      Lembrar Depois
                    </Button>
                  </div>
                  
                  {/* Show some client details for high priority insights */}
                  {insight.priority === 1 && insight.clientData && insight.clientData.length > 0 && (
                    <div className="mt-3 p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-2">Primeiros clientes:</p>
                      <div className="space-y-1">
                        {insight.clientData.slice(0, 3).map((client: any, index: number) => (
                          <p key={index} className="text-sm text-muted-foreground">
                            • {client.name} {client.email && `(${client.email})`}
                          </p>
                        ))}
                        {insight.clientData.length > 3 && (
                          <p className="text-sm text-muted-foreground">
                            ... e mais {insight.clientData.length - 3} cliente{insight.clientData.length - 3 > 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}