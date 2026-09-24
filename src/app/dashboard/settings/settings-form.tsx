'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Loader2, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { updateSettingsAction } from '@/app/actions/settings';

export function SettingsForm({ profile, userId }: { profile: any; userId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [logoUrl, setLogoUrl] = useState(profile?.agency_logo_url || '');
  const [color, setColor] = useState(profile?.agency_color || '#000000');
  const [whatsapp, setWhatsapp] = useState(profile?.whatsapp || '');
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

      // 2. Update profile using Server Action to bypass RLS
      const formData = new FormData();
      formData.append('logoUrl', finalLogoUrl);
      formData.append('color', color);
      formData.append('whatsapp', whatsapp);

      const result = await updateSettingsAction(formData);

      if (!result.success) {
        throw new Error(result.error);
      }

      setSuccess(true);
      setPreviewFile(null);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar as configurações.');
    } finally {
      setLoading(false);
    }
  };

  const currentLogo = previewUrl || logoUrl;

  return (
    <Card className="border-zinc-200 shadow-sm">
      <CardHeader className="bg-zinc-50 border-b border-zinc-100 pb-6 rounded-t-xl">
        <CardTitle>Identidade Visual e Contato</CardTitle>
        <CardDescription>
          Personalize a experiência dos seus clientes. A logo, a cor e o WhatsApp escolhidos aparecerão no Portal do Cliente.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-8">
        
        {/* Logo Upload */}
        <div className="space-y-4">
          <Label>Logo da sua Agência</Label>
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <div className="h-32 w-48 border-2 border-dashed border-zinc-200 rounded-xl flex items-center justify-center bg-zinc-50 overflow-hidden relative group">
              {currentLogo ? (
                <img src={currentLogo} alt="Logo preview" className="max-h-full max-w-full object-contain p-2" />
              ) : (
                <div className="flex flex-col items-center text-zinc-400">
                  <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                  <span className="text-xs font-medium">Nenhuma logo</span>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-2">
              <Label htmlFor="logo-upload" className="cursor-pointer inline-block">
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
              onChange={(e) => { setColor(e.target.value); setSuccess(false); }}
              className="h-12 w-24 p-1 cursor-pointer rounded-lg"
            />
            <Input 
              type="text" 
              value={color} 
              onChange={(e) => { setColor(e.target.value); setSuccess(false); }}
              className="w-32 uppercase font-mono"
            />
          </div>
          <p className="text-xs text-zinc-500">Usada em botões e pequenos detalhes no portal.</p>
        </div>

        {/* WhatsApp */}
        <div className="space-y-4">
          <Label htmlFor="whatsapp">WhatsApp de Contato (Botão do Portal)</Label>
          <div className="flex items-center gap-4">
            <Input 
              id="whatsapp"
              type="text" 
              placeholder="Ex: 5511999999999"
              value={whatsapp} 
              onChange={(e) => { setWhatsapp(e.target.value); setSuccess(false); }}
              className="max-w-md h-12"
            />
          </div>
          <p className="text-xs text-zinc-500">
            Digite apenas números, incluindo o código do país (Ex: 55 para o Brasil). O cliente será direcionado para este número ao clicar em "Fale com o Cerimonial".
          </p>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-zinc-100 flex items-center gap-4">
          <Button 
            onClick={handleSave} 
            disabled={loading || (!previewFile && color === profile?.agency_color && whatsapp === profile?.whatsapp)}
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
