'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

export function TransactionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type') || 'income'; // 'income' or 'expense'
  
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    type: typeParam,
    description: '',
    amount: '',
    due_date: '',
    event_id: '',
    client_id: '',
    supplier_id: '',
    status: 'pending',
  });

  useEffect(() => {
    async function fetchData() {
      const { data: eData } = await supabase.from('events').select('id, title').order('date');
      const { data: cData } = await supabase.from('clients').select('id, full_name').order('full_name');
      const { data: sData } = await supabase.from('suppliers').select('id, name').order('name');
      
      if (eData) setEvents(eData);
      if (cData) setClients(cData);
      if (sData) setSuppliers(sData);
    }
    fetchData();
  }, [supabase]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('transactions').insert({
      type: formData.type,
      description: formData.description,
      amount: parseFloat(formData.amount),
      due_date: formData.due_date,
      event_id: formData.event_id || null,
      client_id: formData.type === 'income' ? (formData.client_id || null) : null,
      supplier_id: formData.type === 'expense' ? (formData.supplier_id || null) : null,
      status: formData.status,
      paid_date: formData.status === 'paid' ? new Date().toISOString().split('T')[0] : null,
    });

    if (!error) {
      router.push('/dashboard/financials');
      router.refresh();
    } else {
      console.error(error);
      alert('Erro ao salvar lançamento: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{formData.type === 'income' ? 'Nova Receita' : 'Nova Despesa'}</CardTitle>
        <CardDescription>
          {formData.type === 'income' 
            ? 'Registre um pagamento a receber de um cliente.' 
            : 'Registre um pagamento a fazer para um fornecedor.'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição *</Label>
              <Input id="description" name="description" required value={formData.description} onChange={handleChange} placeholder={formData.type === 'income' ? 'Sinal do Contrato' : 'Sinal do Buffet'} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Valor (R$) *</Label>
              <Input id="amount" name="amount" type="number" step="0.01" required value={formData.amount} onChange={handleChange} placeholder="0.00" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="due_date">Data de Vencimento *</Label>
              <Input id="due_date" name="due_date" type="date" required value={formData.due_date} onChange={handleChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <select 
                id="status" 
                name="status" 
                value={formData.status} 
                onChange={handleChange}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
              >
                <option value="pending">Pendente</option>
                <option value="paid">Pago</option>
              </select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="event_id">Vincular ao Evento</Label>
            <select 
              id="event_id" 
              name="event_id" 
              value={formData.event_id} 
              onChange={handleChange}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
            >
              <option value="">(Não vincular)</option>
              {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
            </select>
          </div>

          {formData.type === 'income' ? (
            <div className="grid gap-2">
              <Label htmlFor="client_id">Cliente Pagador</Label>
              <select 
                id="client_id" 
                name="client_id" 
                value={formData.client_id} 
                onChange={handleChange}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
              >
                <option value="">(Selecione um cliente)</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
              </select>
            </div>
          ) : (
            <div className="grid gap-2">
              <Label htmlFor="supplier_id">Fornecedor a Pagar</Label>
              <select 
                id="supplier_id" 
                name="supplier_id" 
                value={formData.supplier_id} 
                onChange={handleChange}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
              >
                <option value="">(Selecione um fornecedor)</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          )}

        </CardContent>
        <CardFooter className="flex justify-between border-t p-6">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" className={formData.type === 'income' ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"} disabled={loading}>
            {loading ? 'Salvando...' : `Salvar ${formData.type === 'income' ? 'Receita' : 'Despesa'}`}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
