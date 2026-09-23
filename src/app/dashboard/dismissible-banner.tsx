'use client';

import { useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';

export function DismissibleBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative flex items-start md:items-center gap-4 bg-[#FCFAFA] border border-[#F5F2F0] px-6 py-5 rounded-3xl shadow-sm">
      <div className="h-12 w-12 rounded-xl bg-[#A86F6B] flex items-center justify-center shrink-0 shadow-inner">
        <CheckCircle2 className="h-6 w-6 text-white" />
      </div>
      <div>
        <h3 className="font-bold text-zinc-900 mb-0.5">Configuração concluída!</h3>
        <p className="text-sm text-zinc-500">Você completou os 3 primeiros passos. A plataforma é toda sua agora.</p>
      </div>
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute right-4 top-4 md:top-1/2 md:-translate-y-1/2 p-2 text-zinc-400 hover:text-zinc-600 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
