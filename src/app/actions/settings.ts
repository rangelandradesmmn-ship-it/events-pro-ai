'use server';

import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateSettingsAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Não autorizado.' };
  }

  const logoUrl = formData.get('logoUrl') as string;
  const color = formData.get('color') as string;
  const whatsapp = formData.get('whatsapp') as string;

  // By using Admin Client, we bypass the missing RLS Update policy on profiles table
  const supabaseAdmin = createAdminClient();
  
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      agency_logo_url: logoUrl,
      agency_color: color,
      whatsapp: whatsapp,
    })
    .eq('id', user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard/settings');
  revalidatePath('/portal/[token]', 'layout');
  
  return { success: true };
}
