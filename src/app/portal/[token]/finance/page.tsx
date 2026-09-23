import { createAdminClient as createClient } from '@/utils/supabase/admin';
import { notFound } from 'next/navigation';
import { DollarSign, PieChart, ArrowDownCircle, CheckCircle2, Clock, XCircle, TrendingDown } from 'lucide-react';

export default async function PortalBudgetPage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = await params;
  const token = resolvedParams.token;
  const supabase = await createClient();

  const { data: client } = await supabase
    .from('clients')
    .select('*, events(*)')
    .eq('token', token)
    .single();

  if (!client || !client.events || client.events.length === 0) {
    notFound();
  }
  
  const event = client.events[0];

  // Fetch only the 'expenses' (wedding costs) for this event
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*, suppliers(name)')
    .eq('event_id', event.id)
    .eq('type', 'expense')
    .order('due_date', { ascending: true });

  const estimatedBudget = event.budget ? Number(event.budget) : 0;
  
  const totalCommitted = transactions?.reduce((acc, t) => acc + Number(t.amount), 0) || 0;
  const totalPaid = transactions?.filter(t => t.status === 'paid').reduce((acc, t) => acc + Number(t.amount), 0) || 0;
  const totalPending = transactions?.filter(t => t.status === 'pending' || t.status === 'overdue').reduce((acc, t) => acc + Number(t.amount), 0) || 0;
  
  const remainingBudget = estimatedBudget - totalCommitted;
  
  // Calculate progress percentage
  const progressPercentage = estimatedBudget > 0 ? Math.min((totalCommitted / estimatedBudget) * 100, 100) : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    // Append T12:00:00Z to avoid timezone shifts
    return new Date(dateString + 'T12:00:00Z').toLocaleDateString('pt-BR');
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 flex items-center gap-3">
          <PieChart className="h-8 w-8 text-[#A86F6B]" />
          Orçamento do Casamento
        </h1>
        <p className="text-muted-foreground mt-2">
          Acompanhe os custos, pagamentos de fornecedores e veja se o seu evento está dentro do limite estipulado.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Orçamento Total */}
        <div className="bg-white border border-zinc-100 rounded-[24px] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-zinc-500 mb-2">
              <DollarSign className="h-4 w-4" />
              <h3 className="text-sm font-semibold uppercase tracking-wider">Orçamento Limite</h3>
            </div>
            <div className="text-3xl font-bold text-zinc-900">{formatCurrency(estimatedBudget)}</div>
          </div>
          {estimatedBudget === 0 && (
            <p className="text-xs text-amber-600 mt-4 bg-amber-50 p-2 rounded-lg border border-amber-100">
              A assessoria ainda não definiu o teto de gastos do seu evento.
            </p>
          )}
        </div>

        {/* Total Comprometido */}
        <div className="bg-white border border-zinc-100 rounded-[24px] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-zinc-500 mb-2">
              <TrendingDown className="h-4 w-4" />
              <h3 className="text-sm font-semibold uppercase tracking-wider">Total Comprometido</h3>
            </div>
            <div className="text-3xl font-bold text-red-600">{formatCurrency(totalCommitted)}</div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-zinc-500">Uso do Orçamento</span>
              <span className="font-bold text-zinc-700">{progressPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-zinc-100 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${progressPercentage > 90 ? 'bg-red-500' : progressPercentage > 75 ? 'bg-yellow-500' : 'bg-green-500'}`}
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Saldo Restante */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-[24px] p-6 shadow-sm flex flex-col justify-between text-white">
          <div>
            <div className="flex items-center gap-2 text-zinc-400 mb-2">
              <PieChart className="h-4 w-4" />
              <h3 className="text-sm font-semibold uppercase tracking-wider">Saldo Disponível</h3>
            </div>
            <div className="text-3xl font-bold">{formatCurrency(remainingBudget)}</div>
          </div>
          <p className="text-xs text-zinc-400 mt-4">
            {remainingBudget < 0 ? 'Atenção: O casamento ultrapassou o orçamento previsto.' : 'Valor livre para contratação de novos fornecedores.'}
          </p>
        </div>
      </div>

      {/* Resumo de Status */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
         <div className="bg-green-50 border border-green-100 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-green-600 uppercase tracking-wider">Já Pago</p>
              <p className="text-xl font-bold text-green-800 mt-1">{formatCurrency(totalPaid)}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-green-200/50 flex items-center justify-center">
               <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
         </div>
         <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-yellow-600 uppercase tracking-wider">A Pagar (Pendente)</p>
              <p className="text-xl font-bold text-yellow-800 mt-1">{formatCurrency(totalPending)}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-yellow-200/50 flex items-center justify-center">
               <Clock className="h-5 w-5 text-yellow-600" />
            </div>
         </div>
      </div>

      {/* Tabela de Lançamentos */}
      <div className="bg-white border border-zinc-100 rounded-[32px] overflow-hidden shadow-sm">
        <div className="p-6 md:px-8 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-900">Histórico de Contratos e Parcelas</h2>
        </div>
        
        {transactions && transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-100 text-xs uppercase tracking-wider font-semibold text-zinc-500">
                  <th className="p-5 font-semibold">Descrição / Fornecedor</th>
                  <th className="p-5 font-semibold">Vencimento</th>
                  <th className="p-5 font-semibold">Valor</th>
                  <th className="p-5 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="p-5">
                      <p className="font-medium text-zinc-900">{t.description}</p>
                      {t.suppliers?.name && (
                        <p className="text-xs text-muted-foreground mt-0.5">Fornecedor: {t.suppliers.name}</p>
                      )}
                    </td>
                    <td className="p-5 text-sm text-zinc-600">
                      {formatDate(t.due_date)}
                    </td>
                    <td className="p-5 text-sm font-bold text-zinc-900">
                      {formatCurrency(Number(t.amount))}
                    </td>
                    <td className="p-5 text-right">
                      {t.status === 'paid' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Pago
                        </span>
                      )}
                      {t.status === 'pending' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold">
                          <Clock className="h-3.5 w-3.5" /> Pendente
                        </span>
                      )}
                      {t.status === 'overdue' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold">
                          <XCircle className="h-3.5 w-3.5" /> Atrasado
                        </span>
                      )}
                      {t.status === 'cancelled' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-zinc-600 text-xs font-bold">
                          Cancelado
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center">
            <div className="bg-zinc-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <ArrowDownCircle className="h-8 w-8 text-zinc-300" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900">Nenhum custo lançado</h3>
            <p className="text-muted-foreground mt-1 max-w-sm mx-auto">
              A assessoria ainda não registrou nenhum contrato ou parcela para este casamento.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
