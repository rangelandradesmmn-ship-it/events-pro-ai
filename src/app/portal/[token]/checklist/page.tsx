import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { CheckCircle2, Circle, ListChecks, Calendar } from 'lucide-react';

export default async function PortalChecklistPage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = await params;
  const token = resolvedParams.token;
  const supabase = await createClient();

  const { data: client } = await supabase
    .from('clients')
    .select('*, events(*)')
    .eq('token', token)
    .single();

  if (!client) {
    notFound();
  }
  
  const event = client.events && client.events.length > 0 ? client.events[0] : null;
  
  if (!event) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto text-center mt-12">
        <p className="text-muted-foreground">Nenhum evento vinculado ao seu perfil.</p>
      </div>
    );
  }

  // Fetch Tasks
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('event_id', event.id)
    .order('due_date', { ascending: true, nullsFirst: false });

  const completedTasks = tasks?.filter(t => t.completed) || [];
  const pendingTasks = tasks?.filter(t => !t.completed) || [];
  
  const totalTasks = (tasks?.length) || 0;
  const progress = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">Checklist do Evento</h1>
        <p className="text-muted-foreground mt-1">Acompanhe o andamento dos preparativos do seu casamento.</p>
      </div>

      <div className="bg-white border border-zinc-100 rounded-[32px] p-6 md:p-10 shadow-sm space-y-8">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between items-end mb-2">
            <div>
              <span className="text-3xl font-bold text-[#A86F6B]">{progress}%</span>
              <span className="text-sm font-medium text-zinc-500 ml-2">concluído</span>
            </div>
            <span className="text-sm font-semibold text-zinc-700">{completedTasks.length} de {totalTasks} tarefas</span>
          </div>
          <div className="w-full bg-zinc-100 rounded-full h-3">
            <div className="bg-[#A86F6B] h-3 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        {tasks && tasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pendentes */}
            <div>
              <h3 className="font-bold text-zinc-900 mb-4 flex items-center gap-2">
                <Circle className="h-4 w-4 text-zinc-400" />
                Tarefas Pendentes
                <span className="bg-zinc-100 text-zinc-500 text-xs px-2 py-0.5 rounded-full">{pendingTasks.length}</span>
              </h3>
              
              <div className="space-y-3">
                {pendingTasks.map(task => (
                  <div key={task.id} className="p-4 border border-zinc-100 rounded-2xl bg-[#FCFAFA]">
                    <div className="flex items-start gap-3">
                      <Circle className="h-5 w-5 text-zinc-300 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-zinc-900 leading-tight">{task.title}</h4>
                        {task.category && (
                          <span className="inline-block px-2 py-0.5 mt-2 bg-white border border-zinc-100 text-[10px] font-bold tracking-wider uppercase text-zinc-500 rounded">
                            {task.category}
                          </span>
                        )}
                        {task.due_date && (
                          <div className="flex items-center gap-1 text-xs font-medium text-[#A86F6B] mt-2">
                            <Calendar className="h-3.5 w-3.5" />
                            Prazo: {new Date(task.due_date).toLocaleDateString('pt-BR')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {pendingTasks.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">Tudo em dia!</p>
                )}
              </div>
            </div>

            {/* Concluídas */}
            <div>
              <h3 className="font-bold text-zinc-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Tarefas Concluídas
                <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">{completedTasks.length}</span>
              </h3>
              
              <div className="space-y-3 opacity-70">
                {completedTasks.map(task => (
                  <div key={task.id} className="p-3 border border-transparent rounded-xl flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                    <div>
                      <h4 className="font-medium text-zinc-500 line-through">{task.title}</h4>
                      {task.category && (
                        <span className="inline-block text-[10px] font-bold tracking-wider uppercase text-zinc-400 mt-1">
                          {task.category}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {completedTasks.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">Nenhuma tarefa marcada como concluída ainda.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center border-t border-zinc-100">
            <div className="bg-zinc-50 p-6 rounded-full mb-6">
              <ListChecks className="h-10 w-10 text-zinc-300" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-2">Checklist não publicado</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Sua assessoria ainda está elaborando a lista de tarefas para o seu evento.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
