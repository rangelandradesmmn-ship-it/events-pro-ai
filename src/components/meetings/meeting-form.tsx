'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

export function MeetingForm({ meetingId, initialData }: { meetingId?: string, initialData?: any }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    client_id: initialData?.client_id || '',
    date: initialData?.date || '',
    start_time: initialData?.start_time ? initialData.start_time.substring(0, 5) : '',
    end_time: initialData?.end_time ? initialData.end_time.substring(0, 5) : '',
    location: initialData?.location || '',
    description: initialData?.description || '',
    status: initialData?.status || 'scheduled',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      title: formData.title,
      client_id: formData.client_id || null,
      date: formData.date,
      start_time: formData.start_time,
      end_time: formData.end_time || null,
      location: formData.location || null,
      description: formData.description || null,
      status: formData.status,
    };

    let error;
    if (meetingId) {
      const { error: updateError } = await supabase.from('meetings').update(payload).eq('id', meetingId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('meetings').insert(payload);
      error = insertError;
    }

    if (!error) {
      router.push('/dashboard/meetings');
      router.refresh();
    } else {
      console.error(error);
      alert('Erro ao agendar reunião: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Agendar Reunião</CardTitle>
        <CardDescription>Marque um novo compromisso na sua agenda.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="title">Assunto / Título *</Label>
            <Input id="title" name="title" required value={formData.title} onChange={handleChange} placeholder="Ex: Reunião de Alinhamento de Decoração" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="client_id">Cliente Associado</Label>
            <select 
              id="client_id" 
              name="client_id" 
              value={formData.client_id} 
              onChange={handleChange}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
            >
              <option value="">(Nenhum cliente específico)</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.full_name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Data *</Label>
              <Input id="date" name="date" type="date" required value={formData.date} onChange={handleChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="start_time">Horário Início *</Label>
              <Input id="start_time" name="start_time" type="time" required value={formData.start_time} onChange={handleChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end_time">Horário Fim</Label>
              <Input id="end_time" name="end_time" type="time" value={formData.end_time} onChange={handleChange} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="location">Local / Link da Chamada</Label>
            <Input id="location" name="location" value={formData.location} onChange={handleChange} placeholder="Ex: Google Meet ou Escritório Central" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Pauta / Observações</Label>
            <textarea 
              id="description" 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Descreva o que será discutido..."
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-6">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" className="bg-zinc-900 text-gold-50" disabled={loading}>
            {loading ? 'Agendando...' : 'Agendar Reunião'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
