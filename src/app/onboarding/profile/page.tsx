'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function OnboardingProfilePage() {
  const [role, setRole] = useState('');
  const [eventsPerMonth, setEventsPerMonth] = useState('');

  return (
    <div className="min-h-screen bg-[#F5F2F0] flex flex-col items-center py-10 px-4">
      
      {/* Logo */}
      <div className="mb-8 mt-4">
        <div className="flex items-center gap-2 text-zinc-800">
          <Heart className="h-5 w-5 text-[#A86F6B] fill-[#A86F6B]" />
          <span className="font-serif font-bold text-xl tracking-tight">LUXE EVENTS</span>
        </div>
      </div>
      
      {/* Card Container */}
      <div className="w-full max-w-[680px] bg-white rounded-[32px] p-8 md:p-14 shadow-sm border border-zinc-100 flex flex-col items-center">
        
        {/* Step Indicator */}
        <div className="flex gap-2 mb-10">
          <div className="h-1.5 w-10 bg-[#A86F6B] rounded-full"></div>
          <div className="h-1.5 w-10 bg-zinc-100 rounded-full"></div>
          <div className="h-1.5 w-10 bg-zinc-100 rounded-full"></div>
          <div className="h-1.5 w-10 bg-zinc-100 rounded-full"></div>
        </div>

        <h1 className="text-3xl font-bold text-zinc-900 mb-2 font-serif text-center">
          Conta um pouco sobre você
        </h1>
        <p className="text-zinc-500 mb-10 text-center">
          Vamos personalizar a experiência pro seu perfil.
        </p>

        <form className="w-full space-y-8" action="/onboarding/event">
          
          {/* Question 1 */}
          <div className="space-y-3">
            <h3 className="font-semibold text-zinc-800 text-sm">Você é...</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <label className={`cursor-pointer flex items-start p-4 rounded-xl border ${role === 'cerimonialista' ? 'border-[#A86F6B] bg-[#F9F0EE]/30' : 'border-zinc-100'} hover:border-[#A86F6B] transition-colors`}>
                <div className="pt-1 flex-shrink-0">
                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${role === 'cerimonialista' ? 'border-[#A86F6B]' : 'border-zinc-300'}`}>
                    {role === 'cerimonialista' && <div className="h-2 w-2 rounded-full bg-[#A86F6B]" />}
                  </div>
                  <input type="radio" name="role" value="cerimonialista" className="hidden" onChange={(e) => setRole(e.target.value)} />
                </div>
                <div className="ml-3">
                  <span className="block text-sm font-semibold text-zinc-900">Cerimonialista</span>
                  <span className="block text-xs text-zinc-500 mt-1">Cuido do dia do casamento</span>
                </div>
              </label>

              <label className={`cursor-pointer flex items-start p-4 rounded-xl border ${role === 'assessoria' ? 'border-[#A86F6B] bg-[#F9F0EE]/30' : 'border-zinc-100'} hover:border-[#A86F6B] transition-colors`}>
                <div className="pt-1 flex-shrink-0">
                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${role === 'assessoria' ? 'border-[#A86F6B]' : 'border-zinc-300'}`}>
                    {role === 'assessoria' && <div className="h-2 w-2 rounded-full bg-[#A86F6B]" />}
                  </div>
                  <input type="radio" name="role" value="assessoria" className="hidden" onChange={(e) => setRole(e.target.value)} />
                </div>
                <div className="ml-3">
                  <span className="block text-sm font-semibold text-zinc-900">Assessoria</span>
                  <span className="block text-xs text-zinc-500 mt-1">Cuido do planejamento completo</span>
                </div>
              </label>

              <label className={`cursor-pointer flex items-start p-4 rounded-xl border ${role === 'noiva' ? 'border-[#A86F6B] bg-[#F9F0EE]/30' : 'border-zinc-100'} hover:border-[#A86F6B] transition-colors`}>
                <div className="pt-1 flex-shrink-0">
                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${role === 'noiva' ? 'border-[#A86F6B]' : 'border-zinc-300'}`}>
                    {role === 'noiva' && <div className="h-2 w-2 rounded-full bg-[#A86F6B]" />}
                  </div>
                  <input type="radio" name="role" value="noiva" className="hidden" onChange={(e) => setRole(e.target.value)} />
                </div>
                <div className="ml-3">
                  <span className="block text-sm font-semibold text-zinc-900">Noiva ou Noivo</span>
                  <span className="block text-xs text-zinc-500 mt-1">Estou organizando meu próprio casamento</span>
                </div>
              </label>

              <label className={`cursor-pointer flex items-start p-4 rounded-xl border ${role === 'espaco' ? 'border-[#A86F6B] bg-[#F9F0EE]/30' : 'border-zinc-100'} hover:border-[#A86F6B] transition-colors`}>
                <div className="pt-1 flex-shrink-0">
                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${role === 'espaco' ? 'border-[#A86F6B]' : 'border-zinc-300'}`}>
                    {role === 'espaco' && <div className="h-2 w-2 rounded-full bg-[#A86F6B]" />}
                  </div>
                  <input type="radio" name="role" value="espaco" className="hidden" onChange={(e) => setRole(e.target.value)} />
                </div>
                <div className="ml-3">
                  <span className="block text-sm font-semibold text-zinc-900">Espaço de eventos</span>
                  <span className="block text-xs text-zinc-500 mt-1">Gerencio um buffet, salão ou venue</span>
                </div>
              </label>

            </div>
          </div>

          {/* Question 2 */}
          <div className="space-y-3">
            <h3 className="font-semibold text-zinc-800 text-sm">Quantos casamentos você organiza por mês?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <label className={`cursor-pointer flex items-center p-4 rounded-xl border ${eventsPerMonth === '1-3' ? 'border-[#A86F6B] bg-[#F9F0EE]/30' : 'border-zinc-100'} hover:border-[#A86F6B] transition-colors`}>
                <div className="flex-shrink-0">
                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${eventsPerMonth === '1-3' ? 'border-[#A86F6B]' : 'border-zinc-300'}`}>
                    {eventsPerMonth === '1-3' && <div className="h-2 w-2 rounded-full bg-[#A86F6B]" />}
                  </div>
                  <input type="radio" name="events" value="1-3" className="hidden" onChange={(e) => setEventsPerMonth(e.target.value)} />
                </div>
                <div className="ml-3">
                  <span className="block text-sm font-semibold text-zinc-900">1 a 3 eventos</span>
                </div>
              </label>

              <label className={`cursor-pointer flex items-center p-4 rounded-xl border ${eventsPerMonth === '4-10' ? 'border-[#A86F6B] bg-[#F9F0EE]/30' : 'border-zinc-100'} hover:border-[#A86F6B] transition-colors`}>
                <div className="flex-shrink-0">
                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${eventsPerMonth === '4-10' ? 'border-[#A86F6B]' : 'border-zinc-300'}`}>
                    {eventsPerMonth === '4-10' && <div className="h-2 w-2 rounded-full bg-[#A86F6B]" />}
                  </div>
                  <input type="radio" name="events" value="4-10" className="hidden" onChange={(e) => setEventsPerMonth(e.target.value)} />
                </div>
                <div className="ml-3">
                  <span className="block text-sm font-semibold text-zinc-900">4 a 10 eventos</span>
                </div>
              </label>

              <label className={`cursor-pointer flex items-center p-4 rounded-xl border ${eventsPerMonth === '10+' ? 'border-[#A86F6B] bg-[#F9F0EE]/30' : 'border-zinc-100'} hover:border-[#A86F6B] transition-colors`}>
                <div className="flex-shrink-0">
                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${eventsPerMonth === '10+' ? 'border-[#A86F6B]' : 'border-zinc-300'}`}>
                    {eventsPerMonth === '10+' && <div className="h-2 w-2 rounded-full bg-[#A86F6B]" />}
                  </div>
                  <input type="radio" name="events" value="10+" className="hidden" onChange={(e) => setEventsPerMonth(e.target.value)} />
                </div>
                <div className="ml-3">
                  <span className="block text-sm font-semibold text-zinc-900">Mais de 10 eventos</span>
                </div>
              </label>

            </div>
          </div>

          {/* Question 3 */}
          <div className="space-y-1.5 pt-2">
            <h3 className="font-semibold text-zinc-800 text-sm">Cidade e estado</h3>
            <Input 
              name="city" 
              placeholder="Curitiba, PR"
              className="h-12 border-zinc-100 rounded-xl focus-visible:ring-1 focus-visible:ring-zinc-400 bg-white"
            />
          </div>

          <div className="pt-6">
            <Button type="submit" className="w-full h-12 bg-[#A86F6B] hover:bg-[#8F5E5A] text-white font-medium rounded-full text-base transition-colors">
              Continuar
            </Button>
          </div>
          
        </form>
        
      </div>
    </div>
  );
}
