import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Users, CheckCircle2, XCircle, Clock, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { revalidatePath } from 'next/cache';
import { CopyInviteLinkButton } from '@/components/rsvp/copy-link-button';

export default async function RsvpPage({ searchParams }: { searchParams: Promise<{ event_id?: string }> }) {
  const supabase = await createClient();
  const resolvedParams = await searchParams;
  const eventId = resolvedParams.event_id;
  
  // Fetch events for the selector
  const { data: events } = await supabase.from('events').select('id, title').order('date');

  // Fetch guests (filtered by event if selected)
  let query = supabase.from('guests').select('*, events(title)').order('name');
  if (eventId) {
    query = query.eq('event_id', eventId);
  }
  const { data: guests } = await query;

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'confirmed': return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="mr-1 h-3 w-3" /> Confirmado</Badge>;
      case 'declined': return <Badge className="bg-red-100 text-red-800"><XCircle className="mr-1 h-3 w-3" /> Ausente</Badge>;
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="mr-1 h-3 w-3" /> Pendente</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  async function updateStatus(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    const status = formData.get('status') as string;
    const supabaseServer = await createClient();
    await supabaseServer.from('guests').update({ status }).eq('id', id);
    revalidatePath('/dashboard/rsvp');
  }

  async function deleteGuest(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    const supabaseServer = await createClient();
    await supabaseServer.from('guests').delete().eq('id', id);
    revalidatePath('/dashboard/rsvp');
  }

  // Calculate totals
  const totalGuests = guests?.length || 0;
  const totalCompanions = guests?.reduce((acc, g) => acc + (g.companions || 0), 0) || 0;
  const confirmedCount = guests?.filter(g => g.status === 'confirmed').length || 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">RSVP & Convidados</h1>
          <p className="text-muted-foreground mt-1">Gerencie a lista de presença e os acompanhantes.</p>
        </div>
        <div>
          <Link href={`/dashboard/rsvp/new${eventId ? `?event_id=${eventId}` : ''}`}>
            <Button className="bg-zinc-900 text-gold-50 hover:bg-zinc-800">
              <Plus className="mr-2 h-4 w-4" /> Adicionar Convidado
            </Button>
          </Link>
        </div>
      </div>

      {/* Event Selector */}
      <Card className="bg-zinc-50 border-dashed">
        <CardContent className="p-4 flex items-center gap-4">
          <Users className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium">Filtrar por Evento:</span>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <Link href="/dashboard/rsvp">
              <Badge variant={!eventId ? "default" : "outline"} className={!eventId ? "bg-zinc-900" : "bg-white"}>
                Todos
              </Badge>
            </Link>
            {events?.map(ev => (
              <Link key={ev.id} href={`/dashboard/rsvp?event_id=${ev.id}`}>
                <Badge variant={eventId === ev.id ? "default" : "outline"} className={eventId === ev.id ? "bg-zinc-900" : "bg-white"}>
                  {ev.title}
                </Badge>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Convites Enviados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGuests}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Presenças Confirmadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{confirmedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Estimado de Pessoas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gold-600">{totalGuests + totalCompanions}</div>
            <p className="text-xs text-muted-foreground">Incluindo acompanhantes</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Convidados</CardTitle>
        </CardHeader>
        <CardContent>
          {guests && guests.length > 0 ? (
            <div className="rounded-md border">
              <table className="w-full text-sm text-left">
                <thead className="bg-zinc-50 border-b">
                  <tr>
                    <th className="px-4 py-3 font-medium text-zinc-600">Nome do Convidado</th>
                    {!eventId && <th className="px-4 py-3 font-medium text-zinc-600">Evento</th>}
                    <th className="px-4 py-3 text-center font-semibold text-zinc-600">Cota (Acomp.)</th>
                    <th className="px-4 py-3 font-semibold text-zinc-600">Status de Presença</th>
                    <th className="px-4 py-3 text-right font-semibold text-zinc-600">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {guests.map((g) => (
                    <tr key={g.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-zinc-900">{g.name}</div>
                        {(g.phone || g.email) && (
                          <div className="text-xs text-muted-foreground">{g.phone} {g.email}</div>
                        )}
                      </td>
                      {!eventId && (
                        <td className="px-4 py-3 text-sm text-zinc-600">
                          {g.events?.title || '-'}
                        </td>
                      )}
                      <td className="px-4 py-3 text-center font-medium">
                        <Badge variant="outline" className="bg-zinc-50">
                          {g.companions} / {g.allowed_companions || 0}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(g.status)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {g.status !== 'confirmed' && (
                            <form action={updateStatus}>
                              <input type="hidden" name="id" value={g.id} />
                              <input type="hidden" name="status" value="confirmed" />
                              <Button type="submit" size="sm" variant="ghost" className="h-7 text-xs text-green-600 hover:text-green-700 hover:bg-green-50">
                                Confirmar
                              </Button>
                            </form>
                          )}
                          {g.status !== 'declined' && (
                            <form action={updateStatus}>
                              <input type="hidden" name="id" value={g.id} />
                              <input type="hidden" name="status" value="declined" />
                              <Button type="submit" size="sm" variant="ghost" className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50">
                                Recusar
                              </Button>
                            </form>
                          )}
                          <CopyInviteLinkButton token={g.token} />
                          <form action={deleteGuest}>
                            <input type="hidden" name="id" value={g.id} />
                            <Button type="submit" size="icon" variant="ghost" className="h-7 w-7 text-zinc-400 hover:text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
              <Users className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
              <p>Nenhum convidado nesta lista.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
