import { createAdminClient as createClient } from '@/utils/supabase/admin';
import { notFound } from 'next/navigation';
import { Users, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CsvUploader } from '@/components/portal/csv-uploader';

export default async function PortalGuestsPage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = await params;
  const token = resolvedParams.token;
  const supabase = await createClient();

  const { data: client } = await supabase
    .from('clients')
    .select('*, events(*)')
    .eq('token', token)
    .single();

  if (!client || !client.events || client.events.length === 0) {
    notFound();
  }
  
  const event = client.events[0];

  // Fetch guests for this event
  const { data: guests } = await supabase
    .from('guests')
    .select('*')
    .eq('event_id', event.id)
    .order('name', { ascending: true });

  const totalGuests = guests?.length || 0;
  const confirmedCount = guests?.filter(g => g.status === 'confirmed').length || 0;
  const pendingCount = guests?.filter(g => g.status === 'pending').length || 0;
  const declinedCount = guests?.filter(g => g.status === 'declined').length || 0;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 flex items-center gap-3">
          <Users className="h-8 w-8 text-[#A86F6B]" />
          Lista de Convidados
        </h1>
        <p className="text-muted-foreground mt-2">
          Acompanhe em tempo real as confirmações de presença do seu evento.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm text-center">
          <div className="text-3xl font-bold text-zinc-900">{totalGuests}</div>
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mt-1">Total de Convites</div>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-2xl p-6 shadow-sm text-center">
          <div className="text-3xl font-bold text-green-700">{confirmedCount}</div>
          <div className="text-xs font-semibold text-green-600 uppercase tracking-wider mt-1">Confirmados</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-6 shadow-sm text-center">
          <div className="text-3xl font-bold text-yellow-700">{pendingCount}</div>
          <div className="text-xs font-semibold text-yellow-600 uppercase tracking-wider mt-1">Pendentes</div>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 shadow-sm text-center">
          <div className="text-3xl font-bold text-red-700">{declinedCount}</div>
          <div className="text-xs font-semibold text-red-600 uppercase tracking-wider mt-1">Ausentes</div>
        </div>
      </div>

      <CsvUploader eventId={event.id} token={token} />

      <div className="bg-white border border-zinc-100 rounded-[32px] overflow-hidden shadow-sm">
        {guests && guests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-100 text-xs uppercase tracking-wider font-semibold text-zinc-500">
                  <th className="p-5 font-semibold">Nome do Convidado</th>
                  <th className="p-5 font-semibold">Email / Contato</th>
                  <th className="p-5 font-semibold text-right">Status de RSVP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {guests.map((guest) => (
                  <tr key={guest.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="p-5 font-medium text-zinc-900">{guest.name}</td>
                    <td className="p-5 text-sm text-zinc-500">{guest.phone || guest.email || '-'}</td>
                    <td className="p-5 text-right">
                      {guest.status === 'confirmed' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Confirmado
                        </span>
                      )}
                      {guest.status === 'pending' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold">
                          <Clock className="h-3.5 w-3.5" /> Pendente
                        </span>
                      )}
                      {guest.status === 'declined' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold">
                          <XCircle className="h-3.5 w-3.5" /> Ausente
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center">
            <div className="bg-zinc-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-zinc-300" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900">Nenhum convidado adicionado</h3>
            <p className="text-muted-foreground mt-1 max-w-sm mx-auto">
              A assessoria ainda não subiu a lista de convidados para o seu evento.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
