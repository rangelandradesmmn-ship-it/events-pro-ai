'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

export function RsvpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEventId = searchParams.get('event_id') || '';
  
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');

  // Single Form State
  const [formData, setFormData] = useState({
    name: '',
    event_id: initialEventId,
    email: '',
    phone: '',
    allowed_companions: '0',
    status: 'pending',
    notes: '',
  });

  // Bulk Form State
  const [bulkData, setBulkData] = useState({
    event_id: initialEventId,
    names: '',
    status: 'pending',
  });

  useEffect(() => {
    async function fetchEvents() {
      const { data } = await supabase.from('events').select('id, title').order('date');
      if (data) setEvents(data);
    }
    fetchEvents();
  }, [supabase]);

  const handleSingleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleBulkChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setBulkData({ ...bulkData, [e.target.name]: e.target.value });
  };

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.event_id) {
      alert('Selecione um evento para este convidado.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('guests').insert({
      name: formData.name,
      event_id: formData.event_id,
      email: formData.email || null,
      phone: formData.phone || null,
      allowed_companions: parseInt(formData.allowed_companions) || 0,
      companions: 0,
      status: formData.status,
    });

    if (!error) {
      router.push(`/dashboard/rsvp?event_id=${formData.event_id}`);
      router.refresh();
    } else {
      console.error(error);
      alert('Erro ao salvar convidado: ' + error.message);
      setLoading(false);
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!bulkData.event_id) {
      alert('Selecione um evento para esta lista.');
      setLoading(false);
      return;
    }

    const lines = bulkData.names.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length === 0) {
      alert('Digite ou cole pelo menos um nome.');
      setLoading(false);
      return;
    }

    const inserts = lines.map(line => {
      // Basic parsing: split by comma to extract name and allowed_companions
      const parts = line.split(',');
      const guestName = parts[0].trim();
      let allowed_companions = 0;
      
      if (parts.length > 1) {
        const limit = parseInt(parts[1].trim());
        if (!isNaN(limit)) {
          allowed_companions = limit;
        }
      }

      return {
        name: guestName,
        event_id: bulkData.event_id,
        allowed_companions: allowed_companions,
        companions: 0,
        status: bulkData.status,
      };
    });

    const { error } = await supabase.from('guests').insert(inserts);

    if (!error) {
      alert(`${inserts.length} convidados adicionados com sucesso!`);
      router.push(`/dashboard/rsvp?event_id=${bulkData.event_id}`);
      router.refresh();
    } else {
      console.error(error);
      alert('Erro ao salvar em lote: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Adicionar Convidados</CardTitle>
            <CardDescription className="mt-1">
              Adicione individualmente com detalhes ou cole uma lista inteira de uma vez.
            </CardDescription>
          </div>
        </div>
        
        <div className="flex bg-zinc-100 p-1 rounded-md mt-6 w-full max-w-sm">
          <button 
            type="button"
            className={`flex-1 py-1.5 text-sm font-medium rounded-sm transition-all ${activeTab === 'single' ? 'bg-white shadow text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'}`}
            onClick={() => setActiveTab('single')}
          >
            Individual
          </button>
          <button 
            type="button"
            className={`flex-1 py-1.5 text-sm font-medium rounded-sm transition-all ${activeTab === 'bulk' ? 'bg-white shadow text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'}`}
            onClick={() => setActiveTab('bulk')}
          >
            Importar em Lote
          </button>
        </div>
      </CardHeader>

      {activeTab === 'single' ? (
        <form onSubmit={handleSingleSubmit}>
          <CardContent className="grid gap-6 pt-2">
            <div className="grid gap-2">
              <Label htmlFor="event_id">Evento *</Label>
              <select 
                id="event_id" 
                name="event_id" 
                required
                value={formData.event_id} 
                onChange={handleSingleChange}
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900 md:text-sm"
              >
                <option value="">(Selecione um evento)</option>
                {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Nome do Convidado (Titular) *</Label>
              <Input id="name" name="name" required value={formData.name} onChange={handleSingleChange} placeholder="Ex: Família Souza" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">WhatsApp / Telefone</Label>
                <Input id="phone" name="phone" value={formData.phone} onChange={handleSingleChange} placeholder="(00) 00000-0000" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleSingleChange} placeholder="email@exemplo.com" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="allowed_companions">Limite de Acompanhantes (Cota)</Label>
                <Input id="allowed_companions" name="allowed_companions" type="number" min="0" value={formData.allowed_companions} onChange={handleSingleChange} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status da Presença</Label>
                <select 
                  id="status" 
                  name="status" 
                  value={formData.status} 
                  onChange={handleSingleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900 md:text-sm"
                >
                  <option value="pending">Pendente (Aguardando Resposta)</option>
                  <option value="confirmed">Confirmado</option>
                  <option value="declined">Ausente (Recusou)</option>
                </select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t p-6">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
            <Button type="submit" className="bg-zinc-900 text-gold-50" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Convidado'}
            </Button>
          </CardFooter>
        </form>
      ) : (
        <form onSubmit={handleBulkSubmit}>
          <CardContent className="grid gap-6 pt-2">
            <div className="grid gap-2">
              <Label htmlFor="bulk_event_id">Evento *</Label>
              <select 
                id="bulk_event_id" 
                name="event_id" 
                required
                value={bulkData.event_id} 
                onChange={handleBulkChange}
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900 md:text-sm"
              >
                <option value="">(Selecione um evento)</option>
                {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="names">Nomes dos Convidados e Limites (Um por linha)</Label>
              <Textarea 
                id="names" 
                name="names" 
                required 
                value={bulkData.names} 
                onChange={handleBulkChange} 
                placeholder="Exemplo:&#10;João Silva, 2&#10;Maria Santos&#10;Família Oliveira, 4" 
                className="min-h-[200px] resize-y"
              />
              <p className="text-xs text-muted-foreground mt-1">Dica: Adicione uma vírgula e um número após o nome para definir a cota de acompanhantes. Ex: "João Silva, 2".</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bulk_status">Status Inicial (Para Todos)</Label>
              <select 
                id="bulk_status" 
                name="status" 
                value={bulkData.status} 
                onChange={handleBulkChange}
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900 md:text-sm"
              >
                <option value="pending">Pendente (Aguardando Resposta)</option>
                <option value="confirmed">Confirmado (Convidados Vips)</option>
              </select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t p-6">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
            <Button type="submit" className="bg-zinc-900 text-gold-50" disabled={loading}>
              {loading ? 'Importando...' : 'Importar Lista'}
            </Button>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}
