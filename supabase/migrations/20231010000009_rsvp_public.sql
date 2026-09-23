-- Add token for public RSVP links
ALTER TABLE public.guests ADD COLUMN token UUID DEFAULT gen_random_uuid() UNIQUE;

-- Allow public access to guests and events for RSVP
CREATE POLICY "Public can view guests" ON public.guests FOR SELECT USING (true);
CREATE POLICY "Public can update guests" ON public.guests FOR UPDATE USING (true);
CREATE POLICY "Public can insert guests" ON public.guests FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view events" ON public.events FOR SELECT USING (true);
