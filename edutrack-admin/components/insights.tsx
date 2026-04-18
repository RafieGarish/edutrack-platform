"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import { ChartPieDonutText } from "./piechart";

const data = [
  { name: "Task Completion", value: 85, color: "#10b981" },
  { name: "User Engagement", value: 84, color: "#60a5fa" },
  { name: "Response Time", value: 78, color: "#a78bfa" },
];

const pieData = [
  { name: "filled", value: 85 },
  { name: "rest", value: 15 },
];

const tabs = ["Performance", "Trends"];

export function Insights() {
  return (
    <div className="rounded-xl bg-card border border-border/50 p-5 flex flex-col gap-4">
      <div>
        <h3 className="font-semibold text-foreground">Insights</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Performance analytics</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-background/60 rounded-lg border border-border/30">
        {tabs.map((t, i) => (
          <button
            key={t}
            className={cn(
              "flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              i === 0
                ? "bg-secondary text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Donut chart */}
      {/* <div className="flex items-center justify-center relative" style={{ height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={[{ value: 85 }, { value: 15 }]}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={74}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              strokeWidth={0}
            >
              <Cell fill="#10b981" />
              <Cell fill="hsl(220 14% 14%)" />
            </Pie>
            Second ring
            <Pie
              data={[{ value: 84 }, { value: 16 }]}
              cx="50%"
              cy="50%"
              innerRadius={44}
              outerRadius={56}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              strokeWidth={0}
            >
              <Cell fill="#60a5fa" />
              <Cell fill="hsl(220 14% 16%)" />
            </Pie>
            Third ring
            <Pie
              data={[{ value: 78 }, { value: 22 }]}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={42}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              strokeWidth={0}
            >
              <Cell fill="#a78bfa" />
              <Cell fill="hsl(220 14% 18%)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-2xl font-display font-bold text-foreground">85%</p>
          </div>
        </div>
      </div> */}

      <ChartPieDonutText/>

      {/* Metrics */}
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: item.color }}
              />
              <div>
                <p className="text-xs font-medium text-foreground">{item.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {item.name === "Task Completion"
                    ? "Overall completion rate"
                    : item.name === "User Engagement"
                    ? "Active user participation"
                    : "Average response efficiency"}
                </p>
              </div>
            </div>
            <span
              className="text-sm font-bold font-mono shrink-0"
              style={{ color: item.color }}
            >
              {item.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
