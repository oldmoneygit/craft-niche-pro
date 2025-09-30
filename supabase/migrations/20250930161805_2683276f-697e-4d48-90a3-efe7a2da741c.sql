-- Create appointment_reminders table to track sent reminders
CREATE TABLE appointment_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID NOT NULL,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('72h', '24h', '2h')),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed')),
  client_response TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE appointment_reminders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view reminders from their tenant"
  ON appointment_reminders
  FOR SELECT
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert reminders to their tenant"
  ON appointment_reminders
  FOR INSERT
  WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update reminders from their tenant"
  ON appointment_reminders
  FOR UPDATE
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
  ));

-- Create index for faster queries
CREATE INDEX idx_appointment_reminders_appointment_id ON appointment_reminders(appointment_id);
CREATE INDEX idx_appointment_reminders_tenant_id ON appointment_reminders(tenant_id);

-- Create trigger for updated_at
CREATE TRIGGER update_appointment_reminders_updated_at
  BEFORE UPDATE ON appointment_reminders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();