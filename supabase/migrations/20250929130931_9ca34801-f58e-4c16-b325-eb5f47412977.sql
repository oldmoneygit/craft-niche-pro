-- Atualizar o perfil do usuário admin
UPDATE public.profiles 
SET 
  tenant_id = '2429b7ea-da52-4fbb-8bbe-c678facfd260', 
  role = 'admin',
  full_name = 'Jeferson ADMIN'
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'jefersoncemep@gmail.com'
);