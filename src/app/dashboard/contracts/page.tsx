import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, FileText, CheckCircle2, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ShareContractButtons } from '@/components/contracts/share-buttons';

export default async function ContractsPage() {
  const supabase = await createClient();
  
  const { data: contracts } = await supabase
    .from('contracts')
    .select('*, clients(full_name, phone, email, whatsapp, token)')
    .order('created_at', { ascending: false });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'signed': return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="mr-1 h-3 w-3" /> Assinado</Badge>;
      case 'sent': return <Badge className="bg-blue-100 text-blue-800"><Clock className="mr-1 h-3 w-3" /> Enviado</Badge>;
      case 'draft': return <Badge className="bg-gray-100 text-gray-800">Rascunho</Badge>;
      case 'cancelled': return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contratos</h1>
          <p className="text-muted-foreground mt-1">Gerencie os contratos de prestação de serviços dos seus clientes.</p>
        </div>
        <div>
          <Link href="/dashboard/contracts/new">
            <Button className="bg-zinc-900 text-gold-50 hover:bg-zinc-800">
              <Plus className="mr-2 h-4 w-4" /> Novo Contrato
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {contracts && contracts.length > 0 ? (
          contracts.map((contract) => (
            <Card key={contract.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="bg-zinc-50 border-b pb-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                    {contract.clients?.full_name}
                  </div>
                  {getStatusBadge(contract.status)}
                </div>
                <CardTitle className="text-lg line-clamp-1">{contract.title}</CardTitle>
                <CardDescription className="mt-1">
                  Criado em {new Date(contract.created_at).toLocaleDateString('pt-BR')}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 grid gap-3 text-sm">
                <div className="flex items-center justify-between font-medium">
                  <span className="text-muted-foreground">Valor:</span>
                  <span className="text-green-600">
                    {contract.amount ? `R$ ${contract.amount}` : 'Valor não definido'}
                  </span>
                </div>
                <div className="flex flex-col gap-2 mt-4 border-t pt-4">
                  <div className="flex gap-2">
                    <Link href={`/dashboard/contracts/${contract.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full h-8">
                        <FileText className="mr-2 h-3 w-3" /> Ver Documento Interno
                      </Button>
                    </Link>
                    <form action={async (formData: FormData) => {
                      'use server';
                      const id = formData.get('contract_id') as string;
                      const supabaseServer = await createClient();
                      await supabaseServer.from('contracts').delete().eq('id', id);
                      const { revalidatePath } = await import('next/cache');
                      revalidatePath('/dashboard/contracts');
                    }}>
                      <input type="hidden" name="contract_id" value={contract.id} />
                      <Button type="submit" variant="outline" size="sm" className="w-8 h-8 px-0 text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200" title="Excluir Contrato">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                      </Button>
                    </form>
                  </div>
                  {contract.clients?.token && (
                    <ShareContractButtons 
                      clientName={contract.clients.full_name} 
                      clientPhone={contract.clients.whatsapp || contract.clients.phone}
                      clientEmail={contract.clients.email}
                      portalToken={contract.clients.token}
                      contractTitle={contract.title}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl">
            <h3 className="text-lg font-medium text-zinc-900">Nenhum contrato gerado</h3>
            <p className="text-muted-foreground mt-1 mb-4">Você ainda não gerou nenhum contrato pelo sistema.</p>
            <Link href="/dashboard/contracts/new">
              <Button variant="outline">Gerar Primeiro Contrato</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
