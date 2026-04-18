'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon for Leaflet in bundlers
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapPickerProps {
  latitude: number | null;
  longitude: number | null;
  radius: number;
  onLocationChange: (lat: number, lng: number) => void;
  onAddressChange?: (address: string) => void;
}

/** Reverse-geocode via Nominatim (free, no key needed). */
async function reverseGeocode(lat: number, lng: number, signal?: AbortSignal): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&accept-language=id`,
      { signal },
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.display_name ?? null;
  } catch {
    return null;
  }
}

export default function MapPicker({ latitude, longitude, radius, onLocationChange, onAddressChange }: MapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const geocodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const geocodeAbortRef = useRef<AbortController | null>(null);
  const [loading, setLoading] = useState(true);

  const defaultLat = latitude ?? -7.9666;
  const defaultLng = longitude ?? 112.6326;

  /** Debounced reverse geocode — waits 500ms after last move */
  function scheduleReverseGeocode(lat: number, lng: number) {
    if (!onAddressChange) return;

    // Cancel pending
    if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current);
    geocodeAbortRef.current?.abort();

    geocodeTimerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      geocodeAbortRef.current = controller;
      const address = await reverseGeocode(lat, lng, controller.signal);
      if (address) onAddressChange(address);
    }, 500);
  }

  function handlePinMove(lat: number, lng: number) {
    onLocationChange(lat, lng);
    scheduleReverseGeocode(lat, lng);
  }

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [defaultLat, defaultLng],
      zoom: 16,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const marker = L.marker([defaultLat, defaultLng], { draggable: true }).addTo(map);
    const circle = L.circle([defaultLat, defaultLng], {
      radius,
      color: '#22c55e',
      fillColor: '#22c55e',
      fillOpacity: 0.15,
      weight: 2,
    }).addTo(map);

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      circle.setLatLng(pos);
      handlePinMove(pos.lat, pos.lng);
    });

    map.on('click', (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      circle.setLatLng(e.latlng);
      handlePinMove(e.latlng.lat, e.latlng.lng);
    });

    mapRef.current = map;
    markerRef.current = marker;
    circleRef.current = circle;

    setLoading(false);

    // If no coordinates were provided, try geolocation
    let cancelled = false;
    if (latitude === null && longitude === null) {
      navigator.geolocation?.getCurrentPosition(
        (pos) => {
          if (cancelled) return;
          const m = mapRef.current;
          const mk = markerRef.current;
          const cr = circleRef.current;
          if (!m || !mk || !cr) return;
          const { latitude: lat, longitude: lng } = pos.coords;
          m.setView([lat, lng], 16);
          mk.setLatLng([lat, lng]);
          cr.setLatLng([lat, lng]);
          handlePinMove(lat, lng);
        },
        () => {
          // Geolocation denied/unavailable — keep default
        },
      );
    }

    return () => {
      cancelled = true;
      if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current);
      geocodeAbortRef.current?.abort();
      mapRef.current = null;
      markerRef.current = null;
      circleRef.current = null;
      map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync radius changes
  useEffect(() => {
    circleRef.current?.setRadius(radius);
  }, [radius]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-border/50">
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-secondary/80">
          <span className="text-sm text-muted-foreground">Memuat peta...</span>
        </div>
      )}
      <div ref={mapContainerRef} className="w-full h-[350px] z-0" />
    </div>
  );
}
