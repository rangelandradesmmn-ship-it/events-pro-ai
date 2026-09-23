'use client';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function UnassignedList({ unassignedGuests, tables, assignGuest }: { unassignedGuests: any[], tables: any[], assignGuest: (formData: FormData) => void }) {
  const [search, setSearch] = useState('');
  
  const filteredGuests = unassignedGuests.filter(g => g.name.toLowerCase().includes(search.toLowerCase()));
  
  return (
    <>
      <div className="relative mb-6">
        <Input 
          placeholder="Buscar convidado..." 
          className="pl-10 h-12 rounded-xl border-zinc-200 bg-zinc-50" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="absolute left-3.5 top-3.5 text-zinc-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-1 pr-2 -mr-2">
        {filteredGuests.map(guest => {
          const initials = guest.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
          const compCount = guest.companions || 0;
          return (
            <div key={guest.id} className="p-3 bg-white border border-zinc-100 shadow-sm rounded-xl transition-colors group flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-full bg-[#A86F6B] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {initials}
                </div>
                <div className="min-w-0 truncate">
                  <p className="text-sm font-bold text-zinc-900 truncate">
                    {guest.name}
                    {compCount > 0 && <span className="ml-1 text-xs text-orange-500">(+{compCount} acomp.)</span>}
                  </p>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                    {guest.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                  </p>
                </div>
              </div>
              <form action={assignGuest} className="shrink-0 flex items-center gap-2">
                <input type="hidden" name="guest_id" value={guest.id} />
                <select 
                  name="table_id" 
                  className="h-8 w-28 rounded-full border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-600 cursor-pointer outline-none hover:border-zinc-300 transition-colors" 
                  required
                  defaultValue=""
                >
                  <option value="" disabled>Escolher â–¾</option>
                  {tables?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <Button type="submit" size="sm" variant="outline" className="h-8 rounded-full px-3 text-xs font-bold border-zinc-200">
                  Ok
                </Button>
              </form>
            </div>
          );
        })}
        
        {filteredGuests.length === 0 && search && (
          <p className="text-center text-zinc-400 text-sm py-4">Nenhum convidado encontrado.</p>
        )}
        
        {unassignedGuests.length === 0 && !search && (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <p className="text-sm font-bold text-zinc-900">Tudo organizado!</p>
            <p className="text-xs text-zinc-500 mt-1">Todos os convidados confirmados jÃ¡ possuem mesa.</p>
          </div>
        )}
      </div>
    </>
  );
}