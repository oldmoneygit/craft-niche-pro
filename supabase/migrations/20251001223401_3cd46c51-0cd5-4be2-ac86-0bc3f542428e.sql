-- Adicionar coluna para rastrear pedidos de confirmação
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS confirmation_requested_at TIMESTAMPTZ;

-- Índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_appointments_confirmation_requested 
ON appointments(confirmation_requested_at);

-- Comentário
COMMENT ON COLUMN appointments.confirmation_requested_at IS 'Data/hora em que foi solicitada confirmação da consulta';