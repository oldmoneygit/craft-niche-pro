import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import { Bell, Save } from 'lucide-react';

interface ReminderTemplates {
  '72h': string;
  '24h': string;
  '2h': string;
}

export default function PlatformReminderSettings() {
  const { tenantId } = useTenantId();
  const [templates, setTemplates] = useState<ReminderTemplates>({
    '72h': 'Olá! Sua consulta com Dr. {professional_name} está agendada para daqui 3 dias ({date} às {time}). Confirme sua presença respondendo SIM.',
    '24h': 'Lembrete: Sua consulta é amanhã ({date} às {time})! Nos vemos em breve.',
    '2h': 'Sua consulta é hoje daqui 2 horas ({time}). Estamos te esperando!'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, [tenantId]);

  const loadTemplates = async () => {
    if (!tenantId) return;

    try {
      const { data } = await supabase
        .from('tenant_config')
        .select('custom_fields')
        .eq('tenant_id', tenantId)
        .single();

      if (data?.custom_fields && typeof data.custom_fields === 'object') {
        const customFields = data.custom_fields as Record<string, any>;
        if (customFields.reminder_templates) {
          setTemplates(customFields.reminder_templates as ReminderTemplates);
        }
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const saveTemplates = async () => {
    if (!tenantId) return;

    setLoading(true);
    try {
      const { data: existingConfig } = await supabase
        .from('tenant_config')
        .select('custom_fields')
        .eq('tenant_id', tenantId)
        .single();

      const currentFields = existingConfig?.custom_fields && typeof existingConfig.custom_fields === 'object'
        ? existingConfig.custom_fields as Record<string, any>
        : {};

      const updatedCustomFields = {
        ...currentFields,
        reminder_templates: templates
      };

      const { error } = await supabase
        .from('tenant_config')
        .update({ custom_fields: updatedCustomFields as any })
        .eq('tenant_id', tenantId);

      if (error) throw error;

      toast({
        title: "Templates salvos",
        description: "Os templates de lembrete foram atualizados com sucesso."
      });
    } catch (error) {
      console.error('Error saving templates:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar os templates.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <Bell className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Configurar Lembretes</h1>
          <p className="text-muted-foreground">Personalize as mensagens enviadas aos pacientes</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Variáveis Disponíveis</CardTitle>
          <CardDescription>
            Use estas variáveis nas suas mensagens: <code>{'{professional_name}'}</code>, <code>{'{date}'}</code>, <code>{'{time}'}</code>, <code>{'{client_name}'}</code>
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Lembrete 3 dias antes (72h)</CardTitle>
            <CardDescription>Mensagem enviada 3 dias antes da consulta</CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor="template-72h">Mensagem</Label>
            <Textarea
              id="template-72h"
              value={templates['72h']}
              onChange={(e) => setTemplates(prev => ({ ...prev, '72h': e.target.value }))}
              rows={4}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lembrete 1 dia antes (24h)</CardTitle>
            <CardDescription>Mensagem enviada 1 dia antes da consulta</CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor="template-24h">Mensagem</Label>
            <Textarea
              id="template-24h"
              value={templates['24h']}
              onChange={(e) => setTemplates(prev => ({ ...prev, '24h': e.target.value }))}
              rows={4}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lembrete 2 horas antes (2h)</CardTitle>
            <CardDescription>Mensagem enviada 2 horas antes da consulta</CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor="template-2h">Mensagem</Label>
            <Textarea
              id="template-2h"
              value={templates['2h']}
              onChange={(e) => setTemplates(prev => ({ ...prev, '2h': e.target.value }))}
              rows={4}
              className="mt-2"
            />
          </CardContent>
        </Card>
      </div>

      <Button 
        onClick={saveTemplates} 
        disabled={loading}
        size="lg"
        className="w-full sm:w-auto"
      >
        <Save className="w-4 h-4 mr-2" />
        {loading ? 'Salvando...' : 'Salvar Templates'}
      </Button>
    </div>
  );
}
