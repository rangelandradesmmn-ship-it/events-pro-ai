'use server';

import { createClient } from '@/utils/supabase/server';

export async function processCheckinAction(token: string) {
  if (!token || token.trim() === '') {
    return { success: false, error: 'QR Code inválido (vazio).' };
  }

  const supabase = await createClient();

  // Find guest by token
  const { data: guest, error } = await supabase
    .from('guests')
    .select('id, name, companions, status, events(title)')
    .eq('token', token)
    .single();

  if (error || !guest) {
    return { success: false, error: 'Convidado não encontrado na base de dados.' };
  }

  if (guest.status === 'checked_in') {
    return { 
      success: true, 
      alreadyCheckedIn: true,
      guest: {
        name: guest.name,
        companions: guest.companions,
        eventName: Array.isArray(guest.events) ? guest.events[0]?.title : (guest.events as any)?.title
      }
    };
  }

  if (guest.status === 'declined') {
    return { success: false, error: `${guest.name} havia marcado como AUSENTE. Entrada requer liberação especial.` };
  }

  // Update status
  const { error: updateError } = await supabase
    .from('guests')
    .update({ status: 'checked_in' })
    .eq('id', guest.id);

  if (updateError) {
    return { success: false, error: 'Falha ao registrar check-in no sistema.' };
  }

  return { 
    success: true, 
    alreadyCheckedIn: false,
    guest: {
      name: guest.name,
      companions: guest.companions,
      eventName: Array.isArray(guest.events) ? guest.events[0]?.title : (guest.events as any)?.title
    }
  };
}
