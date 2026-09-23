-- Update the handle_new_user function to grant a 7-day free trial
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, stripe_current_period_end)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'client'::user_role),
    now() + interval '7 days'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Optionally, give all existing active users who don't have a subscription 7 days of trial from today
UPDATE public.profiles 
SET stripe_current_period_end = now() + interval '7 days'
WHERE stripe_current_period_end IS NULL AND is_superadmin = false;
