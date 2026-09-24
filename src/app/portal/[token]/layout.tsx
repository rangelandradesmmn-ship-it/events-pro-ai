import { ReactNode } from 'react';
import Link from 'next/link';
import { createAdminClient as createClient } from '@/utils/supabase/admin';
import { notFound } from 'next/navigation';
import { 
  Home, 
  CalendarDays, 
  CheckSquare, 
  DollarSign, 
  CreditCard, 
  Users, 
  Map, 
  HeartHandshake, 
  FileText, 
  Image as ImageIcon, 
  Paperclip, 
  MessageCircle, 
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function ClientPortalLayout({ 
  children,
  params 
}: { 
  children: ReactNode,
  params: Promise<{ token: string }> 
}) {
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

  // Fetch Agency Profile for White-label
  const { data: agencyProfile } = await supabase
    .from('profiles')
    .select('full_name, agency_logo_url, agency_color, whatsapp')
    .eq('id', client.planner_id)
    .single();

  const brandColor = agencyProfile?.agency_color || '#d4af37'; // fallback to gold-400
  const agencyName = agencyProfile?.full_name || 'LUXE EVENTS';

  const event = client.events && client.events.length > 0 ? client.events[0] : null;

  const navItems = [
    { name: 'Visão Geral', href: `/portal/${token}`, icon: Home },
    { name: 'Cronograma', href: `/portal/${token}/schedule`, icon: CalendarDays },
    { name: 'Checklist', href: `/portal/${token}/checklist`, icon: CheckSquare },
    { name: 'Orçamento', href: `/portal/${token}/finance`, icon: DollarSign },
    { name: 'Noiva', href: `/portal/${token}/bride`, icon: Users },
    { name: 'Noivo', href: `/portal/${token}/groom`, icon: Users },
    { name: 'Convidados', href: `/portal/${token}/guests`, icon: Users },
    { name: 'Mesas', href: `/portal/${token}/tables`, icon: Map },
    { name: 'Fornecedores', href: `/portal/${token}/suppliers`, icon: HeartHandshake },
    { name: 'Contratos', href: `/portal/${token}/contracts`, icon: FileText },
    { name: 'Inspirações', href: `/portal/${token}/inspirations`, icon: ImageIcon },
    { name: 'Documentos', href: `/portal/${token}/documents`, icon: Paperclip },
  ];

  const helpItems = [
    { name: 'Fale com o Cerimonial', href: `https://wa.me/${agencyProfile?.whatsapp || ''}`, icon: MessageCircle },
    { name: 'Notificações', href: `/portal/${token}/notifications`, icon: Bell },
  ];

  return (
    <div className="flex min-h-screen bg-zinc-50">
      {/* Sidebar Desktop */}
      <aside className="hidden w-64 flex-col bg-zinc-900 border-r border-zinc-800 md:flex">
        <div className="flex h-20 items-center border-b border-zinc-800 px-6">
          <Link href={`/portal/${token}`} className="flex flex-col gap-0.5">
            {agencyProfile?.agency_logo_url ? (
                <img src={agencyProfile.agency_logo_url} alt={agencyName} className="h-10 object-contain" />
              ) : (
                <span className="font-serif font-bold text-xl tracking-wide" style={{ color: brandColor }}>{agencyName.toUpperCase()}</span>
              )}
            <span className="text-xs text-zinc-400">Área do Cliente</span>
          </Link>
        </div>
        
        {event && (
          <div className="px-6 py-4 border-b border-zinc-800">
            <div className="text-xs font-bold text-gold-500 uppercase tracking-widest mb-1">{event.type}</div>
            <div className="text-sm font-medium text-white line-clamp-1">{event.title}</div>
            <div className="text-xs text-zinc-400 flex flex-col gap-1 mt-2">
              <span className="flex items-center gap-1">📅 {event.date ? new Date(event.date + 'T12:00:00Z').toLocaleDateString('pt-BR') : 'A definir'}</span>
              <span className="flex items-center gap-1 line-clamp-1">📍 {event.location_name || 'Espaço a definir'}</span>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto py-4">
          <nav className="grid items-start px-4 text-sm font-medium gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-zinc-400 transition-all hover:text-white hover:bg-zinc-800"
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="mt-auto border-t border-zinc-800 p-4">
          <nav className="grid gap-1">
            {helpItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition-all hover:text-white hover:bg-zinc-800"
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex flex-1 flex-col overflow-hidden h-screen">
        {/* Mobile Header */}
        <header className="flex h-14 items-center gap-4 border-b bg-zinc-900 px-4 md:hidden">
           {agencyProfile?.agency_logo_url ? (
                <img src={agencyProfile.agency_logo_url} alt={agencyName} className="h-6 object-contain" />
              ) : (
                <span className="font-serif font-bold tracking-wide" style={{ color: brandColor }}>{agencyName.toUpperCase()}</span>
              )}
        </header>

        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
