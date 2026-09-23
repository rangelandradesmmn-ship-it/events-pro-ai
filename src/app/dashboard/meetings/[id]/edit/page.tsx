import { createClient } from '@/utils/supabase/server';
import { MeetingForm } from '@/components/meetings/meeting-form';
import { redirect, notFound } from 'next/navigation';

export default async function EditMeetingPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const resolvedParams = await params;
  const id = resolvedParams.id;

  if (!user) {
    redirect('/login');
  }

  // Fetch meeting data on the server
  const { data: meeting, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !meeting) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Editar Reunião</h1>
        <p className="text-muted-foreground mt-1">Atualize os detalhes do agendamento.</p>
      </div>
      
      <div className="flex-1">
        <MeetingForm meetingId={id} initialData={meeting} />
      </div>
    </div>
  );
}
