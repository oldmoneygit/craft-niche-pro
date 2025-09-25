import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, MessageCircle, Users, Calendar, TrendingUp } from "lucide-react";

const mockChatHistory = [
  {
    id: 1,
    type: "bot",
    message: "Olá! Sou o assistente IA da FitLife Academia. Como posso ajudá-lo hoje?",
    timestamp: "09:00"
  },
  {
    id: 2,
    type: "user",
    message: "Quais são os horários das aulas de crossfit?",
    timestamp: "09:01"
  },
  {
    id: 3,
    type: "bot",
    message: "As aulas de Crossfit acontecem nos seguintes horários:\n\n• Segunda, Quarta e Sexta: 07:00, 18:00 e 19:30\n• Terça e Quinta: 06:30, 17:30 e 19:00\n• Sábado: 08:00 e 09:30\n\nGostaria de agendar uma aula experimental?",
    timestamp: "09:01"
  },
  {
    id: 4,
    type: "user", 
    message: "Sim, gostaria de agendar para amanhã às 18h",
    timestamp: "09:02"
  },
  {
    id: 5,
    type: "bot",
    message: "Perfeito! Agendei sua aula experimental de Crossfit para amanhã (12/01) às 18:00 com o Prof. Marcos. \n\n📋 Lembre-se de trazer:\n• Roupa confortável\n• Tênis apropriado\n• Toalha\n• Garrafa de água\n\nChegue 15 min antes para avaliação física. Confirmo por WhatsApp uma hora antes!",
    timestamp: "09:02"
  }
];

const quickReplies = [
  "Horários das aulas",
  "Planos disponíveis", 
  "Agendar aula experimental",
  "Cancelar agendamento",
  "Renovar plano",
  "Contato da academia"
];

export function AcademiaChatView() {
  const [messages, setMessages] = useState(mockChatHistory);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const userMessage = {
        id: messages.length + 1,
        type: "user" as const,
        message: newMessage,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages([...messages, userMessage]);
      setNewMessage("");

      // Simulate bot response
      setTimeout(() => {
        const botMessage = {
          id: messages.length + 2,
          type: "bot" as const,
          message: "Entendi sua solicitação. Nossa equipe está analisando e retornará em breve com uma resposta personalizada!",
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMessage]);
      }, 1000);
    }
  };

  const handleQuickReply = (reply: string) => {
    setNewMessage(reply);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Chat com IA - Assistente Fitness</h2>
        <p className="text-muted-foreground">Atendimento automatizado para membros e interessados</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Stats */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Estatísticas do Chat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Conversas hoje</span>
                </div>
                <Badge>24</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Leads gerados</span>
                </div>
                <Badge>8</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Agendamentos</span>
                </div>
                <Badge>5</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">Taxa conversão</span>
                </div>
                <Badge variant="secondary">33%</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Respostas Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {quickReplies.map((reply, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full text-left justify-start h-auto py-2 text-xs"
                    onClick={() => handleQuickReply(reply)}
                  >
                    {reply}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                <CardTitle>Assistente IA FitLife</CardTitle>
                <Badge variant="secondary" className="ml-auto">Online</Badge>
              </div>
              <CardDescription>
                Demonstração do atendimento automatizado
              </CardDescription>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start gap-3 ${
                        message.type === "user" ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.type === "bot" 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-secondary text-secondary-foreground"
                      }`}>
                        {message.type === "bot" ? (
                          <Bot className="h-4 w-4" />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                      </div>
                      
                      <div className={`max-w-[80%] ${message.type === "user" ? "text-right" : "text-left"}`}>
                        <div className={`rounded-lg px-3 py-2 text-sm ${
                          message.type === "bot"
                            ? "bg-muted text-muted-foreground"
                            : "bg-primary text-primary-foreground"
                        }`}>
                          <p className="whitespace-pre-line">{message.message}</p>
                        </div>
                        <span className="text-xs text-muted-foreground mt-1 block">
                          {message.timestamp}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="flex gap-2 pt-4">
                <Input
                  placeholder="Digite sua mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}