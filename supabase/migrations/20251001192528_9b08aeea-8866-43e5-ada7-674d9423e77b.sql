-- Adicionar campos financeiros na tabela appointments
ALTER TABLE appointments 
  ADD COLUMN IF NOT EXISTS value DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS payment_method TEXT,
  ADD COLUMN IF NOT EXISTS payment_date DATE,
  ADD COLUMN IF NOT EXISTS payment_notes TEXT;

-- Criar check constraint para payment_status
ALTER TABLE appointments 
  DROP CONSTRAINT IF EXISTS appointments_payment_status_check;

ALTER TABLE appointments 
  ADD CONSTRAINT appointments_payment_status_check 
  CHECK (payment_status IN ('pending', 'paid', 'cancelled', 'refunded'));

-- Criar índices para consultas financeiras
CREATE INDEX IF NOT EXISTS idx_appointments_payment_status 
  ON appointments(tenant_id, payment_status);

CREATE INDEX IF NOT EXISTS idx_appointments_payment_date 
  ON appointments(tenant_id, payment_date);

-- Criar view para facilitar consultas financeiras
CREATE OR REPLACE VIEW financial_summary AS
SELECT 
  a.tenant_id,
  DATE_TRUNC('month', a.datetime) as month,
  COUNT(*) as total_appointments,
  COUNT(*) FILTER (WHERE a.payment_status = 'paid') as paid_count,
  COUNT(*) FILTER (WHERE a.payment_status = 'pending') as pending_count,
  SUM(a.value) FILTER (WHERE a.payment_status = 'paid') as total_received,
  SUM(a.value) FILTER (WHERE a.payment_status = 'pending') as total_pending,
  SUM(a.value) as total_expected
FROM appointments a
WHERE a.value IS NOT NULL
GROUP BY a.tenant_id, DATE_TRUNC('month', a.datetime);

-- Criar função para estatísticas financeiras
CREATE OR REPLACE FUNCTION get_financial_stats(
  p_tenant_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  total_appointments BIGINT,
  paid_appointments BIGINT,
  pending_appointments BIGINT,
  total_received NUMERIC,
  total_pending NUMERIC,
  average_value NUMERIC,
  payment_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_appointments,
    COUNT(*) FILTER (WHERE payment_status = 'paid')::BIGINT as paid_appointments,
    COUNT(*) FILTER (WHERE payment_status = 'pending')::BIGINT as pending_appointments,
    COALESCE(SUM(value) FILTER (WHERE payment_status = 'paid'), 0) as total_received,
    COALESCE(SUM(value) FILTER (WHERE payment_status = 'pending'), 0) as total_pending,
    COALESCE(AVG(value), 0) as average_value,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        (COUNT(*) FILTER (WHERE payment_status = 'paid')::NUMERIC / COUNT(*)::NUMERIC * 100)
      ELSE 0
    END as payment_rate
  FROM appointments
  WHERE tenant_id = p_tenant_id
    AND datetime >= p_start_date
    AND datetime <= p_end_date
    AND value IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;