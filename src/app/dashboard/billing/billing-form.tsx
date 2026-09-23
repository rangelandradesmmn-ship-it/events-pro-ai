'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink } from 'lucide-react';

export function BillingForm({ isSubscribed }: { isSubscribed: boolean }) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
      });
      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Erro ao iniciar o checkout.');
      }
    } catch (error) {
      console.error(error);
      alert('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  if (isSubscribed) {
    return (
      <Button 
        disabled
        className="w-full rounded-xl h-12 font-bold text-base bg-emerald-500 hover:bg-emerald-600 text-white"
      >
        Assinatura Ativa
      </Button>
    );
  }

  return (
    <Button 
      onClick={handleCheckout} 
      disabled={loading}
      className="w-full rounded-xl h-12 font-bold text-base bg-white text-zinc-900 hover:bg-zinc-100"
    >
      {loading ? (
        <Loader2 className="h-5 w-5 mr-2 animate-spin text-zinc-900" />
      ) : (
        <ExternalLink className="h-5 w-5 mr-2" />
      )}
      Assinar Agora
    </Button>
  );
}
