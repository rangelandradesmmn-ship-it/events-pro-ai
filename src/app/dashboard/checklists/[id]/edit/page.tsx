import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Link from 'next/link';

export default async function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const taskId = resolvedParams.id;
  
  const supabase = await createClient();
  const { data: task } = await supabase.from('tasks').select('*').eq('id', taskId).single();
  
  if (!task) {
    redirect('/dashboard/checklists');
  }

  async function updateTask(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    const title = formData.get('title') as string;
    const due_date = formData.get('due_date') as string;

    const supabaseServer = await createClient();
    await supabaseServer.from('tasks').update({
      title,
      due_date: due_date || null
    }).eq('id', id);

    redirect('/dashboard/checklists' + (task.event_id ? `?event_id=${task.event_id}` : ''));
  }

  return (
    <div className="flex flex-col gap-8 max-w-xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Editar Tarefa</h1>
        <p className="text-muted-foreground mt-1">Atualize os detalhes da tarefa.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes</CardTitle>
        </CardHeader>
        <form action={updateTask}>
          <input type="hidden" name="id" value={task.id} />
          <CardContent className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="title">Título da Tarefa</Label>
              <Input id="title" name="title" defaultValue={task.title} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="due_date">Data de Vencimento</Label>
              <Input id="due_date" name="due_date" type="date" defaultValue={task.due_date ? task.due_date.split('T')[0] : ''} />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t p-6">
            <Link href={`/dashboard/checklists${task.event_id ? `?event_id=${task.event_id}` : ''}`}>
              <Button type="button" variant="outline">Cancelar</Button>
            </Link>
            <Button type="submit" className="bg-zinc-900 text-gold-50">
              Salvar Alterações
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
