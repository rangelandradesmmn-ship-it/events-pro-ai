'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { UploadCloud, File, Trash2, Loader2 } from 'lucide-react';

export function FileUploader({ clientId, existingFiles = [] }: { clientId: string, existingFiles: any[] }) {
  const supabase = createClient();
  const router = useRouter();
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    // 1. Upload to Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${clientId}/${Math.random()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('client_files')
      .upload(fileName, file);

    if (uploadError) {
      alert('Erro no upload: ' + uploadError.message);
      setUploading(false);
      return;
    }

    // 2. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('client_files')
      .getPublicUrl(fileName);

    // 3. Save to database
    const { error: dbError } = await supabase.from('client_files').insert({
      client_id: clientId,
      file_name: file.name,
      file_url: publicUrl,
      file_type: file.type,
      file_size: file.size,
    });

    if (dbError) {
      alert('Erro ao salvar no banco: ' + dbError.message);
    } else {
      router.refresh();
    }
    
    setUploading(false);
  };

  const handleDelete = async (id: string, url: string) => {
    if (!confirm('Tem certeza que deseja excluir este arquivo?')) return;
    
    // Simplification: We delete from DB, but we should also delete from Storage
    const path = url.split('/').pop();
    if (path) {
      await supabase.storage.from('client_files').remove([`${clientId}/${path}`]);
    }
    
    await supabase.from('client_files').delete().eq('id', id);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-zinc-300 rounded-xl p-8 text-center bg-zinc-50 hover:bg-zinc-100 transition-colors relative">
        <input 
          type="file" 
          onChange={handleFileUpload} 
          disabled={uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          title="Clique para fazer upload"
        />
        <div className="flex flex-col items-center justify-center gap-2">
          {uploading ? (
            <Loader2 className="h-10 w-10 text-gold-500 animate-spin" />
          ) : (
            <UploadCloud className="h-10 w-10 text-muted-foreground" />
          )}
          <p className="font-medium text-zinc-900">
            {uploading ? 'Enviando arquivo...' : 'Clique ou arraste o arquivo aqui'}
          </p>
          <p className="text-xs text-muted-foreground">PDF, Imagens ou Planilhas (Max. 10MB)</p>
        </div>
      </div>

      {/* Files List */}
      <div className="grid gap-3">
        {existingFiles.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhum arquivo anexado.</p>
        ) : (
          existingFiles.map((file) => (
            <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg bg-white">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 bg-zinc-100 rounded text-zinc-600">
                  <File className="h-5 w-5" />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <a href={file.file_url} target="_blank" rel="noreferrer" className="text-sm font-medium hover:underline truncate">
                    {file.file_name}
                  </a>
                  <span className="text-xs text-muted-foreground">
                    {(file.file_size / 1024).toFixed(1)} KB • {new Date(file.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(file.id, file.file_url)} className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
