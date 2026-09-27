"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Next.js tags its own internal fetches with these headers: `next-action` on
// every Server Action invocation (form submit or a direct call wrapped in
// startTransition), `rsc` on route-navigation payload fetches. Hover-prefetch
// requests also carry `rsc` but never block anything the user is waiting on,
// so they're excluded via `next-router-prefetch`. Tracking exactly these
// means the bar reflects real pending work on the page, not just "a link was
// clicked" — a manual fetch, an unrelated poll (e.g. the session heartbeat),
// or a fully-cached instant navigation correctly does/doesn't show it.
const RSC_HEADER = "rsc";
const ACTION_HEADER = "next-action";
const PREFETCH_HEADER = "next-router-prefetch";

function readHeader(headers: HeadersInit | undefined, name: string): string | null {
  if (!headers) return null;
  if (headers instanceof Headers) return headers.get(name);
  if (Array.isArray(headers)) {
    const entry = headers.find(([key]) => key.toLowerCase() === name);
    return entry ? entry[1] : null;
  }
  const key = Object.keys(headers).find((k) => k.toLowerCase() === name);
  return key ? (headers as Record<string, string>)[key] : null;
}

function isTrackedRequest(input: RequestInfo | URL, init: RequestInit | undefined): boolean {
  const headers = init?.headers ?? (input instanceof Request ? input.headers : undefined);
  if (readHeader(headers, ACTION_HEADER)) return true;
  if (readHeader(headers, RSC_HEADER) && !readHeader(headers, PREFETCH_HEADER)) return true;
  return false;
}

type Listener = (pendingCount: number) => void;

let pendingCount = 0;
const listeners = new Set<Listener>();
let patched = false;

function notify() {
  listeners.forEach((listener) => listener(pendingCount));
}

function patchFetchOnce() {
  if (patched || typeof window === "undefined") return;
  patched = true;

  const nativeFetch = window.fetch.bind(window);
  window.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const tracked = isTrackedRequest(input, init);
    if (tracked) {
      pendingCount += 1;
      notify();
    }
    try {
      return await nativeFetch(input, init);
    } finally {
      if (tracked) {
        pendingCount = Math.max(0, pendingCount - 1);
        notify();
      }
    }
  }) as typeof window.fetch;
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function TopLoader() {
  const [progress, setProgress] = useState(0);
  const trickleId = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeId = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    patchFetchOnce();

    function clearTrickle() {
      if (trickleId.current) {
        clearInterval(trickleId.current);
        trickleId.current = null;
      }
    }

    function onPendingChange(count: number) {
      if (fadeId.current) {
        clearTimeout(fadeId.current);
        fadeId.current = null;
      }

      if (count > 0) {
        if (!trickleId.current) {
          setProgress((p) => (p <= 0 ? 12 : p));
          trickleId.current = setInterval(() => {
            setProgress((p) => (p >= 90 ? p : p + (90 - p) * 0.08 + 0.5));
          }, 200);
        }
        return;
      }

      clearTrickle();
      setProgress((p) => (p === 0 ? p : 100));
      fadeId.current = setTimeout(() => setProgress(0), 300);
    }

    const unsubscribe = subscribe(onPendingChange);
    return () => {
      unsubscribe();
      clearTrickle();
      if (fadeId.current) clearTimeout(fadeId.current);
    };
  }, []);

  if (progress <= 0) return null;

  return (
    <div className='pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px]' aria-hidden>
      <div
        className={cn(
          "h-full bg-primary shadow-[0_0_8px_var(--primary)] transition-[width,opacity] duration-200 ease-out",
          progress >= 100 && "opacity-0",
        )}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
