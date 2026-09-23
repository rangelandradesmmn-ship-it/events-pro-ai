'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu,
  ShieldAlert,
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
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export function MobileNav({ userRole, isSuperadmin = false }: { userRole: string, isSuperadmin?: boolean }) {
  const activeRoles = [userRole, ...(isSuperadmin ? ['superadmin'] : [])];
  const pathname = usePathname();

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
    <Sheet>
      <SheetTrigger className="md:hidden flex h-10 w-10 items-center justify-center rounded-md hover:bg-zinc-100 text-zinc-900">
        <Menu className="h-6 w-6" />
        <span className="sr-only">Toggle navigation menu</span>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 bg-white p-0">
        <div className="flex h-20 items-center px-8 border-b border-zinc-50">
          <Link href="/dashboard" className="flex items-center gap-2.5 text-zinc-900">
            <img src="/logo.png" alt="Events Pro AI" className="w-full h-12 object-contain" />
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-6">
          <nav className="flex flex-col gap-1.5 px-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-zinc-900 text-white shadow-md shadow-zinc-900/10'
                      : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                  }`}
                >
                  <item.icon
                    className={`h-5 w-5 transition-colors ${
                      isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-900'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
