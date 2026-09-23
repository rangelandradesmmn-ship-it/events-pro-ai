import Link from 'next/link';
import { Heart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OnboardingWelcomePage() {
  return (
    <div className="min-h-screen bg-[#F5F2F0] flex flex-col items-center justify-center py-10 px-4">
      
      {/* Logo */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-zinc-800">
          <Heart className="h-5 w-5 text-[#A86F6B] fill-[#A86F6B]" />
          <span className="font-serif font-bold text-xl tracking-tight">LUXE EVENTS</span>
        </div>
      </div>
      
      {/* Card Container */}
      <div className="w-full max-w-[600px] bg-white rounded-[32px] p-10 md:p-14 shadow-sm border border-zinc-100 flex flex-col items-center text-center">
        
        {/* Heart Icon Top */}
        <div className="h-16 w-16 bg-[#F9F0EE] rounded-2xl flex items-center justify-center mb-8">
          <Heart className="h-7 w-7 text-[#A86F6B] fill-[#A86F6B]" />
        </div>

        {/* Text */}
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4 font-serif">
          Bem-vinda(o) ao LUXE EVENTS!
        </h1>
        <p className="text-zinc-500 mb-10 max-w-md mx-auto leading-relaxed">
          Organize seu próximo casamento em minutos. Vamos configurar seu primeiro evento rapidamente.
        </p>

        {/* Feature List */}
        <div className="w-full max-w-[420px] space-y-3 mb-10">
          
          <div className="flex items-center gap-4 bg-[#FCFAFA] border border-zinc-50 rounded-2xl p-4">
            <div className="h-8 w-8 rounded-full bg-[#F9F0EE] flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4 text-[#A86F6B]" />
            </div>
            <span className="text-sm font-medium text-zinc-700 text-left">
              Configure seu perfil em 30 segundos
            </span>
          </div>

          <div className="flex items-center gap-4 bg-[#FCFAFA] border border-zinc-50 rounded-2xl p-4">
            <div className="h-8 w-8 rounded-full bg-[#F9F0EE] flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4 text-[#A86F6B]" />
            </div>
            <span className="text-sm font-medium text-zinc-700 text-left">
              Crie seu primeiro evento
            </span>
          </div>

          <div className="flex items-center gap-4 bg-[#FCFAFA] border border-zinc-50 rounded-2xl p-4">
            <div className="h-8 w-8 rounded-full bg-[#F9F0EE] flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4 text-[#A86F6B]" />
            </div>
            <span className="text-sm font-medium text-zinc-700 text-left">
              Desbloqueie a plataforma com 3 passos simples
            </span>
          </div>

        </div>

        {/* Button */}
        <Link href="/onboarding/profile" className="w-full max-w-[200px]">
          <Button className="w-full h-12 bg-[#A86F6B] hover:bg-[#8F5E5A] text-white font-medium rounded-full text-base transition-colors">
            Começar
          </Button>
        </Link>
        
      </div>
    </div>
  );
}
