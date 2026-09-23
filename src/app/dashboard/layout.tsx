import { ReactNode } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { ShieldAlert,
  Calendar, 
  CalendarDays,
  Users, 
  Users2,
  LayoutDashboard, 
  Settings, 
  LogOut,
  Briefcase,
  CheckSquare,
  FileText,
  DollarSign,
  HeartHandshake,
  MessageSquare,
  FolderOpen,
  QrCode,
  Heart,
  Rotate3D,
  MapPin
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MobileNav } from '@/components/dashboard/mobile-nav';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const userRole = profile?.role || 'admin';
  const isSuperadmin = profile?.is_superadmin || false;
  const activeRoles = [userRole, ...(isSuperadmin ? ['superadmin'] : [])]; // fallback to admin if not set

  const allNavItems = [
    { name: 'Configurações', href: '/dashboard/settings', icon: Settings, roles: ['admin'] },
    { name: 'Sala de Comando', href: '/dashboard/super-admin', icon: ShieldAlert, roles: ['superadmin'] },
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'planner', 'assistant'] },
    { name: 'Eventos', href: '/dashboard/events', icon: Calendar, roles: ['admin', 'planner', 'assistant', 'team'] },
    { name: 'Equipe', href: '/dashboard/team', icon: Briefcase, roles: ['admin'] },
    { name: 'Clientes', href: '/dashboard/clients', icon: HeartHandshake, roles: ['admin', 'planner', 'assistant'] },
    { name: 'Convidados (RSVP)', href: '/dashboard/rsvp', icon: Users, roles: ['admin', 'planner', 'assistant'] },
    { name: 'Mapa de Mesas 2D', href: '/dashboard/tables', icon: Users2, roles: ['admin', 'planner', 'assistant'] },
    { name: 'Mapa da Cerimônia 3D', href: '/dashboard/ceremony-3d', icon: Rotate3D, roles: ['admin', 'planner', 'assistant'] },
    { name: 'Reuniões', href: '/dashboard/meetings', icon: MessageSquare, roles: ['admin', 'planner', 'assistant'] },
    { name: 'Portaria (Scanner)', href: '/dashboard/checkin', icon: QrCode, roles: ['admin', 'planner', 'assistant', 'team'] },
    { name: 'Cronograma', href: '/dashboard/timeline', icon: CalendarDays, roles: ['admin', 'planner', 'assistant', 'team'] },
    { name: 'Financeiro', href: '/dashboard/financials', icon: DollarSign, roles: ['admin', 'planner'] },
    { name: 'Contratos', href: '/dashboard/contracts', icon: FileText, roles: ['admin', 'planner'] },
    { name: 'Checklists', href: '/dashboard/checklists', icon: CheckSquare, roles: ['admin', 'planner', 'assistant', 'team'] },
    { name: 'Arquivos', href: '/dashboard/files', icon: FolderOpen, roles: ['admin', 'planner', 'assistant'] },
  ];

  const navItems = allNavItems.filter(item => item.roles.some(r => activeRoles.includes(r)));

  return (
    <div className="flex min-h-screen bg-[#FDFDFD]">
      {/* Sidebar Desktop */}
      <aside className="hidden w-72 flex-col border-r border-zinc-100 bg-white md:flex shadow-[4px_0_24px_rgba(0,0,0,0.01)]">
        <div className="flex h-20 items-center px-8 border-b border-zinc-50">
          <Link href="/dashboard" className="flex items-center gap-2.5 text-zinc-900 group">
            <img src="/logo.png" alt="Events Pro AI" className="w-full h-16 object-contain" />
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-6">
          <nav className="grid items-start px-4 font-semibold text-[15px] gap-1.5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3.5 rounded-2xl px-4 py-3.5 text-zinc-500 transition-all hover:text-[#A86F6B] hover:bg-[#F9F0EE] group"
              >
                <item.icon className="h-5 w-5 stroke-[2px] group-hover:scale-110 transition-transform" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-auto border-t border-zinc-100 p-6 bg-zinc-50/50">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-11 w-11 shadow-sm ring-2 ring-white">
              <AvatarImage src="" alt={profile?.full_name || user.email} />
              <AvatarFallback className="bg-[#E4C5BA] text-zinc-900 font-bold">
                {(profile?.full_name || user.email || 'U').substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-[15px] font-bold text-zinc-900 truncate max-w-[140px]">{profile?.full_name || 'Usuário'}</span>
              <span className="text-xs font-semibold text-[#A86F6B] uppercase tracking-wider">{profile?.role || 'Admin'}</span>
            </div>
          </div>
          <form action="/auth/signout" method="post">
            <Button variant="outline" className="w-full justify-center text-zinc-600 hover:text-red-600 hover:bg-red-50 hover:border-red-100 rounded-xl h-11 font-bold border-zinc-200" type="submit">
              <LogOut className="mr-2 h-4 w-4 stroke-[2.5px]" />
              Encerrar Sessão
            </Button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex flex-1 flex-col">
        {/* Mobile Header (simplified for now) */}
        <header className="flex h-16 items-center gap-4 border-b border-zinc-100 bg-white px-4 lg:h-[60px] lg:px-6 md:hidden">
            <MobileNav 
              userRole={userRole} 
              isSuperadmin={isSuperadmin} 
              userFullName={profile?.full_name || ''} 
              userEmail={user?.email || ''} 
            />
            <div className="flex-1 flex justify-center">
              <img src="/logo.png" alt="Events Pro AI" className="h-10 object-contain mr-8" />
            </div>
          </header>

        <div className="flex-1 overflow-auto p-4 md:p-8 lg:p-12">
          {children}
        </div>
      </main>
    </div>
  );
}
