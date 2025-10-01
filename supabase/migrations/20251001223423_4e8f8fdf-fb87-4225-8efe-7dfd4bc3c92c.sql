-- Adicionar colunas para rastrear envio de lembretes
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS reminder_sent TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reminder_type TEXT;

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_appointments_reminder_sent 
ON appointments(reminder_sent);

-- Comentários
COMMENT ON COLUMN appointments.reminder_sent IS 'Data/hora em que o lembrete foi enviado';
COMMENT ON COLUMN appointments.reminder_type IS 'Tipo de lembrete enviado (whatsapp, email, sms)';