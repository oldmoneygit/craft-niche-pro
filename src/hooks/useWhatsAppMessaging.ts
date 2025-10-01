import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Appointment {
  id: string;
  datetime: string;
  type: string;
  clients: {
    name: string;
    phone: string;
  };
}

export const useWhatsAppMessaging = () => {
  const [sending, setSending] = useState(false);

  const formatPhone = (phone: string): string => {
    return phone.replace(/\D/g, '');
  };

  const formatDateTime = (datetime: string): string => {
    const date = new Date(datetime);
    return `${date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long',
      year: 'numeric'
    })} às ${date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`;
  };

  const sendReminder = async (appointment: Appointment): Promise<boolean> => {
    const message = `Olá ${appointment.clients.name}! 👋

Este é um lembrete da sua consulta de *${appointment.type}* agendada para:

📅 ${formatDateTime(appointment.datetime)}

Nos vemos em breve! 😊`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/55${formatPhone(appointment.clients.phone)}?text=${encodedMessage}`;
    
    // Abrir WhatsApp
    window.open(whatsappUrl, '_blank');

    // Marcar como enviado no banco
    const { error } = await supabase
      .from('appointments')
      .update({ 
        reminder_sent: new Date().toISOString(),
        reminder_type: 'whatsapp'
      })
      .eq('id', appointment.id);

    if (error) {
      console.error('Erro ao atualizar reminder:', error);
      return false;
    }

    return true;
  };

  const sendConfirmationRequest = async (appointment: Appointment): Promise<boolean> => {
    const message = `Olá ${appointment.clients.name}! 👋

Gostaria de confirmar sua consulta de *${appointment.type}* agendada para:

📅 ${formatDateTime(appointment.datetime)}

Por favor, responda com *SIM* para confirmar ou *NÃO* caso precise remarcar.

Obrigado! 😊`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/55${formatPhone(appointment.clients.phone)}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');

    // Marcar como solicitação de confirmação enviada
    const { error } = await supabase
      .from('appointments')
      .update({ 
        confirmation_requested_at: new Date().toISOString()
      })
      .eq('id', appointment.id);

    if (error) {
      console.error('Erro ao atualizar confirmação:', error);
      return false;
    }

    return true;
  };

  const sendRemindersInBatch = async (appointments: Appointment[]): Promise<void> => {
    setSending(true);
    let successCount = 0;
    let failCount = 0;

    for (const apt of appointments) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2s entre envios
      const success = await sendReminder(apt);
      
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    setSending(false);

    toast({
      title: "Lembretes Enviados",
      description: `${successCount} enviados com sucesso${failCount > 0 ? `, ${failCount} falharam` : ''}`,
      variant: successCount > 0 ? "default" : "destructive"
    });
  };

  const sendConfirmationsInBatch = async (appointments: Appointment[]): Promise<void> => {
    setSending(true);
    let successCount = 0;
    let failCount = 0;

    for (const apt of appointments) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2s entre envios
      const success = await sendConfirmationRequest(apt);
      
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    setSending(false);

    toast({
      title: "Confirmações Solicitadas",
      description: `${successCount} enviadas com sucesso${failCount > 0 ? `, ${failCount} falharam` : ''}`,
      variant: successCount > 0 ? "default" : "destructive"
    });
  };

  return {
    sendReminder,
    sendConfirmationRequest,
    sendRemindersInBatch,
    sendConfirmationsInBatch,
    sending
  };
};
