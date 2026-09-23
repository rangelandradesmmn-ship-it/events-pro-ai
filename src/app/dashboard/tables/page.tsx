import { createClient } from '@/utils/supabase/server';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users2, Plus, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { revalidatePath } from 'next/cache';
import { TableCard } from '@/components/tables/table-card';
import { UnassignedList } from '@/components/tables/unassigned-list';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function TablesPage({ searchParams }: { searchParams: Promise<{ eventId?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const supabase = await createClient();

  const { data: events } = await supabase.from('events').select('id, title, date').order('date', { ascending: true });
  
  const currentEventId = resolvedSearchParams.eventId || (events && events.length > 0 ? events[0].id : null);

  // Server Actions
  async function addTable(formData: FormData) {
    'use server';
    const event_id = formData.get('event_id') as string;
    const name = formData.get('name') as string;
    const capacity = parseInt(formData.get('capacity') as string) || 10;
    const shape = formData.get('shape') as string || 'round';
    
    if (!name || !event_id) return;

    const supabaseServer = await createClient();
    await supabaseServer.from('tables').insert({ event_id, name, capacity, shape });
    revalidatePath('/dashboard/tables');
  }

  async function assignGuest(formData: FormData) {
    'use server';
    const guest_id = formData.get('guest_id') as string;
    const table_id = formData.get('table_id') as string;
    const supabaseServer = await createClient();
    
    await supabaseServer.from('guests').update({ table_id: table_id || null }).eq('id', guest_id);
    revalidatePath('/dashboard/tables');
  }

  async function deleteTable(formData: FormData) {
    'use server';
    const table_id = formData.get('table_id') as string;
    const supabaseServer = await createClient();
    await supabaseServer.from('tables').delete().eq('id', table_id);
    revalidatePath('/dashboard/tables');
  }

  async function editTable(formData: FormData) {
    'use server';
    const table_id = formData.get('table_id') as string;
    const name = formData.get('name') as string;
    const capacity = parseInt(formData.get('capacity') as string);
    const shape = formData.get('shape') as string;
    const supabaseServer = await createClient();
    
    if (name && capacity && table_id) {
      await supabaseServer.from('tables').update({ name, capacity, shape }).eq('id', table_id);
      revalidatePath('/dashboard/tables');
    }
  }

  if (!events || events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white border border-dashed rounded-lg h-96">
        <Users2 className="h-12 w-12 text-zinc-300 mb-4" />
        <h2 className="text-xl font-bold mb-2">Nenhum evento encontrado</h2>
        <p className="text-muted-foreground mb-4">Crie um evento primeiro para organizar as mesas.</p>
        <Link href="/dashboard/events/new">
          <Button>Criar Evento</Button>
        </Link>
      </div>
    );
  }

  // Fetch Tables
  const { data: tables } = await supabase.from('tables').select('*').eq('event_id', currentEventId).order('created_at', { ascending: true });
  
  // Fetch Guests
  const { data: guests } = await supabase.from('guests').select('id, name, email, status, table_id, companions, companions_names').eq('event_id', currentEventId).in('status', ['confirmed', 'pending']);
  
  const unassignedGuests = guests?.filter(g => !g.table_id) || [];
  
  // Calcular totais incluindo acompanhantes
  const totalPeople = guests?.reduce((acc, g) => acc + 1 + (g.companions || 0), 0) || 0;
  const assignedPeople = guests?.filter(g => g.table_id).reduce((acc, g) => acc + 1 + (g.companions || 0), 0) || 0;
  const unassignedPeople = totalPeople - assignedPeople;

  const currentEvent = events.find(e => e.id === currentEventId);
  const formattedDate = currentEvent?.date 
    ? new Date(currentEvent.date + 'T12:00:00Z').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' }) 
    : '';

  const totalSeats = tables?.reduce((acc, t) => acc + (t.capacity || 0), 0) || 0;

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-black text-zinc-900 flex items-center gap-3">
            <span className="text-[#A86F6B]">🍴</span> Mesas de recepção
          </h1>
          <div className="flex items-center gap-2 mt-1.5 text-[15px] text-zinc-500 font-medium">
            <select 
              className="bg-transparent font-medium text-zinc-700 hover:text-zinc-900 focus:outline-none cursor-pointer p-0 border-none inline"
              defaultValue={currentEventId || ''}
            >
              {events.map(e => (
                <option key={e.id} value={e.id}>{e.title}</option>
              ))}
            </select>
            <span>•</span>
            <span>{formattedDate}</span>
          </div>
        </div>
        
        <form action={addTable} className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-zinc-200 shadow-sm">
          <input type="hidden" name="event_id" value={currentEventId || ''} />
          <Input name="name" placeholder="Nome (Ex: Mesa 1)" className="w-40 border-none shadow-none focus-visible:ring-0 px-3" required />
          <div className="w-px h-6 bg-zinc-200"></div>
          <Input name="capacity" type="number" placeholder="Lugares" className="w-24 border-none shadow-none focus-visible:ring-0 px-3" defaultValue="10" required />
          <Button type="submit" className="bg-[#A86F6B] hover:bg-[#8F5E5A] text-white rounded-xl font-bold px-6 h-10 shadow-sm">
            + Adicionar mesa
          </Button>
        </form>
      </div>

      {/* Metrics Row */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="rounded-[24px] border-zinc-200 shadow-sm bg-white">
            <CardHeader className="pb-1 pt-6 px-8">
              <CardTitle className="text-[13px] font-bold text-zinc-500 uppercase tracking-wider">Mesas</CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-6">
              <div className="text-[40px] font-black text-zinc-900 font-serif leading-none">{tables?.length || 0}</div>
            </CardContent>
          </Card>

          <Card className="rounded-[24px] border-zinc-200 shadow-sm bg-white">
            <CardHeader className="pb-1 pt-6 px-8">
              <CardTitle className="text-[13px] font-bold text-zinc-500 uppercase tracking-wider">Alocados</CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-6">
              <div className="text-[40px] font-black text-[#A86F6B] font-serif leading-none">
                {assignedPeople}<span className="text-2xl text-zinc-300">/{totalPeople}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[24px] border-zinc-200 shadow-sm bg-white">
            <CardHeader className="pb-1 pt-6 px-8">
              <CardTitle className="text-[13px] font-bold text-zinc-500 uppercase tracking-wider">Sem Mesa</CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-6">
              <div className="text-[40px] font-black text-orange-500 font-serif leading-none">{unassignedPeople}</div>
            </CardContent>
          </Card>
        </div>
        <p className="text-sm font-medium text-zinc-500 mt-4 px-2">Capacidade total: {totalSeats} lugares</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Painel Esquerdo: Lista de Convidados sem mesa */}
        <div className="xl:col-span-4 flex flex-col gap-4">
          <div className="bg-white border border-zinc-200 rounded-[24px] p-6 flex flex-col h-[600px] shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-full bg-[#F9F0EE] flex items-center justify-center shrink-0">
                <Users2 className="h-6 w-6 text-[#A86F6B]" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 text-lg">Convidados sem mesa</h3>
                <p className="text-sm text-zinc-500 font-medium">{totalPeople} pessoas • <span className="text-orange-500 font-bold">{unassignedPeople} sem mesa</span></p>
              </div>
            </div>
            
            <UnassignedList unassignedGuests={unassignedGuests} tables={tables || []} assignGuest={assignGuest} />
            
            {unassignedGuests.length > 5 && (
              <div className="pt-4 mt-2 border-t border-zinc-100 text-center">
                <span className="text-xs font-medium text-zinc-400">e mais {unassignedGuests.length - 5} convidados sem mesa</span>
              </div>
            )}
          </div>
        </div>

        {/* Painel Direito: Mesas Grid */}
        <div className="xl:col-span-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 content-start">
            {tables && tables.length > 0 ? tables.map(table => {
              const tableGuests = guests?.filter(g => g.table_id === table.id) || [];
              
              return (
                <TableCard 
                  key={table.id}
                  table={table}
                  tableGuests={tableGuests}
                  onDelete={deleteTable}
                  onEdit={editTable}
                  onUnassign={assignGuest}
                />
              );
            }) : (
              <div className="col-span-full flex flex-col items-center justify-center p-8 bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-3xl min-h-[400px]">
                <p className="text-zinc-500 font-medium mb-4">Ainda não há mesas configuradas para este evento.</p>
              </div>
            )}
            
            {/* Botão Extra de Adicionar Mesa no final do grid */}
            <form action={addTable} className="border-2 border-dashed border-amber-200 bg-amber-50/30 rounded-[24px] min-h-[300px] flex flex-col items-center justify-center text-center p-6 cursor-pointer hover:bg-amber-50/50 transition-colors relative">
               <input type="hidden" name="event_id" value={currentEventId || ''} />
               <input type="hidden" name="name" value={`Mesa ${(tables?.length || 0) + 1}`} />
               <input type="hidden" name="capacity" value="10" />
               <input type="hidden" name="shape" value="round" />
               <button type="submit" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-transparent">submit</button>
               <div className="h-10 w-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                 <Plus className="h-5 w-5" />
               </div>
               <h3 className="font-bold text-zinc-900">Adicionar mesa</h3>
               <p className="text-xs font-medium text-zinc-500 mt-1">Clique para criar automaticamente</p>
            </form>
          </div>
        </div>
      </div>
      
      <div className="pt-8 text-center border-t border-zinc-100">
        <p className="text-sm font-medium text-zinc-500">
          Trocou alguém de mesa na véspera? A lista, o check-in e o portal do casal já sabem. Você não atualiza três lugares — atualiza um.
        </p>
      </div>
    </div>
  );
}
