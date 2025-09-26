import React from 'react';
import DashboardTemplate from '@/core/layouts/DashboardTemplate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Bot, 
  Users,
  Phone,
  Settings,
  Play,
  Pause,
  BarChart3
} from 'lucide-react';

export default function PlatformChat() {
  return (
    <DashboardTemplate title="Chat & WhatsApp">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Chat & WhatsApp</h2>
            <p className="text-muted-foreground">
              Central de atendimento integrada com IA
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>
            <Button className="action-primary">
              <Play className="h-4 w-4 mr-2" />
              Ativar IA
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversas Ativas</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">+5 desde ontem</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resoluções IA</CardTitle>
              <Bot className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87%</div>
              <p className="text-xs text-muted-foreground">Taxa de sucesso</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo Resposta</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12s</div>
              <p className="text-xs text-muted-foreground">Média hoje</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Satisfação</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.8/5</div>
              <p className="text-xs text-muted-foreground">Avaliação média</p>
            </CardContent>
          </Card>
        </div>

        {/* WhatsApp Integration */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-green-600" />
                Integração WhatsApp
              </CardTitle>
              <CardDescription>
                Configure e gerencie sua integração com WhatsApp Business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-green-800">WhatsApp Business API</p>
                  <p className="text-sm text-green-600">Conectado e funcionando</p>
                </div>
                <Badge className="bg-green-100 text-green-800">Ativo</Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Mensagens enviadas hoje:</span>
                  <span className="text-sm font-medium">156</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Mensagens recebidas:</span>
                  <span className="text-sm font-medium">89</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Taxa de entrega:</span>
                  <span className="text-sm font-medium text-green-600">98.5%</span>
                </div>
              </div>

              <Button variant="outline" className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Configurar WhatsApp
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-600" />
                Agente IA Especializado
              </CardTitle>
              <CardDescription>
                IA treinada especificamente para seu tipo de negócio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-blue-800">IA Nutricional</p>
                  <p className="text-sm text-blue-600">Especializada em nutrição</p>
                </div>
                <Badge className="bg-blue-100 text-blue-800">Treinando</Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Conversas atendidas pela IA:</span>
                  <span className="text-sm font-medium">67</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Taxa de resolução:</span>
                  <span className="text-sm font-medium text-green-600">87%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Transferências para humano:</span>
                  <span className="text-sm font-medium">13%</span>
                </div>
              </div>

              <Button variant="outline" className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Treinar IA
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Central de Conversas</CardTitle>
            <CardDescription>
              Interface de chat integrada - funcionalidade completa disponível em breve
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/30 rounded-lg p-8 text-center">
              <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Interface de Chat em Desenvolvimento</h3>
              <p className="text-muted-foreground mb-6">
                A interface completa de chat com WhatsApp e IA será implementada na próxima fase.
                Por enquanto, você pode configurar as integrações acima.
              </p>
              <div className="flex justify-center space-x-4">
                <Button variant="outline">
                  Ver Roadmap
                </Button>
                <Button className="action-primary">
                  Solicitar Demonstração
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardTemplate>
  );
}