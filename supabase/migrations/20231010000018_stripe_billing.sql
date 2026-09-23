-- Add billing columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_current_period_end TIMESTAMPTZ;

-- Allow reading these columns (already covered by existing RLS, but let's be sure)
-- No additional policies needed since they are on profiles and we fixed the recursion.
