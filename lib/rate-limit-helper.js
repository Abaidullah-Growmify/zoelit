/**
 * Frontend helper for displaying rate‑limit countdowns.
 */

/**
 * Parses Retry‑After seconds from a rate‑limit response.
 */
export function parseRetryAfter(errorOrResponse) {
  const header = errorOrResponse?.headers?.get?.("Retry-After") ||
                 errorOrResponse?.headers?.["Retry-After"] ||
                 errorOrResponse?.retryAfter;
  if (!header) return null;
  
  const seconds = Number.isFinite(Number(header)) ? Number(header) : null;
  if (seconds && seconds > 0) return seconds;
  return null;
}

/**
 * Formats remaining time as "Xm Ys" or "Xs".
 */
export function formatRemainingTime(seconds) {
  if (!seconds || seconds <= 0) return "Now";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return remainingSeconds > 0
      ? `${minutes}m ${remainingSeconds}s`
      : `${minutes}m`;
  }
  return `${remainingSeconds}s`;
}

/**
 * Returns a human‑friendly message for rate‑limit errors.
 */
export function getRateLimitMessage(errorResponse, defaultMessage = "Too many requests") {
  const seconds = parseRetryAfter(errorResponse);
  if (!seconds) return defaultMessage + ". Please try again shortly.";
  
  const timeText = formatRemainingTime(seconds);
  return `${defaultMessage}. Please wait ${timeText} before trying again.`;
}

/**
 * Starts a countdown timer that updates a UI element.
 * Returns a cleanup function.
 */
export function startCountdownTimer(seconds, onUpdate, onComplete) {
  if (!seconds || seconds <= 0) {
    if (onComplete) onComplete();
    return () => {};
  }
  
  let remaining = seconds;
  const interval = setInterval(() => {
    remaining -= 1;
    if (onUpdate) onUpdate(remaining);
    if (remaining <= 0) {
      clearInterval(interval);
      if (onComplete) onComplete();
    }
  }, 1000);
  
  if (onUpdate) onUpdate(remaining);
  
  return () => clearInterval(interval);
}