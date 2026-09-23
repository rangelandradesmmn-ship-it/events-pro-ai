'use client';

import dynamic from 'next/dynamic';
import { Rotate3D } from 'lucide-react';

const CeremonyMap3D = dynamic(() => import('./ceremony-map'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] md:h-[700px] rounded-3xl bg-zinc-100 animate-pulse flex items-center justify-center border border-zinc-200">
      <div className="flex flex-col items-center text-zinc-400 gap-4">
        <Rotate3D className="h-10 w-10 animate-spin-slow" />
        <span className="font-medium">Carregando motor 3D...</span>
      </div>
    </div>
  )
});

import { useState } from 'react';

interface CeremonyMapWrapperProps {
  totalGuests: number;
}

export type ScenarioType = 'jardim' | 'praia' | 'salao';

export default function CeremonyMapWrapper({ totalGuests }: CeremonyMapWrapperProps) {
  const [scenario, setScenario] = useState<ScenarioType>('jardim');

  return (
    <div className="space-y-4">
      <CeremonyMap3D totalGuests={totalGuests} scenario={scenario} />
      
      <div className="flex flex-col md:flex-row justify-between items-center text-sm text-zinc-500 bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
        <div className="flex items-center gap-2 mb-3 md:mb-0">
          <span className="font-semibold text-zinc-700 mr-2">Cenário:</span>
          <button 
            onClick={() => setScenario('jardim')} 
            className={`px-3 py-1.5 rounded-full transition-colors ${scenario === 'jardim' ? 'bg-[#A86F6B] text-white' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'}`}
          >
            Jardim
          </button>
          <button 
            onClick={() => setScenario('praia')} 
            className={`px-3 py-1.5 rounded-full transition-colors ${scenario === 'praia' ? 'bg-[#A86F6B] text-white' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'}`}
          >
            Praia
          </button>
          <button 
            onClick={() => setScenario('salao')} 
            className={`px-3 py-1.5 rounded-full transition-colors ${scenario === 'salao' ? 'bg-[#A86F6B] text-white' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'}`}
          >
            Salão
          </button>
        </div>
        
        <p className="flex items-center gap-1"><Rotate3D className="h-4 w-4" /> Use o mouse para girar</p>
      </div>
    </div>
  );
}
