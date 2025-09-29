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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Plus,
  Search,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Video,
  MessageCircle,
  Calendar,
  Heart,
  ThumbsUp,
  Brain,
  Lightbulb,
  Target
} from "lucide-react";
import AIAgent from "./AIAgent";
import { mockNutriData } from "@/lib/mockDataNutricionista";

const ChatAI = ({ clientId }: { clientId?: string }) => {
  const [newMessage, setNewMessage] = useState("");
  const [showAutomationSettings, setShowAutomationSettings] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { chatMessages, patients } = mockNutriData;

  // Conversas simuladas com pacientes
  const conversations = [
    {
      id: 1,
      patientId: 1,
      patientName: "Maria Silva",
      patientPhone: "(11) 99999-1234",
      lastMessage: "Oi! Estava com uma dúvida sobre o plano alimentar...",
      time: "14:32",
      unread: 2,
      online: true,
      messages: [
        {
          id: 1,
          sender: "patient",
          message: "Oi Gabriel! Tudo bem?",
          time: "14:25",
          status: "read"
        },
        {
          id: 2,
          sender: "patient", 
          message: "Estava com uma dúvida sobre o plano alimentar...",
          time: "14:26",
          status: "read"
        },
        {
          id: 3,
          sender: "patient",
          message: "Posso substituir a batata doce por mandioca?",
          time: "14:32",
          status: "delivered"
        }
      ]
    },
    {
      id: 2,
      patientId: 2,
      patientName: "João Santos",
      patientPhone: "(11) 88888-5678",
      lastMessage: "Muito obrigado pelas orientações! 😊",
      time: "13:15",
      unread: 0,
      online: false,
      messages: [
        {
          id: 1,
          sender: "nutricionista",
          message: "Olá João! Como foi sua semana seguindo o plano?",
          time: "09:00",
          status: "read"
        },
        {
          id: 2,
          sender: "patient",
          message: "Foi muito boa! Perdi 1,2kg esta semana",
          time: "13:10",
          status: "read"
        },
        {
          id: 3,
          sender: "patient",
          message: "Muito obrigado pelas orientações! 😊",
          time: "13:15",
          status: "read"
        }
      ]
    },
    {
      id: 3,
      patientId: 3,
      patientName: "Ana Costa",
      patientPhone: "(11) 77777-9012",
      lastMessage: "Agendei minha consulta para segunda-feira",
      time: "12:45",
      unread: 0,
      online: false,
      messages: [
        {
          id: 1,
          sender: "system",
          message: "Lembrete: Ana tem consulta amanhã às 10h",
          time: "12:40",
          status: "sent"
        },
        {
          id: 2,
          sender: "patient",
          message: "Agendei minha consulta para segunda-feira",
          time: "12:45",
          status: "read"
        }
      ]
    },
    {
      id: 4,
      patientId: 4,
      patientName: "Carlos Oliveira",
      patientPhone: "(11) 66666-3456",
      lastMessage: "IA: Seu plano vence em 3 dias. Gostaria de renovar?",
      time: "11:20",
      unread: 1,
      online: true,
      isAIConversation: true,
      messages: [
        {
          id: 1,
          sender: "ai",
          message: "Olá Carlos! Seu plano trimestral vence em 3 dias. Gostaria de renovar para continuar sua jornada de saúde?",
          time: "11:20",
          status: "delivered"
        }
      ]
    }
  ];

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

  const filteredConversations = conversations.filter(conv =>
    conv.patientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unread, 0);

  const AutomationSettingsModal = () => (
    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Configurações de Automação & WhatsApp</DialogTitle>
      </DialogHeader>
      <div className="space-y-6 mt-4">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Conexão WhatsApp Business</h3>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-medium">WhatsApp Business API</div>
                  <div className="text-sm text-muted-foreground">+55 (11) 99999-0000</div>
                </div>
              </div>
              <Badge className="status-active">Conectado</Badge>
            </div>
          </Card>
        </div>
        
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
          <h3 className="text-lg font-semibold">Respostas Automáticas da IA</h3>
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
            Adicionar Nova Resposta Automática
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

  const ConversationItem = ({ conversation }) => (
    <div 
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
        selectedConversation?.id === conversation.id ? 'bg-primary/10' : 'hover:bg-muted/50'
      }`}
      onClick={() => setSelectedConversation(conversation)}
    >
      <div className="relative">
        <Avatar className="h-10 w-10">
          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${conversation.patientName}`} />
          <AvatarFallback>
            {conversation.patientName.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        {conversation.online && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-sm truncate">{conversation.patientName}</h4>
            {conversation.isAIConversation && (
              <Bot className="h-3 w-3 text-primary" />
            )}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">{conversation.time}</span>
            {conversation.unread > 0 && (
              <Badge className="h-5 w-5 rounded-full bg-primary text-white text-xs p-0 flex items-center justify-center">
                {conversation.unread}
              </Badge>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {conversation.lastMessage}
        </p>
      </div>
    </div>
  );

  const ChatMessage = ({ message, isOwnMessage }) => (
    <div className={`flex mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] rounded-lg p-3 ${
        isOwnMessage 
          ? 'bg-primary text-primary-foreground' 
          : message.sender === 'ai' 
          ? 'bg-blue-100 text-blue-900' 
          : message.sender === 'system'
          ? 'bg-muted text-muted-foreground'
          : 'bg-muted'
      }`}>
        {message.sender === 'ai' && (
          <div className="flex items-center gap-2 mb-1">
            <Bot className="h-3 w-3" />
            <span className="text-xs font-medium">Assistente IA</span>
          </div>
        )}
        {message.sender === 'system' && (
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-3 w-3" />
            <span className="text-xs font-medium">Sistema</span>
          </div>
        )}
        <p className="text-sm">{message.message}</p>
        <div className={`text-xs mt-1 ${isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'} flex items-center gap-1`}>
          <span>{message.time}</span>
          {isOwnMessage && (
            <div className="flex">
              {message.status === 'sent' && <CheckCircle className="h-3 w-3" />}
              {message.status === 'delivered' && <CheckCircle className="h-3 w-3" />}
              {message.status === 'read' && <CheckCircle className="h-3 w-3 text-blue-400" />}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Tabs defaultValue="chat" className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Chat IA & Automação</h2>
          <p className="text-muted-foreground">Central de atendimento integrada com AI Agent especializado</p>
        </div>
        <TabsList className="grid w-[400px] grid-cols-2">
          <TabsTrigger value="chat">Chat & WhatsApp</TabsTrigger>
          <TabsTrigger value="agent">AI Agent</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="chat" className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-semibold">Central de Atendimento</h3>
            <p className="text-muted-foreground">Gerencie conversas do WhatsApp e mensagens automáticas</p>
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
              <MessageSquare className="h-4 w-4 mr-2" />
              Nova Conversa
            </Button>
          </div>
        </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{conversations.length}</div>
                <div className="text-sm text-muted-foreground">Conversas Ativas</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bot className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">94%</div>
                <div className="text-sm text-muted-foreground">Automação IA</div>
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
                <div className="text-2xl font-bold">&lt; 2min</div>
                <div className="text-sm text-muted-foreground">Tempo Resposta</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <ThumbsUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">4.9/5</div>
                <div className="text-sm text-muted-foreground">Satisfação</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Conversas</CardTitle>
              {totalUnread > 0 && (
                <Badge className="bg-primary text-white">
                  {totalUnread} não lidas
                </Badge>
              )}
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar conversa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[480px]">
              <div className="p-3 space-y-1">
                {filteredConversations.map((conversation) => (
                  <ConversationItem key={conversation.id} conversation={conversation} />
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Window */}
        <Card className="lg:col-span-2">
          {selectedConversation ? (
            <>
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedConversation.patientName}`} />
                      <AvatarFallback>
                        {selectedConversation.patientName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{selectedConversation.patientName}</h3>
                        {selectedConversation.isAIConversation && (
                          <Badge variant="outline" className="text-xs">
                            <Bot className="h-3 w-3 mr-1" />
                            IA Ativa
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {selectedConversation.online ? 'Online agora' : `Visto por último ${selectedConversation.time}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <ScrollArea className="h-[400px] p-4">
                  {selectedConversation.messages.map((message) => (
                    <ChatMessage 
                      key={message.id} 
                      message={message} 
                      isOwnMessage={message.sender === 'nutricionista'} 
                    />
                  ))}
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Input
                      placeholder="Digite sua mensagem..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && newMessage.trim()) {
                          // Simular envio de mensagem
                          setNewMessage("");
                        }
                      }}
                    />
                    <Button variant="ghost" size="sm">
                      <Smile className="h-4 w-4" />
                    </Button>
                    <Button size="sm" className="action-primary">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Quick Replies */}
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <Button variant="outline" size="sm" className="text-xs">
                      👋 Olá! Como posso ajudar?
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs">
                      📅 Vamos agendar uma consulta?
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs">
                      📊 Como está seu progresso?
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="h-full flex items-center justify-center text-center">
              <div className="space-y-4">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="font-semibold text-lg">Selecione uma conversa</h3>
                  <p className="text-muted-foreground">
                    Escolha uma conversa à esquerda para começar a atender seu paciente
                  </p>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
      </TabsContent>

      <TabsContent value="agent">
        <AIAgent />
      </TabsContent>
    </Tabs>
  );
};

export default ChatAI;