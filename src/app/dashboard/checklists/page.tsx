import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2, Circle, Clock, CheckSquare, Plus, Calendar, Sparkles, Trash2, Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { revalidatePath } from 'next/cache';
import { generateChecklistWithAI } from '@/app/actions/ai-checklist';

export default async function ChecklistsPage({ searchParams }: { searchParams: Promise<{ event_id?: string }> }) {
  const supabase = await createClient();
  const resolvedParams = await searchParams;
  const eventId = resolvedParams.event_id;
  
  // Fetch events for selector
  const { data: events } = await supabase.from('events').select('id, title').order('date');

  // Fetch tasks
  let query = supabase.from('tasks').select('*, events(title)').order('completed', { ascending: true }).order('due_date', { ascending: true });
  if (eventId) {
    query = query.eq('event_id', eventId);
  }
  const { data: tasks } = await query;

  async function toggleTask(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    const completedStr = formData.get('completed') as string;
    const completed = completedStr === 'true';
    
    const supabaseServer = await createClient();
    await supabaseServer.from('tasks').update({ completed: !completed }).eq('id', id);
    revalidatePath('/dashboard/checklists');
  }

  async function addTask(formData: FormData) {
    'use server';
    const title = formData.get('title') as string;
    const due_date = formData.get('due_date') as string;
    const event_id = formData.get('event_id') as string;
    
    if (!title) return;
    
    const supabaseServer = await createClient();
    await supabaseServer.from('tasks').insert({ 
      title, 
      due_date: due_date || null, 
      event_id: event_id || null 
    });
    revalidatePath('/dashboard/checklists');
  }

  async function deleteTask(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    const supabaseServer = await createClient();
    await supabaseServer.from('tasks').delete().eq('id', id);
    revalidatePath('/dashboard/checklists');
  }

  // Progress calculations
  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter(t => t.completed).length || 0;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Checklists</h1>
          <p className="text-muted-foreground mt-1">Acompanhe as tarefas e não deixe nenhum detalhe do evento para trás.</p>
        </div>
        {eventId && (
          <form action={generateChecklistWithAI}>
             <input type="hidden" name="event_id" value={eventId} />
             <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-md transition-all hover:scale-105">
               <Sparkles className="mr-2 h-4 w-4" /> Gerar Checklist Inteligente
             </Button>
          </form>
        )}
      </div>

      {/* Event Selector */}
      <Card className="bg-zinc-50 border-dashed">
        <CardContent className="p-4 flex items-center gap-4">
          <CheckSquare className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium">Filtrar por Evento:</span>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <Link href="/dashboard/checklists">
              <Badge variant={!eventId ? "default" : "outline"} className={!eventId ? "bg-zinc-900" : "bg-white"}>
                Todos
              </Badge>
            </Link>
            {events?.map(ev => (
              <Link key={ev.id} href={`/dashboard/checklists?event_id=${ev.id}`}>
                <Badge variant={eventId === ev.id ? "default" : "outline"} className={eventId === ev.id ? "bg-zinc-900" : "bg-white"}>
                  {ev.title}
                </Badge>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Adicionar Tarefa */}
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Nova Tarefa</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={addTask} className="grid gap-4">
                {eventId && <input type="hidden" name="event_id" value={eventId} />}
                {!eventId && (
                  <select 
                    name="event_id" 
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  >
                    <option value="">(Tarefa Geral - Sem Evento)</option>
                    {events?.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
                  </select>
                )}
                <Input name="title" placeholder="O que precisa ser feito?" required />
                <Input name="due_date" type="date" title="Prazo (Opcional)" />
                <Button type="submit" className="w-full bg-zinc-900 text-gold-50">
                  <Plus className="h-4 w-4 mr-2" /> Adicionar
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Progresso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-zinc-900 mb-2">{progressPercent}%</div>
              <div className="w-full bg-zinc-100 rounded-full h-2.5">
                <div className="bg-gold-500 h-2.5 rounded-full" style={{ width: `${progressPercent}%` }}></div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{completedTasks} de {totalTasks} concluídas</p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Tarefas */}
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-0">
              {tasks && tasks.length > 0 ? (
                <div className="divide-y">
                  {tasks.map((task) => (
                    <div key={task.id} className={`group p-4 flex items-start gap-3 hover:bg-zinc-50 transition-colors ${task.completed ? 'opacity-60 bg-zinc-50/50' : ''}`}>
                      <form action={toggleTask}>
                        <input type="hidden" name="id" value={task.id} />
                        <input type="hidden" name="completed" value={task.completed.toString()} />
                        <button type="submit" className="mt-0.5 text-zinc-400 hover:text-gold-600 transition-colors">
                          {task.completed ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <Circle className="h-5 w-5" />
                          )}
                        </button>
                      </form>
                      
                      <div className="flex-1">
                        <div className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : 'text-zinc-900'}`}>
                          {task.title}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          {task.due_date && (
                            <span className="flex items-center gap-1 text-red-600/80">
                              <Calendar className="h-3 w-3" />
                              {new Date(task.due_date + 'T12:00:00Z').toLocaleDateString('pt-BR')}
                            </span>
                          )}
                          {!eventId && task.events && (
                            <span className="flex items-center gap-1">
                              <CheckSquare className="h-3 w-3" />
                              {task.events.title}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/dashboard/checklists/${task.id}/edit`}>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-zinc-400 hover:text-zinc-900">
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </Link>
                        <form action={deleteTask}>
                          <input type="hidden" name="id" value={task.id} />
                          <Button type="submit" size="icon" variant="ghost" className="h-7 w-7 text-zinc-400 hover:text-red-600">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <CheckSquare className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                  <p>Nenhuma tarefa pendente.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
