-- 1. Adicionar a coluna is_superadmin (caso não exista)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_superadmin BOOLEAN DEFAULT false;

-- 2. Transformar a primeira conta criada no sistema no Super Admin (A sua conta!)
UPDATE public.profiles SET is_superadmin = true WHERE id = (
    SELECT id FROM public.profiles ORDER BY created_at ASC LIMIT 1
);

-- 3. Criar uma função segura para checar se o usuário é superadmin (evita loop infinito no Supabase)
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  SELECT is_superadmin INTO is_admin FROM public.profiles WHERE id = auth.uid();
  RETURN coalesce(is_admin, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Criar políticas de RLS para permitir que o Superadmin leia TUDO
-- Para perfis
DROP POLICY IF EXISTS "Superadmins podem ver todos os perfis" ON public.profiles;
CREATE POLICY "Superadmins podem ver todos os perfis"
ON public.profiles FOR SELECT
USING ( public.is_superadmin() );

-- Para eventos
DROP POLICY IF EXISTS "Superadmins podem ver todos os eventos" ON public.events;
CREATE POLICY "Superadmins podem ver todos os eventos"
ON public.events FOR SELECT
USING ( public.is_superadmin() );
