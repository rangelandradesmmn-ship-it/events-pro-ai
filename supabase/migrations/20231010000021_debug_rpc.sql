CREATE OR REPLACE FUNCTION public.get_policies_debug()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT json_agg(row_to_json(p))
  FROM pg_policies p
  WHERE schemaname = 'public';
$$;
