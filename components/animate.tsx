"use client";

import { useRef, useEffect, useState, type ReactNode } from "react";

export type AnimationType = "fade-up" | "fade-in" | "slide-left" | "slide-right" | "scale" | "none";

const INITIAL_CLASSES: Record<AnimationType, string> = {
  "fade-up": "opacity-0 translate-y-6",
  "fade-in": "opacity-0",
  "slide-left": "opacity-0 -translate-x-8",
  "slide-right": "opacity-0 translate-x-8",
  "scale": "opacity-0 scale-95",
  "none": "",
};

const VISIBLE_CLASSES: Record<AnimationType, string> = {
  "fade-up": "opacity-100 translate-y-0",
  "fade-in": "opacity-100",
  "slide-left": "opacity-100 translate-x-0",
  "slide-right": "opacity-100 translate-x-0",
  "scale": "opacity-100 scale-100",
  "none": "",
};

export function Animate({
  children,
  className = "",
  delay = 0,
  animation = "fade-up",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  animation?: AnimationType;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);

    if (animation === "none") {
      setVisible(true);
      return;
    }

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
  }, [animation]);

  if (animation === "none") {
    return <div className={className}>{children}</div>;
  }

  // Before JS hydrates, render fully visible (no flash of invisible content)
  const animClass = mounted
    ? visible
      ? VISIBLE_CLASSES[animation]
      : INITIAL_CLASSES[animation]
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

/**
 * Backward-compatible Reveal component — delegates to Animate with fade-up.
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <Animate animation="fade-up" delay={delay} className={className}>
      {children}
    </Animate>
  );
}
