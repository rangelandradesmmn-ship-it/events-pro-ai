'use client';

import { Button } from '@/components/ui/button';

export function ViewContractButton({ content }: { content: string }) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    alert("Conteúdo do Contrato:\n\n" + (content ? content.substring(0, 800) + '...' : 'Contrato em branco.'));
  };

  return (
    <Button 
      variant="outline" 
      className="w-full border-gold-200 text-gold-700 hover:bg-gold-50"
      onClick={handleClick}
      type="button"
    >
      Ler Documento
    </Button>
  );
}
