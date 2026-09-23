'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Edit2, X, Check, Users2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function VisualTable({ capacity, guests, shape = 'round' }: { capacity: number, guests: any[], shape?: string }) {
  const center = 110; // slightly larger canvas
  const isComplete = guests.length >= capacity;
  
  return (
    <div className="relative w-[220px] h-[220px] mx-auto my-6">
      {/* Table itself */}
      {shape === 'round' ? (
        <div className={`absolute inset-10 rounded-full border-2 flex items-center justify-center flex-col transition-colors
          ${isComplete ? 'border-[#A86F6B] bg-white' : 'border-[#E4C5BA] bg-white'}`}>
          <span className="text-xl font-bold text-zinc-900 font-serif">Mesa</span>
          <span className="text-sm font-bold text-zinc-400 mt-1">{guests.length}/{capacity}</span>
        </div>
      ) : (
        <div className={`absolute left-[30px] top-[60px] w-[160px] h-[100px] rounded-[24px] border-2 flex items-center justify-center flex-col transition-colors
          ${isComplete ? 'border-[#A86F6B] bg-white' : 'border-[#E4C5BA] bg-white'}`}>
          <span className="text-xl font-bold text-zinc-900 font-serif">Mesa</span>
          <span className="text-sm font-bold text-zinc-400 mt-1">{guests.length}/{capacity}</span>
        </div>
      )}
      
      {/* Chairs around it */}
      {Array.from({ length: capacity }).map((_, i) => {
        const guest = guests[i];
        let x = 0;
        let y = 0;

        if (shape === 'round') {
          const radius = 80; 
          const angle = (i / capacity) * Math.PI * 2 - Math.PI / 2;
          x = center + radius * Math.cos(angle) - 16; 
          y = center + radius * Math.sin(angle) - 16;
        } else {
          // Rectangular logic
          const topCount = Math.ceil(capacity / 2);
          const isTop = i < topCount;
          const indexInRow = isTop ? i : i - topCount;
          const rowCount = isTop ? topCount : Math.floor(capacity / 2);
          
          const spacing = 160 / rowCount;
          x = 30 + (indexInRow + 0.5) * spacing - 16;
          y = isTop ? 18 : 170; // Top or bottom row
        }
        
        return (
          <div 
            key={i} 
            className={`absolute w-8 h-8 rounded-full border-2 flex items-center justify-center text-[11px] font-bold shadow-sm transition-all group
              ${guest ? 'bg-[#C18884] border-white text-white z-10' : 'bg-transparent border-dashed border-zinc-200 text-transparent'}`}
            style={{ left: x, top: y }}
            title={guest?.name || 'Assento Livre'}
          >
            {guest ? guest.name.split(' ').map((n:string)=>n[0]).join('').substring(0,2).toUpperCase() : ''}
            
            {/* Tooltip on hover for guest name */}
            {guest && (
              <div className="absolute -top-8 bg-zinc-900 text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                {guest.name}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function TableCard({ 
  table, 
  tableGuests, 
  onDelete, 
  onEdit, 
  onUnassign 
}: { 
  table: any, 
  tableGuests: any[],
  onDelete: (formData: FormData) => void,
  onEdit: (formData: FormData) => void,
  onUnassign: (formData: FormData) => void
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [showGuests, setShowGuests] = useState(false);
  
  // Expand tableGuests into individual seats to account for companions
  const tableSeats: any[] = [];
  tableGuests.forEach(guest => {
    tableSeats.push({ id: guest.id, name: guest.name });
    const compCount = guest.companions || 0;
    const comps = Array.isArray(guest.companions_names) ? guest.companions_names : [];
    
    for (let i = 0; i < compCount; i++) {
      const realName = comps[i]?.name ? comps[i].name.split(' ')[0] : `${guest.name.split(' ')[0]} (Acomp)`;
      tableSeats.push({ id: `${guest.id}-c${i}`, name: realName });
    }
  });

  const isComplete = tableSeats.length >= table.capacity;
  const freeSeats = Math.max(0, table.capacity - tableSeats.length);

  return (
    <Card className={`rounded-[24px] overflow-hidden relative shadow-sm group transition-colors duration-300
      ${isComplete ? 'border-[#A86F6B]/30 bg-white' : 'border-zinc-200 bg-white'}`}>
      
      <CardContent className="p-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-start mb-2 min-h-[60px]">
          {isEditing ? (
            <form action={(formData) => { onEdit(formData); setIsEditing(false); }} className="flex gap-2 flex-1 items-start flex-wrap bg-zinc-50 p-3 rounded-xl">
              <input type="hidden" name="table_id" value={table.id} />
              <input name="name" defaultValue={table.name} className="h-8 w-full md:w-32 text-sm px-3 border rounded-lg" required placeholder="Nome da mesa" />
              <input name="capacity" type="number" defaultValue={table.capacity} className="h-8 w-24 text-sm px-3 border rounded-lg" required placeholder="Lugares" />
              <select name="shape" defaultValue={table.shape || 'round'} className="h-8 w-32 text-xs px-2 border rounded-lg bg-white">
                <option value="round">Redonda</option>
                <option value="rectangular">Retangular</option>
              </select>
              <div className="flex w-full gap-2 mt-2">
                <button type="submit" className="h-8 flex-1 flex items-center justify-center bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors">
                  Salvar
                </button>
                <button type="button" onClick={() => setIsEditing(false)} className="h-8 px-4 flex items-center justify-center bg-zinc-200 text-zinc-700 font-bold rounded-lg hover:bg-zinc-300 transition-colors">
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <>
              <div>
                {isComplete && <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold mb-2 tracking-wider">⭐ COMPLETA</span>}
                <h3 className="text-xl font-bold text-zinc-900">{table.name}</h3>
                <p className="text-xs text-zinc-500 font-medium mt-1">{table.shape === 'rectangular' ? 'Mesa Retangular' : 'Mesa Redonda'}</p>
              </div>
              <div className="text-right">
                <div className={`text-xl font-bold font-serif ${isComplete ? 'text-[#A86F6B]' : 'text-zinc-900'}`}>
                  {tableSeats.length}/{table.capacity}
                </div>
                <div className={`text-xs font-semibold mt-1 ${isComplete ? 'text-[#A86F6B]' : 'text-zinc-400'}`}>
                  {isComplete ? 'completa' : (freeSeats === 1 ? '1 lugar livre' : `${freeSeats} lugares livres`)}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Visual Map */}
        {!isEditing && (
          <div className="flex-1 flex flex-col items-center justify-center py-4">
            <VisualTable capacity={table.capacity} guests={tableSeats} shape={table.shape || 'round'} />
          </div>
        )}

        {/* Guest List Dropdown */}
        {showGuests && (
          <div className="mt-4 mb-4 bg-zinc-50 rounded-xl p-3 border border-zinc-100 space-y-2">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Convidados sentados</span>
              <button onClick={() => setShowGuests(false)} className="text-zinc-400 hover:text-zinc-700">
                <X className="h-4 w-4" />
              </button>
            </div>
            {tableGuests.map(guest => (
              <div key={guest.id} className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-zinc-100 shadow-sm group/guest">
                <span className="font-medium text-sm text-zinc-900 truncate pr-2">
                  {guest.name}
                  {guest.companions > 0 && <span className="text-orange-500 ml-1 text-xs">(+{guest.companions})</span>}
                </span>
                <form action={onUnassign}>
                  <input type="hidden" name="guest_id" value={guest.id} />
                  <input type="hidden" name="table_id" value="" />
                  <button type="submit" className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md opacity-0 group-hover/guest:opacity-100 hover:bg-red-100 transition-all">REMOVER</button>
                </form>
              </div>
            ))}
            {tableGuests.length === 0 && (
              <p className="text-xs text-center text-zinc-400 py-2 font-medium">Mesa vazia.</p>
            )}
          </div>
        )}

        {/* Bottom Actions */}
        {!isEditing && (
          <div className="flex gap-2 mt-auto pt-4">
            <Button 
              type="button" 
              variant="outline" 
              className={`flex-1 rounded-xl h-10 text-xs font-bold transition-colors ${showGuests ? 'bg-zinc-100' : 'hover:bg-zinc-50'}`}
              onClick={() => setShowGuests(!showGuests)}
            >
              <Users2 className="h-4 w-4 mr-1.5" /> Convidados
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1 rounded-xl h-10 text-xs font-bold hover:bg-zinc-50 transition-colors"
              onClick={() => setIsEditing(true)}
            >
              Editar
            </Button>
            <form action={onDelete} className="shrink-0">
              <input type="hidden" name="table_id" value={table.id} />
              <Button 
                type="submit" 
                variant="outline" 
                className="w-10 h-10 rounded-xl p-0 text-zinc-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors" 
                onClick={(e) => { if(!confirm('Excluir esta mesa? Os convidados voltarão para a lista de "Sem mesa".')) e.preventDefault(); }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
