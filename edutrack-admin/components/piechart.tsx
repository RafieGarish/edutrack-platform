"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Label, Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import TodayDate from "./todaydate"

export const description = "A donut chart with text"

const chartData = [
  { browser: "hadir", visitors: 275, fill: "var(--color-terlambat)" },
  { browser: "terlambat", visitors: 200, fill: "var(--color-hadir)" },
  { browser: "sakit", visitors: 287, fill: "var(--color-sakit)" },
  { browser: "izin", visitors: 173, fill: "var(--color-izin)" },
  { browser: "tidak_hadir", visitors: 190, fill: "var(--color-tidak_hadir)" },
]

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  hadir: {
    label: "Hadir",
    color: "hsl(var(--chart-1))",
  },
  terlambat: {
    label: "Terlambat",
    color: "hsl(var(--chart-2))",
  },
  sakit: {
    label: "Sakit",
    color: "hsl(var(--chart-3))",
  },
  izin: {
    label: "Izin",
    color: "hsl(var(--chart-4))",
  },
  tidak_hadir: {
    label: "Tidak Hadir",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig

export function ChartPieDonutText() {
  const totalVisitors = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.visitors, 0)
  }, [])

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Statistik absensi hari ini</CardTitle>
        <CardDescription><TodayDate /></CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="visitors"
              nameKey="browser"
              innerRadius={50}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalVisitors.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Total Absensi
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="browser" />}
              className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      {/* <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter> */}
    </Card>
  )
}
