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
  Car,
  Wrench,
} from 'lucide-react';
import { mockChatMessages } from '@/lib/autopecasMockData';

export const AutopecasChatView = () => {
  const [selectedChat, setSelectedChat] = useState('1');
  const [newMessage, setNewMessage] = useState('');

  const chatSessions = [
    {
      id: '1',
      customer: 'João da Silva',
      lastMessage: 'Cliente confirmou o pedido. Preparando para entrega.',
      timestamp: '15:45',
      status: 'active',
      unread: 0,
      type: 'whatsapp',
    },
    {
      id: '2',
      customer: 'Auto Center Rápido',
      lastMessage: 'IA: Encontrei as peças solicitadas. Deseja fazer o orçamento?',
      timestamp: '14:30',
      status: 'ai_handling',
      unread: 2,
      type: 'whatsapp',
    },
    {
      id: '3',
      customer: 'Oficina Mecânica Santos',
      lastMessage: 'Preciso de amortecedores para Civic 2020',
      timestamp: '13:15',
      status: 'waiting',
      unread: 1,
      type: 'chat',
    },
  ];

  const aiSuggestions = [
    'Encontrei essas peças compatíveis com seu veículo',
    'Temos essa peça em estoque. Deseja fazer o pedido?',
    'Para melhor atendimento, preciso saber o ano do seu veículo',
    'Essa peça está em falta. Posso sugerir uma alternativa?',
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
        return <Wrench className="h-4 w-4" />;
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
                        <AvatarFallback>
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
              <AvatarFallback>JS</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">João da Silva</CardTitle>
              <p className="text-sm text-muted-foreground">Online agora</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Phone className="h-4 w-4 mr-2" />
              Ligar
            </Button>
            <Button variant="outline" size="sm">
              <Car className="h-4 w-4 mr-2" />
              Veículo
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
                        ? 'bg-primary text-primary-foreground'
                        : message.sender === 'ai'
                        ? 'bg-purple-100 text-purple-900'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      {getMessageIcon(message.sender)}
                      <span className="text-xs font-medium">
                        {message.sender === 'ai' ? 'IA AutoPeças' : 
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
              Sugestões da IA:
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
              <Button onClick={handleSendMessage} className="bg-gradient-primary">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};