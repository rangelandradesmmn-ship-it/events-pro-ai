-- TABLES (Mapa de Mesas)
CREATE TABLE public.tables (
  id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ADD TABLE_ID TO GUESTS
ALTER TABLE public.guests ADD COLUMN table_id UUID REFERENCES public.tables(id) ON DELETE SET NULL;

-- EVENT TIMELINE (Cronograma)
CREATE TABLE public.event_timeline (
  id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  time TIME NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  responsible TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- EVENT CHECKLISTS (Checklist Inteligente)
CREATE TABLE public.event_checklists (
  id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  task TEXT NOT NULL,
  due_date DATE,
  is_completed BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- RLS POLICIES
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_checklists ENABLE ROW LEVEL SECURITY;

-- Admins/Planners can manage all. 
-- For MVP we just use a generic authenticated policy.
CREATE POLICY "Authenticated users can manage tables" ON public.tables FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage timeline" ON public.event_timeline FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage checklists" ON public.event_checklists FOR ALL USING (auth.role() = 'authenticated');
