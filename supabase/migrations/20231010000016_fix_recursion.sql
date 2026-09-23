-- 1. Remover a política antiga que causava recursividade infinita (e que era uma falha de segurança no modelo SaaS, pois permitia assessores verem outros assessores)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- 2. Recriar a função de checagem do Super Admin do jeito certo (Security Definer com search_path seguro)
CREATE OR REPLACE FUNCTION public.get_my_superadmin_status()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT is_superadmin FROM profiles WHERE id = auth.uid();
$$;

-- 3. Recriar a política de leitura de perfis para o Super Admin
DROP POLICY IF EXISTS "Superadmins podem ver todos os perfis" ON public.profiles;
CREATE POLICY "Superadmins podem ver todos os perfis" 
ON public.profiles FOR SELECT 
USING ( get_my_superadmin_status() );

-- 4. Garantir que o seu usuário foi de fato marcado como Super Admin (Para ter certeza absoluta!)
UPDATE public.profiles SET is_superadmin = true WHERE role = 'admin';
