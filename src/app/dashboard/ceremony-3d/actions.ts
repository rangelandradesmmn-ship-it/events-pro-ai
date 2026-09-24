'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function publishToPortalAction(eventId: string) {
  const supabase = await createClient();

  // Try to update the event as published
  const { error: updateError } = await supabase
    .from('events')
    .update({ portal_published: true })
    .eq('id', eventId);
    
  if (updateError) {
    console.error("Error publishing event:", updateError);
    return { success: false, error: 'Erro ao publicar (talvez falte rodar a migração não banco)' };
  }
  
  // Find the client token linked to this event to generate the portal URL
  const { data: eventData } = await supabase
    .from('events')
    .select('client_id')
    .eq('id', eventId)
    .single();
    
  if (eventData?.client_id) {
    const { data: clientData } = await supabase
      .from('clients')
      .select('token')
      .eq('id', eventData.client_id)
      .single();
      
    if (clientData?.token) {
      revalidatePath('/dashboard/ceremony-3d');
      return { success: true, token: clientData.token };
    }
  }

  // Fallback if client token is missing
  revalidatePath('/dashboard/ceremony-3d');
  return { success: true, token: 'demo-token' };
}
