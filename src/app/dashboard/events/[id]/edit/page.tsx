import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { EventForm } from '@/components/events/event-form';

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const eventId = resolvedParams.id;
  
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: event } = await supabase.from('events').select('*').eq('id', eventId).single();
  
  if (!event) {
    redirect('/dashboard/events');
  }

  const { data: clients } = await supabase.from('clients').select('id, full_name').order('full_name');

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Editar Evento</h1>
        <p className="text-muted-foreground mt-1">Atualize os detalhes do evento.</p>
      </div>

      <EventForm userId={user.id} clients={clients || []} initialData={event} />
    </div>
  );
}
