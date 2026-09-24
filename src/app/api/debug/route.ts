import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase.rpc('get_policies_debug');

  if (error) {
    // If the rpc doesn't exist, let's create it dynamically via a raw query if we can, 
    // or just fetch from a known table that has policies.
    // Since we can't create RPCs from JS easily without raw SQL, let's just return a hint.
    return NextResponse.json({ error: error.message });
  }

  return NextResponse.json({ policies: data });
}
