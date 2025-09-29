-- Confirmar email do usuário admin para permitir login imediato
UPDATE auth.users 
SET 
  email_confirmed_at = now(),
  confirmation_token = '',
  raw_user_meta_data = raw_user_meta_data || '{"email_verified": true}'::jsonb
WHERE email = 'jefersoncemep@gmail.com';

-- Garantir que o perfil está criado e associado corretamente
INSERT INTO public.profiles (user_id, full_name, tenant_id, role)
SELECT 
  u.id,
  'Jeferson ADMIN',
  '2429b7ea-da52-4fbb-8bbe-c678facfd260',
  'admin'
FROM auth.users u 
WHERE u.email = 'jefersoncemep@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET
  tenant_id = '2429b7ea-da52-4fbb-8bbe-c678facfd260',
  role = 'admin',
  full_name = 'Jeferson ADMIN';