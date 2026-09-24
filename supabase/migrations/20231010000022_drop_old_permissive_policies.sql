-- Clean up ALL old permissive policies that were created before the Multi-Tenant architecture

DROP POLICY IF EXISTS "Users can manage contracts" ON public.contracts;
DROP POLICY IF EXISTS "Users can manage suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Users can manage meetings" ON public.meetings;
DROP POLICY IF EXISTS "Users can manage transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can manage guests" ON public.guests;
DROP POLICY IF EXISTS "Users can manage tasks" ON public.tasks;
DROP POLICY IF EXISTS "Authenticated users can manage tables" ON public.tables;
DROP POLICY IF EXISTS "Authenticated users can manage timeline" ON public.event_timeline;
DROP POLICY IF EXISTS "Authenticated users can manage checklists" ON public.event_checklists;
-- If clients had a similar one:
DROP POLICY IF EXISTS "Users can manage clients" ON public.clients;
