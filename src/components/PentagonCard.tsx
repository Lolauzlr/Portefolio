"use client";

import { useEffect, useId, useRef, useState } from "react";

export default function PentagonCard({
  children,
  className,
  contentClassName,
}: {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  const [size, setSize] = useState({ w: 800, h: 300 });
  const ref = useRef<HTMLDivElement>(null);
  const gradientId = `silver-card-${useId()}`;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setSize({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const chamfer = 27;
  const cut = 12;

  return (
    <div ref={ref} className={`relative ${className || ""}`}>
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          clipPath: `polygon(0 0, calc(100% - ${chamfer}px) 0, 100% ${cut}px, 100% 100%, 0 100%)`,
          background: "rgba(0,0,0,0.40)",
        }}
      />
      {/* SVG gradient silver border */}
      <svg
        className="absolute inset-0 w-full h-full z-10 pointer-events-none"
        viewBox={`0 0 ${size.w} ${size.h}`}
        preserveAspectRatio="none"
        fill="none"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2={size.w} y2={size.h} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
            <stop offset="25%" stopColor="rgba(200,200,200,0.5)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.7)" />
            <stop offset="75%" stopColor="rgba(180,180,180,0.4)" />
            <stop offset="100%" stopColor="rgba(220,220,220,0.6)" />
          </linearGradient>
        </defs>
        <polygon
          points={`0.5,0.5 ${size.w - chamfer},0.5 ${size.w - 0.5},${cut} ${size.w - 0.5},${size.h - 0.5} 0.5,${size.h - 0.5}`}
          stroke={`url(#${gradientId})`}
          strokeWidth="1"
          fill="none"
        />
      </svg>
      {/* Content */}
      <div className={`relative z-20 p-5 ${contentClassName || ""}`}>{children}</div>
    </div>
  );
}
