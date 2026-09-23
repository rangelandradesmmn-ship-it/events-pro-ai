import { createClient } from '@/utils/supabase/server';
import { EventForm } from '@/components/events/event-form';
import { redirect } from 'next/navigation';

export default async function NewEventPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: clients } = await supabase.from('clients').select('id, full_name').order('full_name');

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Novo Evento</h1>
        <p className="text-muted-foreground mt-1">Cadastre um novo evento no sistema.</p>
      </div>
      
      <div className="flex-1">
        <EventForm userId={user.id} clients={clients || []} />
      </div>
    </div>
  );
}
