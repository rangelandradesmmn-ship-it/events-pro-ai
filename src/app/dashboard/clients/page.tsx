import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Phone, Mail, FileText, User } from 'lucide-react';
import { CopyPortalLinkButton } from '@/components/clients/copy-portal-button';

export default async function ClientsPage() {
  const supabase = await createClient();
  
  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground mt-1">Gerencie a sua base de clientes e contratantes.</p>
        </div>
        <div>
          <Link href="/dashboard/clients/new">
            <Button className="bg-zinc-900 text-gold-50 hover:bg-zinc-800">
              <Plus className="mr-2 h-4 w-4" /> Novo Cliente
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {clients && clients.length > 0 ? (
          clients.map((client) => (
            <Card key={client.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="bg-zinc-50 border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-100 text-gold-700 font-bold">
                    {client.full_name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <CardTitle className="text-lg line-clamp-1">{client.full_name}</CardTitle>
                    {client.cpf && <p className="text-xs text-muted-foreground mt-0.5">CPF: {client.cpf}</p>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 grid gap-3 text-sm">
                {client.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4 text-gold-500" />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}
                {client.whatsapp && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4 text-green-600" />
                    <span>{client.whatsapp}</span>
                  </div>
                )}
                <div className="flex gap-2 mt-2 pt-4 border-t">
                  <Link href={`/dashboard/clients/${client.id}`} className="w-full">
                    <Button variant="outline" size="sm" className="w-full text-xs h-8">
                      <User className="mr-2 h-3 w-3" /> Perfil
                    </Button>
                  </Link>
                  <Link href={`/dashboard/clients/${client.id}?tab=contracts`} className="w-full">
                    <Button variant="outline" size="sm" className="w-full text-xs h-8">
                      <FileText className="mr-2 h-3 w-3" /> Contratos
                    </Button>
                  </Link>
                </div>
                {client.token && (
                  <CopyPortalLinkButton token={client.token} />
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl">
            <h3 className="text-lg font-medium text-zinc-900">Nenhum cliente cadastrado</h3>
            <p className="text-muted-foreground mt-1 mb-4">Você ainda não adicionou clientes à sua base.</p>
            <Link href="/dashboard/clients/new">
              <Button variant="outline">Cadastrar Primeiro Cliente</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
