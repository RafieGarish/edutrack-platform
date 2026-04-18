"use client";

import { ExternalLink } from "lucide-react";

// Simplified SVG world map with activity dots
const activityPoints = [
  { cx: 200, cy: 130, r: 4, label: "Europe" },
  { cx: 165, cy: 155, r: 5, label: "Africa" },
  { cx: 250, cy: 120, r: 3, label: "Russia" },
  { cx: 300, cy: 140, r: 4, label: "Asia" },
  { cx: 340, cy: 160, r: 3, label: "SE Asia" },
  { cx: 370, cy: 180, r: 5, label: "Australia" },
  { cx: 90, cy: 130, r: 4, label: "N. America" },
  { cx: 105, cy: 170, r: 3, label: "S. America" },
];

export function ActivityMap() {
  return (
    <div className="rounded-xl bg-card border border-border/50 p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">User Activity Map</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time user engagement worldwide
          </p>
        </div>
        <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ExternalLink className="w-3.5 h-3.5" />
          View Details
        </button>
      </div>

      <div className="relative bg-background/60 rounded-xl border border-border/30 overflow-hidden" style={{ height: 220 }}>
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* World map SVG (simplified continents) */}
        <svg
          viewBox="0 0 460 230"
          className="w-full h-full"
          style={{ opacity: 0.25 }}
          fill="none"
        >
          {/* North America */}
          <path d="M55,60 Q65,45 90,50 L115,55 Q130,80 120,110 L100,130 Q80,145 60,130 Q40,115 45,85 Z" fill="hsl(var(--muted-foreground))" />
          {/* South America */}
          <path d="M90,140 L115,145 Q125,160 120,185 L105,210 Q85,215 75,195 Q65,175 75,155 Z" fill="hsl(var(--muted-foreground))" />
          {/* Europe */}
          <path d="M175,55 Q195,45 215,55 L220,80 Q205,90 185,85 Q168,75 175,55 Z" fill="hsl(var(--muted-foreground))" />
          {/* Africa */}
          <path d="M168,95 Q185,90 200,100 L205,140 Q200,175 185,185 Q168,180 155,160 Q150,135 160,115 Z" fill="hsl(var(--muted-foreground))" />
          {/* Russia/Asia */}
          <path d="M220,40 Q270,30 330,40 L360,60 Q365,90 345,100 L295,100 Q260,95 230,80 Z" fill="hsl(var(--muted-foreground))" />
          {/* South/SE Asia */}
          <path d="M265,105 Q295,100 330,110 L340,140 Q315,150 290,140 Q270,130 265,105 Z" fill="hsl(var(--muted-foreground))" />
          {/* Australia */}
          <path d="M340,170 Q370,160 395,175 L400,195 Q390,215 365,215 Q340,210 335,195 Z" fill="hsl(var(--muted-foreground))" />
        </svg>

        {/* Activity dots */}
        {activityPoints.map((p, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${(p.cx / 460) * 100}%`,
              top: `${(p.cy / 230) * 100}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="relative">
              <div
                className="rounded-full bg-primary animate-ping absolute opacity-40"
                style={{ width: p.r * 2 + 4, height: p.r * 2 + 4, top: -2, left: -2 }}
              />
              <div
                className="rounded-full bg-primary"
                style={{ width: p.r * 2, height: p.r * 2 }}
              />
            </div>
          </div>
        ))}

        {/* Map controls */}
        <div className="absolute top-3 right-3 flex flex-col gap-1">
          <button className="w-6 h-6 flex items-center justify-center rounded bg-card/80 border border-border/50 text-muted-foreground hover:text-foreground text-sm transition-colors">
            +
          </button>
          <button className="w-6 h-6 flex items-center justify-center rounded bg-card/80 border border-border/50 text-muted-foreground hover:text-foreground text-sm transition-colors">
            −
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4">
        {[
          { label: "High Activity", size: "w-2.5 h-2.5" },
          { label: "Medium", size: "w-2 h-2" },
          { label: "Low", size: "w-1.5 h-1.5" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={`${item.size} rounded-full bg-primary shrink-0`} />
            <span className="text-xs text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
