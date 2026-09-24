'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { 
  Menu,
  Home, 
  CalendarDays, 
  CheckSquare, 
  DollarSign, 
  Users, 
  Map, 
  HeartHandshake, 
  FileText, 
  Image as ImageIcon, 
  Paperclip, 
  MessageCircle, 
  Bell
} from 'lucide-react';

export function PortalMobileNav({ 
  agencyName, 
  agencyLogoUrl, 
  brandColor,
  token,
  event,
  whatsapp
}: { 
  agencyName: string;
  agencyLogoUrl: string | null;
  brandColor: string;
  token: string;
  event: any;
  whatsapp: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the sheet when the route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

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
    { name: 'Fale com o Cerimonial', href: `https://wa.me/${whatsapp || ''}`, icon: MessageCircle },
    { name: 'Notificações', href: `/portal/${token}/notifications`, icon: Bell },
  ];

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-zinc-900 px-4 md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger className="p-2 text-zinc-400 hover:text-white rounded-md"><Menu className="h-6 w-6" /></SheetTrigger>
        <SheetContent side="left" className="w-72 bg-zinc-900 p-0 border-r border-zinc-800 text-zinc-400">
          <SheetTitle className="sr-only">Menu do Portal</SheetTitle>
          <div className="flex h-14 items-center border-b border-zinc-800 px-6">
            <Link href={`/portal/${token}`} className="flex flex-col gap-0.5" onClick={() => setOpen(false)}>
              {agencyLogoUrl ? (
                <img src={agencyLogoUrl} alt={agencyName} className="h-12 max-w-[200px] object-contain py-1" />
              ) : (
                <span className="font-serif font-bold text-lg tracking-wide" style={{ color: brandColor }}>{agencyName.toUpperCase()}</span>
              )}
            </Link>
          </div>
          
          {event && (
            <div className="px-6 py-4 border-b border-zinc-800">
              <div className="text-xs font-bold text-gold-500 uppercase tracking-widest mb-1">{event.type}</div>
              <div className="text-sm font-medium text-white line-clamp-1">{event.title}</div>
            </div>
          )}

          <div className="flex-1 overflow-auto py-4">
            <nav className="grid items-start px-4 text-sm font-medium gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all hover:text-white hover:bg-zinc-800"
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          <div className="mt-auto border-t border-zinc-800 p-4">
            <nav className="grid gap-1">
              {helpItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-white hover:bg-zinc-800"
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex justify-center mr-10">
        {agencyLogoUrl ? (
          <img src={agencyLogoUrl} alt={agencyName} className="h-10 max-w-[150px] object-contain py-1" />
        ) : (
          <span className="font-serif font-bold tracking-wide" style={{ color: brandColor }}>{agencyName.toUpperCase()}</span>
        )}
      </div>
    </header>
  );
}
