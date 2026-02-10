import { useEffect, useRef, useState } from 'react';
import Quagga from '@ericblade/quagga2';

interface BarcodeScannerProps {
  onDetected: (code: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export default function BarcodeScanner({ onDetected, onError, className = '' }: BarcodeScannerProps) {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<string>('');

  const startScanner = () => {
    if (!scannerRef.current) return;

    Quagga.init(
      {
        inputStream: {
          type: 'LiveStream',
          target: scannerRef.current,
          constraints: {
            width: 640,
            height: 480,
            facingMode: 'environment',
          },
        },
        decoder: {
          readers: [
            'code_128_reader',
            'ean_reader',
            'ean_8_reader',
            'code_39_reader',
            'upc_reader',
          ],
        },
        locate: true,
      },
      (err: any) => {
        if (err) {
          console.error('Barcode scanner initialization error:', err);
          onError?.(err.message || 'Failed to initialize scanner');
          return;
        }
        Quagga.start();
        setIsScanning(true);
      }
    );

    Quagga.onDetected((result: any) => {
      const code = result.codeResult.code;
      if (code && code !== lastScanned) {
        setLastScanned(code);
        onDetected(code);
        
        // Visual feedback
        const canvas = Quagga.canvas.dom.overlay;
        const ctx = canvas.getContext('2d');
        if (ctx && result.box) {
          ctx.strokeStyle = '#00ff00';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(result.box[0][0], result.box[0][1]);
          result.box.forEach((point: [number, number]) => {
            ctx.lineTo(point[0], point[1]);
          });
          ctx.lineTo(result.box[0][0], result.box[0][1]);
          ctx.stroke();
        }
      }
    });
  };

  const stopScanner = () => {
    Quagga.stop();
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      if (isScanning) {
        Quagga.stop();
      }
    };
  }, [isScanning]);

  return (
    <div className={`barcode-scanner ${className}`}>
      <div ref={scannerRef} className="scanner-container w-full aspect-video bg-black rounded-lg overflow-hidden" />
      
      <div className="mt-4 flex gap-2">
        {!isScanning ? (
          <button
            onClick={startScanner}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Scanner
          </button>
        ) : (
          <button
            onClick={stopScanner}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Stop Scanner
          </button>
        )}
      </div>

      {lastScanned && (
        <div className="mt-4 p-4 bg-green-100 dark:bg-green-900 rounded-lg">
          <p className="text-sm text-gray-700 dark:text-gray-300">Last Scanned:</p>
          <p className="font-mono text-lg font-bold">{lastScanned}</p>
        </div>
      )}
    </div>
  );
}
