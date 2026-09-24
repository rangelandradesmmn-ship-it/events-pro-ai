'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { grantLifetimeAccessAction } from '@/app/actions/super-admin';

export function SuperAdminActions({ agencyId, isPartner }: { agencyId: string, isPartner: boolean }) {
  const [loading, setLoading] = useState(false);

  const handleGrantAccess = async () => {
    if (!confirm('Tem certeza que deseja transformar esta agência em Parceira (Acesso Gratuito Vitalício)?')) return;
    
    setLoading(true);
    const formData = new FormData();
    formData.append('userId', agencyId);
    
    const result = await grantLifetimeAccessAction(formData);
    setLoading(false);
    
    if (result.error) {
      alert('Erro ao conceder acesso: ' + result.error);
    } else {
      alert('Acesso vitalício concedido com sucesso!');
    }
  };

  if (isPartner) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
        <ShieldCheck className="h-3.5 w-3.5" />
        Parceiro Vitalício
      </span>
    );
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleGrantAccess} 
      disabled={loading}
      className="text-xs h-8 border-gold-200 text-gold-700 hover:bg-gold-50"
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />}
      Tornar Parceiro
    </Button>
  );
}
