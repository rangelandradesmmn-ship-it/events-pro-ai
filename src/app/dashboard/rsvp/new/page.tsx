import { createClient } from '@/utils/supabase/server';
import { RsvpForm } from '@/components/rsvp/rsvp-form';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

export default async function NewRsvpPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Adicionar Convidado</h1>
        <p className="text-muted-foreground mt-1">Inclua uma pessoa na lista de controle da porta do evento.</p>
      </div>
      
      <div className="flex-1">
        <Suspense fallback={<div>Carregando...</div>}>
          <RsvpForm />
        </Suspense>
      </div>
    </div>
  );
}
