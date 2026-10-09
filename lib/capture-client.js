import { createCaptureIntent, pushCaptureStep } from "@/lib/api";

const CLIENT_KEY_STORAGE = "zoelit-capture-client-key";
const STRIPE_INTENT_STORAGE = "zoelit-capture-stripe-intent";

function randomId() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function readStorage(key) {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function writeStorage(key, value) {
  if (typeof window === "undefined") return;
  try {
    if (value) window.localStorage.setItem(key, JSON.stringify(value));
    else window.localStorage.removeItem(key);
  } catch {
    // Storage can be unavailable (private mode / quota). Capture is best effort.
  }
}

/**
 * Anonymous browser identifier used only to recognise the same visitor across
 * visits. It grants no access to anything: every capture write still has to
 * pass the backend ownership check.
 */
export function getCaptureClientKey() {
  const existing = readStorage(CLIENT_KEY_STORAGE);
  if (existing?.clientKey) return existing.clientKey;

  const clientKey = randomId();
  writeStorage(CLIENT_KEY_STORAGE, { clientKey });
  return clientKey;
}

export function readStripeIntent() {
  const intent = readStorage(STRIPE_INTENT_STORAGE);
  if (!intent?.id || !intent?.visitKey || intent.clientKey !== getCaptureClientKey()) {
    return null;
  }

  return intent;
}

/** Kept so a visitor returning from Stripe reports the cancellation on the same visit. */
export function rememberStripeIntent(intent) {
  writeStorage(STRIPE_INTENT_STORAGE, intent);
}

export function clearStripeIntent() {
  writeStorage(STRIPE_INTENT_STORAGE, null);
}

/**
 * One record per checkout visit. Called every time the checkout page opens;
 * a visit that already went to Stripe, converted or was abandoned is never
 * resumed, so every arrival starts a brand new record with its own snapshot.
 */
export async function startCaptureIntent({ items, subtotal, shipping, total, billing = {}, token }) {
  const clientKey = getCaptureClientKey();

  const response = await createCaptureIntent(
    {
      clientKey,
      items,
      subtotal,
      shipping,
      total,
      billing,
    },
    token
  );

  return { id: response.id, visitKey: response.visitKey, clientKey };
}

/** Fire and forget: a failed capture must never interrupt checkout. */
export function reportCaptureStep(intent, payload, token) {
  if (!intent?.id || !intent?.visitKey) return Promise.resolve(null);

  return pushCaptureStep(
    intent.id,
    { ...payload, visitKey: intent.visitKey, clientKey: intent.clientKey },
    token
  ).catch(() => null);
}

/**
 * Debounced form reporter so typing in the billing form is saved without a
 * request per keystroke.
 */
export function createStepReporter(delay = 2500) {
  let timer = null;
  let queued = null;

  const flush = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }

    const next = queued;
    queued = null;
    if (!next) return;
    reportCaptureStep(next.intent, next.payload, next.token);
  };

  return function queue(intent, payload, token) {
    queued = { intent, payload, token };

    if (timer) clearTimeout(timer);
    timer = setTimeout(flush, delay);
  };
}

/**
 * Sent when the checkout page goes away, which is how a record learns it was
 * abandoned. Uses `keepalive` so the request survives the navigation.
 *
 * Leaving the page normally means abandonment. Navigating to Stripe on purpose
 * is not: that hand-off already reports the "stripe" step, and a beacon racing
 * behind it would otherwise overwrite the payment exit with a checkout exit.
 */
let stripeRedirectStarted = false;

export function suppressCheckoutExit() {
  stripeRedirectStarted = true;
}

export function reportCheckoutExit(intent, token) {
  if (!intent?.id || !intent?.visitKey) return;
  if (typeof window === "undefined") return;
  if (stripeRedirectStarted) return;

  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL?.trim()
      || (process.env.NODE_ENV === "development" ? "http://localhost:5000" : "https://web-zoelit-backend.vercel.app");

    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    window.fetch(`${apiBase}/api/capture/intent/${encodeURIComponent(intent.id)}/step`, {
      method: "POST",
      headers,
      credentials: "include",
      keepalive: true,
      body: JSON.stringify({
        step: "left",
        visitKey: intent.visitKey,
        clientKey: intent.clientKey,
      }),
    }).catch(() => {});
  } catch {
    // Best effort only.
  }
}
