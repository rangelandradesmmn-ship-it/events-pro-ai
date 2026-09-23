import { createClient } from '@/utils/supabase/server';
import { ClientForm } from '@/components/clients/client-form';
import { redirect } from 'next/navigation';

export default async function NewClientPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Novo Cliente</h1>
        <p className="text-muted-foreground mt-1">Adicione um novo cliente à sua base de contatos.</p>
      </div>
      
      <div className="flex-1">
        <ClientForm />
      </div>
    </div>
  );
}
