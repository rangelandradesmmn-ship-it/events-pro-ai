-- Create a table to track files metadata
CREATE TABLE public.client_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.client_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage client files" ON public.client_files FOR ALL USING (auth.uid() IS NOT NULL);

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('client_files', 'client_files', true);

-- Storage Policies
CREATE POLICY "Public access to client files" ON storage.objects FOR SELECT USING (bucket_id = 'client_files');
CREATE POLICY "Auth users can upload client files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'client_files' AND auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can update client files" ON storage.objects FOR UPDATE USING (bucket_id = 'client_files' AND auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can delete client files" ON storage.objects FOR DELETE USING (bucket_id = 'client_files' AND auth.uid() IS NOT NULL);
