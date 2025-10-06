import { useState } from 'react';

// Hook temporariamente desabilitado - tabela appointment_reminders não existe no banco
// TODO: Criar tabela appointment_reminders ou remover este hook

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

export const useReminders = () => {
  const [pendingReminders] = useState<PendingReminder[]>([]);
  const [loading] = useState(false);

  const sendBatchReminders = async () => {
    console.warn('useReminders: Tabela appointment_reminders não existe');
  };

  const sendSingleReminder = async () => {
    console.warn('useReminders: Tabela appointment_reminders não existe');
  };

  return {
    pendingReminders,
    loading,
    sendBatchReminders,
    sendSingleReminder,
  };
};
