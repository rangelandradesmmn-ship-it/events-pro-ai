import { createClient } from '@/utils/supabase/server';
import { TransactionForm } from '@/components/financials/transaction-form';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

export default async function NewTransactionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Novo Lançamento</h1>
        <p className="text-muted-foreground mt-1">Registre a movimentação financeira para manter o fluxo de caixa atualizado.</p>
      </div>
      
      <div className="flex-1">
        <Suspense fallback={<div>Carregando...</div>}>
          <TransactionForm />
        </Suspense>
      </div>
    </div>
  );
}
