import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FileUploader } from '@/components/clients/file-uploader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, MapPin, Calendar, FileText, File, Edit, MessageSquare, DollarSign, CheckCircle2, Clock } from 'lucide-react';
import { CopyPortalLinkButton } from '@/components/clients/copy-portal-button';

export default async function ClientProfilePage({ params, searchParams }: { params: { id: string }, searchParams: { [key: string]: string | string[] | undefined } }) {
  const supabase = await createClient();
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const currentTab = typeof resolvedSearchParams.tab === 'string' ? resolvedSearchParams.tab : 'overview';
  
  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !client) {
    notFound();
  }

  // Fetch contracts for this client
  const { data: contracts } = await supabase
    .from('contracts')
    .select('*')
    .eq('client_id', id)
    .order('created_at', { ascending: false });

  // Fetch events for this client
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('client_id', id)
    .order('date', { ascending: false });

  // Fetch files for this client
  const { data: files } = await supabase
    .from('client_files')
    .select('*')
    .eq('client_id', id)
    .order('created_at', { ascending: false });

  // Fetch transactions (finance)
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('client_id', id)
    .order('due_date', { ascending: false });

  // Fetch meetings
  const { data: meetings } = await supabase
    .from('meetings')
    .select('*, events(title)')
    .eq('client_id', id)
    .order('date', { ascending: false });

  // Fetch partners (Bride/Groom)
  const eventIds = events?.map(e => e.id) || [];
  let eventPartners: any[] = [];
  if (eventIds.length > 0) {
    const { data: partners } = await supabase
      .from('event_partners')
      .select('*')
      .in('event_id', eventIds);
    eventPartners = partners || [];
  }

  // Financial calculations
  const totalBilled = transactions?.reduce((acc, t) => acc + (t.amount || 0), 0) || 0;
  const totalPaid = transactions?.filter(t => t.status === 'paid').reduce((acc, t) => acc + (t.amount || 0), 0) || 0;
  const totalPending = totalBilled - totalPaid;

  const totalAmount = contracts?.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0;
  const receivedAmount = transactions?.filter(t => t.status === 'paid' && t.type === 'income').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0;

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-10">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F9F0EE] text-[#A86F6B] font-bold text-2xl shadow-sm">
            {client.full_name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">{client.full_name}</h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <span className="bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">
                Cliente desde {new Date(client.created_at).getFullYear()}
              </span>
              {client.cpf && <span>CPF: {client.cpf}</span>}
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {client.whatsapp && (
            <a href={`https://wa.me/55${client.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">
              <Button variant="outline" className="text-green-700 border-green-200 hover:bg-green-50 h-9">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/></svg>
                WhatsApp
              </Button>
            </a>
          )}
          {client.email && (
            <a href={`mailto:${client.email}`}>
              <Button variant="outline" className="text-blue-700 border-blue-200 hover:bg-blue-50 h-9">
                <Mail className="mr-2 h-4 w-4" /> E-mail
              </Button>
            </a>
          )}
          {client.token && (
            <div className="w-auto">
              <CopyPortalLinkButton token={client.token} />
            </div>
          )}
          <Button variant="outline" className="h-9">
            <Edit className="mr-2 h-4 w-4" /> Editar
          </Button>
        </div>
      </div>

      <Tabs defaultValue={currentTab} className="w-full overflow-x-auto">
        <TabsList className="grid w-[900px] grid-cols-7 mb-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="fichas">Fichas (Noivos)</TabsTrigger>
          <TabsTrigger value="events">Eventos</TabsTrigger>
          <TabsTrigger value="contracts">Contratos</TabsTrigger>
          <TabsTrigger value="financials">Financeiro</TabsTrigger>
          <TabsTrigger value="meetings">Reuniões</TabsTrigger>
          <TabsTrigger value="files">Arquivos</TabsTrigger>
        </TabsList>

        <TabsContent value="fichas" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Fichas dos Noivos</CardTitle>
              <CardDescription>Informações coletadas pelo Portal do Cliente.</CardDescription>
            </CardHeader>
            <CardContent>
              {eventPartners && eventPartners.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {eventPartners.map(partner => (
                    <div key={partner.id} className="border border-zinc-200 rounded-lg p-5">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-lg text-zinc-900 capitalize">{partner.role}</h4>
                        <span className="text-xs bg-zinc-100 px-2 py-1 rounded text-zinc-600">{partner.full_name}</span>
                      </div>
                      <div className="space-y-2 text-sm text-zinc-700">
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Telefone:</span>
                          <span className="font-medium">{partner.phone || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Email:</span>
                          <span className="font-medium">{partner.email || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Data de Nascimento:</span>
                          <span className="font-medium">{partner.birth_date ? new Date(partner.birth_date).toLocaleDateString('pt-BR') : '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">CPF:</span>
                          <span className="font-medium">{partner.cpf || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">RG:</span>
                          <span className="font-medium">{partner.rg || '-'}</span>
                        </div>
                        <div className="pt-2 border-t mt-2">
                          <p className="text-zinc-500 mb-1">Filiação:</p>
                          <p className="font-medium">{partner.mother_name || '-'}</p>
                          <p className="font-medium">{partner.father_name || '-'}</p>
                        </div>
                        {partner.notes && (
                          <div className="pt-2 border-t mt-2">
                            <p className="text-zinc-500 mb-1">Observações:</p>
                            <p className="text-sm italic text-zinc-600">{partner.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                  Nenhuma ficha preenchida ainda pelos clientes.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Informações de Contato</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                {client.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <span>{client.email}</span>
                  </div>
                )}
                {client.whatsapp && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-green-600" />
                    <span>{client.whatsapp} (WhatsApp)</span>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span>{client.phone}</span>
                  </div>
                )}
                {client.address && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <span>{client.address}</span>
                  </div>
                )}
                {client.cpf && (
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <span>CPF/CNPJ: {client.cpf}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Anotações do CRM</CardTitle>
                <CardDescription>Preferências, restrições e detalhes importantes sobre o cliente.</CardDescription>
              </CardHeader>
              <CardContent>
                <form action={async (formData: FormData) => {
                  'use server';
                  const notes = formData.get('notes') as string;
                  const supabaseServer = await createClient();
                  await supabaseServer.from('clients').update({ notes }).eq('id', id);
                  const { revalidatePath } = await import('next/cache');
                  revalidatePath(`/dashboard/clients/${id}`);
                }}>
                  <textarea 
                    name="notes" 
                    defaultValue={client.notes || ''} 
                    className="w-full min-h-[150px] p-3 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="Ex: Noiva tem alergia a glúten. Detesta a cor laranja. Melhor horário para reunião é sexta à tarde."
                  />
                  <div className="flex justify-end mt-2">
                    <Button type="submit" size="sm" className="bg-zinc-900 text-gold-50">Salvar Anotações</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financials" className="mt-6">
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Contratado</CardDescription>
                <CardTitle className="text-2xl text-zinc-900">R$ {totalBilled.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Valor Pago</CardDescription>
                <CardTitle className="text-2xl text-green-600">R$ {totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Saldo Pendente</CardDescription>
                <CardTitle className="text-2xl text-red-600">R$ {totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</CardTitle>
              </CardHeader>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Faturas</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions && transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-zinc-50 text-zinc-500 uppercase text-xs border-b">
                      <tr>
                        <th className="px-4 py-3">Descrição</th>
                        <th className="px-4 py-3">Vencimento</th>
                        <th className="px-4 py-3">Valor</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {transactions.map(t => (
                        <tr key={t.id} className="hover:bg-zinc-50">
                          <td className="px-4 py-3 font-medium">{t.description}</td>
                          <td className="px-4 py-3 text-zinc-500">{t.due_date ? new Date(t.due_date + 'T12:00:00Z').toLocaleDateString('pt-BR') : '-'}</td>
                          <td className="px-4 py-3 font-medium">R$ {t.amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          <td className="px-4 py-3">
                            {t.status === 'paid' ? (
                              <Badge className="bg-green-100 text-green-800 border-none">Pago</Badge>
                            ) : (
                              <Badge className="bg-yellow-100 text-yellow-800 border-none">Pendente</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                  Nenhuma fatura registrada para este cliente.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meetings" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Histórico de Reuniões</CardTitle>
                <CardDescription>Acompanhe todos os seus encontros com este cliente.</CardDescription>
              </div>
              <a href={`/dashboard/meetings/new?client_id=${client.id}`}>
                <Button size="sm" className="bg-zinc-900 text-gold-50">Agendar Reunião</Button>
              </a>
            </CardHeader>
            <CardContent>
              {meetings && meetings.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {meetings.map((meeting) => (
                    <div key={meeting.id} className="flex flex-col border border-zinc-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-zinc-900 line-clamp-1">{meeting.title}</h4>
                        {meeting.status === 'completed' ? (
                          <Badge className="bg-green-100 text-green-800 border-none"><CheckCircle2 className="mr-1 h-3 w-3" /> Concluída</Badge>
                        ) : meeting.status === 'scheduled' ? (
                          <Badge className="bg-blue-100 text-blue-800 border-none"><Clock className="mr-1 h-3 w-3" /> Agendada</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800 border-none">Cancelada</Badge>
                        )}
                      </div>
                      <div className="space-y-1 mt-2 text-sm text-zinc-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-zinc-400" />
                          <span>{new Date(meeting.date + 'T12:00:00Z').toLocaleDateString('pt-BR')} às {meeting.start_time?.substring(0, 5)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-zinc-400" />
                          <span className="truncate">{meeting.location || 'Local a definir'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                  Nenhuma reunião agendada.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Eventos do Cliente</CardTitle>
              <CardDescription>Histórico de todos os eventos associados.</CardDescription>
            </CardHeader>
            <CardContent>
              {events && events.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {events.map((event) => (
                    <div key={event.id} className="border border-zinc-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-zinc-900 text-lg line-clamp-1">{event.title}</h4>
                        <span className="text-xs uppercase font-bold tracking-wider px-2 py-1 rounded bg-gold-100 text-gold-800">{event.type}</span>
                      </div>
                      <div className="space-y-2 mt-4 text-sm text-zinc-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-zinc-400" />
                          <span>{event.date ? new Date(event.date + 'T12:00:00Z').toLocaleDateString('pt-BR') : 'A definir'} {event.time && `às ${event.time.substring(0, 5)}`}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-zinc-400" />
                          <span className="truncate">{event.location_name || 'Local a definir'}</span>
                        </div>
                      </div>
                      <Link href={`/dashboard/events`} className="mt-4 block">
                        <Button variant="outline" size="sm" className="w-full">
                          Ver Detalhes do Evento
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                  Nenhum evento vinculado a este cliente ainda.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contracts" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Contratos do Cliente</h3>
            <a href={`/dashboard/contracts/new?client_id=${client.id}`}>
              <Button size="sm" className="bg-zinc-900 text-gold-50">Gerar Novo Contrato</Button>
            </a>
          </div>

          {contracts && contracts.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {contracts.map((contract) => (
                <Card key={contract.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="bg-zinc-50 border-b pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-lg line-clamp-1">{contract.title}</CardTitle>
                      <span className="text-xs uppercase font-bold tracking-wider px-2 py-1 rounded bg-zinc-200">{contract.status}</span>
                    </div>
                    <CardDescription className="mt-1">
                      {new Date(contract.created_at).toLocaleDateString('pt-BR')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4 grid gap-3 text-sm">
                    <div className="flex items-center justify-between font-medium">
                      <span className="text-muted-foreground">Valor:</span>
                      <span className="text-green-600">
                        {contract.amount ? `R$ ${contract.amount}` : 'Não definido'}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Link href={`/dashboard/contracts/${contract.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <FileText className="mr-2 h-4 w-4" /> Visualizar
                        </Button>
                      </Link>
                      <form action={async (formData: FormData) => {
                        'use server';
                        const id = formData.get('contract_id') as string;
                        const supabaseServer = await createClient();
                        await supabaseServer.from('contracts').delete().eq('id', id);
                        const { revalidatePath } = await import('next/cache');
                        revalidatePath(`/dashboard/clients/${client.id}`);
                      }}>
                        <input type="hidden" name="contract_id" value={contract.id} />
                        <Button type="submit" variant="outline" size="sm" className="w-10 px-0 text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200" title="Excluir Contrato">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                        </Button>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent>
                <div className="py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg mt-6">
                  <FileText className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                  <p>Nenhum contrato gerado.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="files" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Repositório de Arquivos</CardTitle>
              <CardDescription>Faça upload de documentos, comprovantes ou fotos deste cliente.</CardDescription>
            </CardHeader>
            <CardContent>
              <FileUploader clientId={client.id} existingFiles={files || []} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
