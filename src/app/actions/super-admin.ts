'use server';

import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';

export async function grantLifetimeAccessAction(formData: FormData) {
  const userId = formData.get('userId') as string;
  
  if (!userId) {
    return { success: false, error: 'ID da agência não fornecido.' };
  }

  // 1. Check if the caller is really a super admin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Não autenticado.' };

  const { data: profile } = await supabase.from('profiles').select('is_superadmin').eq('id', user.id).single();
  if (!profile?.is_superadmin) {
    return { success: false, error: 'Acesso negado.' };
  }

  // 2. Grant lifetime access by setting date to 2099
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ 
      stripe_current_period_end: '2099-12-31T23:59:59Z',
      stripe_subscription_id: 'sub_partner_lifetime',
      stripe_customer_id: 'cus_partner'
    })
    .eq('id', userId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard/super-admin');
  return { success: true };
}
