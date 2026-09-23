'use client';

import { Button } from '@/components/ui/button';
import { LinkIcon } from 'lucide-react';

export function CopyInviteLinkButton({ token }: { token: string }) {
  const handleCopy = () => {
    const url = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(url);
    alert('Link exclusivo copiado! Envie para o convidado via WhatsApp.');
  };

  return (
    <Button 
      size="sm" 
      variant="outline" 
      className="text-xs border-gold-200 text-gold-700 hover:bg-gold-50 h-7"
      onClick={handleCopy}
      type="button"
      title="Copiar Link de Confirmação"
    >
      <LinkIcon className="h-3 w-3 mr-1" />
      Copiar Link
    </Button>
  );
}
