'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Loader2, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function SettingsForm({ profile, userId }: { profile: any; userId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [logoUrl, setLogoUrl] = useState(profile?.agency_logo_url || '');
  const [color, setColor] = useState(profile?.agency_color || '#000000');
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPreviewFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setSuccess(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setSuccess(false);

    try {
      let finalLogoUrl = logoUrl;

      // 1. Upload new image if selected
      if (previewFile) {
        const fileExt = previewFile.name.split('.').pop();
        const fileName = `${userId}-${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('agency_logos')
          .upload(filePath, previewFile, { upsert: true });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data } = supabase.storage.from('agency_logos').getPublicUrl(filePath);
        finalLogoUrl = data.publicUrl;
        setLogoUrl(finalLogoUrl);
      }

      // 2. Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          agency_logo_url: finalLogoUrl,
          agency_color: color,
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      setSuccess(true);
      setPreviewFile(null);
      router.refresh();

    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Ocorreu um erro ao salvar as configurações.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-zinc-100 shadow-sm">
      <CardHeader>
        <CardTitle>Identidade Visual</CardTitle>
        <CardDescription>
          Personalize a experiência dos seus clientes. A logo e cor escolhidas aparecerão no Portal dos Noivos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        
        {/* Logo Upload */}
        <div className="space-y-4">
          <Label>Logo da sua Agência</Label>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="h-32 w-48 bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-xl flex items-center justify-center overflow-hidden relative">
              {previewUrl || logoUrl ? (
                <img 
                  src={previewUrl || logoUrl} 
                  alt="Sua logo" 
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <div className="flex flex-col items-center text-zinc-400">
                  <ImageIcon className="h-8 w-8 mb-2" />
                  <span className="text-xs font-medium">Nenhuma logo</span>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-2 w-full">
              <Label htmlFor="logo-upload" className="cursor-pointer">
                <div className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-bold text-zinc-50 hover:bg-zinc-900/90 w-full md:w-auto">
                  <Upload className="mr-2 h-4 w-4" />
                  Escolher arquivo...
                </div>
              </Label>
              <Input 
                id="logo-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange}
              />
              <p className="text-xs text-zinc-500">Recomendado: PNG transparente (máx. 2MB)</p>
            </div>
          </div>
        </div>

        {/* Color Picker */}
        <div className="space-y-4">
          <Label>Cor Principal (Destaques)</Label>
          <div className="flex items-center gap-4">
            <Input 
              type="color" 
              value={color} 
              onChange={(e) => setColor(e.target.value)}
              className="h-12 w-24 p-1 cursor-pointer rounded-lg"
            />
            <Input 
              type="text" 
              value={color} 
              onChange={(e) => setColor(e.target.value)}
              className="w-32 uppercase font-mono"
            />
          </div>
          <p className="text-xs text-zinc-500">Usada em botões e pequenos detalhes no portal.</p>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-zinc-100 flex items-center gap-4">
          <Button 
            onClick={handleSave} 
            disabled={loading || (!previewFile && color === profile?.agency_color)}
            className="rounded-xl h-12 px-8 font-bold"
          >
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Salvar Configurações
          </Button>

          {success && (
            <span className="text-emerald-600 flex items-center text-sm font-medium animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              Salvo com sucesso!
            </span>
          )}
        </div>

      </CardContent>
    </Card>
  );
}
