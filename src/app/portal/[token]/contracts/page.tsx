import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { FileText, CheckCircle2, Clock, FileSignature, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { revalidatePath } from 'next/cache';
import { ViewContractButton } from '@/components/portal/view-contract-button';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function ClientPortalContractsPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ token: string }>,
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const token = resolvedParams.token;
  const success = resolvedSearchParams.success === 'true';
  const supabase = await createClient();

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('token', token)
    .single();

  if (!client) {
    notFound();
  }

  // Filter out 'draft' contracts so the client only sees 'sent' and 'signed'
  const { data: contracts } = await supabase
    .from('contracts')
    .select('*')
    .eq('client_id', client.id)
    .neq('status', 'draft')
    .order('created_at', { ascending: false });

  async function signContract(formData: FormData) {
    'use server';
    const contractId = formData.get('contract_id') as string;
    const clientToken = formData.get('token') as string;
    const supabaseServer = await createClient();
    
    const { error } = await supabaseServer.from('contracts').update({ 
      status: 'signed',
      signed_at: new Date().toISOString()
    }).eq('id', contractId);
    
    if (error) {
      console.error('Error signing contract:', error);
      throw new Error(error.message);
    }

    redirect(`/portal/${clientToken}/contracts?success=true`);
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 flex items-center gap-3">
          <FileSignature className="h-8 w-8 text-[#A86F6B]" />
          Contratos e Assinaturas
        </h1>
        <p className="text-muted-foreground mt-2">
          Visualize os termos, valores e assine os documentos digitais de forma segura diretamente pela plataforma.
        </p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-2xl p-4 flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
          <div>
            <h3 className="font-bold text-green-900">Contrato assinado com sucesso!</h3>
            <p className="text-sm mt-1 text-green-700">A assessoria já foi notificada da sua assinatura digital.</p>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {contracts && contracts.length > 0 ? (
          contracts.map(contract => (
            <div key={contract.id} className={`border rounded-[24px] overflow-hidden shadow-sm transition-all ${contract.status === 'sent' ? 'bg-white border-[#A86F6B]/30 shadow-md ring-1 ring-[#A86F6B]/10' : 'bg-white border-zinc-100'}`}>
              <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                <div className="flex items-start gap-4 flex-1">
                  <div className={`mt-1 h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${contract.status === 'signed' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                    <FileText className="h-6 w-6" />
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-zinc-900 text-xl">{contract.title}</h3>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {contract.status === 'signed' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Assinado Digitalmente
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold">
                          <Clock className="h-3.5 w-3.5" /> Aguardando sua Assinatura
                        </span>
                      )}
                      
                      {contract.amount && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 text-xs font-semibold">
                          Valor: {formatCurrency(Number(contract.amount))}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-zinc-100">
                  {contract.content && (
                    <div className="w-full sm:w-auto">
                      <ViewContractButton content={contract.content} />
                    </div>
                  )}
                  
                  {contract.status === 'sent' && (
                    <form action={signContract} className="w-full sm:w-auto">
                      <input type="hidden" name="contract_id" value={contract.id} />
                      <input type="hidden" name="token" value={token} />
                      <Button type="submit" className="w-full h-12 rounded-xl bg-[#A86F6B] text-white hover:bg-[#8F5E5A] font-semibold px-6 shadow-sm">
                        Assinar Agora
                      </Button>
                    </form>
                  )}
                </div>
                
              </div>
              
              {contract.status === 'signed' && contract.signed_at && (
                <div className="bg-zinc-50 px-6 md:px-8 py-3 border-t border-zinc-100 text-xs text-zinc-500 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Assinatura registrada em sistema no dia {new Date(contract.signed_at).toLocaleDateString('pt-BR')} às {new Date(contract.signed_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="py-20 text-center bg-white rounded-[32px] border border-zinc-100 shadow-sm flex flex-col items-center">
            <div className="bg-zinc-50 p-4 rounded-full shadow-sm mb-4">
              <FileSignature className="h-8 w-8 text-zinc-300" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 mb-1">Nenhum contrato pendente</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              Quando a assessoria gerar um novo contrato para você assinar, ele aparecerá aqui.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
