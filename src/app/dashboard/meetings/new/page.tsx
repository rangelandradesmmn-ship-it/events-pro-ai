import { createClient } from '@/utils/supabase/server';
import { MeetingForm } from '@/components/meetings/meeting-form';
import { redirect } from 'next/navigation';

export default async function NewMeetingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nova Reunião</h1>
        <p className="text-muted-foreground mt-1">Marque compromissos e alinhe os detalhes do evento com seu time e clientes.</p>
      </div>
      
      <div className="flex-1">
        <MeetingForm />
      </div>
    </div>
  );
}
