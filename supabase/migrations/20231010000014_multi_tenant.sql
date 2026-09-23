-- SaaS Multi-Tenant Architecture Upgrade

-- 1. Add planner_id columns
ALTER TABLE public.clients ADD COLUMN planner_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.suppliers ADD COLUMN planner_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.contracts ADD COLUMN planner_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.transactions ADD COLUMN planner_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.checklists ADD COLUMN planner_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.tasks ADD COLUMN planner_id UUID REFERENCES public.profiles(id);

-- 2. Migrate existing data to the primary planner to prevent data loss
DO $$
DECLARE
  v_planner_id UUID;
BEGIN
  -- Grab the first planner profile available (usually the main user)
  SELECT id INTO v_planner_id FROM public.profiles WHERE role IN ('planner', 'admin') LIMIT 1;
  
  IF v_planner_id IS NOT NULL THEN
    UPDATE public.clients SET planner_id = v_planner_id WHERE planner_id IS NULL;
    UPDATE public.suppliers SET planner_id = v_planner_id WHERE planner_id IS NULL;
    UPDATE public.contracts SET planner_id = v_planner_id WHERE planner_id IS NULL;
    UPDATE public.transactions SET planner_id = v_planner_id WHERE planner_id IS NULL;
    UPDATE public.checklists SET planner_id = v_planner_id WHERE planner_id IS NULL;
    UPDATE public.tasks SET planner_id = v_planner_id WHERE planner_id IS NULL;
    -- Ensure events are also assigned
    UPDATE public.events SET owner_id = v_planner_id WHERE owner_id IS NULL;
  END IF;
END $$;

-- 3. Set Default auth.uid() and NOT NULL
ALTER TABLE public.events ALTER COLUMN owner_id SET DEFAULT auth.uid();
ALTER TABLE public.clients ALTER COLUMN planner_id SET DEFAULT auth.uid();
ALTER TABLE public.clients ALTER COLUMN planner_id SET NOT NULL;

ALTER TABLE public.suppliers ALTER COLUMN planner_id SET DEFAULT auth.uid();
ALTER TABLE public.suppliers ALTER COLUMN planner_id SET NOT NULL;

ALTER TABLE public.contracts ALTER COLUMN planner_id SET DEFAULT auth.uid();
ALTER TABLE public.contracts ALTER COLUMN planner_id SET NOT NULL;

ALTER TABLE public.transactions ALTER COLUMN planner_id SET DEFAULT auth.uid();
ALTER TABLE public.transactions ALTER COLUMN planner_id SET NOT NULL;

ALTER TABLE public.checklists ALTER COLUMN planner_id SET DEFAULT auth.uid();
ALTER TABLE public.checklists ALTER COLUMN planner_id SET NOT NULL;

ALTER TABLE public.tasks ALTER COLUMN planner_id SET DEFAULT auth.uid();
ALTER TABLE public.tasks ALTER COLUMN planner_id SET NOT NULL;


-- 4. Enable Row Level Security and Create Multi-Tenant Policies

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view events they own" ON public.events;
DROP POLICY IF EXISTS "Planners can view their clients" ON public.clients;

-- Events Policies
CREATE POLICY "Planners can manage their own events" ON public.events
  FOR ALL USING (auth.uid() = owner_id);

-- Clients Policies
CREATE POLICY "Planners can manage their own clients" ON public.clients
  FOR ALL USING (auth.uid() = planner_id);

-- Suppliers Policies
CREATE POLICY "Planners can manage their own suppliers" ON public.suppliers
  FOR ALL USING (auth.uid() = planner_id);

-- Contracts Policies
CREATE POLICY "Planners can manage their own contracts" ON public.contracts
  FOR ALL USING (auth.uid() = planner_id);

-- Transactions Policies
CREATE POLICY "Planners can manage their own transactions" ON public.transactions
  FOR ALL USING (auth.uid() = planner_id);

-- Checklists Policies
CREATE POLICY "Planners can manage their own checklists" ON public.checklists
  FOR ALL USING (auth.uid() = planner_id);

-- Tasks Policies
CREATE POLICY "Planners can manage their own tasks" ON public.tasks
  FOR ALL USING (auth.uid() = planner_id);


-- Guests (Inherits access from Events)
-- Planners can view/edit guests if they own the event
DROP POLICY IF EXISTS "Planners can manage guests of their events" ON public.guests;
CREATE POLICY "Planners can manage guests of their events" ON public.guests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = guests.event_id
      AND events.owner_id = auth.uid()
    )
  );

-- Portal access for Guests (Public/Anon)
-- Anyone can read/insert a guest if they have the right event_id/token (Already handled via token lookup)
CREATE POLICY "Portal users can insert guests" ON public.guests
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Portal users can view guests" ON public.guests
  FOR SELECT USING (true);
CREATE POLICY "Portal users can update guests" ON public.guests
  FOR UPDATE USING (true);
