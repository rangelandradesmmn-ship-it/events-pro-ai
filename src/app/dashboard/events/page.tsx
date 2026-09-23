import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Calendar as CalendarIcon, MapPin, Users, DollarSign, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { revalidatePath } from 'next/cache';

export default async function EventsPage() {
  const supabase = await createClient();

  async function deleteEvent(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    const supabaseServer = await createClient();
    await supabaseServer.from('events').delete().eq('id', id);
    revalidatePath('/dashboard/events');
  }
  
  const { data: events } = await supabase
    .from('events')
    .select('*, clients(full_name)')
    .order('date', { ascending: true });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'planejamento': 'bg-blue-100 text-blue-800',
      'contratacao': 'bg-purple-100 text-purple-800',
      'organizacao': 'bg-yellow-100 text-yellow-800',
      'confirmacao': 'bg-orange-100 text-orange-800',
      'execucao': 'bg-green-100 text-green-800',
      'finalizado': 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Eventos</h1>
          <p className="text-muted-foreground mt-1">Gerencie todos os seus eventos, casamentos e festas.</p>
        </div>
        <div className="flex gap-2">
          {/* Abaixo adicionaríamos botões para trocar visualização: Lista, Calendário, Kanban */}
          <Link href="/dashboard/events/new">
            <Button className="bg-zinc-900 text-gold-50 hover:bg-zinc-800">
              <Plus className="mr-2 h-4 w-4" /> Novo Evento
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events && events.length > 0 ? (
          events.map((event) => (
            <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="bg-zinc-50 border-b pb-4 group relative">
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/dashboard/events/${event.id}/edit`}>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-zinc-400 hover:text-zinc-900">
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </Link>
                  <form action={deleteEvent}>
                    <input type="hidden" name="id" value={event.id} />
                    <Button type="submit" size="icon" variant="ghost" className="h-7 w-7 text-zinc-400 hover:text-red-600">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </form>
                </div>
                <div className="flex justify-between items-start pt-2">
                  <Badge variant="outline" className="text-xs uppercase tracking-wider text-muted-foreground border-zinc-200">
                    {event.type}
                  </Badge>
                  <Badge className={`text-xs ${getStatusColor(event.status)} border-none shadow-none`}>
                    {event.status}
                  </Badge>
                </div>
                <CardTitle className="text-xl line-clamp-1">{event.title}</CardTitle>
                <CardDescription className="flex flex-col gap-1 mt-1 text-xs">
                  {event.clients && (
                    <span className="font-medium text-gold-600">Cliente: {event.clients.full_name}</span>
                  )}
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    {event.date ? new Date(event.date + 'T12:00:00Z').toLocaleDateString('pt-BR') : 'Data a definir'} 
                    {event.time && ` às ${event.time.substring(0, 5)}`}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 grid gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-gold-500" />
                  <span className="line-clamp-1">{event.location_name || 'Local a definir'}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4 text-gold-500" />
                    <span>{event.guest_count || 0} convidados</span>
                  </div>
                  <div className="flex items-center gap-1 font-medium">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    {event.budget ? `R$ ${event.budget}` : '---'}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl">
            <h3 className="text-lg font-medium text-zinc-900">Nenhum evento encontrado</h3>
            <p className="text-muted-foreground mt-1 mb-4">Você ainda não possui eventos cadastrados.</p>
            <Link href="/dashboard/events/new">
              <Button variant="outline">Cadastrar Primeiro Evento</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
