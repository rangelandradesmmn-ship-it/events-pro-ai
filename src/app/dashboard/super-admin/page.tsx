import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Calendar, Users, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function SuperAdminPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Verify Super Admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_superadmin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_superadmin) {
    return (
      <div className="p-10">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Acesso Negado (Debug)</h1>
        <p>Parece que o banco de dados não está retornando is_superadmin = true para você.</p>
        <pre className="bg-zinc-100 p-4 mt-4 rounded-md overflow-auto text-sm">
          {JSON.stringify({ userId: user.id, profile }, null, 2)}
        </pre>
      </div>
    );
  }

  // Fetch all agencies (role = admin)
  const { data: agencies, error: agenciesError } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'admin')
    .order('created_at', { ascending: false });

  // Fetch all events across the platform
  const { count: totalEvents } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true });

  const totalAgencies = agencies?.length || 0;

  return (
    <div className="flex flex-col max-w-6xl mx-auto pb-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-red-100 rounded-xl flex items-center justify-center">
            <ShieldAlert className="h-5 w-5 text-red-600" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900">
            Sala de Comando
          </h1>
        </div>
        <p className="text-zinc-500 text-lg">
          Visão global do SaaS. Apenas você tem acesso a esta página.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-zinc-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">
              Assessorias Cadastradas
            </CardTitle>
            <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-zinc-900">{totalAgencies}</div>
            <p className="text-sm text-zinc-500 mt-2 font-medium">Agências ativas na plataforma</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">
              Eventos Gerenciados
            </CardTitle>
            <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Calendar className="h-5 w-5 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-zinc-900">{totalEvents || 0}</div>
            <p className="text-sm text-zinc-500 mt-2 font-medium">Casamentos/eventos criados pelas agências</p>
          </CardContent>
        </Card>
      </div>

      {/* Agencies List */}
      <Card className="border-zinc-100 shadow-sm overflow-hidden">
        <div className="border-b border-zinc-100 bg-zinc-50/50 p-6">
          <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-zinc-400" />
            Lista de Assessorias (Seus Clientes)
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white border-b border-zinc-100 text-zinc-500 font-medium">
              <tr>
                <th className="px-6 py-4">Nome do Dono / Agência</th>
                <th className="px-6 py-4">Contato</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Data de Cadastro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 bg-white">
              {agencies?.map((agency) => (
                <tr key={agency.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-zinc-900">{agency.full_name}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">ID: {agency.id.split('-')[0]}...</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-zinc-900">{agency.email || 'Email não registrado'}</div>
                    <div className="text-zinc-500">{agency.whatsapp || agency.phone || 'Sem telefone'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                      Ativo
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-600 font-medium">
                    {new Date(agency.created_at).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
              
              {(!agencies || agencies.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                    Nenhuma agência encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}
