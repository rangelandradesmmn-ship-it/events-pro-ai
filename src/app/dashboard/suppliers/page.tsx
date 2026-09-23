import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Phone, Mail, Camera, Globe, Star, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default async function SuppliersPage() {
  const supabase = await createClient();
  
  const { data: suppliers } = await supabase
    .from('suppliers')
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < (rating || 0) ? 'text-gold-500 fill-gold-500' : 'text-zinc-300'}`} />
    ));
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fornecedores</h1>
          <p className="text-muted-foreground mt-1">Seu catálogo de parceiros para organização de eventos.</p>
        </div>
        <div>
          <Link href="/dashboard/suppliers/new">
            <Button className="bg-zinc-900 text-gold-50 hover:bg-zinc-800">
              <Plus className="mr-2 h-4 w-4" /> Adicionar Fornecedor
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {suppliers && suppliers.length > 0 ? (
          suppliers.map((supplier) => (
            <Card key={supplier.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="bg-zinc-50 border-b pb-4">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="uppercase text-[10px] tracking-wider font-semibold bg-white">
                    {supplier.category}
                  </Badge>
                  <div className="flex gap-0.5">
                    {renderStars(supplier.rating)}
                  </div>
                </div>
                <CardTitle className="text-xl line-clamp-1">{supplier.name}</CardTitle>
                <CardDescription className="line-clamp-1 mt-1 text-xs font-medium text-zinc-600">
                  Contato: {supplier.contact_name || 'Não informado'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 grid gap-3 text-sm">
                {supplier.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4 text-green-600" />
                    <span>{supplier.phone}</span>
                  </div>
                )}
                {supplier.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4 text-gold-500" />
                    <span className="truncate">{supplier.email}</span>
                  </div>
                )}
                <div className="flex gap-2 mt-2 pt-4 border-t">
                  {supplier.instagram && (
                    <Button variant="outline" size="sm" className="w-full text-xs h-8" asChild>
                      <a href={`https://instagram.com/${supplier.instagram.replace('@', '')}`} target="_blank" rel="noreferrer">
                        <Camera className="mr-2 h-3 w-3" /> Instagram
                      </a>
                    </Button>
                  )}
                  {supplier.portfolio_url && (
                    <Button variant="outline" size="sm" className="w-full text-xs h-8" asChild>
                      <a href={supplier.portfolio_url} target="_blank" rel="noreferrer">
                        <Globe className="mr-2 h-3 w-3" /> Portfólio
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl">
            <h3 className="text-lg font-medium text-zinc-900">Nenhum fornecedor cadastrado</h3>
            <p className="text-muted-foreground mt-1 mb-4">Monte sua rede de parceiros cadastrando o primeiro fornecedor.</p>
            <Link href="/dashboard/suppliers/new">
              <Button variant="outline">Cadastrar Fornecedor</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
