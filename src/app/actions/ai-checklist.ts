'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { GoogleGenAI } from '@google/genai';

export async function generateChecklistWithAI(formData: FormData) {
  const eventId = formData.get('event_id') as string;
  if (!eventId) throw new Error('Selecione um evento primeiro');

  const supabase = await createClient();
  
  // 1. Fetch event details
  const { data: event } = await supabase.from('events').select('*').eq('id', eventId).single();
  if (!event) throw new Error('Evento não encontrado');

  // 2. Call Gemini API
  const prompt = `Você é um Cerimonialista de Alto Padrão.
Crie um checklist de 5 tarefas cruciais para organizar o seguinte evento:
Título: ${event.title}
Data: ${event.date}
Local: ${event.location || 'Não definido'}

Retorne APENAS um array JSON válido. Cada objeto deve ter:
- "title": string curta com o nome da tarefa
- "days_before": número inteiro de dias de antecedência para concluir

Exemplo: [{"title": "Degustação do Buffet", "days_before": 45}]`;

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  let response;
  let retries = 3;
  while (retries > 0) {
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      });
      break; // Success
    } catch (error: any) {
      if (error.message && error.message.includes('503')) {
        retries--;
        if (retries === 0) throw new Error('A IA está sobrecarregada no momento. Tente novamente em alguns instantes.');
        await new Promise(res => setTimeout(res, 2000)); // wait 2 seconds
      } else {
        throw error;
      }
    }
  }

  let tasks = [];
  try {
    tasks = JSON.parse(response?.text || '[]');
  } catch (e) {
    throw new Error('A IA não retornou o formato esperado.');
  }

  // 3. Insert into database
  const eventDate = new Date(event.date);
  
  const tasksToInsert = tasks.map((t: any) => {
    const dueDate = new Date(eventDate);
    dueDate.setDate(dueDate.getDate() - (t.days_before || 0));
    
    return {
      event_id: event.id,
      title: '✨ ' + t.title,
      due_date: dueDate.toISOString().split('T')[0],
      completed: false
    };
  });

  await supabase.from('tasks').insert(tasksToInsert);
  revalidatePath('/dashboard/checklists');
}
