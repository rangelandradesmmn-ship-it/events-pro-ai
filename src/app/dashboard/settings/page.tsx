import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { SettingsForm } from './settings-form';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
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

  return (
    <div className="flex flex-col max-w-4xl mx-auto pb-10 space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-zinc-900">
          Configurações da Agência
        </h1>
        <p className="text-zinc-500 text-lg mt-2">
          Personalize a identidade visual do seu Portal do Cliente (White-label).
        </p>
      </div>

      <SettingsForm profile={profile} userId={user.id} />
    </div>
  );
}
