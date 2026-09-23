import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar, MapPin, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RsvpClientForm } from '@/components/rsvp/rsvp-client-form';

export const dynamic = 'force-dynamic';

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = await params;
  const token = resolvedParams.token;

  const supabase = await createClient();

  // Fetch guest by token
  const { data: guest } = await supabase
    .from('guests')
    .select('*, events(*)')
    .eq('token', token)
    .single();

  if (!guest) {
    notFound();
  }

  const event = guest.events;

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-serif font-bold text-zinc-900 tracking-tight">LUXE EVENTS</h1>
          <p className="text-sm text-gold-600 font-medium uppercase tracking-widest">Confirmação de Presença</p>
        </div>

        <Card className="border-none shadow-xl bg-white overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-gold-400 to-gold-600" />
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl font-serif mb-2">{event.title}</CardTitle>
            <CardDescription className="flex flex-col items-center gap-2 text-sm">
              {event.date && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-gold-500" />
                  {new Date(event.date + 'T12:00:00Z').toLocaleDateString('pt-BR')} 
                  {event.time && ` às ${event.time.substring(0, 5)}`}
                </span>
              )}
              {event.location_name && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-gold-500" />
                  {event.location_name}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 sm:px-8 pb-8 border-t pt-8">
            <div className="text-center mb-8">
              <h2 className="text-xl font-medium text-zinc-900">Olá, {guest.name}!</h2>
              {guest.status === 'confirmed' ? (
                <div className="mt-4 flex flex-col items-center justify-center p-4 bg-zinc-50 rounded-lg border border-zinc-100">
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold mb-4 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" /> Presença Confirmada!
                  </div>
                  <p className="text-sm text-zinc-600 mb-4">Apresente este QR Code na portaria do evento para agilizar seu check-in.</p>
                  <div className="p-2 bg-white rounded-xl shadow-sm border border-zinc-200">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${guest.token}`} 
                      alt="QR Code de Acesso" 
                      className="w-40 h-40"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground mt-2">
                  Você foi convidado(a) para este evento inesquecível. Por favor, confirme sua presença abaixo.
                </p>
              )}
            </div>

            <RsvpClientForm guest={guest} token={token} />

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
