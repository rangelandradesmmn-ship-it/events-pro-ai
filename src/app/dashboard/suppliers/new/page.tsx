import { createClient } from '@/utils/supabase/server';
import { SupplierForm } from '@/components/suppliers/supplier-form';
import { redirect } from 'next/navigation';

export default async function NewSupplierPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Novo Fornecedor</h1>
        <p className="text-muted-foreground mt-1">Cadastre os detalhes de contato de um novo parceiro.</p>
      </div>
      
      <div className="flex-1">
        <SupplierForm />
      </div>
    </div>
  );
}
