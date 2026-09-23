'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

export function EventForm({ userId, clients, initialData }: { userId: string, clients?: any[], initialData?: any }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    type: initialData?.type || 'Casamento',
    date: initialData?.date || '',
    time: initialData?.time ? initialData.time.substring(0, 5) : '',
    location_name: initialData?.location_name || '',
    address: initialData?.address || '',
    guest_count: initialData?.guest_count?.toString() || '',
    budget: initialData?.budget?.toString() || '',
    status: initialData?.status || 'planejamento',
    client_id: initialData?.client_id || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      title: formData.title,
      type: formData.type,
      date: formData.date || null,
      time: formData.time || null,
      location_name: formData.location_name,
      address: formData.address,
      guest_count: formData.guest_count ? parseInt(formData.guest_count) : null,
      budget: formData.budget ? parseFloat(formData.budget) : null,
      status: formData.status,
      client_id: formData.client_id || null,
      owner_id: userId,
    };

    let error;
    if (initialData?.id) {
      const { error: updateError } = await supabase.from('events').update(payload).eq('id', initialData.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('events').insert(payload);
      error = insertError;
    }

    if (!error) {
      router.push('/dashboard/events');
      router.refresh();
    } else {
      console.error(error);
      alert('Erro ao salvar evento: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Detalhes do Evento</CardTitle>
        <CardDescription>Preencha as informações básicas do novo evento.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="title">Nome do Evento *</Label>
            <Input id="title" name="title" required value={formData.title} onChange={handleChange} placeholder="Ex: Casamento João e Maria" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="client_id">Cliente Vinculado</Label>
            <select 
              id="client_id" 
              name="client_id" 
              value={formData.client_id} 
              onChange={handleChange}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            >
              <option value="">Selecione um Cliente (Opcional)</option>
              {clients?.map(c => (
                <option key={c.id} value={c.id}>{c.full_name}</option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="type">Tipo de Evento</Label>
              <select 
                id="type" 
                name="type" 
                value={formData.type} 
                onChange={handleChange}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              >
                <option value="Casamento">Casamento</option>
                <option value="Formatura">Formatura</option>
                <option value="Corporativo">Corporativo</option>
                <option value="Aniversario">Aniversário</option>
                <option value="Festa Infantil">Festa Infantil</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Fase Atual</Label>
              <select 
                id="status" 
                name="status" 
                value={formData.status} 
                onChange={handleChange}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              >
                <option value="planejamento">Planejamento</option>
                <option value="contratacao">Contratação</option>
                <option value="organizacao">Organização</option>
                <option value="confirmacao">Confirmação (RSVP)</option>
                <option value="execucao">Execução</option>
                <option value="finalizado">Finalizado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Data do Evento</Label>
              <Input id="date" name="date" type="date" value={formData.date} onChange={handleChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time">Horário</Label>
              <Input id="time" name="time" type="time" value={formData.time} onChange={handleChange} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="location_name">Nome do Local</Label>
            <Input id="location_name" name="location_name" value={formData.location_name} onChange={handleChange} placeholder="Ex: Espaço das Águas" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="guest_count">Qtd. Convidados</Label>
              <Input id="guest_count" name="guest_count" type="number" value={formData.guest_count} onChange={handleChange} placeholder="Ex: 150" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="budget">Orçamento Previsto (R$)</Label>
              <Input id="budget" name="budget" type="number" step="0.01" value={formData.budget} onChange={handleChange} placeholder="Ex: 50000.00" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-6">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" className="bg-zinc-900 text-gold-50" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Evento'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
