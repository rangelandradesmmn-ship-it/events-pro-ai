'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

export function SupplierForm() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Buffet',
    contact_name: '',
    phone: '',
    email: '',
    instagram: '',
    portfolio_url: '',
    rating: '5',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('suppliers').insert({
      name: formData.name,
      category: formData.category,
      contact_name: formData.contact_name || null,
      phone: formData.phone || null,
      email: formData.email || null,
      instagram: formData.instagram || null,
      portfolio_url: formData.portfolio_url || null,
      rating: parseInt(formData.rating),
      notes: formData.notes || null,
    });

    if (!error) {
      router.push('/dashboard/suppliers');
      router.refresh();
    } else {
      console.error(error);
      alert('Erro ao salvar fornecedor: ' + error.message);
      setLoading(false);
    }
  };

  const categories = [
    'Buffet', 'Decoração', 'Fotografia', 'Filmagem', 'Som e Iluminação', 
    'Banda/DJ', 'Cerimonial', 'Espaço/Local', 'Segurança', 'Transporte', 
    'Doces/Bolo', 'Lembrancinhas', 'Outros'
  ];

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Cadastro de Fornecedor</CardTitle>
        <CardDescription>Adicione um novo parceiro ao seu catálogo.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome da Empresa / Profissional *</Label>
              <Input id="name" name="name" required value={formData.name} onChange={handleChange} placeholder="Ex: Doce Sabor Buffet" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Categoria *</Label>
              <select 
                id="category" 
                name="category" 
                required
                value={formData.category} 
                onChange={handleChange}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="contact_name">Pessoa de Contato</Label>
              <Input id="contact_name" name="contact_name" value={formData.contact_name} onChange={handleChange} placeholder="Ex: João Silva" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Telefone / WhatsApp</Label>
              <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="(00) 00000-0000" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="contato@empresa.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rating">Avaliação (1 a 5 estrelas)</Label>
              <select 
                id="rating" 
                name="rating" 
                value={formData.rating} 
                onChange={handleChange}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
              >
                <option value="5">⭐⭐⭐⭐⭐ (5 - Excelente)</option>
                <option value="4">⭐⭐⭐⭐ (4 - Muito Bom)</option>
                <option value="3">⭐⭐⭐ (3 - Bom)</option>
                <option value="2">⭐⭐ (2 - Regular)</option>
                <option value="1">⭐ (1 - Ruim)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input id="instagram" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="@perfil" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="portfolio_url">Site / Portfólio</Label>
              <Input id="portfolio_url" name="portfolio_url" type="url" value={formData.portfolio_url} onChange={handleChange} placeholder="https://..." />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Anotações Internas</Label>
            <textarea 
              id="notes" 
              name="notes" 
              value={formData.notes} 
              onChange={handleChange} 
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Histórico de problemas, elogios, preços base..."
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-6">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" className="bg-zinc-900 text-gold-50" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Fornecedor'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
