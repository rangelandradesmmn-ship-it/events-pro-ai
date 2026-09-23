'use client';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Upload, FileSpreadsheet, Loader2 } from 'lucide-react';
import { uploadPortalGuestsAction } from '@/app/actions/portal-guests';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';

export function CsvUploader({ eventId, token }: { eventId: string, token: string }) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      
      // Converte a planilha para uma matriz de arrays (linhas e colunas)
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      
      // Pula as linhas até encontrar os dados reais (ignorando títulos e cabeçalhos)
      const guestsToInsert = [];
      for (let i = 0; i < rows.length; i++) {
        const row: any = rows[i];
        if (Array.isArray(row) && row.length > 0 && row[0]) {
          const name = String(row[0]).trim();
          
          // Ignora se for o título da planilha ou o cabeçalho das colunas
          if (name.toLowerCase().includes('lista de convidados') || name.toLowerCase().includes('nome completo')) {
            continue;
          }

          if (name) {
            guestsToInsert.push({
              name: name,
              phone: row[1] ? String(row[1]).trim() : '',
              allowed_companions: row[2] ? parseInt(String(row[2]).trim()) || 0 : 0
            });
          }
        }
      }

      if (guestsToInsert.length === 0) {
        alert('Nenhum convidado encontrado na planilha.');
        setLoading(false);
        return;
      }

      const result = await uploadPortalGuestsAction(eventId, token, guestsToInsert);
      
      if (result.success) {
        alert(`${guestsToInsert.length} convidados importados com sucesso!`);
        router.refresh();
      } else {
        alert('Erro ao importar: ' + result.error);
      }

    } catch (err: any) {
      alert('Erro ao ler arquivo: ' + err.message);
    }
    
    setLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-zinc-50 border border-zinc-200 border-dashed rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
          <FileSpreadsheet className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="font-bold text-zinc-900">Importação em Lote</h3>
          <p className="text-sm text-zinc-500 mt-1">
            Baixe nossa planilha padrão, preencha com os nomes dos seus convidados e faça o upload aqui.
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-3 shrink-0">
        <a href="/template_convidados.xlsx" download>
          <Button variant="outline" className="bg-white">
            <Download className="h-4 w-4 mr-2" /> Modelo
          </Button>
        </a>
        
        <input 
          type="file" 
          accept=".xlsx, .xls, .csv"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <Button 
          onClick={() => fileInputRef.current?.click()} 
          disabled={loading}
          className="bg-zinc-900 text-white hover:bg-zinc-800"
        >
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
          {loading ? 'Lendo...' : 'Enviar Planilha'}
        </Button>
      </div>
    </div>
  );
}