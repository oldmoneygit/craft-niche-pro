import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  MessageSquare,
  Bot,
  User,
  Send,
  Phone,
  MoreHorizontal,
  Settings,
  Brain,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { mockChatMessages } from '@/lib/mockData';

const ChatView = () => {
  const [newMessage, setNewMessage] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(0);

  const conversations = [
    {
      id: 1,
      patientName: 'Marina Silva',
      phone: '(11) 99887-6655',
      lastMessage: 'Sexta-feira às 15:00h seria ideal!',
      timestamp: '14:35',
      unread: 1,
      status: 'active',
    },
    {
      id: 2,
      patientName: 'Roberto Santos',
      phone: '(11) 98765-4321',
      lastMessage: 'Obrigado pela informação',
      timestamp: '13:20',
      unread: 0,
      status: 'resolved',
    },
    {
      id: 3,
      patientName: 'Ana Costa',
      phone: '(11) 97654-3210',
      lastMessage: 'Gostaria de remarcar minha consulta',
      timestamp: '12:15',
      unread: 2,
      status: 'pending',
    },
  ];

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Aqui enviaria a mensagem
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const [date, time] = timestamp.split(' ');
    return time;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Chat com IA</h2>
          <p className="text-muted-foreground">
            Monitore e gerencie conversas do agente de IA
          </p>
        </div>
        <Button variant="secondary">
          <Settings className="h-4 w-4 mr-2" />
          Configurar IA
        </Button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Conversas Hoje</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bot className="h-4 w-4 text-accent" />
              <div>
                <p className="text-sm font-medium">Resolvidas IA</p>
                <p className="text-2xl font-bold">9</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-warning" />
              <div>
                <p className="text-sm font-medium">Transferidas</p>
                <p className="text-2xl font-bold">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <div>
                <p className="text-sm font-medium">Taxa Sucesso</p>
                <p className="text-2xl font-bold">85%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat Interface */}
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Conversas Ativas</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              <div className="space-y-1 p-4">
                {conversations.map((conversation, index) => (
                  <div
                    key={conversation.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedConversation === index
                        ? 'bg-primary/10 border border-primary/20'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedConversation(index)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{conversation.patientName}</span>
                      <div className="flex items-center space-x-1">
                        {conversation.unread > 0 && (
                          <Badge variant="secondary" className="bg-primary text-white text-xs">
                            {conversation.unread}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {conversation.timestamp}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {conversation.lastMessage}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {conversation.phone}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          conversation.status === 'active'
                            ? 'border-warning text-warning'
                            : conversation.status === 'resolved'
                            ? 'border-success text-success'
                            : 'border-primary text-primary'
                        }`}
                      >
                        {conversation.status === 'active'
                          ? 'Ativa'
                          : conversation.status === 'resolved'
                          ? 'Resolvida'
                          : 'Pendente'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Messages */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback className="bg-primary text-white">
                    {conversations[selectedConversation]?.patientName
                      .split(' ')
                      .map(n => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">
                    {conversations[selectedConversation]?.patientName}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {conversations[selectedConversation]?.phone} • WhatsApp
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="secondary" size="sm">
                  <Phone className="h-4 w-4 mr-2" />
                  Ligar
                </Button>
                <Button variant="secondary" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96 p-4">
              <div className="space-y-4">
                {mockChatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div className="flex items-start space-x-2 max-w-xs lg:max-w-md">
                      {message.type === 'ai' && (
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-accent text-white">
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`p-3 rounded-lg ${
                          message.type === 'user'
                            ? 'bg-primary text-white'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span
                            className={`text-xs ${
                              message.type === 'user'
                                ? 'text-white/70'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {formatTimestamp(message.timestamp)}
                          </span>
                          {message.type === 'ai' && (
                            <Brain className="h-3 w-3 text-accent ml-2" />
                          )}
                        </div>
                      </div>
                      {message.type === 'user' && (
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-primary text-white">
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t p-4">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Digite sua resposta..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-gradient-primary hover:shadow-hover"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span>A IA está gerenciando esta conversa</span>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className="text-xs h-6">
                    Assumir Conversa
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs h-6">
                    Treinar IA
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatView;