'use server';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateRsvpAction(formData: FormData) {
  const token = formData.get('token') as string;
  const status = formData.get('status') as string;
  const notes = formData.get('notes') as string;
  const companionsNames = formData.get('companions_names') as string;
  const companionsCount = formData.get('companions_count') as string;

  const supabase = await createClient();

  const { error } = await supabase.from('guests').update({
    status,
    notes,
    companions_names: JSON.parse(companionsNames || '[]'),
    companions: parseInt(companionsCount || '0')
  }).eq('token', token);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/invite/' + token);
  return { success: true };
}