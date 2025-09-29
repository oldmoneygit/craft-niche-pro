import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Search, MessageCircle, Bot, Clock, Users, Send, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import DashboardTemplate from '@/core/layouts/DashboardTemplate';
import { useCommunications } from '@/hooks/useCommunications';
import { useClients } from '@/hooks/useClients';
import { useTenant } from '@/hooks/useTenant';
import { useClientConfig } from '@/core/contexts/ClientConfigContext';
import EmailTemplateManager from '@/components/platform/EmailTemplateManager';
import CommunicationHistory from '@/components/platform/CommunicationHistory';

export default function PlatformCommunication() {
  const { clientId } = useParams<{ clientId: string }>();
  const { setClientId, clientConfig, loading: configLoading, error, clearError } = useClientConfig();
  
  // Use gabriel-gandin as fallback if clientId is invalid
  const actualClientId = clientId && clientId !== ':clientId' ? clientId : 'gabriel-gandin';
  
  const { tenant } = useTenant(actualClientId);
  const { communications, templates, loading } = useCommunications(actualClientId);
  const { clients } = useClients(tenant?.id);
  const [searchQuery, setSearchQuery] = useState('');

  React.useEffect(() => {
    console.log('PlatformCommunication: clientId from params:', clientId);
    console.log('PlatformCommunication: actualClientId:', actualClientId);
    setClientId(actualClientId);
  }, [actualClientId, setClientId]);

  React.useEffect(() => {
    console.log('PlatformCommunication: tenant:', tenant);
    console.log('PlatformCommunication: configLoading:', configLoading);
    console.log('PlatformCommunication: loading:', loading);
    console.log('PlatformCommunication: error:', error);
  }, [tenant, configLoading, loading, error]);

  // Mock conversations for now
  const conversations = [
    {
      id: 1,
      clientName: "Maria Silva",
      lastMessage: "Obrigada pelas orientações!",
      time: "14:32",
      unread: 2,
      online: true,
    },
    {
      id: 2,
      clientName: "João Santos",
      lastMessage: "Quando é minha próxima consulta?",
      time: "13:15",
      unread: 0,
      online: false,
    },
  ];

  if (configLoading || loading) {
    return (
      <DashboardTemplate title="Comunicação">
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando comunicações...</p>
          </div>
        </div>
      </DashboardTemplate>
    );
  }

  if (error) {
    return (
      <DashboardTemplate title="Comunicação">
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => { clearError(); if (clientId) setClientId(clientId); }}>
              Tentar novamente
            </Button>
          </div>
        </div>
      </DashboardTemplate>
    );
  }

  return (
    <DashboardTemplate title="Comunicação">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">Comunicação</h2>
            <p className="text-muted-foreground">Gerencie conversas e mensagens com seus clientes</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>
            <Button className="action-primary">
              <Plus className="h-4 w-4 mr-2" />
              Nova Mensagem
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{communications.length}</div>
                  <div className="text-sm text-muted-foreground">Mensagens</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-green-600" />
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
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Bot className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{templates.length}</div>
                  <div className="text-sm text-muted-foreground">Templates</div>
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
        </div>

        <Tabs defaultValue="history" className="space-y-4">
          <TabsList>
            <TabsTrigger value="history">Histórico</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="conversations">Conversas</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="history">
            <CommunicationHistory clientId={actualClientId} />
          </TabsContent>

          <TabsContent value="templates">
            <EmailTemplateManager clientId={actualClientId} />
          </TabsContent>

          <TabsContent value="conversations">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Conversations List */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Conversas</CardTitle>
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
                  <ScrollArea className="h-[400px]">
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className="flex items-center gap-3 p-4 border-b hover:bg-muted/50 cursor-pointer"
                      >
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${conversation.clientName}`} />
                            <AvatarFallback>
                              {conversation.clientName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          {conversation.online && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm truncate">{conversation.clientName}</h4>
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
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Chat Area */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Selecione uma conversa</CardTitle>
                </CardHeader>
                <CardContent className="h-[400px] flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Selecione uma conversa para começar</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics de Comunicação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Analytics em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardTemplate>
  );
}