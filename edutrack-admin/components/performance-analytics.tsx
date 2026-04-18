"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { Lightbulb } from "lucide-react";

const data = [
  { subject: "Performance", value: 72 },
  { subject: "Engagement", value: 85 },
  { subject: "Conversion", value: 68 },
  { subject: "User Satisfaction", value: 78 },
  { subject: "Content Quality", value: 80 },
];

export function PerformanceAnalytics() {
  return (
    <div className="rounded-xl bg-card border border-border/50 p-5 flex flex-col gap-4">
      <div>
        <h3 className="font-semibold text-foreground">Performance Analytics</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Key performance indicators and metrics overview
        </p>
      </div>

      {/* Radar chart */}
      <div style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
            <PolarGrid stroke="hsl(var(--border))" strokeOpacity={0.5} />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
            />
            <Radar
              name="Performance"
              dataKey="value"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.15}
              strokeWidth={1.5}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Tip */}
      <div className="flex items-start gap-2.5 bg-primary/5 border border-primary/15 rounded-lg p-3">
        <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="text-foreground font-medium">Tip: </span>
          Improve performance by optimizing content delivery, enhancing user experience, and gathering regular feedback.
        </p>
      </div>

      {/* Footer */}
      <p className="text-[10px] text-muted-foreground/40 text-center font-mono">
        by <span className="text-primary/60">Aniq-ui</span>
      </p>
    </div>
  );
}
