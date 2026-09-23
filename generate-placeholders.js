const fs = require('fs');
const path = require('path');

const routes = ['schedule', 'checklist', 'payments', 'bride', 'groom', 'guests', 'tables', 'suppliers', 'inspirations', 'documents'];
const content = `import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';

export default async function PortalUnderConstruction({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = await params;
  const token = resolvedParams.token;
  const supabase = await createClient();

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('token', token)
    .single();

  if (!client) {
    notFound();
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto h-full flex flex-col items-center justify-center text-center mt-20">
      <div className="bg-zinc-100 p-8 rounded-full mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
      </div>
      <h2 className="text-2xl font-bold text-zinc-900 mb-2">Módulo em Construção</h2>
      <p className="text-muted-foreground max-w-md">
        Seu cerimonial está preparando esta área com todo carinho. Em breve você terá acesso a todas as informações aqui.
      </p>
    </div>
  );
}
`;

routes.forEach(r => {
  const dir = path.join('src/app/portal/[token]', r);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'page.tsx'), content);
  console.log('Created ' + r);
});
