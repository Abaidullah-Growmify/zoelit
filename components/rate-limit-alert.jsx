"use client";

import { useState, useEffect } from "react";
import { Clock, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { startCountdownTimer, formatRemainingTime } from "@/lib/rate-limit-helper";

export function RateLimitAlert({ retryAfter, message = "Too many attempts", detail = "Sign-in is paused to protect your account.", className, showIcon = true }) {
  const [remaining, setRemaining] = useState(retryAfter);

  useEffect(() => {
    const resetTimer = window.setTimeout(() => {
      setRemaining(retryAfter || 0);
    }, 0);
    if (!retryAfter || retryAfter <= 0) return () => window.clearTimeout(resetTimer);
    const stopCountdown = startCountdownTimer(retryAfter, setRemaining);
    return () => {
      window.clearTimeout(resetTimer);
      stopCountdown?.();
    };
  }, [retryAfter]);

  if (!retryAfter || retryAfter <= 0) return null;

  return (
    <div className={cn(
      "flex items-center gap-3 rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3.5 text-sm text-on-surface",
      className
    )}>
      <div className="flex items-start gap-2">
        {showIcon && <span className="grid size-10 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-700"><ShieldAlert className="size-5" /></span>}
        <div className="flex-1">
          <p className="font-bold">{message}</p>
          <p className="mt-0.5 text-sm text-on-surface-variant">{detail}{remaining > 0 ? ` Try again in ${formatRemainingTime(remaining)}.` : ""}</p>
        </div>
      </div>
    </div>
  );
}

export function RateLimitButton({ retryAfter, children, className, disabled = false, ...props }) {
  const [remaining, setRemaining] = useState(retryAfter || 0);
  const [initial, setInitial] = useState(retryAfter || 0);
  const isRateLimited = retryAfter > 0 && remaining > 0;
  const isDisabled = isRateLimited || disabled;

  useEffect(() => {
    const resetTimer = window.setTimeout(() => {
      setRemaining(retryAfter || 0);
      setInitial(retryAfter || 0);
    }, 0);
    if (!retryAfter || retryAfter <= 0) return () => window.clearTimeout(resetTimer);
    const stopCountdown = startCountdownTimer(retryAfter, setRemaining);
    return () => {
      window.clearTimeout(resetTimer);
      stopCountdown?.();
    };
  }, [retryAfter]);

  return (
    <button
      className={cn(
        "relative isolate inline-flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-md border border-primary/20 px-4 text-sm font-bold transition",
        isRateLimited
          ? "cursor-not-allowed bg-surface-container-high text-on-surface"
          : "bg-primary text-white hover:bg-primary-dark",
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {isRateLimited && <span className="absolute inset-y-0 left-0 -z-10 bg-primary/25 transition-[width] duration-1000" style={{ width: `${initial ? Math.max(0, Math.min(100, ((initial - remaining) / initial) * 100)) : 100}%` }} />}
      <span className="relative inline-flex items-center gap-2">
        {isRateLimited && <Clock className="size-4" />}
        {isRateLimited ? `Try again in ${formatRemainingTime(remaining)}` : children}
      </span>
    </button>
  );
}
