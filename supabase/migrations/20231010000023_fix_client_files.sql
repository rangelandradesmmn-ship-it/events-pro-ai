-- 1. DROP the old permissive policy on client_files
DROP POLICY IF EXISTS "Users can manage client files" ON public.client_files;

-- 2. CREATE the correct Multi-Tenant policy for client_files
CREATE POLICY "Planners can manage files of their clients" ON public.client_files
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE clients.id = client_files.client_id
    AND clients.planner_id = auth.uid()
  )
);

-- 3. DROP old storage policies
DROP POLICY IF EXISTS "Auth users can upload client files" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can update client files" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can delete client files" ON storage.objects;

-- 4. CREATE secure storage policies for the planner
CREATE POLICY "Assessores podem gerenciar arquivos" ON storage.objects
FOR ALL USING (bucket_id = 'client_files' AND auth.uid() = owner);
