-- Drop the trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the function safely WITH 7-day free trial
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role public.user_role;
  v_name TEXT;
BEGIN
  -- Safe role cast
  BEGIN
    v_role := COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'client'::public.user_role);
  EXCEPTION WHEN OTHERS THEN
    v_role := 'client'::public.user_role;
  END;

  -- Safe name fallback
  v_name := COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Usuário ' || substr(new.id::text, 1, 6));

  -- Insert profile WITH 7-day free trial
  INSERT INTO public.profiles (id, full_name, role, stripe_current_period_end)
  VALUES (new.id, v_name, v_role, now() + interval '7 days');

  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- Em caso de qualquer outro erro bizarro, força a criação do perfil mínimo para não quebrar a autenticação
  INSERT INTO public.profiles (id, full_name, role, stripe_current_period_end)
  VALUES (new.id, 'Usuário ' || substr(new.id::text, 1, 6), 'client'::public.user_role, now() + interval '7 days');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Restore the 7 days for the user that just registered
UPDATE public.profiles 
SET stripe_current_period_end = now() + interval '7 days'
WHERE stripe_current_period_end IS NULL AND is_superadmin = false;
