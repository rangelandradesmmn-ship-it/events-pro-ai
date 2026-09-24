import { createClient } from '@/utils/supabase/server';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Users, Download, Rotate3D } from 'lucide-react';
import Link from 'next/link';

import { PublishButton } from './publish-button';
import CeremonyMapWrapper from '@/components/3d/ceremony-map-wrapper';

export const metadata = {
  title: 'Mapa da CerimÃ´nia 3D | LUXE EVENTS',
};

export default async function Ceremony3DPage() {
  const supabase = await createClient();

  // Get active event and its guests
  // For this MVP, we'll just get the first event that has some guests, or default to a fake count
  const { data: events } = await supabase
    .from('events')
    .select('id, title, status, portal_published')
    .order('date', { ascending: true })
    .limit(1);

  const nearestEvent = events && events.length > 0 ? events[0] : null;
  let totalGuests = 0;

  if (nearestEvent) {
    const { data: guestsData } = await supabase
      .from('guests')
      .select('companions')
      .eq('event_id', nearestEvent.id);
      
    if (guestsData && guestsData.length > 0) {
      totalGuests = guestsData.length + guestsData.reduce((acc, g) => acc + (g.companions || 0), 0);
    }
  }

  return (
    <div className="flex flex-col max-w-6xl mx-auto pb-10 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="uppercase text-[11px] font-bold tracking-widest text-[#A86F6B]">A entrega que o casal nÃ£o espera</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-zinc-900 tracking-tight">
            VocÃª cadastrou os convidados. <br/>
            <span className="text-[#A86F6B] italic">O mapa da cerimÃ´nia jÃ¡ estÃ¡ pronto.</span>
          </h1>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/tables">
            <Button variant="outline" className="rounded-full h-11 px-6 font-medium border-zinc-200 text-zinc-700">
              Ver lista 2D
            </Button>
          </Link>
          {nearestEvent ? (
            <PublishButton 
              eventId={nearestEvent.id} 
              isPublished={nearestEvent.portal_published || false} 
            />
          ) : (
            <Button disabled className="rounded-full h-11 px-6 font-medium bg-[#A86F6B] opacity-50 text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Publicar no Portal
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
        
        {/* Left Side: Explanations */}
        <div className="lg:col-span-4 space-y-8">
          <p className="text-zinc-600 text-[15px] leading-relaxed">
            A mesma lista que vocÃª colou no passo 2 vira o mapa de assentos sozinha â€” lado da noiva, lado do noivo, fileira por fileira. VocÃª ajusta o que quiser arrastando, e o casal abre o portal e vÃª exatamente onde cada convidado vai sentar.
          </p>

          <div className="space-y-6">
            <div className="flex gap-3">
              <CheckCircle2 className="h-5 w-5 text-[#A86F6B] shrink-0" />
              <div>
                <strong className="text-sm text-zinc-900 block mb-0.5">Nasce dos convidados</strong>
                <span className="text-sm text-zinc-500">nada de montar assento por assento do zero.</span>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="h-5 w-5 text-[#A86F6B] shrink-0" />
              <div>
                <strong className="text-sm text-zinc-900 block mb-0.5">2D para trabalhar, 3D para encantar</strong>
                <span className="text-sm text-zinc-500">a mesma informaÃ§Ã£o nas duas vistas.</span>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="h-5 w-5 text-[#A86F6B] shrink-0" />
              <div>
                <strong className="text-sm text-zinc-900 block mb-0.5">VocÃª decide quando publicar</strong>
                <span className="text-sm text-zinc-500">fica em rascunho atÃ© estar do seu jeito.</span>
              </div>
            </div>
          </div>
          
          <Card className="bg-[#FCFAFA] border-[#F9F0EE] shadow-none rounded-2xl">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center shrink-0 border border-zinc-100">
                <Users className="h-5 w-5 text-[#A86F6B]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Convidados Confirmados</p>
                <p className="text-xl font-bold text-zinc-900">{totalGuests} <span className="text-sm font-medium text-zinc-500">assentos gerados</span></p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: 3D Canvas */}
        <div className="lg:col-span-8">
          <CeremonyMapWrapper totalGuests={totalGuests} />
        </div>

      </div>
    </div>
  );
}

function CheckCircle2(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

