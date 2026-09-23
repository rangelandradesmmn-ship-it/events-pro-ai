import { createClient } from '@/utils/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarDays, Plus, Clock, User, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function TimelinePage({ searchParams }: { searchParams: Promise<{ eventId?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const supabase = await createClient();

  const { data: events } = await supabase.from('events').select('id, title, date').order('date', { ascending: true });
  const currentEventId = resolvedSearchParams.eventId || (events && events.length > 0 ? events[0].id : null);

  // Server Actions
  async function addTimelineItem(formData: FormData) {
    'use server';
    const event_id = formData.get('event_id') as string;
    const time = formData.get('time') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const responsible = formData.get('responsible') as string;

    if (!time || !title) return;

    const supabaseServer = await createClient();
    await supabaseServer.from('event_timeline').insert({
      event_id, time, title, description, responsible
    });
    revalidatePath('/dashboard/timeline');
  }

  async function deleteItem(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    const supabaseServer = await createClient();
    await supabaseServer.from('event_timeline').delete().eq('id', id);
    revalidatePath('/dashboard/timeline');
  }

  if (!events || events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white border border-dashed rounded-lg h-96">
        <CalendarDays className="h-12 w-12 text-zinc-300 mb-4" />
        <h2 className="text-xl font-bold mb-2">Nenhum evento encontrado</h2>
        <Link href="/dashboard/events/new">
          <Button>Criar Evento</Button>
        </Link>
      </div>
    );
  }

  // Fetch Timeline
  const { data: timeline } = await supabase.from('event_timeline').select('*').eq('event_id', currentEventId).order('time', { ascending: true });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Cronograma do Grande Dia</h1>
          <p className="text-muted-foreground mt-1">O roteiro minuto a minuto do seu evento.</p>
        </div>
        <div className="flex gap-4">
           <select 
            className="flex h-10 w-64 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            defaultValue={currentEventId || ''}
          >
            {events.map(e => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Painel de Adicionar */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-4 pt-6">
              <h3 className="font-bold text-zinc-900 mb-4">Adicionar Horário</h3>
              <form action={addTimelineItem} className="space-y-4">
                <input type="hidden" name="event_id" value={currentEventId || ''} />
                
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-700">Horário</label>
                  <Input name="time" type="time" required />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-700">O que vai acontecer?</label>
                  <Input name="title" placeholder="Ex: Entrada da Noiva" required />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-700">Responsável (Fornecedor)</label>
                  <Input name="responsible" placeholder="Ex: Fotógrafo" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-700">Detalhes</label>
                  <Input name="description" placeholder="Anotações para a equipe" />
                </div>

                <Button type="submit" className="w-full bg-gold-600 hover:bg-gold-700 text-white">
                  <Plus className="h-4 w-4 mr-2" /> Inserir no Cronograma
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Linha do Tempo */}
        <div className="md:col-span-2 bg-white p-6 rounded-lg border border-zinc-200 min-h-[400px]">
          {timeline && timeline.length > 0 ? (
            <div className="relative border-l-2 border-gold-200 ml-4 space-y-8 py-4">
              {timeline.map(item => (
                <div key={item.id} className="relative pl-8 group">
                  <span className="absolute -left-[17px] top-1 h-8 w-8 rounded-full bg-gold-50 border-2 border-gold-400 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-gold-600" />
                  </span>
                  <Card className="border-zinc-200 shadow-sm transition-all hover:border-gold-300">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-lg font-bold text-gold-700">{item.time.substring(0, 5)}</span>
                          <h4 className="font-bold text-zinc-900 text-lg mt-1">{item.title}</h4>
                          {item.description && <p className="text-sm text-zinc-600 mt-2">{item.description}</p>}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {item.responsible && (
                            <div className="flex items-center text-xs font-medium text-zinc-600 bg-zinc-100 px-2 py-1 rounded-md">
                              <User className="h-3 w-3 mr-1" /> {item.responsible}
                            </div>
                          )}
                          <form action={deleteItem}>
                            <input type="hidden" name="id" value={item.id} />
                            <Button type="submit" size="icon" variant="ghost" className="h-6 w-6 text-zinc-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </form>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <Clock className="h-12 w-12 text-zinc-200 mb-4" />
                <h3 className="text-lg font-medium text-zinc-900">Nenhum evento no roteiro</h3>
                <p className="text-muted-foreground mt-1 max-w-sm text-sm">Adicione o primeiro horário usando o formulário ao lado.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
