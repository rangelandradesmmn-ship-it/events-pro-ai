import { createAdminClient as createClient } from '@/utils/supabase/admin';
import { notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Palette, Image as ImageIcon, Upload, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function InspirationsPage({ 
  params 
}: { 
  params: Promise<{ token: string }> 
}) {
  const resolvedParams = await params;
  const token = resolvedParams.token;
  const supabase = await createClient();

  const { data: client } = await supabase
    .from('clients')
    .select('*, events(*)')
    .eq('token', token)
    .single();

  if (!client || !client.events || client.events.length === 0) {
    notFound();
  }
  
  const event = client.events[0];
  const clientId = client.id;
  const eventId = event.id;

  // Since we might not have added theme_colors to events table yet, we'll try to fetch it, but handle if it fails
  let themeColors: string[] = [];
  try {
    const { data: eventData } = await supabase.from('events').select('theme_colors').eq('id', eventId).single();
    if (eventData?.theme_colors) themeColors = eventData.theme_colors;
  } catch (e) {
    // Column might not exist yet, fallback to empty
  }

  // Fetch inspiration files
  const { data: files } = await supabase
    .from('client_files')
    .select('*')
    .eq('client_id', clientId)
    .eq('file_type', 'inspiration')
    .order('created_at', { ascending: false });

  // Server Action to add a color
  async function addColor(formData: FormData) {
    'use server';
    const color = formData.get('color') as string;
    if (!color) return;
    
    const supabaseServer = await createClient();
    
    // Fetch current colors
    let currentColors: string[] = [];
    const { data: currentEvent } = await supabaseServer.from('events').select('theme_colors').eq('id', eventId).single();
    if (currentEvent?.theme_colors) currentColors = currentEvent.theme_colors;
    
    if (!currentColors.includes(color)) {
      const newColors = [...currentColors, color];
      await supabaseServer.from('events').update({ theme_colors: newColors }).eq('id', eventId);
      revalidatePath(`/portal/${token}/inspirations`);
    }
  }

  // Server Action to remove a color
  async function removeColor(formData: FormData) {
    'use server';
    const colorToRemove = formData.get('color') as string;
    const supabaseServer = await createClient();
    
    let currentColors: string[] = [];
    const { data: currentEvent } = await supabaseServer.from('events').select('theme_colors').eq('id', eventId).single();
    if (currentEvent?.theme_colors) currentColors = currentEvent.theme_colors;
    
    const newColors = currentColors.filter(c => c !== colorToRemove);
    await supabaseServer.from('events').update({ theme_colors: newColors }).eq('id', eventId);
    revalidatePath(`/portal/${token}/inspirations`);
  }

  // Server Action to upload image
  async function uploadImage(formData: FormData) {
    'use server';
    const file = formData.get('file') as File;
    if (!file || file.size === 0) return;
    
    const supabaseServer = await createClient();
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `inspirations/${clientId}/${fileName}`;

    const { error: uploadError } = await supabaseServer.storage
      .from('client_files')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload Error:', uploadError);
      throw new Error("Erro ao enviar imagem. Verifique se as permissões (SQL) foram aplicadas corretamente no banco.");
    }

    const { data: publicUrlData } = supabaseServer.storage
      .from('client_files')
      .getPublicUrl(filePath);

    const { error: dbError } = await supabaseServer.from('client_files').insert({
      client_id: clientId,
      file_name: file.name,
      file_url: publicUrlData.publicUrl,
      file_type: 'inspiration',
      file_size: file.size
    });

    if (dbError) {
      console.error('DB Error:', dbError);
      throw new Error("Erro ao salvar referência no banco.");
    }

    revalidatePath(`/portal/${token}/inspirations`);
  }

  // Server Action to delete image
  async function deleteImage(formData: FormData) {
    'use server';
    const fileId = formData.get('fileId') as string;
    const fileUrl = formData.get('fileUrl') as string;
    const supabaseServer = await createClient();
    
    const urlParts = fileUrl.split('/client_files/');
    if (urlParts.length > 1) {
      const path = urlParts[1];
      await supabaseServer.storage.from('client_files').remove([path]);
    }

    await supabaseServer.from('client_files').delete().eq('id', fileId);
    revalidatePath(`/portal/${token}/inspirations`);
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-12 pb-20">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 flex items-center gap-3">
          <Palette className="h-8 w-8 text-[#A86F6B]" />
          Painel de Inspirações
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Construa a visão estética do seu casamento. Salve sua paleta de cores e crie um mural de referências fotográficas para alinhar cada detalhe visual com a nossa assessoria.
        </p>
      </div>

      {/* 1. Paleta de Cores */}
      <div className="bg-white border border-zinc-100 rounded-[32px] p-6 md:p-10 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-zinc-100 pb-6">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">🎨</span>
              Paleta de Cores
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Defina as cores oficiais do evento (ideal para vestidos de madrinhas, flores e papelaria).</p>
          </div>
          
          <form action={addColor} className="flex items-center gap-2 bg-zinc-50 p-2 rounded-2xl border border-zinc-200">
            <input 
              type="color" 
              name="color" 
              defaultValue="#A86F6B"
              className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-none p-0 outline-none" 
            />
            <Button type="submit" variant="secondary" size="sm" className="rounded-xl h-10 px-4 font-semibold">
              <Plus className="h-4 w-4 mr-1" /> Adicionar Cor
            </Button>
          </form>
        </div>

        {themeColors && themeColors.length > 0 ? (
          <div className="flex flex-wrap gap-4">
            {themeColors.map(color => (
              <div key={color} className="group relative">
                <div 
                  className="w-20 h-20 md:w-24 md:h-24 rounded-2xl shadow-sm border border-black/5 transition-transform group-hover:scale-105"
                  style={{ backgroundColor: color }}
                />
                <div className="text-center mt-2 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  {color}
                </div>
                <form action={removeColor} className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <input type="hidden" name="color" value={color} />
                  <button type="submit" className="bg-white text-red-500 rounded-full p-1.5 shadow-md border border-zinc-100 hover:bg-red-50">
                    <X className="h-3 w-3" />
                  </button>
                </form>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
            <p className="text-muted-foreground text-sm">Nenhuma cor definida ainda. Escolha no seletor acima.</p>
          </div>
        )}
      </div>

      {/* 2. Mural de Referências (Moodboard) */}
      <div className="bg-white border border-zinc-100 rounded-[32px] p-6 md:p-10 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-zinc-100 pb-6">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">✨</span>
              Mural de Referências (Moodboard)
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Faça upload de fotos do Pinterest, vestidos que você amou, arranjos de mesa e bolos.</p>
          </div>
          
          <form action={uploadImage} className="flex items-center gap-2">
            <label className="relative cursor-pointer group">
              <div className="flex items-center gap-2 bg-[#A86F6B] hover:bg-[#8F5E5A] text-white px-5 h-12 rounded-full font-medium transition-colors shadow-sm">
                <Upload className="h-4 w-4" />
                <span>Subir Imagem</span>
              </div>
              <input 
                type="file" 
                name="file" 
                accept="image/*" 
                className="hidden" 
              />
            </label>
            <Button type="submit" variant="outline" className="h-12 rounded-full px-6 border-zinc-200">
              Salvar
            </Button>
          </form>
        </div>

        {files && files.length > 0 ? (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {files.map(file => (
              <div key={file.id} className="relative group break-inside-avoid">
                <img 
                  src={file.file_url} 
                  alt="Inspiração" 
                  className="w-full rounded-2xl object-cover border border-zinc-100 shadow-sm transition-transform duration-300 group-hover:scale-[1.02]"
                />
                
                {/* Delete overlay on hover */}
                <form action={deleteImage} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center backdrop-blur-[2px]">
                  <input type="hidden" name="fileId" value={file.id} />
                  <input type="hidden" name="fileUrl" value={file.file_url} />
                  <button type="submit" className="bg-white/90 text-red-600 p-3 rounded-full hover:bg-white hover:scale-110 transition-all shadow-xl">
                    <X className="h-5 w-5" />
                  </button>
                </form>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-zinc-50 rounded-3xl border border-dashed border-zinc-200 flex flex-col items-center">
            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
              <ImageIcon className="h-8 w-8 text-zinc-300" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 mb-1">O mural está em branco</h3>
            <p className="text-muted-foreground text-sm max-w-sm">Clique em "Subir Imagem" e depois em "Salvar" para começar a preencher o seu mural com referências maravilhosas.</p>
          </div>
        )}
      </div>

    </div>
  );
}
