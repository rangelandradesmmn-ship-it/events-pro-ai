'use client';

import Link from 'next/link';
import { Heart, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function OnboardingEventPage() {
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
          <div className="h-1.5 w-10 bg-[#A86F6B] rounded-full"></div>
          <div className="h-1.5 w-10 bg-zinc-100 rounded-full"></div>
          <div className="h-1.5 w-10 bg-zinc-100 rounded-full"></div>
        </div>

        <h1 className="text-3xl font-bold text-zinc-900 mb-2 font-serif text-center">
          Vamos criar seu primeiro casamento
        </h1>
        <p className="text-zinc-500 mb-10 text-center">
          Você pode editar todos os detalhes depois.
        </p>

        <form className="w-full space-y-6" action="/onboarding/supplier">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="bride" className="text-sm font-semibold text-zinc-800">Nome da noiva</Label>
              <Input 
                id="bride" 
                name="bride"
                placeholder="Ana"
                className="h-12 border-zinc-100 rounded-xl focus-visible:ring-1 focus-visible:ring-zinc-400 bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="groom" className="text-sm font-semibold text-zinc-800">Nome do noivo</Label>
              <Input 
                id="groom" 
                name="groom"
                placeholder="Bruno"
                className="h-12 border-zinc-100 rounded-xl focus-visible:ring-1 focus-visible:ring-zinc-400 bg-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="date" className="text-sm font-semibold text-zinc-800">Data do casamento</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                <CalendarIcon className="h-5 w-5" />
              </div>
              <Input 
                id="date" 
                name="date"
                type="date"
                placeholder="Selecione a data..."
                className="h-12 pl-10 border-zinc-100 rounded-xl focus-visible:ring-1 focus-visible:ring-zinc-400 bg-white text-zinc-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="city" className="text-sm font-semibold text-zinc-800">Cidade ou local (opcional)</Label>
            <Input 
              id="city" 
              name="city"
              placeholder="Curitiba, PR"
              className="h-12 border-zinc-100 rounded-xl focus-visible:ring-1 focus-visible:ring-zinc-400 bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="guests" className="text-sm font-semibold text-zinc-800">Número estimado de convidados (opcional)</Label>
            <Input 
              id="guests" 
              name="guests"
              type="number"
              placeholder="150"
              className="h-12 border-zinc-100 rounded-xl focus-visible:ring-1 focus-visible:ring-zinc-400 bg-white"
            />
          </div>

          <div className="pt-8 flex items-center justify-between">
            <Link href="/dashboard" className="text-sm font-semibold text-zinc-700 hover:text-zinc-900 transition-colors">
              Pular por enquanto
            </Link>
            <Button type="submit" className="h-12 px-8 bg-[#A86F6B] hover:bg-[#8F5E5A] text-white font-medium rounded-full text-base transition-colors">
              Criar evento
            </Button>
          </div>
          
        </form>
        
      </div>
    </div>
  );
}
