"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from "recharts";
import { ChevronDown } from "lucide-react";

const data = [
  { month: "Jan%", value: 72 },
  { month: "Feb%", value: 68 },
  { month: "Mar%", value: 78 },
  { month: "Apr%", value: 88 },
  { month: "May%", value: 83 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border/50 rounded-lg px-3 py-2 text-xs shadow-lg">
        <p className="text-muted-foreground">{label}</p>
        <p className="text-foreground font-semibold">{payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

export function PerformanceMetrics() {
  return (
    <div className="rounded-xl bg-card border border-border/50 p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Performance Metrics</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Monthly completion rate tracking</p>
        </div>
        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors border border-border/50 rounded-lg px-2.5 py-1.5">
          Last 5 Months
          <ChevronDown className="w-3 h-3 ml-0.5" />
        </button>
      </div>

      {/* Chart */}
      <div style={{ height: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 0, left: -25, bottom: 0 }} barCategoryGap="35%">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--secondary))", opacity: 0.5 }} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.month === "Apr%" ? "hsl(var(--primary))" : "hsl(215 20% 22%)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border/40">
        {[
          { label: "Avg Completion", value: "88.0%" },
          { label: "Above Target", value: "4/5" },
          { label: "Best Month", value: "Apr" },
        ].map((item) => (
          <div key={item.label} className="space-y-0.5">
            <p className="text-[10px] text-muted-foreground">{item.label}</p>
            <p className="text-sm font-bold font-display text-foreground">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
