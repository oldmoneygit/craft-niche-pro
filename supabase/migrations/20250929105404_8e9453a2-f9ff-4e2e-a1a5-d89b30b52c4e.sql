-- Create tenants table
CREATE TABLE public.tenants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subdomain TEXT NOT NULL UNIQUE,
  business_name TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  birth_date DATE,
  weight_current DECIMAL,
  height DECIMAL,
  goal TEXT,
  allergies TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('primeira_consulta', 'retorno')),
  status TEXT NOT NULL DEFAULT 'agendado' CHECK (status IN ('agendado', 'confirmado', 'realizado', 'cancelado')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tenants table
CREATE POLICY "Users can view their own tenant" 
ON public.tenants 
FOR SELECT 
USING (owner_email = auth.jwt() ->> 'email');

CREATE POLICY "Users can update their own tenant" 
ON public.tenants 
FOR UPDATE 
USING (owner_email = auth.jwt() ->> 'email');

-- RLS Policies for clients table
CREATE POLICY "Users can view clients from their tenant" 
ON public.clients 
FOR SELECT 
USING (
  tenant_id IN (
    SELECT id FROM public.tenants 
    WHERE owner_email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "Users can insert clients to their tenant" 
ON public.clients 
FOR INSERT 
WITH CHECK (
  tenant_id IN (
    SELECT id FROM public.tenants 
    WHERE owner_email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "Users can update clients from their tenant" 
ON public.clients 
FOR UPDATE 
USING (
  tenant_id IN (
    SELECT id FROM public.tenants 
    WHERE owner_email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "Users can delete clients from their tenant" 
ON public.clients 
FOR DELETE 
USING (
  tenant_id IN (
    SELECT id FROM public.tenants 
    WHERE owner_email = auth.jwt() ->> 'email'
  )
);

-- RLS Policies for appointments table
CREATE POLICY "Users can view appointments from their tenant" 
ON public.appointments 
FOR SELECT 
USING (
  tenant_id IN (
    SELECT id FROM public.tenants 
    WHERE owner_email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "Users can insert appointments to their tenant" 
ON public.appointments 
FOR INSERT 
WITH CHECK (
  tenant_id IN (
    SELECT id FROM public.tenants 
    WHERE owner_email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "Users can update appointments from their tenant" 
ON public.appointments 
FOR UPDATE 
USING (
  tenant_id IN (
    SELECT id FROM public.tenants 
    WHERE owner_email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "Users can delete appointments from their tenant" 
ON public.appointments 
FOR DELETE 
USING (
  tenant_id IN (
    SELECT id FROM public.tenants 
    WHERE owner_email = auth.jwt() ->> 'email'
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample tenant for Gabriel Gandin
INSERT INTO public.tenants (subdomain, business_name, owner_email)
VALUES ('gabriel-gandin', 'Gabriel Gandin - Nutricionista', 'gabriel@gandin.com.br');

-- Add indexes for better performance
CREATE INDEX idx_clients_tenant_id ON public.clients(tenant_id);
CREATE INDEX idx_appointments_tenant_id ON public.appointments(tenant_id);
CREATE INDEX idx_appointments_client_id ON public.appointments(client_id);
CREATE INDEX idx_appointments_datetime ON public.appointments(datetime);