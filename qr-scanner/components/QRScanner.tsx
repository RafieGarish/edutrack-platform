'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import jsQR from 'jsqr';

interface QRScannerProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
  isPaused?: boolean; // Controlled from parent to pause between scans
}

export default function QRScanner({ onScan, onError, isPaused = false }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isPausedRef = useRef(isPaused); // Ref so tick() always reads latest value
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Keep ref in sync with prop
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Stable tick function that reads from refs, not closures
  const tick = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!isPausedRef.current && video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth', // Changed from 'dontInvert' to improve reliability
        });

        if (code?.data) {
          onScan(code.data);
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(tick);
  }, [onScan]); // onScan is stable (wrapped in useCallback in parent)

  useEffect(() => {
    let stream: MediaStream | null = null;
    let mounted = true;

    const startScanner = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });

        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        setHasPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          await videoRef.current.play();
          animationFrameRef.current = requestAnimationFrame(tick);
        }
      } catch (err) {
        console.error('Camera error:', err);
        if (mounted) {
          setHasPermission(false);
          onError?.('Akses kamera ditolak atau tidak tersedia.');
        }
      }
    };

    startScanner();

    return () => {
      mounted = false;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [tick, onError]);

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
      {hasPermission === false ? (
        <div className="text-white text-center p-4 z-20 bg-black absolute inset-0 flex flex-col items-center justify-center">
          <span className="material-symbols-outlined text-4xl mb-2 text-red-500">videocam_off</span>
          <p className="font-medium">Akses Kamera Ditolak</p>
          <p className="text-sm text-slate-400 mt-2">
            Izinkan akses kamera di pengaturan browser Anda untuk menggunakan scanner.
          </p>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            playsInline
            muted
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Paused overlay */}
          {isPaused && (
            <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center backdrop-blur-sm">
              <div className="flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-4xl text-white animate-pulse">
                  pause_circle
                </span>
                <p className="text-white text-sm font-medium">Memproses...</p>
              </div>
            </div>
          )}

          {hasPermission === null && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-800 z-10">
              <p className="text-slate-400 text-sm font-medium flex items-center gap-2">
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                Meminta Akses Kamera...
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}