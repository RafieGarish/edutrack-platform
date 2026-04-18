"use client";

import { useEffect, useRef } from "react";
import "@/styles/flipclock.css"; 
import { flipClock, clock, theme, css } from "flipclock";

export default function FlipClock() {
  const clockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!clockRef.current) return;

    const instance = flipClock({
      parent: clockRef.current,
      face: clock({
        format: '[HH]:[mm]:[ss]'
      }),
      theme: theme({
        dividers: ":", 
        css: css({
            fontSize: "2rem"
        })
      }),
      autoStart: true,
    });

    return () => {
      instance.unmount();
    };
  }, []);

  return <div ref={clockRef} />;
}