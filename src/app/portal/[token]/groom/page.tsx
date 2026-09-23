import { createAdminClient as createClient } from '@/utils/supabase/admin';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Heart, Save, CheckCircle2 } from 'lucide-react';

export default async function GroomPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ token: string }>,
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const token = resolvedParams.token;
  const success = resolvedSearchParams.success === 'true';
  
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

  // Fetch groom data
  const { data: groomData } = await supabase
    .from('event_partners')
    .select('*')
    .eq('event_id', event.id)
    .eq('role', 'noivo')
    .maybeSingle();

  const eventId = event.id;
  const groomDataId = groomData?.id || null;

  async function saveGroom(formData: FormData) {
    'use server';
    const supabaseServer = await createClient();
    
    const payload = {
      event_id: eventId,
      role: 'noivo',
      full_name: formData.get('full_name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      birth_date: formData.get('birth_date') as string || null,
      rg: formData.get('rg') as string,
      cpf: formData.get('cpf') as string,
      father_name: formData.get('father_name') as string,
      mother_name: formData.get('mother_name') as string,
      notes: formData.get('notes') as string,
    };

    if (groomDataId) {
      const { error } = await supabaseServer.from('event_partners').update(payload).eq('id', groomDataId);
      if (error) {
        console.error('Update error:', error);
        throw new Error(error.message);
      }
    } else {
      const { error } = await supabaseServer.from('event_partners').insert(payload);
      if (error) {
        console.error('Insert error:', error);
        throw new Error(error.message);
      }
    }
    
    redirect(`/portal/${token}/groom?success=true`);
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 flex items-center gap-3">
          <Heart className="h-8 w-8 text-[#A86F6B]" />
          Ficha do Noivo
        </h1>
        <p className="text-muted-foreground mt-2">
          Preencha seus dados com atenção. Eles serão utilizados em todos os contratos e alinhamentos de protocolo do casamento.
        </p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-2xl p-4 flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
          <div>
            <h3 className="font-bold text-green-900">Informações salvas com sucesso!</h3>
            <p className="text-sm mt-1 text-green-700">Seus dados já foram enviados para a assessoria de forma segura.</p>
          </div>
        </div>
      )}

      <div className="bg-white border border-zinc-100 rounded-[32px] p-6 md:p-10 shadow-sm">
        <form action={saveGroom} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-zinc-900">Nome Completo</label>
              <input name="full_name" defaultValue={groomData?.full_name || ''} required className="w-full h-11 px-4 border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-[#A86F6B] focus:border-transparent outline-none transition-all" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-900">Telefone / WhatsApp</label>
              <input name="phone" defaultValue={groomData?.phone || ''} required className="w-full h-11 px-4 border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-[#A86F6B] focus:border-transparent outline-none transition-all" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-900">Email</label>
              <input name="email" type="email" defaultValue={groomData?.email || ''} className="w-full h-11 px-4 border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-[#A86F6B] focus:border-transparent outline-none transition-all" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-900">Data de Nascimento</label>
              <input name="birth_date" type="date" defaultValue={groomData?.birth_date || ''} className="w-full h-11 px-4 border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-[#A86F6B] focus:border-transparent outline-none transition-all" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-900">RG</label>
              <input name="rg" defaultValue={groomData?.rg || ''} className="w-full h-11 px-4 border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-[#A86F6B] focus:border-transparent outline-none transition-all" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-900">CPF</label>
              <input name="cpf" defaultValue={groomData?.cpf || ''} required className="w-full h-11 px-4 border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-[#A86F6B] focus:border-transparent outline-none transition-all" />
            </div>

            <div className="space-y-2 md:col-span-2 pt-4 border-t border-zinc-100">
              <h3 className="font-bold text-zinc-900 mb-2">Filiação (Para o Protocolo da Cerimônia)</h3>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-900">Nome da Mãe</label>
              <input name="mother_name" defaultValue={groomData?.mother_name || ''} className="w-full h-11 px-4 border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-[#A86F6B] focus:border-transparent outline-none transition-all" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-900">Nome do Pai</label>
              <input name="father_name" defaultValue={groomData?.father_name || ''} className="w-full h-11 px-4 border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-[#A86F6B] focus:border-transparent outline-none transition-all" />
            </div>

            <div className="space-y-2 md:col-span-2 pt-4 border-t border-zinc-100">
              <label className="text-sm font-semibold text-zinc-900">Observações Adicionais (Restrições alimentares, alergias, local do making of)</label>
              <textarea name="notes" defaultValue={groomData?.notes || ''} rows={4} className="w-full p-4 border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-[#A86F6B] focus:border-transparent outline-none transition-all"></textarea>
            </div>
          </div>

          <div className="pt-6">
            <button type="submit" className="flex items-center justify-center w-full md:w-auto px-8 h-12 bg-[#A86F6B] hover:bg-[#8F5E5A] text-white rounded-full font-semibold transition-colors">
              <Save className="h-4 w-4 mr-2" />
              Salvar Informações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
