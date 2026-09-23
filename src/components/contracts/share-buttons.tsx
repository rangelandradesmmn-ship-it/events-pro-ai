'use client';

import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
// We'll use an SVG or plain text for WhatsApp if lucide doesn't have it, or MessageCircle
import { MessageCircle } from 'lucide-react';

export function ShareContractButtons({ clientName, clientPhone, clientEmail, portalToken, contractTitle }: { clientName: string, clientPhone: string, clientEmail: string, portalToken: string, contractTitle: string }) {
  const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/portal/${portalToken}`;
  const message = `Olá ${clientName},\n\nO documento "${contractTitle}" já está disponível para sua análise e assinatura digital.\n\nAcesse seu portal exclusivo e seguro através do link abaixo:\n${url}\n\nAtenciosamente,\nLuxe Events.`;

  const handleWhatsApp = () => {
    if (!clientPhone) {
      alert('O cliente não possui um telefone cadastrado.');
      return;
    }
    // Remove non-numeric characters from phone
    const phone = clientPhone.replace(/\D/g, '');
    const waUrl = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  const handleEmail = () => {
    if (!clientEmail) {
      alert('O cliente não possui um e-mail cadastrado.');
      return;
    }
    const mailtoUrl = `mailto:${clientEmail}?subject=${encodeURIComponent(`Assinatura de Contrato: ${contractTitle}`)}&body=${encodeURIComponent(message)}`;
    window.open(mailtoUrl, '_blank');
  };

  return (
    <div className="flex gap-2 mt-2 w-full">
      <Button 
        variant="outline" 
        size="sm" 
        className="flex-1 h-8 text-xs text-green-700 border-green-200 hover:bg-green-50"
        onClick={handleWhatsApp}
        title="Enviar por WhatsApp"
      >
        <MessageCircle className="mr-2 h-3 w-3 shrink-0" /> <span className="truncate">WhatsApp</span>
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        className="flex-1 h-8 text-xs text-blue-700 border-blue-200 hover:bg-blue-50"
        onClick={handleEmail}
        title="Enviar por E-mail"
      >
        <Mail className="mr-2 h-3 w-3 shrink-0" /> <span className="truncate">E-mail</span>
      </Button>
    </div>
  );
}
