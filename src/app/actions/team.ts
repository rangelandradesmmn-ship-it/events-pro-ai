'use server';

import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function deleteTeamMemberAction(formData: FormData) {
  const userId = formData.get('userId') as string;
  
  if (!userId) {
    return { success: false, error: 'ID do usuário não fornecido.' };
  }

  const supabaseAdmin = createAdminClient();

  // 1. Apagar os dados vinculados do usuário (Cascade manual para evitar erros de Foreign Key)
  await supabaseAdmin.from('guests').delete().eq('planner_id', userId); // if exists
  await supabaseAdmin.from('tasks').delete().eq('planner_id', userId);
  await supabaseAdmin.from('checklists').delete().eq('planner_id', userId);
  await supabaseAdmin.from('transactions').delete().eq('planner_id', userId);
  await supabaseAdmin.from('contracts').delete().eq('planner_id', userId);
  await supabaseAdmin.from('suppliers').delete().eq('planner_id', userId);
  await supabaseAdmin.from('client_files').delete().eq('uploaded_by', userId);
  await supabaseAdmin.from('clients').delete().eq('planner_id', userId);
  await supabaseAdmin.from('events').delete().eq('owner_id', userId);

  // 2. Apagar o usuário do Supabase Auth (isso vai apagar o profile automaticamente por CASCADE)
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

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
