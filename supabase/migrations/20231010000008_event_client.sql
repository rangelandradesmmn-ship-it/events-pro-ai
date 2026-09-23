-- Add client_id to events table
ALTER TABLE public.events ADD COLUMN client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL;
