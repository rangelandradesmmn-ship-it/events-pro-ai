'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Check, Copy, ExternalLink, Loader2 } from 'lucide-react';
import { publishToPortalAction } from './actions';

export function PublishButton({ eventId, isPublished }: { eventId: string, isPublished: boolean }) {
  const [loading, setLoading] = useState(false);
  const [published, setPublished] = useState(isPublished);
  const [portalToken, setPortalToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handlePublish = async () => {
    setLoading(true);
    const result = await publishToPortalAction(eventId);
    if (result.success) {
      setPublished(true);
      if (result.token) setPortalToken(result.token);
    } else {
      alert(result.error);
    }
    setLoading(false);
  };

  const copyToClipboard = () => {
    if (!portalToken) return;
    const url = `${window.location.origin}/portal/${portalToken}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (published) {
    return (
      <div className="flex items-center gap-2">
        {portalToken && (
          <Button onClick={copyToClipboard} variant="outline" className="rounded-full h-11 px-4 font-medium border-zinc-200 text-zinc-700 bg-white shadow-sm">
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copiado!' : 'Copiar Link'}
          </Button>
        )}
        <a href={`/portal/${portalToken || 'demo'}`} target="_blank" rel="noreferrer" className="inline-flex">
          <Button className="rounded-full h-11 px-6 font-medium bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 shadow-sm">
            <ExternalLink className="h-4 w-4" />
            Abrir Portal
          </Button>
        </a>
      </div>
    );
  }

  return (
    <Button 
      onClick={handlePublish} 
      disabled={loading}
      className="rounded-full h-11 px-6 font-medium bg-[#A86F6B] hover:bg-[#8F5E5A] text-white flex items-center gap-2 shadow-sm transition-all"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
      Publicar no Portal
    </Button>
  );
}
