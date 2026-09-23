'use client';

import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

export function CopyPortalLinkButton({ token }: { token: string }) {
  const handleCopy = () => {
    const url = `${window.location.origin}/portal/${token}`;
    navigator.clipboard.writeText(url);
    alert('Link do Portal copiado!\n\nEnvie para o seu cliente acessar a área restrita dele.');
  };

  return (
    <Button 
      size="sm" 
      variant="outline" 
      className="w-full text-xs border-gold-200 text-gold-700 hover:bg-gold-50 h-8 mt-2"
      onClick={handleCopy}
      type="button"
    >
      <ExternalLink className="h-3 w-3 mr-2" />
      Copiar Link do Portal
    </Button>
  );
}
