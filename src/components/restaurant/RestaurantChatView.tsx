import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Send,
  Bot,
  User,
  Clock,
  Phone,
  MessageSquare,
  Settings
} from 'lucide-react';

const RestaurantChatView = () => {
  const [conversations, setConversations] = useState([
    {
      id: 'conv-1',
      customer: 'Marina Santos',
      phone: '(11) 98765-4321',
      lastMessage: 'Olá! Vocês entregam na Vila Madalena?',
      lastMessageTime: '14:35',
      unreadCount: 2,
      isActive: false,
      messages: [
        {
          id: 'msg-1',
          sender: 'customer',
          content: 'Olá! Vocês entregam na Vila Madalena?',
          timestamp: '14:32',
          isRead: true
        },
        {
          id: 'msg-2',
          sender: 'ai',
          content: 'Olá Marina! Sim, entregamos na Vila Madalena. Nossa taxa de entrega é R$ 8,90 e o tempo estimado é de 35-45 minutos. Gostaria de ver nosso cardápio?',
          timestamp: '14:32',
          isRead: true
        },
        {
          id: 'msg-3',
          sender: 'customer',
          content: 'Perfeito! Qual o prato principal mais pedido?',
          timestamp: '14:35',
          isRead: false
        }
      ]
    },
    {
      id: 'conv-2',
      customer: 'Roberto Silva',
      phone: '(11) 99876-5432',
      lastMessage: 'Obrigado! A comida estava deliciosa.',
      lastMessageTime: '13:22',
      unreadCount: 0,
      isActive: false,
      messages: [
        {
          id: 'msg-4',
          sender: 'customer',
          content: 'Acabei de receber meu pedido',
          timestamp: '13:20',
          isRead: true
        },
        {
          id: 'msg-5',
          sender: 'ai',
          content: 'Que ótimo, Roberto! Espero que esteja tudo saboroso. Como foi sua experiência com o nosso delivery?',
          timestamp: '13:21',
          isRead: true
        },
        {
          id: 'msg-6',
          sender: 'customer',
          content: 'Obrigado! A comida estava deliciosa.',
          timestamp: '13:22',
          isRead: true
        }
      ]
    },
    {
      id: 'conv-3',
      customer: 'Ana Costa',
      phone: '(11) 91234-5678',
      lastMessage: 'Gostaria de fazer um pedido para amanhã',
      lastMessageTime: '12:15',
      unreadCount: 1,
      isActive: false,
      messages: [
        {
          id: 'msg-7',
          sender: 'customer',
          content: 'Gostaria de fazer um pedido para amanhã',
          timestamp: '12:15',
          isRead: false
        }
      ]
    }
  ]);

  const [activeConversation, setActiveConversation] = useState(conversations[0]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation.messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: `msg-${Date.now()}`,
      sender: 'human',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      isRead: true
    };

    // Atualizar a conversa ativa
    const updatedConversation = {
      ...activeConversation,
      messages: [...activeConversation.messages, message],
      lastMessage: newMessage,
      lastMessageTime: message.timestamp
    };

    // Atualizar a lista de conversas
    const updatedConversations = conversations.map(conv =>
      conv.id === activeConversation.id ? updatedConversation : conv
    );

    setConversations(updatedConversations);
    setActiveConversation(updatedConversation);
    setNewMessage('');

    // Simular resposta da IA após 2 segundos
    setTimeout(() => {
      const aiResponse = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        content: 'Obrigado pela sua mensagem! Nossa equipe irá responder em breve. Enquanto isso, posso ajudar com informações sobre nosso cardápio ou delivery.',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        isRead: true
      };

      const finalConversation = {
        ...updatedConversation,
        messages: [...updatedConversation.messages, aiResponse],
        lastMessage: aiResponse.content,
        lastMessageTime: aiResponse.timestamp
      };

      const finalConversations = updatedConversations.map(conv =>
        conv.id === activeConversation.id ? finalConversation : conv
      );

      setConversations(finalConversations);
      setActiveConversation(finalConversation);
    }, 2000);
  };

  const getSenderIcon = (sender: string) => {
    switch (sender) {
      case 'customer':
        return <User className="h-4 w-4" />;
      case 'ai':
        return <Bot className="h-4 w-4" />;
      case 'human':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getSenderLabel = (sender: string) => {
    switch (sender) {
      case 'customer':
        return 'Cliente';
      case 'ai':
        return 'IA';
      case 'human':
        return 'Você';
      default:
        return 'Cliente';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Chat & Atendimento</h1>
          <p className="text-muted-foreground">
            Gerencie conversas com seus clientes
          </p>
        </div>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Configurar IA
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
        {/* Lista de conversas */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Conversas Ativas</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[520px]">
              <div className="space-y-2 p-4">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      activeConversation.id === conv.id
                        ? 'bg-primary/10 border border-primary/20'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setActiveConversation(conv)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {conv.customer.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="font-medium truncate">{conv.customer}</div>
                            {conv.unreadCount > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {conv.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <Phone className="h-3 w-3 mr-1" />
                            {conv.phone}
                          </div>
                          <div className="text-sm text-muted-foreground truncate mt-1">
                            {conv.lastMessage}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground ml-2">
                        <Clock className="h-3 w-3 mr-1" />
                        {conv.lastMessageTime}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat ativo */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {activeConversation.customer.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{activeConversation.customer}</CardTitle>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 mr-1" />
                    {activeConversation.phone}
                  </div>
                </div>
              </div>
              <Badge variant="secondary">WhatsApp</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex flex-col h-[460px]">
            {/* Mensagens */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {activeConversation.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === 'customer' ? 'justify-start' : 'justify-end'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.sender === 'customer'
                          ? 'bg-muted'
                          : message.sender === 'ai'
                          ? 'bg-blue-100 dark:bg-blue-900/20'
                          : 'bg-primary text-primary-foreground'
                      }`}
                    >
                      <div className="flex items-center mb-1">
                        {getSenderIcon(message.sender)}
                        <span className="text-xs font-medium ml-1">
                          {getSenderLabel(message.sender)}
                        </span>
                        <span className="text-xs ml-2 opacity-70">
                          {message.timestamp}
                        </span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input de mensagem */}
            <div className="border-t p-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Digite sua mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage();
                    }
                  }}
                />
                <Button onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RestaurantChatView;