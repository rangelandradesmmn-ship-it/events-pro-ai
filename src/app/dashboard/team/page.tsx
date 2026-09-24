import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Mail, Phone, ShieldCheck, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TeamActions } from '@/components/dashboard/team-actions';

export default async function TeamPage() {
  const supabase = await createClient();
  
  // Fetch profiles that are NOT clients (and exclude self for safety, but we'll just fetch all for now)
  const { data: teamMembers } = await supabase
    .from('profiles')
    .select('*')
    .neq('role', 'client')
    .order('role', { ascending: true })
    .order('full_name', { ascending: true });

  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'admin': return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Administrador</Badge>;
      case 'planner': return <Badge className="bg-gold-100 text-gold-800 border-gold-200">Cerimonialista</Badge>;
      case 'assistant': return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Assistente</Badge>;
      case 'team': return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Staff Operacional</Badge>;
      default: return <Badge>{role}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Equipe</h1>
          <p className="text-muted-foreground mt-1">Gerencie os acessos e permissões do seu time de cerimonial.</p>
        </div>
        <div>
          <Link href="/dashboard/team/invite">
            <Button className="bg-zinc-900 text-gold-50 hover:bg-zinc-800">
              <Plus className="mr-2 h-4 w-4" /> Convidar Membro
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teamMembers && teamMembers.length > 0 ? (
          teamMembers.map((member) => (
            <Card key={member.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="bg-zinc-50 border-b pb-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white border-2 border-gold-100 text-gold-700 font-bold text-lg">
                    {member.full_name ? member.full_name.substring(0, 2).toUpperCase() : 'US'}
                  </div>
                  {getRoleBadge(member.role)}
                </div>
                <CardTitle className="text-xl line-clamp-1">{member.full_name || 'Usuário Sem Nome'}</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 grid gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-zinc-400" />
                  <span>Acesso desde {new Date(member.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
                
                {member.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4 text-zinc-400" />
                    <span>{member.phone}</span>
                  </div>
                )}
                
                <TeamActions member={member} />
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl">
            <h3 className="text-lg font-medium text-zinc-900">Apenas você por aqui</h3>
            <p className="text-muted-foreground mt-1 mb-4">Parece que você ainda não convidou ninguém para o seu time.</p>
            <Link href="/dashboard/team/invite">
              <Button variant="outline">Convidar Primeiro Membro</Button>
            </Link>
          </div>
        )}
      </div>

      <Card className="mt-4 bg-gold-50 border-gold-200">
        <CardContent className="p-6 flex gap-4 items-start">
          <div className="p-2 bg-gold-100 rounded-full text-gold-700">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-semibold text-zinc-900 mb-1">Como funcionam os convites?</h4>
            <p className="text-sm text-zinc-700">
              Futuramente, ao clicar em "Convidar Membro", o sistema enviará um e-mail mágico para o seu funcionário. Ele criará uma senha e já entrará no sistema com as restrições que você definir (ex: Assistentes não podem ver o módulo Financeiro).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
