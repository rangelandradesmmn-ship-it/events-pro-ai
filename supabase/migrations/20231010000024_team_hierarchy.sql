-- Create team_members table to link assistants to agency owners (planners)
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  planner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(planner_id, user_id)
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Policy: Planners can manage their own team members
CREATE POLICY "Planners can manage team_members" ON public.team_members
FOR ALL USING (planner_id = auth.uid());

-- Policy: Users can view their own team membership
CREATE POLICY "Users can view their membership" ON public.team_members
FOR SELECT USING (user_id = auth.uid());

-- Create a fast, security-definer function to check if a user belongs to an agency
CREATE OR REPLACE FUNCTION public.is_in_agency(target_planner_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Se eu sou o dono da agência (Planner)
  IF auth.uid() = target_planner_id THEN
    RETURN TRUE;
  END IF;
  
  -- Se eu sou um membro convidado da agência
  RETURN EXISTS (
    SELECT 1 FROM public.team_members
    WHERE planner_id = target_planner_id
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =======================================================
-- UPDATE ALL EXISTING POLICIES TO USE is_in_agency()
-- =======================================================

-- Events
DROP POLICY IF EXISTS "Planners can manage their own events" ON public.events;
CREATE POLICY "Agency members can manage events" ON public.events
FOR ALL USING (public.is_in_agency(owner_id));

-- Clients
DROP POLICY IF EXISTS "Planners can manage their own clients" ON public.clients;
CREATE POLICY "Agency members can manage clients" ON public.clients
FOR ALL USING (public.is_in_agency(planner_id));

-- Suppliers
DROP POLICY IF EXISTS "Planners can manage their own suppliers" ON public.suppliers;
CREATE POLICY "Agency members can manage suppliers" ON public.suppliers
FOR ALL USING (public.is_in_agency(planner_id));

-- Contracts
DROP POLICY IF EXISTS "Planners can manage their own contracts" ON public.contracts;
CREATE POLICY "Agency members can manage contracts" ON public.contracts
FOR ALL USING (public.is_in_agency(planner_id));

-- Transactions
DROP POLICY IF EXISTS "Planners can manage their own transactions" ON public.transactions;
CREATE POLICY "Agency members can manage transactions" ON public.transactions
FOR ALL USING (public.is_in_agency(planner_id));

-- Checklists
DROP POLICY IF EXISTS "Planners can manage their own checklists" ON public.checklists;
CREATE POLICY "Agency members can manage checklists" ON public.checklists
FOR ALL USING (public.is_in_agency(planner_id));

-- Tasks
DROP POLICY IF EXISTS "Planners can manage their own tasks" ON public.tasks;
CREATE POLICY "Agency members can manage tasks" ON public.tasks
FOR ALL USING (public.is_in_agency(planner_id));

-- Guests
DROP POLICY IF EXISTS "Planners can manage guests of their events" ON public.guests;
CREATE POLICY "Agency members can manage guests" ON public.guests
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = guests.event_id
    AND public.is_in_agency(events.owner_id)
  )
);

-- Client Files
DROP POLICY IF EXISTS "Planners can manage files of their clients" ON public.client_files;
CREATE POLICY "Agency members can manage client files" ON public.client_files
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE clients.id = client_files.client_id
    AND public.is_in_agency(clients.planner_id)
  )
);
