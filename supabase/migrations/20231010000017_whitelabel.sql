-- 1. Adicionar colunas de White-label na tabela profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS agency_logo_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS agency_color TEXT DEFAULT '#000000';

-- 2. Criar o Bucket de Storage (Pasta de Arquivos) para as Logos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('agency_logos', 'agency_logos', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Políticas de Segurança do Storage (Permitir que os noivos vejam as logos sem precisar de login)
DROP POLICY IF EXISTS "Logos publicamente visíveis" ON storage.objects;
CREATE POLICY "Logos publicamente visíveis" ON storage.objects FOR SELECT USING (bucket_id = 'agency_logos');

-- 4. Permitir que os assessores (usuários logados) enviem imagens
DROP POLICY IF EXISTS "Assessores podem subir logos" ON storage.objects;
CREATE POLICY "Assessores podem subir logos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'agency_logos' AND auth.uid() = owner);

DROP POLICY IF EXISTS "Assessores podem atualizar logos" ON storage.objects;
CREATE POLICY "Assessores podem atualizar logos" ON storage.objects FOR UPDATE USING (bucket_id = 'agency_logos' AND auth.uid() = owner);

DROP POLICY IF EXISTS "Assessores podem deletar logos" ON storage.objects;
CREATE POLICY "Assessores podem deletar logos" ON storage.objects FOR DELETE USING (bucket_id = 'agency_logos' AND auth.uid() = owner);
