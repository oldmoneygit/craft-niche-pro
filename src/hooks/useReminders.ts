import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from './useTenantId';

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
}

interface Appointment {
  id: string;
  datetime: string;
  status: string;
  clients: Client;
}

interface PendingReminder {
  appointment: Appointment;
  needsReminders: string[];
}

interface SentReminder {
  appointment_id: string;
  reminder_type: string;
}

export const useReminders = () => {
  const { tenantId } = useTenantId();
  const [pendingReminders, setPendingReminders] = useState<PendingReminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) return;
    fetchPendingReminders();
  }, [tenantId]);

  const fetchPendingReminders = async () => {
    if (!tenantId) return;

    try {
      const now = new Date();
      const threeDaysFromNow = new Date(now.getTime() + 72 * 60 * 60 * 1000);

      // Buscar consultas que precisam de lembrete
      const { data: appointments } = await supabase
        .from('appointments')
        .select(`
          id,
          datetime,
          status,
          clients (id, name, phone, email)
        `)
        .eq('tenant_id', tenantId)
        .in('status', ['agendado', 'confirmado'])
        .gte('datetime', now.toISOString())
        .lte('datetime', threeDaysFromNow.toISOString());

      if (!appointments) return;

      // Verificar quais já receberam lembrete
      const appointmentIds = appointments.map(a => a.id);
      const { data: sentReminders } = await supabase
        .from('appointment_reminders')
        .select('appointment_id, reminder_type')
        .in('appointment_id', appointmentIds);

      // Calcular quais lembretes enviar
      const pending = appointments.map(apt => {
        const aptDate = new Date(apt.datetime);
        const hoursUntil = (aptDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        
        const sent = (sentReminders as SentReminder[] | null)?.filter(r => r.appointment_id === apt.id) || [];
        const sentTypes = sent.map(s => s.reminder_type);

        const needsReminders: string[] = [];
        if (hoursUntil <= 72 && !sentTypes.includes('72h')) needsReminders.push('72h');
        if (hoursUntil <= 24 && !sentTypes.includes('24h')) needsReminders.push('24h');
        if (hoursUntil <= 2 && !sentTypes.includes('2h')) needsReminders.push('2h');

        return needsReminders.length > 0 ? {
          appointment: apt as Appointment,
          needsReminders
        } : null;
      }).filter((item): item is PendingReminder => item !== null);

      setPendingReminders(pending);
    } catch (error) {
      console.error('Error fetching pending reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendReminder = async (appointmentId: string, reminderType: string) => {
    if (!tenantId) return false;

    try {
      // Marcar como enviado no banco
      await supabase.from('appointment_reminders').insert({
        appointment_id: appointmentId,
        tenant_id: tenantId,
        reminder_type: reminderType
      });

      // Remover da lista de pendentes
      await fetchPendingReminders();

      return true;
    } catch (error) {
      console.error('Error sending reminder:', error);
      return false;
    }
  };

  return {
    pendingReminders,
    loading,
    sendReminder,
    refresh: fetchPendingReminders
  };
};
