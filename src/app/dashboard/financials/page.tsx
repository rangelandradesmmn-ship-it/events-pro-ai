import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, ArrowDownCircle, ArrowUpCircle, Calendar, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { revalidatePath } from 'next/cache';

export default async function FinancialsPage() {
  const supabase = await createClient();
  
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*, events(title), clients(full_name), suppliers(name)')
    .order('due_date', { ascending: true });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'paid': return <Badge className="bg-green-100 text-green-800">Pago</Badge>;
      case 'overdue': return <Badge className="bg-red-100 text-red-800">Atrasado</Badge>;
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'cancelled': return <Badge className="bg-gray-100 text-gray-800">Cancelado</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  async function markAsPaid(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    const supabaseServer = await createClient();
    await supabaseServer.from('transactions').update({ 
      status: 'paid', 
      paid_date: new Date().toISOString().split('T')[0] 
    }).eq('id', id);
    revalidatePath('/dashboard/financials');
  }

  // Calculate totals
  const totalIncome = transactions?.filter(t => t.type === 'income' && t.status === 'paid').reduce((acc, t) => acc + Number(t.amount), 0) || 0;
  const totalExpense = transactions?.filter(t => t.type === 'expense' && t.status === 'paid').reduce((acc, t) => acc + Number(t.amount), 0) || 0;
  const pendingIncome = transactions?.filter(t => t.type === 'income' && t.status !== 'paid' && t.status !== 'cancelled').reduce((acc, t) => acc + Number(t.amount), 0) || 0;
  const pendingExpense = transactions?.filter(t => t.type === 'expense' && t.status !== 'paid' && t.status !== 'cancelled').reduce((acc, t) => acc + Number(t.amount), 0) || 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-muted-foreground mt-1">Fluxo de caixa, contas a pagar e a receber dos seus eventos.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/financials/new?type=expense">
            <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
              <ArrowDownCircle className="mr-2 h-4 w-4" /> Nova Despesa
            </Button>
          </Link>
          <Link href="/dashboard/financials/new?type=income">
            <Button className="bg-zinc-900 text-gold-50 hover:bg-zinc-800">
              <ArrowUpCircle className="mr-2 h-4 w-4" /> Nova Receita
            </Button>
          </Link>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo em Caixa</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900">R$ {(totalIncome - totalExpense).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">Receitas pagas - Despesas pagas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas (Pagas)</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">+ R$ {pendingIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} a receber</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas (Pagas)</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">+ R$ {pendingExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} a pagar</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lançamentos</CardTitle>
          <CardDescription>Histórico detalhado de todas as transações.</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions && transactions.length > 0 ? (
            <div className="rounded-md border">
              <table className="w-full text-sm text-left">
                <thead className="bg-zinc-50 border-b">
                  <tr>
                    <th className="px-4 py-3 font-medium text-zinc-600">Descrição / Evento</th>
                    <th className="px-4 py-3 font-medium text-zinc-600">Pessoa / Empresa</th>
                    <th className="px-4 py-3 font-medium text-zinc-600">Vencimento</th>
                    <th className="px-4 py-3 font-medium text-zinc-600 text-right">Valor</th>
                    <th className="px-4 py-3 font-medium text-zinc-600 text-center">Status</th>
                    <th className="px-4 py-3 font-medium text-zinc-600 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-zinc-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-zinc-900">{t.description}</div>
                        <div className="text-xs text-muted-foreground">{t.events?.title || 'Sem evento'}</div>
                      </td>
                      <td className="px-4 py-3 text-zinc-600">
                        {t.type === 'income' ? (t.clients?.full_name || '-') : (t.suppliers?.name || '-')}
                      </td>
                      <td className="px-4 py-3 text-zinc-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {new Date(t.due_date + 'T12:00:00Z').toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className={`px-4 py-3 text-right font-medium ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {t.type === 'income' ? '+' : '-'} R$ {Number(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {getStatusBadge(t.status)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {t.status !== 'paid' && t.status !== 'cancelled' && (
                            <form action={markAsPaid}>
                              <input type="hidden" name="id" value={t.id} />
                              <Button type="submit" size="sm" variant="outline" className="h-7 text-xs text-green-600 border-green-200 hover:bg-green-50">
                                Dar Baixa
                              </Button>
                            </form>
                          )}
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-zinc-400 hover:text-zinc-900">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
              Nenhuma transação financeira registrada.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
