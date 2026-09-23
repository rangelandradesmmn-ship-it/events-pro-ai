import { createAdminClient as createClient } from '@/utils/supabase/admin';
import { notFound } from 'next/navigation';
import { Clock } from 'lucide-react';

export default async function PortalSchedulePage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = await params;
  const token = resolvedParams.token;
  const supabase = await createClient();

  const { data: client } = await supabase
    .from('clients')
    .select('*, events(*)')
    .eq('token', token)
    .single();

  if (!client) {
    notFound();
  }
  
  const event = client.events && client.events.length > 0 ? client.events[0] : null;
  
  if (!event) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto text-center mt-12">
        <p className="text-muted-foreground">Nenhum evento vinculado ao seu perfil.</p>
      </div>
    );
  }

  // Fetch Timeline
  const { data: timeline } = await supabase
    .from('event_timeline')
    .select('*')
    .eq('event_id', event.id)
    .order('time', { ascending: true });

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">Cronograma do Dia</h1>
        <p className="text-muted-foreground mt-1">Acompanhe o roteiro completo do seu evento.</p>
      </div>

      <div className="bg-white border border-zinc-100 rounded-[32px] p-6 md:p-12 shadow-sm">
        {timeline && timeline.length > 0 ? (
          <div className="space-y-8">
            {timeline.map(item => (
              <div key={item.id} className="flex gap-4 md:gap-10 group">
                <div className="w-16 md:w-20 font-bold text-[#A86F6B] text-lg md:text-xl pt-0.5 text-right flex-shrink-0">
                  {item.time.substring(0, 5)}
                </div>
                <div className="relative flex-1 pb-8 border-l-2 border-zinc-100 pl-8 md:pl-10 group-last:border-transparent group-last:pb-0">
                  <div className="absolute -left-[11px] top-1.5 h-5 w-5 rounded-full bg-white border-[3px] border-[#A86F6B]"></div>
                  <h4 className="font-semibold text-zinc-900 text-lg">{item.title}</h4>
                  {item.description && (
                    <p className="text-sm md:text-base text-zinc-500 mt-2 leading-relaxed">{item.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-zinc-50 p-6 rounded-full mb-6">
              <Clock className="h-10 w-10 text-zinc-300" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-2">Cronograma em andamento</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Sua assessoria está finalizando os detalhes dos horários do seu grande dia. Volte em breve!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
