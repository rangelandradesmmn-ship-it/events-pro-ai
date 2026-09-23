'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface NavItem {
  name: string;
  href: string;
  icon: any;
}

export function MobileNav({ navItems }: { navItems: NavItem[] }) {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 bg-white p-0">
        <div className="flex h-20 items-center px-8 border-b border-zinc-50">
          <Link href="/dashboard" className="flex items-center gap-2.5 text-zinc-900">
            <img src="/logo.jpg" alt="Events Pro AI" className="h-10 object-contain" />
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
