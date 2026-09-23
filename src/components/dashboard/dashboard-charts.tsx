'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export function DashboardCharts({ events, transactions }: { events: any[], transactions: any[] }) {
  // 1. Process Event Status Data for Pie Chart
  const statusCounts = events.reduce((acc: any, event: any) => {
    const status = event.status || 'planejamento';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const statusMap: Record<string, string> = {
    'planejamento': 'Planejamento',
    'contratacao': 'Contratação',
    'organizacao': 'Organização',
    'confirmacao': 'Confirmação',
    'execucao': 'Execução',
    'finalizado': 'Finalizado'
  };

  const statusColors: Record<string, string> = {
    'planejamento': '#3b82f6', // blue
    'contratacao': '#a855f7', // purple
    'organizacao': '#eab308', // yellow
    'confirmacao': '#f97316', // orange
    'execucao': '#22c55e', // green
    'finalizado': '#64748b' // gray
  };

  const pieData = Object.keys(statusCounts).map(key => ({
    name: statusMap[key] || key,
    value: statusCounts[key],
    color: statusColors[key] || '#94a3b8'
  }));

  // 2. Process Transactions for Bar Chart (Last 6 Months)
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase(),
      Receitas: 0,
      Despesas: 0,
    });
  }

  transactions.forEach(t => {
    if (!t.due_date) return;
    const dateStr = t.due_date.substring(0, 7); // YYYY-MM
    const monthObj = months.find(m => m.key === dateStr);
    if (monthObj) {
      if (t.type === 'income') {
        monthObj.Receitas += Number(t.amount) || 0;
      } else {
        monthObj.Despesas += Number(t.amount) || 0;
      }
    }
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 mt-8">
      {/* Gráfico de Receitas vs Despesas */}
      <Card className="col-span-1 shadow-sm border-zinc-200">
        <CardHeader>
          <CardTitle className="text-xl font-serif">Fluxo Financeiro (Últimos 6 Meses)</CardTitle>
          <CardDescription>Comparativo de Receitas e Despesas.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={months} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => `R$${val/1000}k`} />
              <RechartsTooltip 
                cursor={{fill: '#f8fafc'}}
                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', {minimumFractionDigits:2})}`, undefined]}
              />
              <Legend wrapperStyle={{paddingTop: '20px'}} />
              <Bar dataKey="Receitas" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Funil de Eventos */}
      <Card className="col-span-1 shadow-sm border-zinc-200">
        <CardHeader>
          <CardTitle className="text-xl font-serif">Funil de Eventos</CardTitle>
          <CardDescription>Distribuição dos seus eventos por fase atual.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  formatter={(value: number) => [`${value} evento(s)`, 'Quantidade']}
                />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
             <div className="flex items-center justify-center h-full text-muted-foreground text-sm border-2 border-dashed rounded-lg bg-zinc-50/50">
               Nenhum evento cadastrado
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
