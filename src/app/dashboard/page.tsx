import { createClient } from '@/utils/supabase/server';
import { DismissibleBanner } from './dismissible-banner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Calendar as CalendarIcon, CheckCircle2, ChevronRight, X, Clock3, ListChecks, Users2, DollarSign, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createClient();

  // Get current date string
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Fetch the nearest upcoming event
  const { data: upcomingEvents } = await supabase
    .from('events')
    .select('id, title, date, status')
    .gte('date', todayStr)
    .order('date', { ascending: true })
    .limit(1);

  const nearestEvent = upcomingEvents && upcomingEvents.length > 0 ? upcomingEvents[0] : null;

  // Compute countdown
  let daysRemaining = 0;
  if (nearestEvent && nearestEvent.date) {
    const eventDate = new Date(nearestEvent.date + 'T12:00:00Z');
    const diffTime = Math.abs(eventDate.getTime() - now.getTime());
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Format date to "Quarta-feira, 13 de janeiro de 2027"
  const formattedDate = nearestEvent?.date 
    ? new Date(nearestEvent.date + 'T12:00:00Z').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) 
    : '';

  // Capitalize first letter of formattedDate
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  // Fetch global metrics
  const { count: eventsCount } = await supabase.from('events').select('*', { count: 'exact', head: true });
  const { count: clientsCount } = await supabase.from('clients').select('*', { count: 'exact', head: true });
  const { data: transactions } = await supabase.from('transactions').select('amount, status, type');
  
  const totalRevenue = transactions
    ?.filter(t => t.status === 'paid' && t.type === 'income')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0;

  // Fetch Tasks for this event
  let tasks = [];
  let timeline = [];
  let completedTasksCount = 0;
  
  if (nearestEvent) {
    const { data: eventTasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('event_id', nearestEvent.id)
      .limit(6);
      
    if (eventTasks) {
      tasks = eventTasks;
      completedTasksCount = eventTasks.filter(t => t.completed).length;
    }

    const { data: eventTimeline } = await supabase
      .from('event_timeline')
      .select('*')
      .eq('event_id', nearestEvent.id)
      .order('time', { ascending: true })
      .limit(6);
      
    if (eventTimeline) timeline = eventTimeline;
  }

  return (
    <div className="flex flex-col max-w-6xl mx-auto pb-10 space-y-8">
      
      {/* Global Metrics Section */}
      <div className="mb-12">
        <h2 className="text-[28px] font-black tracking-tight text-zinc-900 mb-6 flex items-center gap-3">
          <LayoutDashboard className="h-7 w-7 text-[#A86F6B] stroke-[2.5px]" />
          Visão Geral do Negócio
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="rounded-[24px] border-zinc-100 shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <CalendarIcon className="w-24 h-24" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Eventos Ativos</CardTitle>
              <div className="bg-zinc-50 p-2 rounded-xl">
                <CalendarIcon className="h-5 w-5 text-zinc-700 stroke-[2.5px]" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10 mt-2">
              <div className="text-5xl font-black text-zinc-900">{eventsCount || 0}</div>
              <p className="text-sm font-semibold text-zinc-500 mt-2">Casamentos planejados</p>
            </CardContent>
          </Card>
          
          <Card className="rounded-[24px] border-zinc-100 shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <DollarSign className="w-24 h-24" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Receita Total</CardTitle>
              <div className="bg-green-50 p-2 rounded-xl">
                <DollarSign className="h-5 w-5 text-green-600 stroke-[2.5px]" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10 mt-2">
              <div className="text-[34px] leading-none font-black text-green-600 tracking-tight">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)}
              </div>
              <p className="text-sm font-semibold text-zinc-500 mt-3">Faturamento recebido</p>
            </CardContent>
          </Card>

          <Card className="rounded-[24px] border-zinc-100 shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <Users2 className="w-24 h-24" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Clientes na Base</CardTitle>
              <div className="bg-[#F9F0EE] p-2 rounded-xl">
                <Users2 className="h-5 w-5 text-[#A86F6B] stroke-[2.5px]" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10 mt-2">
              <div className="text-5xl font-black text-[#A86F6B]">{clientsCount || 0}</div>
              <p className="text-sm font-semibold text-zinc-500 mt-2">Noivos cadastrados</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="w-full h-px bg-zinc-200 my-4" />

      {nearestEvent ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Event details & timeline */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Header Area */}
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F9F0EE] text-[#A86F6B] text-xs font-semibold mb-4">
                <SparklesIcon className="h-3.5 w-3.5" /> Próximo casamento
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 tracking-tight">{nearestEvent.title}</h1>
              <div className="flex items-center gap-3 mt-4 text-sm font-medium text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <CalendarIcon className="h-4 w-4 text-zinc-400" /> {capitalizedDate}
                </span>
                <span className="px-2.5 py-0.5 bg-[#F5F2F0] rounded-md text-zinc-600 text-xs uppercase tracking-wider font-bold">
                  {nearestEvent.status === 'planejamento' ? 'Rascunho' : nearestEvent.status}
                </span>
              </div>
            </div>

            {/* Próximas ações */}
            <div>
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h2 className="text-xl font-bold text-zinc-900">Próximas ações</h2>
                  <p className="text-sm text-zinc-400 mt-1">Tarefas pendentes do próximo casamento</p>
                </div>
                <Link href={`/dashboard/checklists?event_id=${nearestEvent.id}`} className="text-sm font-semibold text-[#A86F6B] hover:text-[#8F5E5A] flex items-center gap-1">
                  Ver checklist <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tasks && tasks.length > 0 ? tasks.map(task => (
                  <div key={task.id} className="bg-white border border-zinc-200 hover:border-zinc-300 rounded-[20px] p-5 flex justify-between items-center shadow-sm transition-all group">
                    <div className="flex items-center gap-4">
                      <div className={`h-7 w-7 rounded-full border-2 flex items-center justify-center shrink-0 ${task.completed ? 'border-[#A86F6B] bg-[#A86F6B]' : 'border-zinc-300 group-hover:border-[#A86F6B]'}`}>
                        {task.completed && <CheckCircle2 className="h-4 w-4 text-white" />}
                      </div>
                      <span className={`text-base font-bold ${task.completed ? 'line-through text-zinc-400' : 'text-zinc-800'} line-clamp-2`}>{task.title}</span>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-2 py-8 text-center bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-3xl">
                    <span className="text-zinc-500 font-medium">Nenhuma tarefa cadastrada para este casamento.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Cronograma do dia */}
            <div className="pt-4">
              <div className="flex justify-between items-end mb-4">
                <h2 className="text-xl font-bold text-zinc-900">Cronograma do dia</h2>
                <Link href={`/dashboard/timeline?eventId=${nearestEvent.id}`} className="text-sm font-semibold text-[#A86F6B] hover:text-[#8F5E5A] flex items-center gap-1">
                  Editar cronograma <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="bg-white border border-zinc-100 rounded-3xl p-6 md:p-10 shadow-sm">
                <div className="space-y-6">
                  {timeline && timeline.length > 0 ? timeline.map(item => (
                     <div key={item.id} className="flex gap-4 md:gap-8 group">
                       <div className="w-16 font-bold text-[#A86F6B] text-sm md:text-base pt-0.5">{item.time.substring(0, 5)}</div>
                       <div className="relative flex-1 pb-6 border-l-2 border-zinc-100 pl-6 md:pl-8 group-last:border-transparent group-last:pb-0">
                         <div className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full bg-zinc-200 border-2 border-white"></div>
                         <h4 className="font-semibold text-zinc-900 text-sm md:text-base">{item.title}</h4>
                         {item.description && <p className="text-xs md:text-sm text-zinc-400 mt-1 line-clamp-2">{item.description}</p>}
                       </div>
                     </div>
                  )) : (
                     <div className="flex flex-col items-center justify-center py-8 text-center">
                       <p className="text-muted-foreground text-sm">Nenhum evento no roteiro. Clique em "Editar cronograma" para adicionar.</p>
                     </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Countdown widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <Card className="rounded-[32px] border-zinc-100 shadow-sm overflow-hidden bg-gradient-to-b from-white to-[#FCFAFA]">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="h-16 w-16 rounded-full bg-[#F9F0EE] flex items-center justify-center mb-6 shadow-inner">
                      <Clock3 className="h-8 w-8 text-[#A86F6B]" />
                    </div>
                    <h3 className="text-xs font-bold tracking-widest text-zinc-400 uppercase mb-2">Contagem Regressiva</h3>
                    <div className="flex items-baseline gap-2 justify-center">
                      <span className="text-7xl font-bold text-[#A86F6B] tracking-tighter leading-none">{daysRemaining}</span>
                      <span className="text-xl text-zinc-500 font-medium">dias</span>
                    </div>

                    <div className="w-full pt-8 mt-8 border-t border-zinc-100">
                      <div className="flex justify-between text-xs font-semibold text-zinc-400 mb-3">
                        <span>Checklist</span>
                        <span>{completedTasksCount}/{tasks.length || 0}</span>
                      </div>
                      <div className="w-full bg-zinc-200 rounded-full h-2 shadow-inner overflow-hidden">
                        <div className="bg-[#A86F6B] h-full rounded-full transition-all duration-1000" style={{ width: `${tasks.length > 0 ? (completedTasksCount/tasks.length)*100 : 0}%` }}></div>
                      </div>
                    </div>
                    
                    <Link href={`/dashboard/ceremony-3d`} className="w-full mt-8 block">
                      <button className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-medium transition-colors shadow-sm">
                        Acessar Mapa 3D
                      </button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

        </div>
      ) : (
        <div className="mt-8 flex flex-col items-center justify-center bg-white border border-dashed rounded-[32px] min-h-[400px] p-8 text-center">
          <CalendarIcon className="h-12 w-12 text-zinc-300 mb-4" />
          <h2 className="text-xl font-bold mb-2">Nenhum evento futuro</h2>
          <p className="text-muted-foreground mb-6">Você não tem nenhum casamento agendado.</p>
          <Link href="/dashboard/events/new">
            <button className="h-12 px-8 bg-[#A86F6B] hover:bg-[#8F5E5A] text-white font-medium rounded-full text-base transition-colors">
              Criar Primeiro Evento
            </button>
          </Link>
        </div>
      )}

      {/* Todos os eventos */}
      <div className="pt-8 border-t border-zinc-200 mt-12 mb-4 flex justify-between items-center">
        <h3 className="font-bold text-zinc-900">Todos os eventos</h3>
        <Link href="/dashboard/events" className="text-sm font-semibold text-[#A86F6B] hover:text-[#8F5E5A] flex items-center gap-1">
          Ver todos <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

    </div>
  );
}

function SparklesIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/>
      <path d="M19 17v4"/>
      <path d="M3 5h4"/>
      <path d="M17 19h4"/>
    </svg>
  );
}
