'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus } from 'lucide-react';
import { updateRsvpAction } from '@/app/actions/rsvp';

export function RsvpClientForm({ guest, token }: { guest: any, token: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(guest.status || 'pending');
  const [notes, setNotes] = useState(guest.notes || '');
  
  // existing companions or empty list
  const [companions, setCompanions] = useState<{name: string, relationship: string}[]>(
    guest.companions_names || []
  );

  const allowed = guest.allowed_companions || 0;

  const handleAdd = () => {
    if (companions.length < allowed) {
      setCompanions([...companions, { name: '', relationship: '' }]);
    }
  };

  const handleRemove = (index: number) => {
    setCompanions(companions.filter((_, i) => i !== index));
  };

  const updateCompanion = (index: number, field: 'name' | 'relationship', value: string) => {
    const newComps = [...companions];
    newComps[index][field] = value;
    setCompanions(newComps);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Validate empty names
    for (const comp of companions) {
      if (!comp.name.trim()) {
        alert('Por favor, preencha o nome de todos os acompanhantes.');
        setLoading(false);
        return;
      }
    }

    const formData = new FormData();
    formData.append('token', token);
    formData.append('status', status);
    formData.append('notes', notes);
    formData.append('companions_names', JSON.stringify(companions));
    formData.append('companions_count', companions.length.toString());

    const result = await updateRsvpAction(formData);
    if (result.success) {
      alert('Presença confirmada com sucesso!');
      router.refresh();
    } else {
      alert('Erro ao salvar: ' + result.error);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-2">
        <Label htmlFor="status">Você poderá comparecer?</Label>
        <select 
          id="status" 
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          required
          className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-500"
        >
          <option value="pending">Ainda não sei (Pendente)</option>
          <option value="confirmed">Sim, eu irei! (Confirmado)</option>
          <option value="declined">Não poderei ir (Recusado)</option>
        </select>
      </div>

      {status === 'confirmed' && allowed > 0 && (
        <div className="border rounded-xl p-4 bg-zinc-50 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-zinc-900">Acompanhantes</h4>
              <p className="text-xs text-zinc-500">Sua cota: {companions.length} de {allowed} permitidos.</p>
            </div>
            {companions.length < allowed && (
              <Button type="button" variant="outline" size="sm" onClick={handleAdd} className="h-8 text-xs bg-white">
                <Plus className="h-3 w-3 mr-1" /> Adicionar
              </Button>
            )}
          </div>
          
          {companions.length > 0 ? (
            <div className="space-y-3">
              {companions.map((comp, i) => (
                <div key={i} className="flex items-start gap-2 bg-white p-3 rounded-lg border border-zinc-200 shadow-sm">
                  <div className="flex-1 space-y-3">
                    <div className="grid gap-1.5">
                      <Label className="text-xs">Nome Completo</Label>
                      <Input value={comp.name} onChange={(e) => updateCompanion(i, 'name', e.target.value)} required placeholder="Ex: Maria Silva" className="h-9 text-sm" />
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-xs">Parentesco / Relação</Label>
                      <Input value={comp.relationship} onChange={(e) => updateCompanion(i, 'relationship', e.target.value)} placeholder="Ex: Esposa, Filho..." className="h-9 text-sm" />
                    </div>
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => handleRemove(i)} className="h-8 w-8 text-zinc-400 hover:text-red-500 mt-5 shrink-0">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500 italic text-center py-2">Você não adicionou nenhum acompanhante.</p>
          )}
        </div>
      )}

      <div className="grid gap-2">
        <Label htmlFor="notes">Alguma restrição alimentar ou observação?</Label>
        <Textarea 
          id="notes" 
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ex: Sou vegetariano, alergia a amendoim..."
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full h-12 text-lg bg-zinc-900 text-gold-50 hover:bg-zinc-800">
        {loading ? 'Enviando...' : 'Enviar Resposta'}
      </Button>
    </form>
  );
}