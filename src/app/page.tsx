import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  CalendarDays, 
  CheckSquare, 
  DollarSign, 
  Users, 
  Map, 
  HeartHandshake, 
  FileText, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Star
} from 'lucide-react';
import CeremonyMapWrapper from '@/components/3d/ceremony-map-wrapper';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-100 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Events Pro AI" className="h-8 object-contain" />
          </div>
          
          <nav className="hidden md:flex gap-8">
            <Link href="#funcionalidades" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">Funcionalidades</Link>
            <Link href="#portal-cliente" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">Portal White-label</Link>
            <Link href="#inovacao-3d" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">Mapa 3D</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-semibold text-zinc-700 hover:text-[#cd9641] transition-colors">
              Login
            </Link>
            <Link href="/register">
              <Button className="rounded-full bg-[#cd9641] text-white hover:bg-[#bc7c34] font-medium shadow-sm transition-all hover:scale-105">
                Cadastre-se Grátis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#cd9641]/10 via-white to-white -z-10"></div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#cd9641]/10 text-[#cd9641] text-sm font-semibold tracking-wide mb-8">
              <Sparkles className="h-4 w-4" />
              <span>A Plataforma Definitiva para Assessorias</span>
            </div>
            
            <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-zinc-900 sm:text-7xl mb-8 font-serif">
              Eleve a gestão dos seus eventos ao <span className="text-[#cd9641] relative whitespace-nowrap">nível premium</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-600">
              Gerencie cronogramas, orçamentos, contratos e encante seus clientes com um portal White-label exclusivo com a marca da sua agência.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/register">
                <Button size="lg" className="h-14 rounded-full bg-[#cd9641] px-8 text-lg font-bold text-white hover:bg-[#bc7c34] shadow-xl shadow-[#cd9641]/20 transition-all hover:scale-105">
                  Começar Agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login" className="text-sm font-semibold leading-6 text-zinc-900 hover:text-[#cd9641] transition-colors">
                Já tenho uma conta <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="funcionalidades" className="py-24 bg-zinc-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-base font-semibold leading-7 text-[#cd9641]">Tudo que você precisa</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
                Gestão 360º para Casamentos e Eventos
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: 'Gestão Financeira', desc: 'Controle de orçamentos, parcelas, receitas e despesas em tempo real.', icon: DollarSign },
                { title: 'Cronograma Perfeito', desc: 'Linha do tempo detalhada e gestão de tarefas para que nada passe despercebido.', icon: CalendarDays },
                { title: 'RSVP Automático', desc: 'Confirmação de presença simplificada com controle de cotas e acompanhantes.', icon: Users },
                { title: 'Contratos e Docs', desc: 'Organize contratos, notas fiscais e propostas em um único lugar seguro.', icon: FileText },
                { title: 'Checklists Inteligentes', desc: 'Listas de tarefas para a equipe e para os noivos, garantindo execução impecável.', icon: CheckSquare },
                { title: 'Fornecedores', desc: 'Gestão de parceiros, orçamentos e catálogos para indicações assertivas.', icon: HeartHandshake },
              ].map((feature, idx) => (
                <div key={idx} className="relative p-8 bg-white rounded-3xl shadow-sm border border-zinc-100 hover:shadow-md transition-shadow">
                  <div className="h-12 w-12 rounded-xl bg-[#cd9641]/10 flex items-center justify-center mb-6">
                    <feature.icon className="h-6 w-6 text-[#cd9641]" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 mb-3">{feature.title}</h3>
                  <p className="text-zinc-500 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3D Ceremony Demo Section */}
        <section id="inovacao-3d" className="py-24 bg-zinc-900 text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#cd9641]/10 via-zinc-900 to-zinc-900 opacity-50"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-base font-semibold leading-7 text-[#cd9641]">Inovação Exclusiva</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl mb-4">
                O mapa da cerimônia já está pronto.
              </p>
              <p className="text-lg text-zinc-400 leading-relaxed">
                A mesma lista que você usa para o RSVP vira um mapa de assentos 3D automaticamente. Seus noivos acessam o portal e veem exatamente onde cada um dos convidados vai sentar.
              </p>
            </div>
            
            <div className="mx-auto bg-[#314A2E] rounded-3xl shadow-2xl overflow-hidden border border-zinc-800">
              <div className="p-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-xs font-mono text-zinc-500">Visualização Interativa do Casal (100 Convidados)</div>
                <div className="w-12"></div> {/* spacer */}
              </div>
              {/* Force rendering 100 guests for demonstration */}
              <div className="pointer-events-auto">
                <CeremonyMapWrapper totalGuests={100} />
              </div>
            </div>
          </div>
        </section>

        {/* White-label Section */}
        <section id="portal-cliente" className="py-24 bg-zinc-50 overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1 relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#cd9641]/20 to-[#cd9641]/5 blur-3xl opacity-50 rounded-[3rem]"></div>
                <div className="relative rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl">
                  {/* Mockup simplificado */}
                  <div className="flex items-center gap-2 mb-4 border-b border-zinc-100 pb-4">
                    <div className="h-3 w-3 rounded-full bg-red-400"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                    <div className="h-3 w-3 rounded-full bg-green-400"></div>
                    <div className="mx-auto bg-zinc-100 rounded px-4 py-1 text-xs text-zinc-500 font-mono">
                      https://portal.suaagencia.com.br
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-1/4 space-y-3">
                      <div className="h-8 bg-zinc-100 rounded-md"></div>
                      <div className="h-4 bg-zinc-100 rounded-md w-3/4"></div>
                      <div className="h-4 bg-zinc-100 rounded-md w-full"></div>
                      <div className="h-4 bg-zinc-100 rounded-md w-5/6"></div>
                    </div>
                    <div className="w-3/4 space-y-4">
                      <div className="h-32 bg-zinc-100 rounded-xl"></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="h-24 bg-zinc-100 rounded-xl"></div>
                        <div className="h-24 bg-zinc-100 rounded-xl"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-1 lg:order-2">
                <h2 className="text-base font-semibold leading-7 text-[#cd9641]">Portal White-label</h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl mb-6">
                  Sua marca, sua plataforma.
                </p>
                <p className="text-lg text-zinc-600 mb-8 leading-relaxed">
                  Ofereça aos seus noivos e clientes um portal exclusivo. Personalize com a sua logo, suas cores e forneça uma experiência premium de acompanhamento do evento.
                </p>
                
                <ul className="space-y-4">
                  {[
                    'Logo e identidade visual da sua agência',
                    'Link direto para o seu WhatsApp',
                    'Sem menções à Events Pro AI no portal do cliente',
                    'Acesso via link mágico seguro e prático'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <ShieldCheck className="h-5 w-5 text-[#cd9641]" />
                      <span className="text-zinc-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-white border-t border-zinc-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#cd9641]/10 rounded-3xl p-8 md:p-16 text-center border border-[#cd9641]/20">
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl mb-6">
                Pronto para revolucionar seus eventos?
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-zinc-600 mb-10">
                Junte-se às melhores assessorias e eleve o nível das suas entregas com a Events Pro AI.
              </p>
              <Link href="/register">
                <Button size="lg" className="h-14 rounded-full bg-[#cd9641] px-8 text-lg font-bold text-white hover:bg-[#bc7c34] shadow-xl shadow-[#cd9641]/20 transition-all hover:scale-105">
                  Criar Conta Gratuitamente
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-zinc-50 py-12 border-t border-zinc-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Events Pro AI" className="h-8 object-contain opacity-80" />
          </div>
          <p className="text-sm text-zinc-500">
            © {new Date().getFullYear()} Events Pro AI. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
