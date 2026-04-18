"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { ChevronDown, TrendingUp } from "lucide-react";

const data = [
  { month: "Product", value: 12000 },
  { month: "", value: 18000 },
  { month: "", value: 14000 },
  { month: "", value: 24000 },
  { month: "", value: 22000 },
  { month: "", value: 32000 },
  { month: "Services", value: 28000 },
  { month: "", value: 38000 },
  { month: "", value: 35000 },
  { month: "", value: 42000 },
  { month: "Consulting", value: 55000 },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border/50 rounded-lg px-3 py-2 text-xs shadow-lg">
        <p className="text-foreground font-semibold">
          ${payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export function RevenueAnalytics() {
  return (
    <div className="rounded-xl bg-card border border-border/50 p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Revenue Analytics</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Revenue breakdown by category</p>
        </div>
        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors border border-border/50 rounded-lg px-2.5 py-1.5">
          This Quarter
          <ChevronDown className="w-3 h-3 ml-0.5" />
        </button>
      </div>

      {/* Chart */}
      <div style={{ height: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
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
              tickFormatter={(v) => `$${v / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#revenueGrad)"
              dot={false}
              activeDot={{ r: 4, fill: "hsl(var(--primary))" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border/40">
        {[
          { label: "Total Revenue", value: "$193,390", sub: null },
          { label: "Avg Growth", value: "+13.9%", trend: true },
          { label: "Positive", value: "6/6" },
        ].map((item) => (
          <div key={item.label} className="space-y-0.5">
            <p className="text-[10px] text-muted-foreground">{item.label}</p>
            <p className={`text-sm font-bold font-display ${item.trend ? "text-primary flex items-center gap-1" : "text-foreground"}`}>
              {item.trend && <TrendingUp className="w-3 h-3" />}
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
