import { createAdminClient as createClient } from '@/utils/supabase/admin';
import { notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Paperclip, FileText, Upload, X, Download, FileIcon, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

function formatFileSize(bytes: number) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default async function PortalDocumentsPage({ 
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

  if (!client) {
    notFound();
  }
  
  const clientId = client.id;

  // Fetch documents (all files that are NOT inspirations)
  const { data: files } = await supabase
    .from('client_files')
    .select('*')
    .eq('client_id', clientId)
    .neq('file_type', 'inspiration') // Don't show moodboard photos here
    .order('created_at', { ascending: false });

  // Include files with NULL file_type as well
  const { data: nullFiles } = await supabase
    .from('client_files')
    .select('*')
    .eq('client_id', clientId)
    .is('file_type', null)
    .order('created_at', { ascending: false });

  // Merge and sort
  const allDocuments = [...(files || []), ...(nullFiles || [])].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  async function uploadDocument(formData: FormData) {
    'use server';
    const file = formData.get('file') as File;
    if (!file || file.size === 0) return;
    
    const supabaseServer = await createClient();
    
    // Normalize file name to avoid weird characters in URL
    const originalName = file.name;
    const fileExt = originalName.split('.').pop();
    const safeName = originalName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const fileName = `${Math.random().toString(36).substring(2, 10)}_${Date.now()}_${safeName}`;
    const filePath = `documents/${clientId}/${fileName}`;

    const { error: uploadError } = await supabaseServer.storage
      .from('client_files')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload Error:', uploadError);
      throw new Error("Erro ao enviar documento. Tente nãovamente.");
    }

    const { data: publicUrlData } = supabaseServer.storage
      .from('client_files')
      .getPublicUrl(filePath);

    const { error: dbError } = await supabaseServer.from('client_files').insert({
      client_id: clientId,
      file_name: originalName,
      file_url: publicUrlData.publicUrl,
      file_type: 'document',
      file_size: file.size
    });

    if (dbError) {
      console.error('DB Error:', dbError);
      throw new Error("Erro ao registrar documento não banco.");
    }

    revalidatePath(`/portal/${token}/documents`);
  }

  async function deleteDocument(formData: FormData) {
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
    revalidatePath(`/portal/${token}/documents`);
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 pb-20">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 flex items-center gap-3">
          <Paperclip className="h-8 w-8 text-[#A86F6B]" />
          Documentos
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Repositório seguro para você e a assessoria trocarem arquivos importantes, como RGs, comprovantes, planilhas e alvarás.
        </p>
      </div>

      {/* Document List */}
      <div className="bg-white border border-zinc-100 rounded-[32px] p-6 md:p-10 shadow-sm">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-zinc-100 pb-6">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">📁</span>
              Meus Arquivos
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Anexe aqui contratos assinados, fotos de documentos e afins.</p>
          </div>
          
          <form action={uploadDocument} className="flex items-center">
            <label className="relative cursor-pointer group w-full md:w-auto">
              <div className="flex items-center justify-center gap-2 bg-white border-2 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-700 px-6 h-12 rounded-full font-medium transition-colors shadow-sm">
                <Paperclip className="h-4 w-4" />
                <span>Escolher Arquivo</span>
              </div>
              <input 
                type="file" 
                name="file" 
                className="hidden" 
              />
            </label>
            <Button type="submit" className="ml-2 h-12 rounded-full px-6 font-semibold bg-zinc-900 text-white hover:bg-zinc-800">
              Enviar
            </Button>
          </form>
        </div>

        {allDocuments && allDocuments.length > 0 ? (
          <div className="divide-y divide-zinc-100 -mx-6 md:-mx-10 border-b border-zinc-100 mb-6">
            {allDocuments.map(doc => (
              <div key={doc.id} className="p-6 hover:bg-zinc-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-zinc-900 truncate">{doc.file_name}</h3>
                    <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                      <span>{formatFileSize(doc.file_size)}</span>
                      <span>•</span>
                      <span>{new Date(doc.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a 
                    href={doc.file_url} 
                    target="_blank" 
                    rel="nãoopener nãoreferrer"
                    className="flex items-center justify-center h-10 px-4 rounded-xl bg-zinc-100 text-zinc-700 hover:bg-zinc-200 font-medium text-sm transition-colors"
                  >
                    <Download className="h-4 w-4 mr-2" /> Baixar
                  </a>
                  
                  <form action={deleteDocument}>
                    <input type="hidden" name="fileId" value={doc.id} />
                    <input type="hidden" name="fileUrl" value={doc.file_url} />
                    <button type="submit" className="flex items-center justify-center h-10 w-10 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors" title="Excluir arquivo">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center flex flex-col items-center">
            <div className="bg-zinc-50 p-4 rounded-full shadow-sm mb-4">
              <FileIcon className="h-8 w-8 text-zinc-300" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 mb-1">Nenhum documento anexado</h3>
            <p className="text-muted-foreground text-sm max-w-sm mb-6">
              Os arquivos trocados entre você e a assessoria ficarão salvos aqui.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
