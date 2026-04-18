'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import { DemoState } from '../types';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoModal: React.FC<DemoModalProps> = ({ isOpen, onClose }) => {
  const [state, setState] = useState<DemoState>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState('idle');
      setLocation(null);
      setErrorMsg('');
    }
  }, [isOpen]);

  const startDemo = async () => {
    setState('scanning');
    setErrorMsg('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Simulate QR Code Detection after 3 seconds
      setTimeout(() => {
        stopCamera();
        verifyLocation();
      }, 3000);

    } catch (err) {
      console.error(err);
      setErrorMsg('Could not access camera. Please allow camera permissions.');
      setState('error');
    }
  };

  const verifyLocation = () => {
    setState('locating');
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      setState('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        // Simulate a slight network delay for validation
        setTimeout(() => {
          setState('success');
        }, 1500);
      },
      (err) => {
        console.error(err);
        setErrorMsg('Could not fetch location. Please allow location access.');
        setState('error');
      },
      { enableHighAccuracy: true }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Camera className="w-5 h-5 text-brand-600" />
            Live Student Check-in
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center justify-center min-h-[320px]">
          
          {state === 'idle' && (
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-10 h-10 text-brand-600" />
              </div>
              <h4 className="text-xl font-semibold text-slate-900">Ready to Check In?</h4>
              <p className="text-slate-600 max-w-xs mx-auto">
                This demo will use your camera to simulate scanning a QR code and your GPS to validate your location.
              </p>
              <button
                onClick={startDemo}
                className="w-full py-3 px-6 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold shadow-lg shadow-brand-600/20 transition-all transform hover:scale-[1.02]"
              >
                Start Scanning
              </button>
            </div>
          )}

          {state === 'scanning' && (
            <div className="w-full relative rounded-xl overflow-hidden bg-black aspect-[3/4] max-h-[400px]">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 border-[30px] border-black/40 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-brand-500 relative animate-pulse">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-brand-500"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-brand-500"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-brand-500"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-brand-500"></div>
                </div>
              </div>
              <div className="absolute bottom-6 left-0 right-0 text-center">
                <span className="bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium">
                  Scanning QR Code...
                </span>
              </div>
            </div>
          )}

          {state === 'locating' && (
            <div className="text-center space-y-6 animate-pulse">
              <div className="relative">
                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                   <MapPin className="w-12 h-12 text-blue-500 animate-bounce" />
                </div>
                <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping"></div>
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">Verifying Location</h4>
                <p className="text-slate-500">Checking GPS coordinates...</p>
              </div>
            </div>
          )}

          {state === 'success' && (
            <div className="text-center space-y-6">
              <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <div>
                <h4 className="text-2xl font-bold text-slate-900 mb-2">Check-in Successful!</h4>
                <p className="text-slate-600 mb-2">You have been marked present.</p>
                {location && (
                  <p className="text-xs text-slate-400 font-mono">
                    Loc: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          )}

          {state === 'error' && (
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <h4 className="text-xl font-semibold text-slate-900">Check-in Failed</h4>
              <p className="text-slate-600 max-w-xs mx-auto text-sm">
                {errorMsg}
              </p>
              <button
                onClick={() => setState('idle')}
                className="w-full py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold shadow-lg"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
