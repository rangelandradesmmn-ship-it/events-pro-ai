-- Remove the dangerous policy that allowed everyone to see all events
DROP POLICY IF EXISTS "Public can view events" ON public.events;
