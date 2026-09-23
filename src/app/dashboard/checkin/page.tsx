import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { CheckinScanner } from '@/components/rsvp/checkin-scanner';
import { QrCode } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CheckinPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex flex-col gap-8 items-center max-w-3xl mx-auto py-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center p-3 bg-gold-100 rounded-full mb-4">
          <QrCode className="h-8 w-8 text-gold-700" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Portaria & Check-in</h1>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
          Utilize a câmera deste dispositivo para ler os QR Codes dos convidados e liberar a entrada.
        </p>
      </div>

      <div className="w-full mt-4">
        <CheckinScanner />
      </div>
    </div>
  );
}
