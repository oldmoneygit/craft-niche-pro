import { useState, useEffect } from 'react';
import { Clock, Send, X, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import { useToast } from '@/hooks/use-toast';

interface UnconfirmedAppointment {
  id: string;
  datetime: string;
  client: {
    id: string;
    name: string;
    phone: string;
  };
  hoursUntil: number;
}

export const UnconfirmedAppointmentsAlert = () => {
  const { tenantId } = useTenantId();
  const { toast } = useToast();
  const [unconfirmed, setUnconfirmed] = useState<UnconfirmedAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    if (tenantId) fetchUnconfirmed();
  }, [tenantId]);

  const fetchUnconfirmed = async () => {
    if (!tenantId) return;

    setLoading(true);
    try {
      const now = new Date();
      const fortyEightHoursLater = new Date(now.getTime() + 48 * 60 * 60 * 1000);

      // Buscar consultas agendadas mas não confirmadas nas próximas 48h
      const { data: appointments } = await supabase
        .from('appointments')
        .select(`
          id,
          datetime,
          status,
          clients(id, name, phone)
        `)
        .eq('tenant_id', tenantId)
        .eq('status', 'agendado')
        .gte('datetime', now.toISOString())
        .lte('datetime', fortyEightHoursLater.toISOString())
        .order('datetime', { ascending: true });

      if (!appointments) return;

      const unconfirmedList: UnconfirmedAppointment[] = appointments
        .filter(apt => apt.clients)
        .map(apt => {
          const aptDate = new Date(apt.datetime);
          const hoursUntil = Math.floor((aptDate.getTime() - now.getTime()) / (1000 * 60 * 60));

          return {
            id: apt.id,
            datetime: apt.datetime,
            client: apt.clients as any,
            hoursUntil
          };
        });

      setUnconfirmed(unconfirmedList);

    } catch (error) {
      console.error('Error fetching unconfirmed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendConfirmation = async (appointment: UnconfirmedAppointment) => {
    const aptDate = new Date(appointment.datetime);
    const dateStr = aptDate.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      day: '2-digit', 
      month: 'long' 
    });
    const timeStr = aptDate.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    const message = `Olá ${appointment.client.name}! 👋\n\nLembrando que você tem consulta marcada para ${dateStr} às ${timeStr}.\n\nPode confirmar sua presença? Responda SIM para confirmar ou me avise se precisar remarcar.`;
    
    const whatsappLink = `https://wa.me/55${appointment.client.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappLink, '_blank');

    toast({
      title: "Confirmação Enviada",
      description: `Mensagem enviada para ${appointment.client.name}`
    });

    // Adicionar à lista de dispensados temporariamente
    setDismissed(prev => [...prev, appointment.id]);
  };

  const handleMarkConfirmed = async (appointmentId: string) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'confirmado' })
      .eq('id', appointmentId);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar status",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Confirmado",
        description: "Consulta marcada como confirmada"
      });
      fetchUnconfirmed();
    }
  };

  const handleDismiss = (appointmentId: string) => {
    setDismissed(prev => [...prev, appointmentId]);
    toast({
      title: "Dispensado",
      description: "Alerta removido temporariamente"
    });
  };

  const visibleAppointments = unconfirmed.filter(apt => !dismissed.includes(apt.id));

  if (loading) return null;
  if (visibleAppointments.length === 0) return null;

  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
          <Clock className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-blue-900 text-lg">
            Confirmações Pendentes ({visibleAppointments.length})
          </h3>
          <p className="text-sm text-blue-800">
            Consultas nas próximas 48h que ainda não foram confirmadas
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {visibleAppointments.map(apt => (
          <div 
            key={apt.id} 
            className="bg-white p-4 rounded-lg border-2 border-blue-100 hover:border-blue-300 transition"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-gray-900">{apt.client.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    apt.hoursUntil <= 24 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    em {apt.hoursUntil}h
                  </span>
                </div>
                <p className="text-sm text-gray-600">{apt.client.phone}</p>
                <p className="text-sm text-gray-700 mt-1">
                  📅 {new Date(apt.datetime).toLocaleDateString('pt-BR', { 
                    weekday: 'short', 
                    day: '2-digit', 
                    month: 'short' 
                  })} às {new Date(apt.datetime).toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
              
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleSendConfirmation(apt)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 text-sm font-medium transition"
                >
                  <Send className="w-4 h-4" />
                  Pedir Confirmação
                </button>
                <button
                  onClick={() => handleMarkConfirmed(apt.id)}
                  className="p-2 text-green-600 hover:text-green-800 transition"
                  title="Marcar como confirmado"
                >
                  <CheckCircle className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDismiss(apt.id)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition"
                  title="Dispensar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
