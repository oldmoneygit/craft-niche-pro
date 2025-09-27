import React from 'react';
import { useParams } from 'react-router-dom';
import { useClientConfig } from '@/core/contexts/ClientConfigContext';
import DashboardTemplate from '@/core/layouts/DashboardTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Settings, Bell, User, Shield, Palette, Globe } from 'lucide-react';

export default function PlatformSettings() {
  const { clientId } = useParams<{ clientId: string }>();
  const { setClientId, clientConfig, loading, error, clearError } = useClientConfig();

  React.useEffect(() => {
    if (clientId && clientId.trim()) {
      setClientId(clientId);
    }
  }, [clientId, setClientId]);

  return (
    <DashboardTemplate title="Configurações">
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      ) : !clientConfig ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Plataforma não encontrada</h1>
            <p className="text-muted-foreground">A plataforma solicitada não existe ou não está disponível.</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
              <p className="text-muted-foreground">
                Gerencie as configurações da sua plataforma
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            {/* Perfil */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Perfil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Nome da Empresa</Label>
                    <Input id="company-name" defaultValue={clientConfig.branding.companyName} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business-type">Tipo de Negócio</Label>
                    <Input id="business-type" defaultValue={clientConfig.businessType} disabled />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição do Negócio</Label>
                  <Input id="description" placeholder="Descreva brevemente seu negócio..." />
                </div>
                <Button>Salvar Alterações</Button>
              </CardContent>
            </Card>

            {/* Notificações */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notificações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber notificações por email
                    </p>
                  </div>
                  <Switch defaultChecked={clientConfig.settings.notifications.email} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>WhatsApp</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber notificações via WhatsApp
                    </p>
                  </div>
                  <Switch defaultChecked={clientConfig.settings.notifications.whatsapp} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber notificações push no navegador
                    </p>
                  </div>
                  <Switch defaultChecked={clientConfig.settings.notifications.push} />
                </div>
              </CardContent>
            </Card>

            {/* Módulos Ativos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Módulos Ativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(clientConfig.modules).map(([module, enabled]) => (
                    <div key={module} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm font-medium capitalize">
                        {module.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <Badge variant={enabled ? "default" : "secondary"}>
                        {enabled ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Aparência */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Aparência
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Cor Primária</Label>
                    <div 
                      className="w-full h-10 rounded border-2"
                      style={{ backgroundColor: clientConfig.branding.customColors.primary }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cor Secundária</Label>
                    <div 
                      className="w-full h-10 rounded border-2"
                      style={{ backgroundColor: clientConfig.branding.customColors.secondary }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cor de Destaque</Label>
                    <div 
                      className="w-full h-10 rounded border-2"
                      style={{ backgroundColor: clientConfig.branding.customColors.accent }}
                    />
                  </div>
                </div>
                <Button>Personalizar Cores</Button>
              </CardContent>
            </Card>

            {/* Configurações Regionais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Configurações Regionais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Idioma</Label>
                    <Input id="language" defaultValue={clientConfig.settings.language} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Fuso Horário</Label>
                    <Input id="timezone" defaultValue={clientConfig.settings.timezone} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Moeda</Label>
                    <Input id="currency" defaultValue={clientConfig.settings.currency} />
                  </div>
                </div>
                <Button>Salvar Configurações</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </DashboardTemplate>
  );
}