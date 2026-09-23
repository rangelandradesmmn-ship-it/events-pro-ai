import { createAdminClient as createClient } from '@/utils/supabase/admin';
import { notFound } from 'next/navigation';
import { HeartHandshake, Star, ExternalLink, Camera, Phone, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default async function PortalSuppliersPage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = await params;
  const token = resolvedParams.token;
  const supabase = await createClient();

  const { data: client } = await supabase
    .from('clients')
    .select('*, events(*)')
    .eq('token', token)
    .single();

  if (!client || !client.events || client.events.length === 0) {
    notFound();
  }

  // Fetch all planner's suppliers (The Vendor Guide)
  const { data: suppliers } = await supabase
    .from('suppliers')
    .select('*')
    .order('category', { ascending: true })
    .order('rating', { ascending: false });

  // Group by category
  const groupedSuppliers: Record<string, any[]> = {};
  if (suppliers) {
    suppliers.forEach(supplier => {
      const cat = supplier.category || 'Outros';
      if (!groupedSuppliers[cat]) groupedSuppliers[cat] = [];
      groupedSuppliers[cat].push(supplier);
    });
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 flex items-center gap-3">
          <HeartHandshake className="h-8 w-8 text-[#A86F6B]" />
          Guia de Fornecedores
        </h1>
        <p className="text-muted-foreground mt-2">
          Uma lista selecionada a dedo com os melhores parceiros e profissionais do mercado recomendados pela nossa assessoria para o seu grande dia.
        </p>
      </div>

      {Object.keys(groupedSuppliers).length > 0 ? (
        <div className="space-y-12">
          {Object.entries(groupedSuppliers).map(([category, items]) => (
            <div key={category} className="space-y-4">
              <h2 className="text-2xl font-bold text-zinc-900 border-b border-zinc-200 pb-2 capitalize">
                {category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((supplier) => (
                  <div key={supplier.id} className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-zinc-900 text-lg group-hover:text-[#A86F6B] transition-colors line-clamp-1">{supplier.name}</h3>
                        {supplier.contact_name && (
                          <p className="text-sm text-muted-foreground mt-0.5">Falar com: {supplier.contact_name}</p>
                        )}
                      </div>
                      {supplier.rating && (
                        <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-lg text-xs font-bold">
                          <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                          {supplier.rating}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-sm flex-grow">
                      {supplier.phone && (
                        <div className="flex items-center gap-2 text-zinc-600">
                          <Phone className="h-4 w-4 text-zinc-400" />
                          <span>{supplier.phone}</span>
                        </div>
                      )}
                      {supplier.email && (
                        <div className="flex items-center gap-2 text-zinc-600">
                          <Mail className="h-4 w-4 text-zinc-400" />
                          <span className="truncate">{supplier.email}</span>
                        </div>
                      )}
                      {supplier.notes && (
                        <p className="text-zinc-500 italic mt-3 line-clamp-3 text-xs border-l-2 border-[#A86F6B] pl-2">
                          "{supplier.notes}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-6 pt-4 border-t border-zinc-100">
                      {supplier.instagram && (
                        <a 
                          href={supplier.instagram.startsWith('http') ? supplier.instagram : `https://instagram.com/${supplier.instagram.replace('@', '')}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center flex-1 h-10 rounded-xl bg-pink-50 text-pink-600 hover:bg-pink-100 font-medium text-xs transition-colors"
                        >
                          <Camera className="h-4 w-4 mr-2" /> Instagram
                        </a>
                      )}
                      {supplier.portfolio_url && (
                        <a 
                          href={supplier.portfolio_url.startsWith('http') ? supplier.portfolio_url : `https://${supplier.portfolio_url}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center flex-1 h-10 rounded-xl bg-zinc-50 text-zinc-600 hover:bg-zinc-100 font-medium text-xs transition-colors"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" /> Portfólio
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-zinc-100 rounded-[32px] p-12 text-center shadow-sm">
          <div className="bg-zinc-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <HeartHandshake className="h-8 w-8 text-zinc-300" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 mb-2">Guia em construção</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            A assessoria está montando a lista exclusiva de recomendações para o seu casamento.
          </p>
        </div>
      )}
    </div>
  );
}
