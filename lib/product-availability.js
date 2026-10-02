const ADMIN_CONTROLLED = ["Out of Stock", "Pre-Order", "Backordered"];
const ADMIN_CONTROLLED_BY_KEY = new Map(ADMIN_CONTROLLED.map((label) => [label.toLowerCase(), label]));

/**
 * Returns the canonical spelling of a known label, or the trimmed text when it
 * is not one we recognise.
 */
function normalizeAvailability(value) {
  const text = String(value ?? "").trim();
  if (!text) return "";
  return ADMIN_CONTROLLED_BY_KEY.get(text.toLowerCase()) || text;
}

/**
 * Mirrors the backend resolver in `services/productAvailabilityService.js`.
 *
 * Kept client-side as well so a product that an admin has just switched off is
 * shown as unavailable on the very first paint, without waiting for the admin
 * save response to be cached and re-fetched.
 */
export function resolveAvailability(product) {
  const count = Math.max(0, Math.floor(Number(product?.stock) || 0));
  const current = normalizeAvailability(product?.availability);

  if ((product?.source || "ingram") === "manual" && ADMIN_CONTROLLED_BY_KEY.has(current.toLowerCase())) return current;

  return count > 0 ? "In Stock" : "Out of Stock";
}

/** A product can only be bought while it is not paused and stock is not zero. */
export function isSellable(product) {
  return resolveAvailability(product) === "In Stock";
}
