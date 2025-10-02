import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, MessageCircle, RefreshCw, Clock } from 'lucide-react';
import { formatDate, formatCurrency, calculateDaysRemaining } from '@/lib/serviceCalculations';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ExpiringService {
  id: string;
  client_id: string;
  client_name: string;
  client_phone: string;
  service_name: string;
  end_date: string;
  price: number;
  days_remaining: number;
}

interface ServiceExpirationAlertsProps {
  tenantId: string;
  daysThreshold?: number;
}

export const ServiceExpirationAlerts = ({ 
  tenantId, 
  daysThreshold = 7 
}: ServiceExpirationAlertsProps) => {
  const { toast } = useToast();
  const [expiringServices, setExpiringServices] = useState<ExpiringService[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchExpiringServices();
  }, [tenantId, daysThreshold]);

  const fetchExpiringServices = async () => {
    setLoading(true);

    const today = new Date();
    const futureDate = new Date(today.getTime() + daysThreshold * 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from('service_subscriptions')
      .select(`
        id,
        end_date,
        price,
        client_id,
        status,
        client:clients!service_subscriptions_client_id_fkey (id, name, phone),
        service:services!service_subscriptions_service_id_fkey (id, name)
      `)
      .eq('tenant_id', tenantId)
      .in('status', ['active', 'expiring_soon'])
      .gte('end_date', today.toISOString().split('T')[0])
      .lte('end_date', futureDate.toISOString().split('T')[0])
      .order('end_date', { ascending: true });

    if (error) {
      console.error('Erro ao buscar serviços expirando:', error);
      setLoading(false);
      return;
    }

    const processed = data?.map(sub => ({
      id: sub.id,
      client_id: sub.client_id,
      client_name: (sub.client as any)?.name || 'Cliente',
      client_phone: (sub.client as any)?.phone || '',
      service_name: (sub.service as any)?.name || 'Serviço',
      end_date: sub.end_date,
      price: sub.price || 0,
      days_remaining: calculateDaysRemaining(sub.end_date)
    })) || [];

    setExpiringServices(processed);
    setLoading(false);

    // Atualizar status para 'expiring_soon' se necessário
    const toUpdate = data?.filter(sub => 
      sub.status === 'active' && calculateDaysRemaining(sub.end_date) <= daysThreshold
    );

    if (toUpdate && toUpdate.length > 0) {
      await supabase
        .from('service_subscriptions')
        .update({ status: 'expiring_soon' })
        .in('id', toUpdate.map(s => s.id));
    }
  };

  const handleSendReminder = async (service: ExpiringService) => {
    setSendingMessage(service.id);

    const message = `Olá ${service.client_name}! 👋

Seu serviço de *${service.service_name}* está próximo do fim.

📅 Data de vencimento: ${formatDate(service.end_date)}
⏰ Faltam apenas ${service.days_remaining} dia(s)

Gostaria de renovar seu acompanhamento? Estou à disposição para continuar te ajudando a alcançar seus objetivos! 💪

Responda esta mensagem para renovarmos.`;

    const whatsappLink = `https://wa.me/55${service.client_phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappLink, '_blank');

    await new Promise(resolve => setTimeout(resolve, 2000));

    setSendingMessage(null);
    
    toast({
      title: '✓ WhatsApp aberto',
      description: `Mensagem pronta para ${service.client_name}`
    });
  };

  const handleSendAllReminders = async () => {
    for (const service of expiringServices) {
      await handleSendReminder(service);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    toast({
      title: '✓ Mensagens enviadas',
      description: `${expiringServices.length} lembretes de renovação enviados`
    });
  };

  const getDaysRemainingColor = (days: number) => {
    if (days <= 3) return 'text-destructive bg-destructive/10 border-destructive/20';
    if (days <= 5) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg border p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="h-20 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (expiringServices.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-lg border-2 border-orange-200 dark:border-orange-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
            <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-foreground">
              Serviços Próximos do Vencimento
            </h3>
            <p className="text-sm text-muted-foreground">
              {expiringServices.length} serviço(s) vencendo nos próximos {daysThreshold} dias
            </p>
          </div>
        </div>
        
        {expiringServices.length > 1 && (
          <Button
            onClick={handleSendAllReminders}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Enviar Todos os Lembretes
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {expiringServices.map(service => (
          <div 
            key={service.id}
            className="bg-card rounded-lg border p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold">
                    {service.client_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{service.client_name}</h4>
                    <p className="text-sm text-muted-foreground">{service.service_name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Vence em: {formatDate(service.end_date)}</span>
                  </div>
                  <Badge className={getDaysRemainingColor(service.days_remaining)}>
                    {service.days_remaining} dia(s) restante(s)
                  </Badge>
                  <span className="font-bold text-foreground">
                    {formatCurrency(service.price)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleSendReminder(service)}
                  disabled={sendingMessage === service.id}
                  variant="outline"
                  size="sm"
                  className="border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  {sendingMessage === service.id ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Enviar Lembrete
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
