import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  MessageCircle, 
  Phone, 
  Mail,
  Clock,
  Heart,
  Brain,
  Lightbulb,
  Star,
  TrendingUp,
  Users,
  Target
} from "lucide-react";
import { mockChatMessages } from "@/lib/mockData";

export default function AITherapist() {
  const [messages, setMessages] = useState(mockChatMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      message: newMessage,
      timestamp: new Date().toLocaleString('pt-BR'),
      patientName: 'Você',
      phone: '',
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        type: 'ai' as const,
        message: generateAIResponse(newMessage),
        timestamp: new Date().toLocaleString('pt-BR'),
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const generateAIResponse = (userMessage: string): string => {
    const responses = [
      "Compreendo sua situação. Com base no protocolo de atendimento da clínica, sugiro agendarmos uma consulta inicial para uma avaliação mais detalhada. Posso verificar nossa agenda para você.",
      "Essa é uma preocupação importante. Nossa equipe especializada pode ajudar com esse tipo de questão. Vou transferir sua solicitação para nossa agenda e enviar algumas informações preliminares.",
      "Entendo que você está passando por um momento difícil. É muito importante buscar ajuda profissional. Temos horários disponíveis ainda esta semana. Gostaria que eu verificasse nossa disponibilidade?",
      "Com base no que você relatou, recomendo uma consulta inicial para podermos entender melhor sua situação e definir o melhor plano de tratamento. Nossa abordagem é personalizada para cada paciente.",
      "Obrigado por compartilhar isso comigo. É um passo muito importante buscar ajuda. Vou organizar algumas informações sobre nossos serviços e verificar nossos horários disponíveis para você."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const quickReplies = [
    "Quero agendar uma consulta",
    "Qual o valor da consulta?",
    "Vocês atendem pelo meu convênio?", 
    "Horários disponíveis",
    "Localização da clínica",
    "Tipos de terapia oferecidos"
  ];

  const handleQuickReply = (reply: string) => {
    setNewMessage(reply);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">IA Terapêutica</h2>
        <p className="text-muted-foreground">Assistente inteligente para atendimento e triagem</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">247</div>
                <div className="text-sm text-muted-foreground">Conversas Hoje</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-success/10 rounded-xl">
                <Users className="h-6 w-6 text-success" />
              </div>
              <div>
                <div className="text-2xl font-bold text-success">89%</div>
                <div className="text-sm text-muted-foreground">Taxa Conversão</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary/10 rounded-xl">
                <Clock className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary">2.3min</div>
                <div className="text-sm text-muted-foreground">Tempo Resposta</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/10 rounded-xl">
                <Star className="h-6 w-6 text-accent" />
              </div>
              <div>
                <div className="text-2xl font-bold text-accent">4.8</div>
                <div className="text-sm text-muted-foreground">Avaliação</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="therapy-card h-[600px] flex flex-col">
            <CardHeader className="border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-primary rounded-full">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    IA Sofia
                    <Badge className="bg-green-50 text-green-700 border-green-200">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                      Online
                    </Badge>
                  </CardTitle>
                  <CardDescription>Assistente Terapêutica Inteligente</CardDescription>
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-0">
              <div className="p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.type === 'ai' && (
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-gradient-primary text-white">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div
                      className={`max-w-[70%] p-3 rounded-xl ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted/50 text-foreground'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p className="text-xs opacity-70 mt-1">{message.timestamp}</p>
                    </div>
                    
                    {message.type === 'user' && (
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-secondary text-secondary-foreground">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex gap-3 justify-start">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-gradient-primary text-white">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted/50 p-3 rounded-xl">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>

            {/* Quick Replies */}
            <div className="p-4 border-t border-border">
              <div className="flex flex-wrap gap-2 mb-3">
                {quickReplies.map((reply, index) => (
                  <Button
                    key={index}
                    size="sm"
                    variant="outline"
                    onClick={() => handleQuickReply(reply)}
                    className="text-xs rounded-full"
                  >
                    {reply}
                  </Button>
                ))}
              </div>
              
              {/* Message Input */}
              <div className="flex gap-3">
                <Input
                  placeholder="Digite sua mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="rounded-xl"
                />
                <Button 
                  onClick={handleSendMessage}
                  className="action-primary px-4 rounded-xl"
                  disabled={!newMessage.trim() || isTyping}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* AI Insights & Features */}
        <div className="space-y-6">
          {/* AI Features */}
          <Card className="therapy-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Recursos da IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl">
                <Brain className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium text-sm">Triagem Inteligente</div>
                  <div className="text-xs text-muted-foreground">Identificação automática de urgência</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-secondary/5 rounded-xl">
                <Target className="h-5 w-5 text-secondary" />
                <div>
                  <div className="font-medium text-sm">Direcionamento</div>
                  <div className="text-xs text-muted-foreground">Indicação do profissional ideal</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-accent/5 rounded-xl">
                <Lightbulb className="h-5 w-5 text-accent" />
                <div>
                  <div className="font-medium text-sm">Sugestões</div>
                  <div className="text-xs text-muted-foreground">Recursos e exercícios terapêuticos</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Insights */}
          <Card className="therapy-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Insights Recentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="text-sm font-medium">Pico de ansiedade detectado</div>
                </div>
                <div className="text-xs text-green-700">
                  70% das conversas mencionaram sintomas de ansiedade nas últimas 4h
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="text-sm font-medium">Horários populares</div>
                </div>
                <div className="text-xs text-blue-700">
                  Mais solicitações entre 14h-17h para terapia de casal
                </div>
              </div>
              
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="text-sm font-medium">Interesse crescente</div>
                </div>
                <div className="text-xs text-purple-700">
                  Aumento de 40% em consultas sobre transtornos do sono
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Methods */}
          <Card className="therapy-card">
            <CardHeader>
              <CardTitle className="text-lg">Canais de Atendimento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MessageCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-medium">WhatsApp</div>
                  <div className="text-xs text-muted-foreground">156 conversas hoje</div>
                </div>
                <Badge className="bg-green-100 text-green-700 text-xs ml-auto">89%</Badge>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Phone className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-medium">Telefone</div>
                  <div className="text-xs text-muted-foreground">23 chamadas hoje</div>
                </div>
                <Badge className="bg-blue-100 text-blue-700 text-xs ml-auto">76%</Badge>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Mail className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm font-medium">Email</div>
                  <div className="text-xs text-muted-foreground">12 mensagens hoje</div>
                </div>
                <Badge className="bg-purple-100 text-purple-700 text-xs ml-auto">92%</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}