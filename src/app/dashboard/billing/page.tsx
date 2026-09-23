import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { BillingForm } from './billing-form';
import { CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const isSubscribed = 
    profile?.stripe_current_period_end && 
    new Date(profile.stripe_current_period_end) > new Date();

  const formattedDate = profile?.stripe_current_period_end 
    ? new Date(profile.stripe_current_period_end).toLocaleDateString('pt-BR') 
    : null;

  return (
    <div className="flex flex-col max-w-5xl mx-auto pb-10 space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-zinc-900">
          Assinatura e Pagamento
        </h1>
        <p className="text-zinc-500 text-lg mt-2">
          Gerencie o seu plano no Events Pro AI e tenha acesso ilimitado.
        </p>
      </div>

      {!isSubscribed && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
          <ShieldCheck className="h-6 w-6 text-red-600 shrink-0" />
          <div>
            <h3 className="font-bold text-red-900">Seu acesso está restrito</h3>
            <p className="text-red-700 text-sm mt-1">
              Assine um plano abaixo para desbloquear todas as funcionalidades, adicionar clientes ilimitados e usar o White-label.
            </p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Pricing Card */}
        <div className="bg-zinc-900 rounded-3xl p-8 text-white shadow-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sm font-semibold mb-6">
            <Zap className="h-4 w-4 text-gold-400" />
            Plano Pro
          </div>
          
          <div className="mb-6">
            <span className="text-5xl font-black">R$ 97</span>
            <span className="text-zinc-400 font-medium">/mês</span>
          </div>

          <p className="text-zinc-300 mb-8">
            Tudo o que você precisa para gerenciar sua assessoria e encantar seus noivos.
          </p>

          <ul className="space-y-4 mb-8">
            {[
              'Eventos e Casamentos ilimitados',
              'Portal dos Noivos (White-label)',
              'Gestão Financeira Completa',
              'Mapas de Mesas e Cerimônia 3D',
              'Controle de Convidados e Check-in QR',
              'Suporte prioritário',
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-zinc-200 font-medium">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                {feature}
              </li>
            ))}
          </ul>

          <BillingForm isSubscribed={!!isSubscribed} />
        </div>

        {/* Current Status */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-zinc-100 shadow-sm">
            <h3 className="text-xl font-bold text-zinc-900 mb-4">Status da Conta</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-zinc-100">
                <span className="text-zinc-500 font-medium">Plano Atual</span>
                {isSubscribed ? (
                  <span className="font-bold text-zinc-900">Plano Pro</span>
                ) : (
                  <span className="font-bold text-zinc-400">Gratuito / Expirado</span>
                )}
              </div>

              <div className="flex justify-between items-center py-3 border-b border-zinc-100">
                <span className="text-zinc-500 font-medium">Situação</span>
                {isSubscribed ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                    Ativo
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                    Inativo
                  </span>
                )}
              </div>

              {isSubscribed && formattedDate && (
                <div className="flex justify-between items-center py-3">
                  <span className="text-zinc-500 font-medium">Renova em</span>
                  <span className="font-bold text-zinc-900">{formattedDate}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
