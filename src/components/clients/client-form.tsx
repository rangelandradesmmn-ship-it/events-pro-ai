'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

export function ClientForm() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    cpf: '',
    email: '',
    phone: '',
    whatsapp: '',
    address: '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('clients').insert({
      full_name: formData.full_name,
      cpf: formData.cpf || null,
      email: formData.email || null,
      phone: formData.phone || null,
      whatsapp: formData.whatsapp || null,
      address: formData.address || null,
      notes: formData.notes || null,
    });

    if (!error) {
      router.push('/dashboard/clients');
      router.refresh();
    } else {
      console.error(error);
      alert('Erro ao salvar cliente: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Dados do Cliente</CardTitle>
        <CardDescription>Cadastre as informações de contato e faturamento do cliente.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="full_name">Nome Completo / Razão Social *</Label>
            <Input id="full_name" name="full_name" required value={formData.full_name} onChange={handleChange} placeholder="Ex: Maria Joaquina Silva" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="cpf">CPF / CNPJ</Label>
              <Input id="cpf" name="cpf" value={formData.cpf} onChange={handleChange} placeholder="Apenas números" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="maria@exemplo.com" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input id="whatsapp" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="(21) 99999-9999" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Telefone Secundário</Label>
              <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="address">Endereço Completo</Label>
            <Input id="address" name="address" value={formData.address} onChange={handleChange} placeholder="Rua, Número, Bairro, Cidade - UF" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Observações</Label>
            <textarea 
              id="notes" 
              name="notes" 
              value={formData.notes} 
              onChange={handleChange} 
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Preferências, restrições, etc."
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-6">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" className="bg-zinc-900 text-gold-50" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Cliente'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
