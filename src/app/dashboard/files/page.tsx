import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, FolderOpen, ExternalLink, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Force Next.js to NEVER cache this page

// Helper to format bytes
function formatFileSize(bytes: number) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default async function FilesPage() {
  const supabase = await createClient();
  
  // Fetch all files from all clients (force inner join to guarantee RLS blocks leak)
  const { data: files, error } = await supabase
    .from('client_files')
    .select('*, clients!inner(full_name)')
    .order('created_at', { ascending: false });
    
  if (error) console.error("Erro ao buscar arquivos globais:", error);

  const totalFiles = files?.length || 0;
  const totalSize = files?.reduce((acc, f) => acc + (f.file_size || 0), 0) || 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Arquivos</h1>
          <p className="text-muted-foreground mt-1">Repositório de todos os documentos anexados no sistema.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Arquivos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFiles}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Armazenamento Utilizado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatFileSize(totalSize)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Arquivos</CardTitle>
          <CardDescription>Para enviar novos arquivos, acesse o perfil de um cliente.</CardDescription>
        </CardHeader>
        <CardContent>
          {files && files.length > 0 ? (
            <div className="rounded-md border">
              <table className="w-full text-sm text-left">
                <thead className="bg-zinc-50 border-b">
                  <tr>
                    <th className="px-4 py-3 font-medium text-zinc-600">Arquivo</th>
                    <th className="px-4 py-3 font-medium text-zinc-600">Cliente (Proprietário)</th>
                    <th className="px-4 py-3 font-medium text-zinc-600">Tamanho</th>
                    <th className="px-4 py-3 font-medium text-zinc-600">Data de Upload</th>
                    <th className="px-4 py-3 font-medium text-zinc-600 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {files.map((f) => (
                    <tr key={f.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-zinc-400" />
                          <span className="font-medium truncate max-w-[200px]">{f.file_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/dashboard/clients/${f.client_id}?tab=files`} className="hover:underline text-gold-600">
                          {f.clients?.full_name || 'Desconhecido'}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatFileSize(f.file_size)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(f.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <a href={f.file_url} target="_blank" rel="noreferrer">
                          <Button size="sm" variant="ghost" className="h-8">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Abrir
                          </Button>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg bg-zinc-50/50">
              <FolderOpen className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
              <p>Nenhum arquivo no sistema ainda.</p>
              <p className="text-sm mt-1">Acesse a aba "Arquivos" de um Cliente para enviar.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
