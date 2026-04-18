"use client";

import { useEffect, useRef, useState } from "react";
import { Cloud, CloudRain, Sun } from "lucide-react";
import FlipClock from "@/components/flipclock";
import { cn } from "@/lib/utils";

interface GreetingProps {
  userName?: string;
  userRole?: string;
  schoolName?: string;
}

function Clock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const h = time.getHours();
  const m = String(time.getMinutes()).padStart(2, "0");
  const s = String(time.getSeconds()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;

  return (
    <div className="flex items-end gap-1">
      <span
        className="text-4xl md:text-5xl font-display font-bold text-foreground tracking-tight tabular-nums"
        suppressHydrationWarning
      >
        {String(h12).padStart(2, "0")}:{m}:{s}
      </span>
      <span className="text-lg font-semibold text-muted-foreground mb-1">{ampm}</span>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Selamat Pagi";
  if (h < 15) return "Selamat Siang";
  if (h < 18) return "Selamat Sore";
  return "Selamat Malam";
}

const LERP = 0.08; // lower = more lag, higher = snappier

export function GreetingCard({ userName, userRole, schoolName }: GreetingProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  // Target (raw cursor) position
  const targetRef = useRef({ x: -999, y: -999 });
  // Smoothed (rendered) position — kept as a ref to avoid re-render per frame
  const smoothRef = useRef({ x: -999, y: -999 });
  const [spotlight, setSpotlight] = useState({ x: -999, y: -999, opacity: 0 });
  const opacityRef = useRef(0);

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // rAF loop: lerp smoothRef toward targetRef, then flush to React state
  const startLoop = () => {
    const tick = () => {
      const tx = targetRef.current.x;
      const ty = targetRef.current.y;
      smoothRef.current.x += (tx - smoothRef.current.x) * LERP;
      smoothRef.current.y += (ty - smoothRef.current.y) * LERP;

      setSpotlight({
        x: smoothRef.current.x,
        y: smoothRef.current.y,
        opacity: opacityRef.current,
      });

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const stopLoop = () => {
    cancelAnimationFrame(rafRef.current);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    targetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    opacityRef.current = 1;
  };

  const handleMouseEnter = () => {
    opacityRef.current = 1;
    startLoop();
  };

  const handleMouseLeave = () => {
    opacityRef.current = 0;
    // Let the loop run a bit more so opacity fades, then stop
    setTimeout(stopLoop, 400);
    setSpotlight((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 relative overflow-hidden"
    >
      {/* Spotlight — light mode: soft dark bloom; dark mode: soft white glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl transition-opacity duration-300 dark:hidden"
        style={{
          opacity: spotlight.opacity,
          background: `radial-gradient(400px circle at ${spotlight.x}px ${spotlight.y}px, rgba(0,0,0,0.055), transparent 70%)`,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 rounded-xl transition-opacity duration-300 hidden dark:block"
        style={{
          opacity: spotlight.opacity,
          background: `radial-gradient(400px circle at ${spotlight.x}px ${spotlight.y}px, rgba(255,255,255,0.12), transparent 70%)`,
        }}
      />

      <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-zinc-900 dark:text-zinc-50">
            {getGreeting()}, {userName}
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">
            Ready to make today productive! 🚀
          </p>
          <div className="flex items-baseline gap-2 text-zinc-900 dark:text-zinc-50">
            <div>
              <span className="tracking-tighter">
                <FlipClock />
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end justify-between">
          <div className="flex items-center gap-4">
            <CloudRain className="w-12 h-12 text-blue-500 dark:text-blue-400" />
            <div className="text-right">
              <div className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">34°C</div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">Patchy rain nearby</div>
            </div>
          </div>
          <div className="text-right mt-4 md:mt-0">
            <div className="font-medium text-zinc-900 dark:text-zinc-50">{schoolName || "-"}</div>
            <div className="text-sm text-zinc-500 dark:text-zinc-400">{today}</div>
          </div>
        </div>
      </div>
    </div>
  );
}