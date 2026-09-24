import { createAdminClient as createClient } from '@/utils/supabase/admin';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import CeremonyMapWrapper from '@/components/3d/ceremony-map-wrapper';

export const dynamic = 'force-dynamic';

export default async function ClientPortalHomePage({ params }: { params: Promise<{ token: string }> }) {
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
  let journeySteps = [];
  let totalGuests = 0;

  if (event) {
    const { data: steps } = await supabase
      .from('event_journey_steps')
      .select('*')
      .eq('event_id', event.id)
      .order('step_order', { ascending: true });
    
    journeySteps = steps || [];
    
    // Count guests for 3D map including companions
    const { data: guestsData } = await supabase
      .from('guests')
      .select('companions')
      .eq('event_id', event.id);
      
    if (guestsData && guestsData.length > 0) {
      totalGuests = guestsData.length + guestsData.reduce((acc, g) => acc + (g.companions || 0), 0);
    }
  }

  const renderJourneyIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-6 w-6 text-green-500 bg-white" />;
      case 'current': return <div className="h-6 w-6 rounded-full bg-yellow-400 border-4 border-white shadow-sm" />;
      default: return <Circle className="h-6 w-6 text-zinc-300 bg-white" />;
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">VisÃ£o Geral</h1>
        <p className="text-muted-foreground mt-1">Acompanhe os detalhes e o progresso do seu evento.</p>
      </div>

      {event?.portal_published && totalGuests > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col mb-4">
            <h2 className="text-2xl font-serif font-bold text-zinc-900">Mapa da Cerimônia</h2>
            <p className="text-zinc-500 text-sm">O mapa de assentos configurado pela sua assessoria.</p>
          </div>
          <CeremonyMapWrapper totalGuests={totalGuests} />
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-zinc-200">
          <CardHeader>
            <CardTitle>Minha Jornada</CardTitle>
            <CardDescription>O passo a passo da construÃ§Ã£o do seu sonho.</CardDescription>
          </CardHeader>
          <CardContent>
            {journeySteps.length > 0 ? (
              <div className="relative border-l-2 border-zinc-200 ml-3 mt-4 space-y-6">
                {journeySteps.map((step: any, index: number) => (
                  <div key={step.id} className="relative pl-6">
                    <span className="absolute -left-[13px] top-1">
                      {renderJourneyIcon(step.status)}
                    </span>
                    <div>
                      <h4 className={`font-medium ${step.status === 'pending' ? 'text-zinc-400' : 'text-zinc-900'}`}>{step.title}</h4>
                      {step.status === 'current' && <p className="text-xs text-gold-600 font-medium mt-1">Fase Atual</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Jornada ainda não configurada pelo cerimonial.</p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-zinc-200 bg-[#F9F0EE]">
            <CardHeader>
              <CardTitle>Detalhes do Evento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {event ? (
                <>
                  <div>
                    <span className="text-xs font-bold text-[#A86F6B] uppercase tracking-widest">{event.type}</span>
                    <p className="text-lg font-bold text-zinc-900 mt-1">{event.title}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-zinc-500">Data</span>
                    <p className="font-medium text-zinc-900">{event.date ? new Date(event.date + 'T12:00:00Z').toLocaleDateString('pt-BR') : 'A definir'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-zinc-500">Local</span>
                    <p className="font-medium text-zinc-900">{event.location_name || 'A definir'}</p>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">Nenhum evento vinculado ao seu perfil.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

