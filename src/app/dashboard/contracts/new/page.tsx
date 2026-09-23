import { createClient } from '@/utils/supabase/server';
import { ContractForm } from '@/components/contracts/contract-form';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

export default async function NewContractPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Novo Contrato</h1>
        <p className="text-muted-foreground mt-1">Crie um novo termo e vincule-o a um cliente e evento.</p>
      </div>
      
      <div className="flex-1">
        <Suspense fallback={<div>Carregando formulário...</div>}>
          <ContractForm />
        </Suspense>
      </div>
    </div>
  );
}
