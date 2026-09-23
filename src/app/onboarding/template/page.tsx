'use client';

import Link from 'next/link';
import { Heart, ListChecks, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OnboardingTemplatePage() {
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
      <div className="w-full max-w-[760px] bg-white rounded-[32px] p-8 md:p-14 shadow-sm border border-zinc-100 flex flex-col items-center">
        
        {/* Step Indicator */}
        <div className="flex gap-2 mb-10">
          <div className="h-1.5 w-10 bg-[#A86F6B] rounded-full"></div>
          <div className="h-1.5 w-10 bg-[#A86F6B] rounded-full"></div>
          <div className="h-1.5 w-10 bg-[#A86F6B] rounded-full"></div>
          <div className="h-1.5 w-10 bg-[#A86F6B] rounded-full"></div>
        </div>

        <h1 className="text-3xl font-bold text-zinc-900 mb-2 font-serif text-center">
          Comece com um template
        </h1>
        <p className="text-zinc-500 mb-10 text-center max-w-2xl mx-auto">
          Vamos criar uma checklist e um cronograma padrão pra você — depois você edita, adiciona ou remove tudo o que quiser.
        </p>

        <form className="w-full space-y-6" action="/dashboard">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Checklist Card */}
            <div className="border border-zinc-100 rounded-3xl p-6 hover:border-[#A86F6B]/30 transition-colors bg-[#FCFAFA]/50">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-full bg-[#F9F0EE] flex items-center justify-center shrink-0">
                  <ListChecks className="h-5 w-5 text-[#A86F6B]" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900">Checklist</h3>
                  <p className="text-sm text-zinc-400">21 tarefas</p>
                </div>
              </div>
              
              <ul className="space-y-3 text-sm text-zinc-400 font-medium list-disc list-inside marker:text-zinc-300">
                <li>Definir orçamento geral do casamento</li>
                <li>Reservar local da cerimônia</li>
                <li>Reservar local da recepção</li>
                <li>Contratar buffet/catering</li>
                <li>Definir cardápio e agendar degustação</li>
                <li className="pt-2 text-zinc-300 list-none">+ 16 itens</li>
              </ul>
            </div>

            {/* Cronograma Card */}
            <div className="border border-zinc-100 rounded-3xl p-6 hover:border-[#A86F6B]/30 transition-colors bg-[#FCFAFA]/50">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-full bg-[#F9F0EE] flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 text-[#A86F6B]" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900">Cronograma do dia</h3>
                  <p className="text-sm text-zinc-400">15 momentos</p>
                </div>
              </div>
              
              <ul className="space-y-3 text-sm text-zinc-400 font-medium list-disc list-inside marker:text-zinc-300">
                <li>14:00 — Abertura do local</li>
                <li>14:30 — Chegada dos convidados</li>
                <li>15:00 — Entrada dos padrinhos e...</li>
                <li>15:10 — Entrada da noiva</li>
                <li>15:15 — Cerimônia religiosa</li>
                <li className="pt-2 text-zinc-300 list-none">+ 10 itens</li>
              </ul>
            </div>

          </div>

          <div className="mt-8 bg-[#F2FBF6] border border-[#E2F5EA] rounded-2xl p-4 flex items-start md:items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-[#0F8A55] shrink-0 mt-0.5 md:mt-0" />
            <p className="text-sm text-[#1F4C36] font-medium">
              Tudo é totalmente editável depois — adicione, remova ou ajuste cada item dentro do casamento.
            </p>
          </div>

          <div className="pt-8 flex items-center justify-between">
            <Link href="/dashboard" className="text-sm font-semibold text-zinc-700 hover:text-zinc-900 transition-colors">
              Pular por enquanto
            </Link>
            <Button type="submit" className="h-12 px-8 bg-[#A86F6B] hover:bg-[#8F5E5A] text-white font-medium rounded-full text-base transition-colors">
              Aplicar template
            </Button>
          </div>
          
        </form>
        
      </div>
    </div>
  );
}
