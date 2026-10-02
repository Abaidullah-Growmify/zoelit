import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

let displayCurrency = "USD";

export function setDisplayCurrency(currency) {
  const candidate = typeof currency === "string" ? currency.trim().toUpperCase() : "";
  if (/^[A-Z]{3}$/.test(candidate)) displayCurrency = candidate;
}

function formatCurrency(amount, currency) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
  } catch {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  }
}

export function money(value, currency) {
  const amount = Number(value);
  const safe = Number.isFinite(amount) ? amount : 0;
  const code = typeof currency === "string" && currency ? currency : displayCurrency;
  return formatCurrency(safe, code);
}

export function shortDate(value) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export function minimumLoadingDelay(startedAt, duration = 650) {
  return new Promise((resolve) => window.setTimeout(resolve, Math.max(0, duration - (Date.now() - startedAt))));
}
