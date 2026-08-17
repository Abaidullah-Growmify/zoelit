"use client";

import { useEffect, useRef } from "react";

export function usePolling(callback, deps, intervalMs = 30000, enabled = true) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    if (!enabled) return undefined;
    const timer = setInterval(() => savedCallback.current(), intervalMs);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, intervalMs, ...deps]);
}
