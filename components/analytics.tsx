"use client";

import { useEffect, useRef } from "react";

import { API_URL } from "@/lib/api";

interface LayoutShiftEntry extends PerformanceEntry {
  hadRecentInput?: boolean;
  value: number;
}

/** Delay before collecting paint metrics to let browser settle. */
const VITALS_INIT_DELAY_MS = 100;
/** Extra wait for LCP/CLS observers to fire. */
const OBSERVERS_SETTLE_MS = 1_000;

function generateId(): string {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function getVisitorId(): string {
  const key = "qv_vid";
  try {
    let id = localStorage.getItem(key);
    if (!id) {
      id = generateId();
      localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return generateId();
  }
}

function getSessionId(): string {
  const key = "qv_sid";
  try {
    let id = sessionStorage.getItem(key);
    if (!id) {
      id = generateId();
      sessionStorage.setItem(key, id);
    }
    return id;
  } catch {
    return generateId();
  }
}

interface TrackPayload {
  visitor_id: string;
  session_id: string;
  path: string;
  referrer: string | null;
  screen_width: number;
  load_time_ms: number | null;
  ttfb_ms: number | null;
  fcp_ms: number | null;
  lcp_ms: number | null;
  cls: number | null;
}

function collectWebVitals(): Promise<{
  load_time_ms: number | null;
  ttfb_ms: number | null;
  fcp_ms: number | null;
  lcp_ms: number | null;
  cls: number | null;
}> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const result = {
        load_time_ms: null as number | null,
        ttfb_ms: null as number | null,
        fcp_ms: null as number | null,
        lcp_ms: null as number | null,
        cls: null as number | null,
      };

      try {
        const nav = performance.getEntriesByType(
          "navigation"
        )[0] as PerformanceNavigationTiming | undefined;
        if (nav) {
          result.load_time_ms = Math.round(nav.loadEventEnd - nav.startTime);
          result.ttfb_ms = Math.round(nav.responseStart - nav.requestStart);
        }

        const paintEntries = performance.getEntriesByType("paint");
        const fcp = paintEntries.find((e) => e.name === "first-contentful-paint");
        if (fcp) {
          result.fcp_ms = Math.round(fcp.startTime);
        }
      } catch {
        // Perf API not available
      }

      // LCP via PerformanceObserver
      try {
        if ("PerformanceObserver" in window) {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            if (entries.length > 0) {
              result.lcp_ms = Math.round(entries[entries.length - 1].startTime);
            }
            lcpObserver.disconnect();
          });
          lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });

          // CLS via layout-shift
          let clsValue = 0;
          const clsObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              const shift = entry as LayoutShiftEntry;
              if (!shift.hadRecentInput) {
                clsValue += shift.value;
              }
            }
          });
          clsObserver.observe({ type: "layout-shift", buffered: true });

          // Give observers time to fire, then resolve
          setTimeout(() => {
            clsObserver.disconnect();
            result.cls = Math.round(clsValue * 1000) / 1000;
            resolve(result);
          }, OBSERVERS_SETTLE_MS);
          return;
        }
      } catch {
        // Observer not supported
      }

      resolve(result);
    }, VITALS_INIT_DELAY_MS);
  });
}

function sendTrackEvent(siteId: string, payload: TrackPayload): void {
  const url = `${API_URL}/api/sites/${siteId}/track/view`;
  const body = JSON.stringify(payload);

  // Use sendBeacon for reliability (survives page unload).
  // Content-Type must be text/plain to avoid CORS preflight — sendBeacon
  // cannot handle preflight requests and the beacon is silently dropped.
  // The backend parses the body as JSON regardless of Content-Type.
  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "text/plain" });
    navigator.sendBeacon(url, blob);
  } else {
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body,
      keepalive: true,
    }).catch(() => {});
  }
}

export function Analytics({ siteId }: { siteId: string }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    // Don't track if inside an editor iframe
    try {
      if (window !== window.parent) return;
    } catch {
      // Cross-origin iframe — skip tracking
      return;
    }

    const visitorId = getVisitorId();
    const sessionId = getSessionId();

    collectWebVitals().then((vitals) => {
      const payload: TrackPayload = {
        visitor_id: visitorId,
        session_id: sessionId,
        path: window.location.pathname,
        referrer: document.referrer || null,
        screen_width: window.innerWidth,
        ...vitals,
      };
      sendTrackEvent(siteId, payload);
    });
  }, [siteId]);

  return null;
}
