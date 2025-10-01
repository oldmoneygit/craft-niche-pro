-- Corrigir search_path das funções de analytics
CREATE OR REPLACE FUNCTION get_analytics_data(
  p_tenant_id UUID,
  p_months INTEGER DEFAULT 6
)
RETURNS TABLE (
  month DATE,
  total_appointments BIGINT,
  completed_appointments BIGINT,
  cancelled_appointments BIGINT,
  no_show_appointments BIGINT,
  attendance_rate NUMERIC,
  new_clients BIGINT,
  total_revenue NUMERIC,
  avg_revenue_per_appointment NUMERIC
) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH months AS (
    SELECT 
      DATE_TRUNC('month', generate_series(
        NOW() - (p_months || ' months')::INTERVAL,
        NOW(),
        '1 month'::INTERVAL
      ))::DATE as month
  ),
  appointments_by_month AS (
    SELECT 
      DATE_TRUNC('month', datetime)::DATE as month,
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'realizado') as completed,
      COUNT(*) FILTER (WHERE status = 'cancelado') as cancelled,
      COUNT(*) FILTER (WHERE status = 'faltou') as no_show,
      COALESCE(SUM(value) FILTER (WHERE payment_status = 'paid'), 0) as revenue,
      COALESCE(AVG(value) FILTER (WHERE value IS NOT NULL), 0) as avg_revenue
    FROM appointments
    WHERE tenant_id = p_tenant_id
    GROUP BY DATE_TRUNC('month', datetime)
  ),
  clients_by_month AS (
    SELECT 
      DATE_TRUNC('month', created_at)::DATE as month,
      COUNT(*) as new_clients
    FROM clients
    WHERE tenant_id = p_tenant_id
    GROUP BY DATE_TRUNC('month', created_at)
  )
  SELECT 
    m.month,
    COALESCE(a.total, 0)::BIGINT as total_appointments,
    COALESCE(a.completed, 0)::BIGINT as completed_appointments,
    COALESCE(a.cancelled, 0)::BIGINT as cancelled_appointments,
    COALESCE(a.no_show, 0)::BIGINT as no_show_appointments,
    CASE 
      WHEN COALESCE(a.total, 0) > 0 THEN 
        (COALESCE(a.completed, 0)::NUMERIC / a.total::NUMERIC * 100)
      ELSE 0
    END as attendance_rate,
    COALESCE(c.new_clients, 0)::BIGINT as new_clients,
    COALESCE(a.revenue, 0) as total_revenue,
    COALESCE(a.avg_revenue, 0) as avg_revenue_per_appointment
  FROM months m
  LEFT JOIN appointments_by_month a ON m.month = a.month
  LEFT JOIN clients_by_month c ON m.month = c.month
  ORDER BY m.month DESC;
END;
$$;

CREATE OR REPLACE FUNCTION get_general_metrics(p_tenant_id UUID)
RETURNS TABLE (
  total_clients BIGINT,
  active_clients BIGINT,
  total_appointments_all_time BIGINT,
  completed_appointments_all_time BIGINT,
  overall_attendance_rate NUMERIC,
  total_revenue_all_time NUMERIC,
  active_meal_plans BIGINT,
  completed_questionnaires BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM clients WHERE tenant_id = p_tenant_id)::BIGINT as total_clients,
    (SELECT COUNT(DISTINCT client_id) 
     FROM appointments 
     WHERE tenant_id = p_tenant_id 
       AND datetime >= NOW() - INTERVAL '60 days')::BIGINT as active_clients,
    (SELECT COUNT(*) FROM appointments WHERE tenant_id = p_tenant_id)::BIGINT as total_appointments_all_time,
    (SELECT COUNT(*) FROM appointments WHERE tenant_id = p_tenant_id AND status = 'realizado')::BIGINT as completed_appointments_all_time,
    CASE 
      WHEN (SELECT COUNT(*) FROM appointments WHERE tenant_id = p_tenant_id) > 0 THEN
        ((SELECT COUNT(*) FROM appointments WHERE tenant_id = p_tenant_id AND status = 'realizado')::NUMERIC / 
         (SELECT COUNT(*) FROM appointments WHERE tenant_id = p_tenant_id)::NUMERIC * 100)
      ELSE 0
    END as overall_attendance_rate,
    COALESCE((SELECT SUM(value) FROM appointments WHERE tenant_id = p_tenant_id AND payment_status = 'paid'), 0) as total_revenue_all_time,
    (SELECT COUNT(*) FROM meal_plans WHERE tenant_id = p_tenant_id AND active = true)::BIGINT as active_meal_plans,
    (SELECT COUNT(*) 
     FROM questionnaire_responses qr
     JOIN questionnaires q ON qr.questionnaire_id = q.id
     WHERE q.tenant_id = p_tenant_id AND qr.status = 'completed')::BIGINT as completed_questionnaires;
END;
$$;