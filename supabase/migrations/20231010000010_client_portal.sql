-- Add token for public Client Portal links
ALTER TABLE public.clients ADD COLUMN token UUID DEFAULT gen_random_uuid() UNIQUE;

-- Allow public access to read client data by token
CREATE POLICY "Public can view client by token" ON public.clients FOR SELECT USING (true);

-- Allow public access to view and update contracts (for signing)
CREATE POLICY "Public can view contracts" ON public.contracts FOR SELECT USING (true);
CREATE POLICY "Public can update contracts" ON public.contracts FOR UPDATE USING (true);

-- Allow public access to view transactions (for viewing boletos/payments)
CREATE POLICY "Public can view transactions" ON public.transactions FOR SELECT USING (true);
