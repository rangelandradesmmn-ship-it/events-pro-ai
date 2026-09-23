'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function OnboardingSupplierPage() {
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
          <div className="h-1.5 w-10 bg-[#A86F6B] rounded-full"></div>
          <div className="h-1.5 w-10 bg-zinc-100 rounded-full"></div>
        </div>

        <h1 className="text-3xl font-bold text-zinc-900 mb-2 font-serif text-center">
          Adicione um fornecedor
        </h1>
        <p className="text-zinc-500 mb-10 text-center max-w-lg mx-auto">
          Esse fornecedor já fica vinculado ao seu primeiro casamento — e disponível pra reusar nos próximos. Você pode editar todos os dados depois.
        </p>

        <form className="w-full space-y-6" action="/onboarding/template">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="supplier_name" className="text-sm font-semibold text-zinc-800">Nome do fornecedor</Label>
              <Input 
                id="supplier_name" 
                name="supplier_name"
                placeholder="Studio Luz Foto"
                className="h-12 border-zinc-100 rounded-xl focus-visible:ring-1 focus-visible:ring-zinc-400 bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category" className="text-sm font-semibold text-zinc-800">Categoria</Label>
              <select 
                id="category" 
                name="category"
                className="flex h-12 w-full items-center justify-between rounded-xl border border-zinc-100 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="fotografia">Fotografia</option>
                <option value="buffet">Buffet</option>
                <option value="decoracao">Decoração</option>
                <option value="musica">Música / Banda</option>
                <option value="local">Local / Espaço</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-semibold text-zinc-800">Email (opcional)</Label>
              <Input 
                id="email" 
                name="email"
                type="email"
                placeholder="contato@studio.com"
                className="h-12 border-zinc-100 rounded-xl focus-visible:ring-1 focus-visible:ring-zinc-400 bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm font-semibold text-zinc-800">Telefone (opcional)</Label>
              <Input 
                id="phone" 
                name="phone"
                placeholder="(11) 99999-9999"
                className="h-12 border-zinc-100 rounded-xl focus-visible:ring-1 focus-visible:ring-zinc-400 bg-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="value" className="text-sm font-semibold text-zinc-800">Valor combinado (opcional)</Label>
            <Input 
              id="value" 
              name="value"
              placeholder="R$ 3.500,00"
              className="h-12 border-zinc-100 rounded-xl focus-visible:ring-1 focus-visible:ring-zinc-400 bg-white"
            />
            <p className="text-xs text-zinc-400 pt-1">
              Se informado, já popula o cronograma financeiro do casamento.
            </p>
          </div>

          <div className="pt-8 flex items-center justify-between">
            <Link href="/dashboard" className="text-sm font-semibold text-zinc-700 hover:text-zinc-900 transition-colors">
              Pular por enquanto
            </Link>
            <Button type="submit" className="h-12 px-8 bg-[#A86F6B] hover:bg-[#8F5E5A] text-white font-medium rounded-full text-base transition-colors">
              Vincular fornecedor
            </Button>
          </div>
          
        </form>
        
      </div>
    </div>
  );
}
