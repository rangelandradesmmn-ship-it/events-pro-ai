import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Calendar, Clock, MapPin, User, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { revalidatePath } from 'next/cache';
import { GoogleCalendarButton } from '@/components/meetings/gcal-button';

export default async function MeetingsPage() {
  const supabase = await createClient();
  
  const { data: meetings } = await supabase
    .from('meetings')
    .select('*, clients(full_name), events(title)')
    .order('date', { ascending: true })
    .order('start_time', { ascending: true });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'completed': return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="mr-1 h-3 w-3" /> Concluída</Badge>;
      case 'cancelled': return <Badge className="bg-red-100 text-red-800"><XCircle className="mr-1 h-3 w-3" /> Cancelada</Badge>;
      case 'scheduled': return <Badge className="bg-blue-100 text-blue-800"><Calendar className="mr-1 h-3 w-3" /> Agendada</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  async function completeMeeting(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    const supabaseServer = await createClient();
    await supabaseServer.from('meetings').update({ status: 'completed' }).eq('id', id);
    revalidatePath('/dashboard/meetings');
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reuniões</h1>
          <p className="text-muted-foreground mt-1">Sua agenda de compromissos com clientes e fornecedores.</p>
        </div>
        <div>
          <Link href="/dashboard/meetings/new">
            <Button className="bg-zinc-900 text-gold-50 hover:bg-zinc-800">
              <Plus className="mr-2 h-4 w-4" /> Nova Reunião
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {meetings && meetings.length > 0 ? (
          meetings.map((meeting) => (
            <Card key={meeting.id} className={`overflow-hidden hover:shadow-md transition-shadow ${meeting.status === 'completed' ? 'opacity-70' : ''}`}>
              <CardHeader className="bg-zinc-50 border-b pb-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center text-sm font-medium text-zinc-900">
                    <Calendar className="mr-2 h-4 w-4 text-gold-500" />
                    {new Date(meeting.date + 'T12:00:00Z').toLocaleDateString('pt-BR')}
                  </div>
                  {getStatusBadge(meeting.status)}
                </div>
                <CardTitle className="text-xl line-clamp-1">{meeting.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 grid gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 text-zinc-400" />
                  <span>{meeting.start_time.substring(0, 5)} {meeting.end_time && `- ${meeting.end_time.substring(0, 5)}`}</span>
                </div>
                
                {meeting.clients && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4 text-zinc-400" />
                    <span className="truncate">{meeting.clients.full_name}</span>
                  </div>
                )}

                {meeting.location && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 text-zinc-400" />
                    <span className="truncate">{meeting.location}</span>
                  </div>
                )}
                
                <div className="mt-2">
                  <GoogleCalendarButton 
                    title={meeting.title}
                    date={meeting.date}
                    startTime={meeting.start_time}
                    location={meeting.location}
                    details={meeting.clients?.full_name ? `Reunião com: ${meeting.clients.full_name}` : 'Reunião Luxe Events'}
                  />
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Link href={`/dashboard/meetings/${meeting.id}/edit`} className="w-full">
                    <Button variant="outline" size="sm" className="w-full text-xs h-8">
                      Editar
                    </Button>
                  </Link>
                  {meeting.status === 'scheduled' && (
                    <form action={completeMeeting} className="w-full">
                      <input type="hidden" name="id" value={meeting.id} />
                      <Button type="submit" variant="outline" size="sm" className="w-full text-xs h-8 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200">
                        Concluir
                      </Button>
                    </form>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl">
            <h3 className="text-lg font-medium text-zinc-900">Sua agenda está livre</h3>
            <p className="text-muted-foreground mt-1 mb-4">Você não tem nenhuma reunião marcada.</p>
            <Link href="/dashboard/meetings/new">
              <Button variant="outline">Agendar Primeira Reunião</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
