import { useState, useEffect } from 'react';
import { AlertTriangle, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import { useToast } from '@/hooks/use-toast';

interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  appointments?: Array<{
    datetime: string;
    status: string;
  }>;
}

export const InactiveClientsAlert = () => {
  const { tenantId } = useTenantId();
  const { toast } = useToast();
  const [inactiveClients, setInactiveClients] = useState<Client[]>([]);

  useEffect(() => {
    if (tenantId) fetchInactiveClients();
  }, [tenantId]);

  const fetchInactiveClients = async () => {
    if (!tenantId) return;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
      const { data: allClients } = await supabase
        .from('clients')
        .select(`
          id, name, phone, email,
          appointments(datetime, status)
        `)
        .eq('tenant_id', tenantId);

      if (!allClients) return;

      const inactive = allClients.filter((client: any) => {
        const appointments = client.appointments || [];
        if (appointments.length === 0) return false;

        const lastAppointment = appointments
          .sort((a: any, b: any) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())[0];

        return new Date(lastAppointment.datetime) < thirtyDaysAgo;
      });

      setInactiveClients(inactive);
    } catch (error) {
      console.error('Error fetching inactive clients:', error);
    }
  };

  const handleSendFollowUp = (client: Client) => {
    const message = `Olá ${client.name}! Faz um tempinho que não nos falamos. Como você está? Gostaria de agendar um retorno para avaliarmos sua evolução?`;
    const whatsappLink = `https://wa.me/55${client.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappLink, '_blank');

    toast({
      title: "Mensagem enviada",
      description: `Follow-up enviado para ${client.name}`
    });
  };

  if (inactiveClients.length === 0) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600" />
        <h3 className="font-semibold text-yellow-900">
          Pacientes Inativos ({inactiveClients.length})
        </h3>
      </div>
      <p className="text-sm text-yellow-800 mb-3">
        Estes pacientes não têm consulta há mais de 30 dias
      </p>
      <div className="space-y-2">
        {inactiveClients.slice(0, 5).map(client => (
          <div key={client.id} className="bg-white p-3 rounded border border-yellow-100 flex items-center justify-between">
            <div>
              <p className="font-medium">{client.name}</p>
              <p className="text-sm text-gray-600">{client.phone}</p>
            </div>
            <button
              onClick={() => handleSendFollowUp(client)}
              className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 flex items-center gap-1 text-sm"
            >
              <Send className="w-3 h-3" />
              Enviar Follow-up
            </button>
          </div>
        ))}
        {inactiveClients.length > 5 && (
          <p className="text-sm text-gray-600 text-center">
            + {inactiveClients.length - 5} pacientes inativos
          </p>
        )}
      </div>
    </div>
  );
};