import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Printer, Send, Edit, FileSignature, CheckCircle2, Clock } from 'lucide-react';

export default async function ContractViewPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { id } = await params;
  
  const { data: contract, error } = await supabase
    .from('contracts')
    .select('*, clients(full_name, cpf, address)')
    .eq('id', id)
    .single();

  if (error || !contract) {
    notFound();
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'signed': return <Badge className="bg-green-100 text-green-800 text-sm py-1"><CheckCircle2 className="mr-1 h-4 w-4" /> Assinado</Badge>;
      case 'sent': return <Badge className="bg-blue-100 text-blue-800 text-sm py-1"><Clock className="mr-1 h-4 w-4" /> Aguardando Assinatura</Badge>;
      case 'draft': return <Badge className="bg-gray-100 text-gray-800 text-sm py-1">Rascunho</Badge>;
      case 'cancelled': return <Badge className="bg-red-100 text-red-800 text-sm py-1">Cancelado</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link href={`/dashboard/clients/${contract.client_id}?tab=contracts`}>
          <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-gold-600">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o Cliente
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-white">
            <Edit className="mr-2 h-4 w-4" /> Editar
          </Button>
          <Button variant="outline" className="bg-white">
            <Printer className="mr-2 h-4 w-4" /> Imprimir / PDF
          </Button>
          {contract.status === 'draft' && (
            <Button className="bg-zinc-900 text-gold-50">
              <Send className="mr-2 h-4 w-4" /> Enviar para Assinatura
            </Button>
          )}
          {contract.status === 'sent' && (
            <Button className="bg-green-600 text-white hover:bg-green-700">
              <FileSignature className="mr-2 h-4 w-4" /> Marcar como Assinado
            </Button>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground font-medium">Status do Contrato</span>
          <div className="mt-1">{getStatusBadge(contract.status)}</div>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-sm text-muted-foreground font-medium">Valor Total</span>
          <span className="text-xl font-bold text-zinc-900">
            {contract.amount ? `R$ ${Number(contract.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Não definido'}
          </span>
        </div>
      </div>

      {/* Document View */}
      <Card className="shadow-lg border-x-0 border-y-0 sm:border rounded-none sm:rounded-xl bg-white min-h-[800px] print:shadow-none print:border-none">
        <CardContent className="p-8 sm:p-16">
          <div className="text-center mb-12">
            <h1 className="text-2xl font-bold uppercase tracking-widest text-zinc-900">{contract.title}</h1>
            <div className="w-16 h-1 bg-gold-400 mx-auto mt-6"></div>
          </div>
          
          <div className="prose prose-zinc max-w-none text-zinc-800 leading-loose text-justify font-serif">
            {contract.content.split('\n').map((paragraph: string, index: number) => (
              <p key={index} className="min-h-[1rem]">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-24 grid grid-cols-2 gap-16 pt-16 border-t border-zinc-200">
            <div className="text-center">
              <div className="border-b border-zinc-400 w-full mb-2"></div>
              <p className="font-semibold">{contract.clients?.full_name}</p>
              <p className="text-sm text-muted-foreground">CONTRATANTE</p>
              {contract.clients?.cpf && <p className="text-xs text-muted-foreground mt-1">CPF: {contract.clients.cpf}</p>}
            </div>
            <div className="text-center">
              <div className="border-b border-zinc-400 w-full mb-2"></div>
              <p className="font-semibold">LUXE EVENTS LTDA</p>
              <p className="text-sm text-muted-foreground">CONTRATADA</p>
              <p className="text-xs text-muted-foreground mt-1">CNPJ: 00.000.000/0001-00</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
