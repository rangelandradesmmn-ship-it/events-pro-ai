import { createAdminClient as createClient } from '@/utils/supabase/admin';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Heart, Save, CheckCircle2, Plus, Trash2, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function ProtagonistsPage({ 
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

  // Fetch partners
  const { data: partners } = await supabase
    .from('event_partners')
    .select('*')
    .eq('event_id', event.id)
    .order('created_at', { ascending: true });

  const eventId = event.id;

  async function savePartner(formData: FormData) {
    'use server';
    const supabaseServer = await createClient();
    const partnerId = formData.get('partner_id') as string;
    
    const payload = {
      role: formData.get('role') as string,
      full_name: formData.get('full_name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      birth_date: formData.get('birth_date') as string || null,
      rg: formData.get('rg') as string,
      cpf: formData.get('cpf') as string,
      father_name: formData.get('father_name') as string,
      mother_name: formData.get('mother_name') as string,
    };

    if (partnerId && partnerId !== 'new') {
      await supabaseServer.from('event_partners').update(payload).eq('id', partnerId);
    } else {
      await supabaseServer.from('event_partners').insert({ ...payload, event_id: eventId });
    }

    revalidatePath(`/portal/${token}/protagonists`);
    redirect(`/portal/${token}/protagonists?success=true`);
  }

  async function deletePartner(formData: FormData) {
    'use server';
    const supabaseServer = await createClient();
    const partnerId = formData.get('partner_id') as string;
    if (partnerId && partnerId !== 'new') {
      await supabaseServer.from('event_partners').delete().eq('id', partnerId);
    }
    revalidatePath(`/portal/${token}/protagonists`);
  }

  async function addPartner() {
    'use server';
    const supabaseServer = await createClient();
    let r = 'Homenageado';
    if (event.type === 'Casamento') r = 'Noiva/Noivo';
    else if (event.type === 'Formatura') r = 'Formando';
    else if (event.type === 'Aniversário' || event.type === 'Festa Infantil') r = 'Aniversariante';

    await supabaseServer.from('event_partners').insert({ 
      event_id: eventId, 
      role: r,
      full_name: '' 
    });
    revalidatePath(`/portal/${token}/protagonists`);
  }

  let pageTitle = 'Ficha dos Homenageados';
  let defaultRole = 'Homenageado';
  let icon = <UserCircle className="h-8 w-8 text-[#A86F6B]" />;

  if (event.type === 'Casamento') { 
    pageTitle = 'Ficha dos Noivos'; 
    defaultRole = 'Noiva'; 
    icon = <Heart className="h-8 w-8 text-[#A86F6B]" />;
  }
  else if (event.type === 'Formatura') { 
    pageTitle = 'Ficha dos Formandos'; 
    defaultRole = 'Formando'; 
  }
  else if (event.type === 'Aniversário' || event.type === 'Festa Infantil') { 
    pageTitle = 'Ficha dos Aniversariantes'; 
    defaultRole = 'Aniversariante'; 
  }

  const displayPartners = partners && partners.length > 0 ? partners : [{ id: 'new', role: defaultRole }];

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 flex items-center gap-3">
          {icon}
          {pageTitle}
        </h1>
        <p className="text-muted-foreground mt-2">
          Preencha os dados com atenção. Eles serão utilizados em todos os contratos e alinhamentos de protocolo.
        </p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-2xl p-4 flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
          <div>
            <h3 className="font-bold text-green-900">Informações salvas com sucesso!</h3>
            <p className="text-sm mt-1 text-green-700">Os dados já foram enviados para a assessoria de forma segura.</p>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {displayPartners.map((partner, index) => (
          <div key={partner.id || index} className="bg-white border border-zinc-100 rounded-[32px] p-6 md:p-10 shadow-sm relative">
            {partner.id !== 'new' && (
              <form action={deletePartner} className="absolute top-6 right-6 md:top-10 md:right-10">
                <input type="hidden" name="partner_id" value={partner.id} />
                <button type="submit" className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" title="Remover pessoa">
                  <Trash2 className="h-5 w-5" />
                </button>
              </form>
            )}

            <form action={savePartner} className="space-y-6">
              <input type="hidden" name="partner_id" value={partner.id} />
              
              <div className="space-y-2 md:w-1/2">
                <label className="text-sm font-semibold text-zinc-900">Qual o papel no evento?</label>
                <input name="role" defaultValue={partner.role || defaultRole} required placeholder="Ex: Noiva, Noivo, Formando, Aniversariante" className="w-full h-11 px-4 border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-[#A86F6B] focus:border-transparent outline-none transition-all" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-zinc-900">Nome Completo</label>
                  <input name="full_name" defaultValue={partner.full_name || ''} required className="w-full h-11 px-4 border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-[#A86F6B] focus:border-transparent outline-none transition-all" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-900">Telefone / WhatsApp</label>
                  <input name="phone" defaultValue={partner.phone || ''} className="w-full h-11 px-4 border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-[#A86F6B] focus:border-transparent outline-none transition-all" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-900">Email</label>
                  <input name="email" type="email" defaultValue={partner.email || ''} className="w-full h-11 px-4 border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-[#A86F6B] focus:border-transparent outline-none transition-all" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-900">Data de Nascimento</label>
                  <input name="birth_date" type="date" defaultValue={partner.birth_date || ''} className="w-full h-11 px-4 border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-[#A86F6B] focus:border-transparent outline-none transition-all" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-900">RG</label>
                  <input name="rg" defaultValue={partner.rg || ''} className="w-full h-11 px-4 border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-[#A86F6B] focus:border-transparent outline-none transition-all" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-900">CPF</label>
                  <input name="cpf" defaultValue={partner.cpf || ''} className="w-full h-11 px-4 border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-[#A86F6B] focus:border-transparent outline-none transition-all" />
                </div>

                <div className="space-y-2 md:col-span-2 pt-4 border-t border-zinc-100">
                  <h3 className="font-bold text-zinc-900 mb-2">Filiação (Para o Protocolo da Cerimônia)</h3>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-900">Nome da Mãe</label>
                  <input name="mother_name" defaultValue={partner.mother_name || ''} className="w-full h-11 px-4 border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-[#A86F6B] focus:border-transparent outline-none transition-all" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-900">Nome do Pai</label>
                  <input name="father_name" defaultValue={partner.father_name || ''} className="w-full h-11 px-4 border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-[#A86F6B] focus:border-transparent outline-none transition-all" />
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-100 flex justify-end">
                <Button type="submit" className="rounded-full bg-[#A86F6B] text-white hover:bg-[#8d5c58] shadow-md shadow-[#A86F6B]/20 transition-all hover:scale-105 h-11 px-8">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Ficha
                </Button>
              </div>
            </form>
          </div>
        ))}
        
        {displayPartners.length > 0 && displayPartners[0].id !== 'new' && (
          <div className="flex justify-center mt-8">
            <form action={addPartner}>
              <Button type="submit" variant="outline" className="rounded-full border-2 border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 h-12 px-6 font-semibold transition-all">
                <Plus className="h-5 w-5 mr-2" />
                Adicionar mais uma pessoa
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
