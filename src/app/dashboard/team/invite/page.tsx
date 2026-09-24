import { createClient as createSupabaseServerClient } from '@/utils/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { redirect } from 'next/navigation';

export default async function InviteTeamPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  async function handleRealInvite(formData: FormData) {
    'use server';
    
    const authUser = (await (await createSupabaseServerClient()).auth.getUser()).data.user;
    const email = formData.get('email') as string;
    const name = formData.get('name') as string;
    const role = formData.get('role') as string;
    
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!serviceRoleKey) {
      redirect('/dashboard/team/invite?error=missing_key');
    }

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 1. Invita o usuário via Auth Admin
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { full_name: name, role: role }, redirectTo: (process.env.NEXT_PUBLIC_SITE_URL || 'https://eventsproai.com.br') + '/auth/callback'
    });

    if (inviteError) {
      console.error("Invite error:", inviteError);
      redirect('/dashboard/team/invite?error=invite_failed');
    }

    // 2. Atualiza o perfil forçadamente com a role (caso a trigger não faça)
    if (inviteData?.user) {
      await supabaseAdmin.from('profiles').update({
        full_name: name,
        role: role
      }).eq('id', inviteData.user.id); await supabaseAdmin.from('team_members').insert({ planner_id: authUser?.id as string, user_id: inviteData.user.id });
    }

    redirect('/dashboard/team?invite=success');
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Convidar Membro</h1>
        <p className="text-muted-foreground mt-1">Envie um e-mail com acesso ao sistema para seu funcionário.</p>
      </div>
      
      <div className="flex-1">
        <Card className="max-w-xl border-zinc-200 shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle>Dados do Novo Acesso</CardTitle>
            <CardDescription>O usuário receberá um link mágico no e-mail para definir a senha.</CardDescription>
          </CardHeader>
          <form action={handleRealInvite}>
            <CardContent className="grid gap-6">
              
              {resolvedSearchParams.error === 'missing_key' && (
                <div className="p-4 bg-red-50 text-red-800 text-sm rounded-xl border border-red-100 font-medium">
                  <strong>Erro:</strong> Chave SUPABASE_SERVICE_ROLE_KEY não configurada no arquivo .env.local.
                </div>
              )}
              
              {resolvedSearchParams.error === 'invite_failed' && (
                <div className="p-4 bg-red-50 text-red-800 text-sm rounded-xl border border-red-100 font-medium">
                  <strong>Erro:</strong> Falha ao enviar o convite. O e-mail pode já estar em uso ou o limite do Supabase foi atingido.
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="name" className="font-bold">Nome Completo</Label>
                <Input id="name" name="name" required placeholder="Ex: Carlos Assistente" className="h-10 rounded-xl" />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="email" className="font-bold">E-mail Profissional</Label>
                <Input id="email" name="email" type="email" required placeholder="carlos@seucerimonial.com.br" className="h-10 rounded-xl" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="role" className="font-bold">Nível de Permissão</Label>
                <select 
                  id="role" 
                  name="role" 
                  required
                  className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900 font-medium"
                >
                  <option value="admin">Administrador (Acesso Total)</option>
                  <option value="planner">Cerimonialista (Gerencia Eventos e Clientes)</option>
                  <option value="assistant">Assistente (Não vê Financeiro nem Contratos)</option>
                  <option value="team">Staff Operacional (Apenas Cronogramas, Mesas e Eventos)</option>
                </select>
              </div>
              
            </CardContent>
            <CardFooter className="flex justify-between border-t p-6 bg-zinc-50 rounded-b-2xl">
              <Link href="/dashboard/team">
                <Button type="button" variant="outline" className="rounded-xl h-10 font-bold px-6">Cancelar</Button>
              </Link>
              <Button type="submit" className="bg-zinc-900 text-white rounded-xl h-10 font-bold px-6 hover:bg-zinc-800 shadow-sm">
                Disparar E-mail Convite
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
