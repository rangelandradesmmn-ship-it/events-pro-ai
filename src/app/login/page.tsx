import Image from 'next/image';
import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2">
            <Image src="/logo.jpg" alt="Events Pro AI Logo" width={180} height={45} className="object-contain" />
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-zinc-900 lg:block">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent"></div>
        <div className="absolute bottom-12 left-12 right-12 z-10 text-white">
          <blockquote className="space-y-2">
            <p className="text-xl text-gold-100 font-light tracking-wide leading-relaxed">
              "TECNOLOGIA QUE VALORIZA O SEU TALENTO"
            </p>
            <footer className="text-sm text-gold-400/80 uppercase tracking-widest">
              Events Pro AI
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
