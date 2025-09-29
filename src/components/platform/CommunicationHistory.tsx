import React, { useState } from 'react';
import { Search, Filter, Mail, MessageCircle, Phone, Eye, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useCommunications } from '@/hooks/useCommunications';
import { useClients } from '@/hooks/useClients';
import { useTenant } from '@/hooks/useTenant';
import { supabase } from '@/integrations/supabase/client';

interface CommunicationHistoryProps {
  clientId: string;
}

export default function CommunicationHistory({ clientId }: CommunicationHistoryProps) {
  const { tenant } = useTenant(clientId);
  const { communications, templates, sendCommunication } = useCommunications(clientId);
  const { clients } = useClients(tenant?.id);
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDirection, setSelectedDirection] = useState<string>('all');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [selectedCommunication, setSelectedCommunication] = useState<any>(null);
  const [composeData, setComposeData] = useState({
    client_id: '',
    type: 'email' as const,
    subject: '',
    content: '',
    templateId: ''
  });

  const filteredCommunications = communications.filter(comm => {
    const matchesSearch = !searchQuery || 
      comm.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || comm.type === selectedType;
    const matchesDirection = selectedDirection === 'all' || comm.direction === selectedDirection;
    
    return matchesSearch && matchesType && matchesDirection;
  });

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'Cliente não encontrado';
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      email: Mail,
      whatsapp: MessageCircle,
      sms: Phone
    };
    const Icon = icons[type as keyof typeof icons] || Mail;
    return <Icon className="h-4 w-4" />;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      sent: 'bg-green-100 text-green-800',
      delivered: 'bg-blue-100 text-blue-800',
      read: 'bg-purple-100 text-purple-800',
      failed: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || colors.sent;
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setComposeData({
        ...composeData,
        templateId: templateId,
        subject: template.subject || '',
        content: template.content
      });
    }
  };

  const handleSendEmail = async () => {
    if (!composeData.client_id || !composeData.content.trim()) {
      toast({
        title: 'Erro',
        description: 'Cliente e conteúdo são obrigatórios',
        variant: 'destructive'
      });
      return;
    }

    try {
      const client = clients.find(c => c.id === composeData.client_id);
      if (!client?.email) {
        toast({
          title: 'Erro',
          description: 'Cliente não possui email cadastrado',
          variant: 'destructive'
        });
        return;
      }

      // Send via edge function
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: client.email,
          subject: composeData.subject || 'Mensagem da Plataforma',
          content: composeData.content,
          clientId: composeData.client_id,
          templateId: composeData.templateId || undefined,
          type: composeData.type
        }
      });

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Email enviado com sucesso'
      });

      setComposeData({
        client_id: '',
        type: 'email',
        subject: '',
        content: '',
        templateId: ''
      });
      setIsComposeOpen(false);
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao enviar email',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Histórico de Comunicação</h3>
        <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
          <DialogTrigger asChild>
            <Button>
              <Send className="h-4 w-4 mr-2" />
              Nova Mensagem
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Enviar Mensagem</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Cliente</label>
                  <select
                    value={composeData.client_id}
                    onChange={(e) => setComposeData({ ...composeData, client_id: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Selecione um cliente</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.name} {client.email ? `(${client.email})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tipo</label>
                  <select
                    value={composeData.type}
                    onChange={(e) => setComposeData({ ...composeData, type: e.target.value as any })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="email">Email</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="sms">SMS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Template (opcional)</label>
                <select
                  value={composeData.templateId}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Nenhum template</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              {composeData.type === 'email' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Assunto</label>
                  <Input
                    value={composeData.subject}
                    onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                    placeholder="Assunto do email"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Mensagem</label>
                <Textarea
                  value={composeData.content}
                  onChange={(e) => setComposeData({ ...composeData, content: e.target.value })}
                  placeholder="Digite sua mensagem..."
                  rows={6}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSendEmail}>Enviar</Button>
                <Button variant="outline" onClick={() => setIsComposeOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar comunicações..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="p-2 border rounded-md"
            >
              <option value="all">Todos os tipos</option>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="sms">SMS</option>
            </select>
            <select
              value={selectedDirection}
              onChange={(e) => setSelectedDirection(e.target.value)}
              className="p-2 border rounded-md"
            >
              <option value="all">Todas direções</option>
              <option value="sent">Enviadas</option>
              <option value="received">Recebidas</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Communications List */}
      <div className="space-y-4">
        {filteredCommunications.map((communication) => (
          <Card key={communication.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getTypeIcon(communication.type)}
                    <span className="font-medium">{getClientName(communication.client_id)}</span>
                    <Badge className={getStatusColor(communication.status)}>
                      {communication.status}
                    </Badge>
                    <Badge variant="outline">
                      {communication.direction === 'sent' ? 'Enviada' : 'Recebida'}
                    </Badge>
                  </div>
                  
                  {communication.metadata?.subject && (
                    <p className="text-sm font-medium mb-1">
                      Assunto: {communication.metadata.subject}
                    </p>
                  )}
                  
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {communication.content}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{new Date(communication.created_at).toLocaleString('pt-BR')}</span>
                    {communication.template_used && (
                      <span>Template usado</span>
                    )}
                  </div>
                </div>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedCommunication(communication)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredCommunications.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhuma comunicação encontrada</p>
          </div>
        )}
      </div>

      {/* View Communication Dialog */}
      <Dialog open={!!selectedCommunication} onOpenChange={() => setSelectedCommunication(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Comunicação</DialogTitle>
          </DialogHeader>
          {selectedCommunication && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Cliente:</label>
                  <p>{getClientName(selectedCommunication.client_id)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo:</label>
                  <div className="flex items-center gap-2">
                    {getTypeIcon(selectedCommunication.type)}
                    <span className="capitalize">{selectedCommunication.type}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Direção:</label>
                  <Badge variant="outline">
                    {selectedCommunication.direction === 'sent' ? 'Enviada' : 'Recebida'}
                  </Badge>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status:</label>
                  <Badge className={getStatusColor(selectedCommunication.status)}>
                    {selectedCommunication.status}
                  </Badge>
                </div>
              </div>
              
              {selectedCommunication.metadata?.subject && (
                <div>
                  <label className="block text-sm font-medium mb-1">Assunto:</label>
                  <p className="p-3 bg-muted rounded-md">{selectedCommunication.metadata.subject}</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-1">Conteúdo:</label>
                <div className="p-4 bg-muted rounded-md whitespace-pre-wrap">
                  {selectedCommunication.content}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Data:</label>
                <p>{new Date(selectedCommunication.created_at).toLocaleString('pt-BR')}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}