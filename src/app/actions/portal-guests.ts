'use server';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function uploadPortalGuestsAction(eventId: string, token: string, guests: any[]) {
  const supabase = await createClient();

  // Basic validation: the user must belong to this token
  const { data: client } = await supabase
    .from('clients')
    .select('*, events(*)')
    .eq('token', token)
    .single();

  if (!client || client.events[0]?.id !== eventId) {
    return { success: false, error: 'Acesso negado.' };
  }

  const inserts = guests.map(g => ({
    event_id: eventId,
    name: g.name,
    phone: g.phone || null,
    allowed_companions: g.allowed_companions || 0,
    companions: 0,
    status: 'pending'
  }));

  const { error } = await supabase.from('guests').insert(inserts);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/portal/' + token + '/guests');
  return { success: true };
}