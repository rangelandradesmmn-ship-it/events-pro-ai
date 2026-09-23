import { createAdminClient as createClient } from '@/utils/supabase/admin';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VisualTable } from '@/components/tables/table-card';

export default async function PortalTablesPage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = await params;
  const token = resolvedParams.token;
  const supabase = await createClient();

  const { data: client } = await supabase
    .from('clients')
    .select('*, events(*)')
    .eq('token', token)
    .single();

  if (!client) {
    notFound();
  }
  
  const event = client.events && client.events.length > 0 ? client.events[0] : null;
  
  if (!event) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto text-center mt-12">
        <p className="text-muted-foreground">Nenhum evento vinculado ao seu perfil.</p>
      </div>
    );
  }

  // Fetch Tables
  const { data: tables } = await supabase
    .from('tables')
    .select('*')
    .eq('event_id', event.id)
    .order('created_at', { ascending: true });
    
  // Fetch Guests
  const { data: guests } = await supabase
    .from('guests')
    .select('id, name, status, table_id')
    .eq('event_id', event.id)
    .in('status', ['confirmed', 'pending']);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">Mapa de Mesas</h1>
        <p className="text-muted-foreground mt-1">Veja onde seus convidados estarão acomodados no grande dia.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables && tables.length > 0 ? tables.map(table => {
          const tableGuests = guests?.filter(g => g.table_id === table.id) || [];
          
          return (
            <Card key={table.id} className="border-zinc-200 flex flex-col overflow-hidden">
              <CardHeader className="bg-zinc-100/50 pb-3 border-b border-zinc-100">
                <div className="flex justify-between items-center h-6">
                  <CardTitle className="text-lg font-serif">{table.name}</CardTitle>
                  <span className="text-xs font-bold text-zinc-500 bg-zinc-200 px-2 py-1 rounded-md">
                    {tableGuests.length} / {table.capacity} lugares
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-2 min-h-32 flex flex-col flex-1 bg-white">
                <VisualTable capacity={table.capacity} guests={tableGuests} shape={table.shape || 'round'} />
                
                <div className="space-y-1.5 mt-2 pt-4 border-t border-zinc-100">
                  {tableGuests.map(guest => (
                    <div key={guest.id} className="flex justify-between items-center p-1.5 px-2 bg-zinc-50 rounded text-sm text-zinc-700">
                      <span className="truncate">{guest.name}</span>
                    </div>
                  ))}
                  {tableGuests.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">Ninguém alocado nesta mesa ainda.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        }) : (
          <div className="col-span-full flex flex-col items-center justify-center p-12 bg-white border border-dashed rounded-lg text-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-300 mb-4"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
            <h3 className="text-lg font-bold text-zinc-900 mb-2">Organização em andamento</h3>
            <p className="text-muted-foreground max-w-sm">Sua assessoria ainda não publicou a disposição das mesas.</p>
          </div>
        )}
      </div>
    </div>
  );
}
