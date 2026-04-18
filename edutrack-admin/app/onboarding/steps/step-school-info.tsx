'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Upload, ArrowRight, MapPin, Navigation } from 'lucide-react';

// Dynamically import MapPicker to avoid SSR issues with Leaflet
const MapPicker = dynamic(() => import('@/components/MapPicker'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[350px] rounded-xl border border-border/50 bg-secondary/50 flex items-center justify-center">
      <span className="text-sm text-muted-foreground">Memuat peta...</span>
    </div>
  ),
});

interface Props {
  data: { name: string; address: string; latitude: number | null; longitude: number | null; radius: number };
  logoFile: File | null;
  onDataChange: (data: { name: string; address: string; latitude: number | null; longitude: number | null; radius: number }) => void;
  onLogoChange: (file: File | null) => void;
  onNext: () => void;
}

export function StepSchoolInfo({ data, logoFile, onDataChange, onLogoChange, onNext }: Props) {
  const [error, setError] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [addressLoading, setAddressLoading] = useState(false);

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      onLogoChange(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!data.name.trim()) {
      setError('Nama sekolah wajib diisi.');
      return;
    }
    setError('');
    onNext();
  }

  // Use a ref to always have the latest data available in callbacks,
  // avoiding stale closures when reverse geocoding resolves after coordinates update.
  const dataRef = useRef(data);
  dataRef.current = data;

  const handleLocationChange = useCallback((lat: number, lng: number) => {
    onDataChange({ ...dataRef.current, latitude: lat, longitude: lng });
    setAddressLoading(true);
  }, [onDataChange]);

  const handleAddressFromMap = useCallback((address: string) => {
    onDataChange({ ...dataRef.current, address });
    setAddressLoading(false);
  }, [onDataChange]);

  // Memoize the coordinate display to avoid unnecessary re-renders
  const coordDisplay = useMemo(() => {
    if (data.latitude !== null && data.longitude !== null) {
      return `${data.latitude.toFixed(6)}, ${data.longitude.toFixed(6)}`;
    }
    return 'Belum dipilih — klik pada peta';
  }, [data.latitude, data.longitude]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Nama Sekolah</label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => onDataChange({ ...data, name: e.target.value })}
          required
          className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
          placeholder="SMK Negeri 1 Malang"
        />
      </div>

      {/* Map Coordinate Picker */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5">
          <MapPin className="w-4 h-4" />
          Lokasi Sekolah
        </label>
        <p className="text-xs text-muted-foreground mb-3">
          Klik pada peta atau seret marker untuk menentukan lokasi sekolah. Alamat akan terisi otomatis.
        </p>
        <MapPicker
          latitude={data.latitude}
          longitude={data.longitude}
          radius={data.radius}
          onLocationChange={handleLocationChange}
          onAddressChange={handleAddressFromMap}
        />

        {/* Coordinate & Radius info */}
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Coordinates display */}
          <div className="sm:col-span-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 border border-border/50">
            <Navigation className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className={`text-xs font-mono ${data.latitude !== null ? 'text-foreground' : 'text-muted-foreground'}`}>
              {coordDisplay}
            </span>
          </div>

          {/* Radius input */}
          <div>
            <div className="relative">
              <input
                type="number"
                min={10}
                max={5000}
                step={10}
                value={data.radius}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val >= 0) {
                    onDataChange({ ...data, radius: val });
                  }
                }}
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border/50 text-sm text-foreground outline-none focus:border-primary/50 transition-all pr-10"
                placeholder="100"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                m
              </span>
            </div>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5">
          Radius digunakan untuk validasi kehadiran berbasis lokasi (geofencing).
        </p>
      </div>

      {/* Address — auto-filled from map, editable */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-sm font-medium text-foreground">Alamat Sekolah</label>
          {addressLoading && (
            <span className="text-[10px] text-muted-foreground animate-pulse">
              Mendeteksi alamat...
            </span>
          )}
        </div>
        <textarea
          value={data.address}
          onChange={(e) => onDataChange({ ...data, address: e.target.value })}
          rows={2}
          className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all resize-none"
          placeholder="Klik pada peta untuk mengisi alamat otomatis, atau ketik manual"
        />
        <p className="text-[10px] text-muted-foreground mt-1">
          Alamat otomatis terisi dari lokasi pin. Anda tetap bisa mengeditnya.
        </p>
      </div>

      {/* School Logo */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Logo Sekolah</label>
        <div className="flex items-center gap-4">
          {logoPreview && (
            <img
              src={logoPreview}
              alt="Logo preview"
              className="w-16 h-16 rounded-xl object-cover border border-border/50"
            />
          )}
          <label className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary border border-border/50 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/80 cursor-pointer transition-all">
            <Upload className="w-4 h-4" />
            {logoFile ? 'Ganti Logo' : 'Upload Logo'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
            />
          </label>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">PNG, JPG maksimal 2MB</p>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all"
        >
          Selanjutnya
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
