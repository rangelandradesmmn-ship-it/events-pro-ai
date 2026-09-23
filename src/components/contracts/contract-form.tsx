'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { generateContractAction } from '@/app/actions/ai-contract';

export function ContractForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialClientId = searchParams.get('client_id') || '';
  
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: 'Contrato de Prestação de Serviços',
    client_id: initialClientId,
    amount: '',
    status: 'draft',
    content: 'Pelo presente instrumento particular, de um lado, o CONTRATADO, e de outro lado, o CONTRATANTE, têm entre si justo e acordado o seguinte: \n\n1. O CONTRATADO se compromete a prestar os serviços de organização de eventos...',
  });

  useEffect(() => {
    async function fetchClients() {
      const { data } = await supabase.from('clients').select('id, full_name').order('full_name');
      if (data) setClients(data);
    }
    fetchClients();
  }, [supabase]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAIGenerate = async () => {
    if (!formData.client_id) {
      alert('Por favor, selecione um cliente primeiro para que a IA possa ler os dados dele.');
      return;
    }
    
    setAiLoading(true);
    try {
      const response = await generateContractAction(formData.client_id);
      setFormData(prev => ({ ...prev, content: response.text }));
    } catch (err: any) {
      alert(err.message || 'Erro ao gerar contrato com IA.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.client_id) {
      alert('Por favor, selecione um cliente.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('contracts').insert({
      title: formData.title,
      client_id: formData.client_id,
      amount: formData.amount ? parseFloat(formData.amount) : null,
      status: formData.status,
      content: formData.content,
    });

    if (!error) {
      // Return to client profile if client_id was in URL, else to contracts list
      if (initialClientId) {
        router.push(`/dashboard/clients/${initialClientId}?tab=contracts`);
      } else {
        router.push('/dashboard/contracts');
      }
      router.refresh();
    } else {
      console.error(error);
      alert('Erro ao salvar contrato: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-4xl">
      <CardHeader>
        <CardTitle>Geração de Contrato</CardTitle>
        <CardDescription>Crie um novo contrato vinculando-o a um cliente e evento.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título do Contrato *</Label>
              <Input id="title" name="title" required value={formData.title} onChange={handleChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="client_id">Cliente *</Label>
              <select 
                id="client_id" 
                name="client_id" 
                required
                value={formData.client_id} 
                onChange={handleChange}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
              >
                <option value="">Selecione um cliente...</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.full_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Valor Total (R$)</Label>
              <Input id="amount" name="amount" type="number" step="0.01" value={formData.amount} onChange={handleChange} placeholder="Ex: 15000.00" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status Inicial</Label>
              <select 
                id="status" 
                name="status" 
                value={formData.status} 
                onChange={handleChange}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
              >
                <option value="draft">Rascunho (Em edição)</option>
                <option value="sent">Enviado para Assinatura</option>
                <option value="signed">Assinado</option>
              </select>
            </div>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content">Conteúdo do Contrato</Label>
              <Button 
                type="button" 
                onClick={handleAIGenerate} 
                disabled={aiLoading || !formData.client_id}
                variant="outline" 
                size="sm" 
                className="text-xs border-gold-300 text-gold-700 hover:bg-gold-50"
              >
                <Sparkles className="mr-1 h-3 w-3" />
                {aiLoading ? 'Redigindo...' : '✨ Redigir com Inteligência Artificial'}
              </Button>
            </div>
            <textarea 
              id="content" 
              name="content" 
              value={formData.content} 
              onChange={handleChange} 
              className="flex min-h-[400px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formData.client_id ? 'Clique no botão acima para a IA redigir o contrato com base nos dados do cliente e do evento.' : 'Selecione um cliente acima para habilitar a redação inteligente.'}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-6">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" className="bg-zinc-900 text-gold-50" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Contrato'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
