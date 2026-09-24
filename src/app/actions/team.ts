'use server';

import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function deleteTeamMemberAction(formData: FormData) {
  const userId = formData.get('userId') as string;
  
  if (!userId) {
    return { success: false, error: 'ID do usuário não fornecido.' };
  }

  const supabaseAdmin = createAdminClient();

  // REMOVED THE NUCLEAR DELETE!
  // We only delete the user from the team_members table so they lose access to this agency.
  // We DO NOT delete their Supabase Auth account because they might be the agency owner themselves,
  // or they might belong to another agency!
  const { error } = await supabaseAdmin.from('team_members').delete().eq('user_id', userId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard/team');
  return { success: true };
}

export async function updateTeamMemberRoleAction(formData: FormData) {
  const userId = formData.get('userId') as string;
  const role = formData.get('role') as string;

  if (!userId || !role) {
    return { success: false, error: 'Dados incompletos.' };
  }

  const supabaseAdmin = createAdminClient();

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ role })
    .eq('id', userId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard/team');
  return { success: true };
}
