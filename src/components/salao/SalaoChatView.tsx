import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  MessageCircle,
  Bot,
  User,
  Send,
  Phone,
  Clock,
  CheckCircle,
  Settings,
  Scissors,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { mockChatMessages } from '@/lib/salaoMockData';

export const SalaoChatView = () => {
  const [selectedChat, setSelectedChat] = useState('1');
  const [newMessage, setNewMessage] = useState('');

  const chatSessions = [
    {
      id: '1',
      customer: 'Amanda Oliveira',
      lastMessage: 'Cliente confirmou o agendamento. Enviando lembrete por WhatsApp.',
      timestamp: '15:45',
      status: 'active',
      unread: 0,
      type: 'whatsapp',
    },
    {
      id: '2',
      customer: 'Julia Santos',
      lastMessage: 'IA: Encontrei horários disponíveis para coloração. Qual prefere?',
      timestamp: '14:20',
      status: 'ai_handling',
      unread: 2,
      type: 'whatsapp',
    },
    {
      id: '3',
      customer: 'Mariana Costa',
      lastMessage: 'Quero agendar corte + escova para sábado',
      timestamp: '13:15',
      status: 'waiting',
      unread: 1,
      type: 'chat',
    },
  ];

  const aiSuggestions = [
    'Temos horários disponíveis para este serviço',
    'Posso agendar com sua profissional preferida?',
    'Este tratamento é recomendado para seu tipo de cabelo',
    'Gostaria de adicionar algum outro serviço?',
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Ativo</Badge>;
      case 'ai_handling':
        return <Badge variant="secondary">IA Respondendo</Badge>;
      case 'waiting':
        return <Badge variant="outline">Aguardando</Badge>;
      default:
        return <Badge variant="outline">Offline</Badge>;
    }
  };

  const getMessageIcon = (sender: string) => {
    switch (sender) {
      case 'ai':
        return <Bot className="h-4 w-4" />;
      case 'user':
        return <Scissors className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      console.log('Enviando mensagem:', newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Lista de Conversas */}
      <Card className="lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg flex items-center">
            <MessageCircle className="h-5 w-5 mr-2" />
            Conversas
          </CardTitle>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <div className="space-y-2 p-4">
              {chatSessions.map((chat) => (
                <div
                  key={chat.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedChat === chat.id
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedChat(chat.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white">
                          {chat.customer.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-sm">{chat.customer}</p>
                          {getStatusBadge(chat.status)}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {chat.lastMessage}
                        </p>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {chat.timestamp}
                        </div>
                      </div>
                    </div>
                    {chat.unread > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {chat.unread}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Ativo */}
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white">
                AO
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">Amanda Oliveira</CardTitle>
              <p className="text-sm text-muted-foreground">Online agora</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Phone className="h-4 w-4 mr-2" />
              Ligar
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Agendar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[350px] p-4">
            <div className="space-y-4">
              {mockChatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                        : message.sender === 'ai'
                        ? 'bg-purple-100 text-purple-900'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      {getMessageIcon(message.sender)}
                      <span className="text-xs font-medium">
                        {message.sender === 'ai' ? 'IA Bella Beauty' : 
                         message.sender === 'user' ? 'Você' : message.customer}
                      </span>
                    </div>
                    <p className="text-sm">{message.message}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs opacity-70">
                        {message.timestamp}
                      </span>
                      {message.sender === 'user' && (
                        <CheckCircle className="h-3 w-3 opacity-70" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Sugestões da IA */}
          <div className="border-t p-4">
            <p className="text-sm font-medium mb-2 flex items-center">
              <Bot className="h-4 w-4 mr-2 text-purple-500" />
              Sugestões da IA Beauty:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
              {aiSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs text-left justify-start h-auto p-2"
                  onClick={() => setNewMessage(suggestion)}
                >
                  <Sparkles className="h-3 w-3 mr-2 text-pink-500" />
                  {suggestion}
                </Button>
              ))}
            </div>

            {/* Input de Mensagem */}
            <div className="flex space-x-2">
              <Input
                placeholder="Digite sua mensagem..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage} 
                className="bg-gradient-to-r from-pink-500 to-purple-600"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};