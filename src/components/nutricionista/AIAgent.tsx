import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Bot, 
  Brain, 
  Zap, 
  Settings, 
  Calendar,
  MessageSquare,
  TrendingUp,
  Users,
  Clock,
  Target,
  Lightbulb,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  BarChart,
  CheckCircle,
  AlertTriangle,
  Upload
} from "lucide-react";

const AIAgent = () => {
  const [agentActive, setAgentActive] = useState(true);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Configurações do Agent
  const agentConfig = {
    name: "NutriBot Pro",
    personality: "Profissional, empático e especialista em nutrição",
    temperature: 0.7,
    responseTime: "< 2s",
    accuracy: 94,
    learningRate: "Alto",
    specialties: [
      "Emagrecimento saudável",
      "Ganho de massa muscular", 
      "Reeducação alimentar",
      "Nutrição esportiva",
      "Dietas terapêuticas"
    ]
  };

  // Conhecimentos treinados
  const knowledgeBase = [
    {
      id: 1,
      category: "Protocolos de Atendimento",
      title: "Processo de Agendamento",
      content: "Como realizar agendamentos, verificar disponibilidade e confirmar consultas",
      status: "trained",
      confidence: 96
    },
    {
      id: 2,
      category: "Conhecimento Técnico",
      title: "Planos Alimentares",
      content: "Tipos de dietas, restrições alimentares, cálculos nutricionais",
      status: "trained", 
      confidence: 92
    },
    {
      id: 3,
      category: "Vendas & Conversão",
      title: "Apresentação de Serviços",
      content: "Como apresentar planos, preços, benefícios e fechar vendas",
      status: "training",
      confidence: 78
    },
    {
      id: 4,
      category: "Atendimento ao Cliente",
      title: "Resolução de Dúvidas",
      content: "FAQ, dúvidas comuns, orientações básicas de nutrição",
      status: "trained",
      confidence: 89
    }
  ];

  // Ações automáticas do Agent
  const agentActions = [
    {
      id: 1,
      name: "Agendamento Automático",
      description: "Verificar agenda e agendar consultas",
      trigger: "Solicitação de agendamento",
      enabled: true,
      successRate: 94
    },
    {
      id: 2, 
      name: "Qualificação de Leads",
      description: "Identificar perfil e necessidades do cliente",
      trigger: "Primeiro contato",
      enabled: true,
      successRate: 87
    },
    {
      id: 3,
      name: "Follow-up de Consultas",
      description: "Lembretes e acompanhamento pós-consulta",
      trigger: "24h após consulta",
      enabled: true,
      successRate: 91
    },
    {
      id: 4,
      name: "Renovação de Planos",
      description: "Oferecer renovação antes do vencimento",
      trigger: "7 dias antes do vencimento",
      enabled: true,
      successRate: 73
    }
  ];

  // Métricas do Agent
  const agentMetrics = {
    totalConversations: 847,
    successfulConversions: 231,
    appointmentsScheduled: 156,
    averageResponseTime: "1.4s",
    customerSatisfaction: 4.7,
    costsReduced: "R$ 2.840/mês"
  };

  const TrainingModal = () => (
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Treinamento do AI Agent</DialogTitle>
      </DialogHeader>
      <Tabs defaultValue="knowledge" className="mt-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="knowledge">Base de Conhecimento</TabsTrigger>
          <TabsTrigger value="training">Treinamento</TabsTrigger>
          <TabsTrigger value="examples">Exemplos</TabsTrigger>
        </TabsList>

        <TabsContent value="knowledge" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Conhecimentos Treinados</h3>
            <Button className="action-primary">
              <Upload className="h-4 w-4 mr-2" />
              Adicionar Conhecimento
            </Button>
          </div>
          
          <div className="space-y-3">
            {knowledgeBase.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{item.title}</h4>
                      <Badge variant={item.status === 'trained' ? 'default' : 'secondary'}>
                        {item.status === 'trained' ? 'Treinado' : 'Treinando'}
                      </Badge>
                    </div>
                    <Badge variant="outline" className="text-xs mb-2">
                      {item.category}
                    </Badge>
                    <p className="text-sm text-muted-foreground">{item.content}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-sm font-medium">{item.confidence}%</div>
                      <Progress value={item.confidence} className="w-16 h-2" />
                    </div>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Treinamento Personalizado</h3>
            
            <Card className="p-4">
              <h4 className="font-medium mb-3">Adicionar Novo Conhecimento</h4>
              <div className="space-y-3">
                <div>
                  <Label>Categoria</Label>
                  <Input placeholder="Ex: Atendimento ao Cliente" />
                </div>
                <div>
                  <Label>Título</Label>
                  <Input placeholder="Ex: Como lidar com objeções" />
                </div>
                <div>
                  <Label>Conteúdo de Treinamento</Label>
                  <Textarea 
                    placeholder="Descreva detalhadamente como o agent deve se comportar nesta situação..."
                    rows={6}
                  />
                </div>
                <Button className="action-primary">
                  <Brain className="h-4 w-4 mr-2" />
                  Treinar Agent
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="examples" className="space-y-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Exemplos de Conversas</h3>
            
            <div className="space-y-3">
              <Card className="p-4">
                <h4 className="font-medium mb-2">Agendamento de Consulta</h4>
                <div className="bg-muted/50 p-3 rounded-lg space-y-2 text-sm">
                  <div><strong>Cliente:</strong> Gostaria de agendar uma consulta</div>
                  <div><strong>Agent:</strong> Claro! Vou verificar a agenda do Dr. Gabriel. Qual seria sua preferência de horário?</div>
                  <div><strong>Cliente:</strong> Manhã, se possível</div>
                  <div><strong>Agent:</strong> Perfeito! Tenho disponibilidade na terça-feira às 9h ou quinta às 10h. Qual prefere?</div>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium mb-2">Qualificação de Lead</h4>
                <div className="bg-muted/50 p-3 rounded-lg space-y-2 text-sm">
                  <div><strong>Cliente:</strong> Quero emagrecer</div>
                  <div><strong>Agent:</strong> Que ótimo! Para criar o melhor plano para você, me conte: qual seu objetivo principal? Quantos quilos gostaria de perder?</div>
                  <div><strong>Cliente:</strong> Uns 10kg em 3 meses</div>
                  <div><strong>Agent:</strong> Entendi! Já tentou algum tipo de dieta antes? Pratica exercícios?</div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </DialogContent>
  );

  const ConfigModal = () => (
    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Configurações do AI Agent</DialogTitle>
      </DialogHeader>
      <div className="space-y-6 mt-4">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Personalidade do Agent</h3>
          <Card className="p-4 space-y-3">
            <div>
              <Label>Nome do Agent</Label>
              <Input value={agentConfig.name} />
            </div>
            <div>
              <Label>Personalidade</Label>
              <Textarea value={agentConfig.personality} rows={3} />
            </div>
            <div>
              <Label>Temperatura (Criatividade)</Label>
              <div className="flex items-center gap-3">
                <Progress value={agentConfig.temperature * 100} className="flex-1" />
                <span className="text-sm">{agentConfig.temperature}</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Ações Automáticas</h3>
          <div className="space-y-3">
            {agentActions.map((action) => (
              <Card key={action.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium">{action.name}</h4>
                      <Switch checked={action.enabled} />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                    <Badge variant="outline" className="text-xs mt-2">
                      {action.trigger}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{action.successRate}%</div>
                    <div className="text-xs text-muted-foreground">Taxa de sucesso</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button className="action-primary">Salvar Configurações</Button>
          <Button variant="outline" onClick={() => setShowConfigModal(false)}>
            Cancelar
          </Button>
        </div>
      </div>
    </DialogContent>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">AI Agent Specialist</h2>
          <p className="text-muted-foreground">Agente inteligente especializado em nutrição e atendimento automatizado</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showTrainingModal} onOpenChange={setShowTrainingModal}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Brain className="h-4 w-4 mr-2" />
                Treinamento
              </Button>
            </DialogTrigger>
            <TrainingModal />
          </Dialog>
          <Dialog open={showConfigModal} onOpenChange={setShowConfigModal}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
            </DialogTrigger>
            <ConfigModal />
          </Dialog>
          <Button 
            className={agentActive ? "bg-red-500 hover:bg-red-600" : "action-primary"}
            onClick={() => setAgentActive(!agentActive)}
          >
            {agentActive ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Desativar Agent
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Ativar Agent
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Status do Agent */}
      <Card className="border-2 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold">{agentConfig.name}</h3>
                <Badge className={agentActive ? 'status-active' : 'bg-red-100 text-red-800'}>
                  {agentActive ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              <p className="text-muted-foreground mb-3">{agentConfig.personality}</p>
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="text-muted-foreground">Precisão:</span>
                  <span className="font-semibold ml-1">{agentConfig.accuracy}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Tempo de Resposta:</span>
                  <span className="font-semibold ml-1">{agentConfig.responseTime}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Taxa de Aprendizado:</span>
                  <span className="font-semibold ml-1">{agentConfig.learningRate}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{agentMetrics.totalConversations}</div>
                <div className="text-sm text-muted-foreground">Conversas Realizadas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{agentMetrics.successfulConversions}</div>
                <div className="text-sm text-muted-foreground">Conversões Realizadas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{agentMetrics.appointmentsScheduled}</div>
                <div className="text-sm text-muted-foreground">Agendamentos Feitos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{agentMetrics.averageResponseTime}</div>
                <div className="text-sm text-muted-foreground">Tempo Médio Resposta</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-pink-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{agentMetrics.customerSatisfaction}/5</div>
                <div className="text-sm text-muted-foreground">Satisfação Cliente</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <BarChart className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{agentMetrics.costsReduced}</div>
                <div className="text-sm text-muted-foreground">Economia Mensal</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Especialidades */}
      <Card>
        <CardHeader>
          <CardTitle>Especialidades Treinadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {agentConfig.specialties.map((specialty, index) => (
              <Badge key={index} variant="outline" className="px-3 py-1">
                <Lightbulb className="h-3 w-3 mr-1" />
                {specialty}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ações Automáticas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Automáticas do Agent</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agentActions.map((action) => (
              <Card key={action.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{action.name}</h4>
                      {action.enabled ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{action.description}</p>
                    <Badge variant="outline" className="text-xs">
                      {action.trigger}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Taxa de sucesso: </span>
                    <span className="font-semibold">{action.successRate}%</span>
                  </div>
                  <Progress value={action.successRate} className="w-20 h-2" />
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAgent;