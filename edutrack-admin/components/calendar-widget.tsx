"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

/* Event Data */
const events: Record<number, string> = {
  5: "Team Meeting",
  12: "EduTrack Deploy",
  18: "Client Presentation",
  23: "Product Review",
  27: "Sprint Planning",
};

export function CalendarWidget() {
  const today = new Date();

  const [current, setCurrent] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });

  const daysInMonth = getDaysInMonth(current.year, current.month);
  const firstDay = getFirstDayOfMonth(current.year, current.month);

  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1
  );

  const prev = () => {
    setCurrent((c) =>
      c.month === 0
        ? { year: c.year - 1, month: 11 }
        : { year: c.year, month: c.month - 1 }
    );
  };

  const next = () => {
    setCurrent((c) =>
      c.month === 11
        ? { year: c.year + 1, month: 0 }
        : { year: c.year, month: c.month + 1 }
    );
  };

  const isToday = (day: number | null) =>
    day !== null &&
    day === today.getDate() &&
    current.month === today.getMonth() &&
    current.year === today.getFullYear();

  return (
    <div className="rounded-xl bg-card border border-border/50 p-5 flex flex-col gap-4 h-full">
      
      {/* Header */}
      <div>
        <h3 className="font-semibold text-foreground">Kalender Pendidikan</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prev}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="text-sm font-semibold text-foreground">
          {MONTHS[current.month]} {current.year}
        </span>

        <button
          onClick={next}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 gap-1">
        {DAYS.map((d) => (
          <div
            key={d}
            className="text-[10px] font-semibold text-muted-foreground text-center py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 flex-1">
        {cells.map((day, i) => {

          const event = day ? events[day] : null;

          return (
            <HoverCard key={i}>
              <HoverCardTrigger asChild>

                <button
                  disabled={!day}
                  className={cn(
                    "aspect-square flex flex-col items-center justify-center rounded-lg text-xs font-medium transition-all relative",
                    !day && "invisible",
                    isToday(day)
                      ? "bg-primary text-primary-foreground font-bold shadow-sm"
                      : day
                      ? "text-foreground hover:bg-secondary"
                      : ""
                  )}
                >
                  {day}

                  {/* Event dot */}
                  {day && event && !isToday(day) && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary/60" />
                  )}

                </button>

              </HoverCardTrigger>

              {day && event && (
                <HoverCardContent className="w-48 text-xs">
                  <p className="font-medium">{event}</p>
                  <p className="text-muted-foreground text-[11px]">
                    {day} {MONTHS[current.month]} {current.year}
                  </p>
                </HoverCardContent>
              )}
            </HoverCard>
          );
        })}
      </div>
    </div>
  );
}