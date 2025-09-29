-- Criar tabela de profiles para dados adicionais do usuário
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  tenant_id UUID REFERENCES public.tenants(id),
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Atualizar as políticas da tabela clients para usar autenticação adequada
DROP POLICY IF EXISTS "Users can view clients from their tenant" ON public.clients;
DROP POLICY IF EXISTS "Users can insert clients to their tenant" ON public.clients;
DROP POLICY IF EXISTS "Users can update clients from their tenant" ON public.clients;
DROP POLICY IF EXISTS "Users can delete clients from their tenant" ON public.clients;

-- Novas políticas baseadas no perfil do usuário
CREATE POLICY "Authenticated users can view clients from their tenant" 
ON public.clients 
FOR SELECT 
USING (
  tenant_id IN (
    SELECT p.tenant_id 
    FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Authenticated users can insert clients to their tenant" 
ON public.clients 
FOR INSERT 
WITH CHECK (
  tenant_id IN (
    SELECT p.tenant_id 
    FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Authenticated users can update clients from their tenant" 
ON public.clients 
FOR UPDATE 
USING (
  tenant_id IN (
    SELECT p.tenant_id 
    FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Authenticated users can delete clients from their tenant" 
ON public.clients 
FOR DELETE 
USING (
  tenant_id IN (
    SELECT p.tenant_id 
    FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  )
);

-- Atualizar políticas de outras tabelas também
DROP POLICY IF EXISTS "Users can view appointments from their tenant" ON public.appointments;
DROP POLICY IF EXISTS "Users can insert appointments to their tenant" ON public.appointments;
DROP POLICY IF EXISTS "Users can update appointments from their tenant" ON public.appointments;
DROP POLICY IF EXISTS "Users can delete appointments from their tenant" ON public.appointments;

CREATE POLICY "Authenticated users can view appointments from their tenant" 
ON public.appointments 
FOR SELECT 
USING (
  tenant_id IN (
    SELECT p.tenant_id 
    FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Authenticated users can insert appointments to their tenant" 
ON public.appointments 
FOR INSERT 
WITH CHECK (
  tenant_id IN (
    SELECT p.tenant_id 
    FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Authenticated users can update appointments from their tenant" 
ON public.appointments 
FOR UPDATE 
USING (
  tenant_id IN (
    SELECT p.tenant_id 
    FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Authenticated users can delete appointments from their tenant" 
ON public.appointments 
FOR DELETE 
USING (
  tenant_id IN (
    SELECT p.tenant_id 
    FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  )
);

-- Trigger para atualizar updated_at na tabela profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para criar perfil automaticamente após signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();