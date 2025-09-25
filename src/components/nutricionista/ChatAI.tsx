import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Bot, 
  MessageSquare, 
  Send, 
  Settings, 
  Users,
  Clock,
  CheckCircle,
  Zap,
  Play,
  Pause,
  Plus
} from "lucide-react";
import { mockNutriData } from "@/lib/mockDataNutricionista";

const ChatAI = () => {
  const [newMessage, setNewMessage] = useState("");
  const [showAutomationSettings, setShowAutomationSettings] = useState(false);
  const { chatMessages } = mockNutriData;

  // Simulação de templates de mensagens
  const messageTemplates = [
    {
      id: 1,
      name: "Renovação de Plano",
      trigger: "7 dias antes do vencimento",
      message: "Olá {nome}! Seu plano {tipo} vence em 7 dias. Que tal renovarmos para continuar sua jornada de saúde?",
      active: true
    },
    {
      id: 2,
      name: "Check-in Semanal",
      trigger: "Todo domingo",
      message: "Oi {nome}! Como foi sua semana seguindo o plano alimentar? Conte-me sobre seus resultados!",
      active: true
    },
    {
      id: 3,
      name: "Lembrete de Consulta",
      trigger: "1 dia antes da consulta",
      message: "Lembrete: você tem consulta amanhã às {horario}. Lembre-se de trazer seus exames!",
      active: true
    },
    {
      id: 4,
      name: "Paciente Inativo",
      trigger: "30 dias sem atividade",
      message: "Oi {nome}! Senti sua falta por aqui. Que tal agendarmos uma consulta para retomar seu acompanhamento?",
      active: false
    }
  ];

  // Respostas automáticas da IA
  const aiResponses = [
    {
      question: "Posso comer banana à noite?",
      answer: "Sim! A banana é uma excelente opção para a noite por conter triptofano, que ajuda na produção de serotonina e melhora o sono. Além disso, fornece potássio e magnésio que auxiliam no relaxamento muscular."
    },
    {
      question: "Quantos copos de água devo beber?",
      answer: "A recomendação geral é de 35ml por kg de peso corporal. Para uma pessoa de 70kg, isso equivale a aproximadamente 2,5 litros por dia. Mas isso pode variar com atividade física e clima."
    },
    {
      question: "Como controlar a vontade de doce?",
      answer: "Algumas estratégias: inclua frutas nas refeições, mastigue bem os alimentos, mantenha horários regulares de alimentação e considere opções mais saudáveis como frutas secas ou chocolate 70% cacau."
    }
  ];

  const AutomationSettingsModal = () => (
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Configurações de Automação</DialogTitle>
      </DialogHeader>
      <div className="space-y-6 mt-4">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Mensagens Automáticas</h3>
          {messageTemplates.map((template) => (
            <Card key={template.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium">{template.name}</h4>
                    <Switch checked={template.active} />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {template.trigger}
                  </Badge>
                </div>
              </div>
              <Textarea 
                value={template.message}
                className="text-sm h-20"
                readOnly
              />
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Respostas Automáticas</h3>
          <div className="space-y-3">
            {aiResponses.map((response, index) => (
              <Card key={index} className="p-4">
                <div className="space-y-2">
                  <div className="font-medium text-sm">"{response.question}"</div>
                  <div className="text-sm text-muted-foreground">{response.answer}</div>
                </div>
              </Card>
            ))}
          </div>
          <Button variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Nova Resposta
          </Button>
        </div>

        <div className="flex gap-2">
          <Button className="action-primary">Salvar Configurações</Button>
          <Button variant="outline" onClick={() => setShowAutomationSettings(false)}>
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
          <h2 className="text-3xl font-bold">Chat IA & Automação</h2>
          <p className="text-muted-foreground">Automatize comunicação e responda pacientes com IA</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showAutomationSettings} onOpenChange={setShowAutomationSettings}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
            </DialogTrigger>
            <AutomationSettingsModal />
          </Dialog>
          <Button className="action-primary">
            <Send className="h-4 w-4 mr-2" />
            Enviar Mensagem
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status da IA */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                Assistente IA Nutricional
                <Badge className="status-active ml-auto">Online</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">24</div>
                  <div className="text-sm text-muted-foreground">Mensagens Hoje</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-success">15</div>
                  <div className="text-sm text-muted-foreground">Respondidas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-warning">3</div>
                  <div className="text-sm text-muted-foreground">Pendentes</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mensagens Recentes */}
          <Card>
            <CardHeader>
              <CardTitle>Conversas Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {chatMessages.map((message) => (
                  <div 
                    key={message.id}
                    className={`flex gap-3 p-3 rounded-lg ${
                      message.type === 'received' ? 'bg-muted/50' : 
                      message.type === 'system' ? 'bg-primary/5' : 'bg-success/5'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      {message.type === 'system' ? (
                        <Bot className="h-4 w-4 text-primary" />
                      ) : (
                        <span className="text-xs font-medium text-primary">
                          {message.patientName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{message.patientName}</span>
                        <span className="text-xs text-muted-foreground">{message.time}</span>
                        {message.answered && (
                          <CheckCircle className="h-3 w-3 text-success" />
                        )}
                      </div>
                      <p className="text-sm">{message.message}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Input para resposta */}
              <div className="flex gap-2 mt-4">
                <Input 
                  placeholder="Digite sua resposta..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                />
                <Button size="sm" className="action-primary">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Automações e Estatísticas */}
        <div className="space-y-6">
          {/* Automações Ativas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Automações Ativas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {messageTemplates.filter(t => t.active).map((template) => (
                <div key={template.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-success"></div>
                    <div>
                      <div className="font-medium text-sm">{template.name}</div>
                      <div className="text-xs text-muted-foreground">{template.trigger}</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Pause className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Nova Automação
              </Button>
            </CardContent>
          </Card>

          {/* Estatísticas */}
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas da IA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Taxa de Resposta</span>
                <span className="font-medium">94%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Tempo Médio</span>
                <span className="font-medium">&lt; 1 min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Satisfação</span>
                <span className="font-medium">4.8/5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Renovações IA</span>
                <span className="font-medium text-success">+23%</span>
              </div>
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Enviar para Todos
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Clock className="h-4 w-4 mr-2" />
                Lembrete Consultas
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="h-4 w-4 mr-2" />
                Check-in Semanal
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Zap className="h-4 w-4 mr-2" />
                Renovação Urgente
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChatAI;