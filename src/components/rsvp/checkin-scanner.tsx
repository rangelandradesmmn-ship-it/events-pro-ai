'use client';

import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { processCheckinAction } from '@/app/actions/checkin';
import { CheckCircle2, AlertTriangle, XCircle, Info, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CheckinScanner() {
  const [scanResult, setScanResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [scannerActive, setScannerActive] = useState(true);

  useEffect(() => {
    if (!scannerActive) return;

    // Create the scanner
    const scanner = new Html5QrcodeScanner(
      "reader", 
      { fps: 10, qrbox: { width: 250, height: 250 } }, 
      false
    );

    // On success scan
    const onScanSuccess = async (decodedText: string) => {
      // Pause scanner UI (Html5QrcodeScanner doesn't have a simple pause, so we just clear/stop or handle flag)
      scanner.clear();
      setScannerActive(false);
      setLoading(true);
      
      try {
        const result = await processCheckinAction(decodedText);
        setScanResult(result);
        
        // Play a beep sound if success
        if (result.success && !result.alreadyCheckedIn) {
          const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
          audio.play().catch(e => console.log('Audio play failed', e));
        }
      } catch (err: any) {
        setScanResult({ success: false, error: err.message || 'Erro ao processar' });
      } finally {
        setLoading(false);
      }
    };

    scanner.render(onScanSuccess, (error) => {
      // ignore normal scan failures (happens every frame it doesn't find a code)
    });

    return () => {
      scanner.clear().catch(error => {
        console.error("Failed to clear html5QrcodeScanner. ", error);
      });
    };
  }, [scannerActive]);

  const resetScanner = () => {
    setScanResult(null);
    setScannerActive(true);
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center">
      
      {scannerActive && (
        <div className="w-full bg-white rounded-xl overflow-hidden border border-zinc-200 shadow-sm">
          <div id="reader" className="w-full"></div>
          <div className="p-4 text-center text-sm text-zinc-500 bg-zinc-50">
            Aponte a câmera para o QR Code do convidado.
          </div>
        </div>
      )}

      {loading && (
        <div className="p-12 text-center flex flex-col items-center animate-pulse">
          <RefreshCcw className="h-8 w-8 text-gold-500 animate-spin mb-4" />
          <p className="font-medium">Verificando convidado no sistema...</p>
        </div>
      )}

      {!scannerActive && !loading && scanResult && (
        <div className="w-full p-6 bg-white rounded-xl border border-zinc-200 shadow-sm flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
          
          {scanResult.success && !scanResult.alreadyCheckedIn && (
            <>
              <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900">Acesso Liberado!</h2>
              <p className="text-lg font-medium text-zinc-700 mt-2">{scanResult.guest.name}</p>
              <div className="mt-4 px-4 py-2 bg-zinc-100 rounded-lg text-sm text-zinc-600">
                Acompanhantes liberados: <strong className="text-zinc-900 text-lg">{scanResult.guest.companions || 0}</strong>
              </div>
            </>
          )}

          {scanResult.success && scanResult.alreadyCheckedIn && (
            <>
              <div className="h-16 w-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-4">
                <Info className="h-10 w-10" />
              </div>
              <h2 className="text-xl font-bold text-zinc-900">Aviso</h2>
              <p className="text-zinc-700 mt-2">Este QR Code já foi utilizado.</p>
              <p className="font-medium text-zinc-900 mt-1">{scanResult.guest.name}</p>
            </>
          )}

          {!scanResult.success && (
            <>
              <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <XCircle className="h-10 w-10" />
              </div>
              <h2 className="text-xl font-bold text-zinc-900">Acesso Negado</h2>
              <p className="text-red-600 mt-2 font-medium">{scanResult.error}</p>
            </>
          )}

          <Button 
            onClick={resetScanner} 
            className="mt-8 w-full bg-zinc-900 text-gold-50 hover:bg-zinc-800"
            size="lg"
          >
            Escanear Próximo
          </Button>
        </div>
      )}
    </div>
  );
}
