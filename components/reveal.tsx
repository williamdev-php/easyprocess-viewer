"use client";

import { useRef, useEffect, useState, type ReactNode } from "react";

export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Mark as mounted so we know JS is running
    setMounted(true);

    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Before JS hydrates, render fully visible (no flash of invisible content)
  // After mount, apply animation classes
  const animClass = mounted
    ? visible
      ? "opacity-100 translate-y-0"
      : "opacity-0 translate-y-6"
    : "";

  return (
    <div
      ref={ref}
      className={`${mounted ? "transition-all duration-700 ease-out" : ""} ${animClass} ${className}`}
      style={mounted ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
