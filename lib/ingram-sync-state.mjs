export function normalizeSyncSku(value) {
  return String(value || "").trim().toUpperCase();
}

export function matchesSyncSearch(item, query) {
  const normalizedQuery = String(query || "").trim().toLowerCase();
  if (!normalizedQuery) return true;
  return [
    item?.name,
    item?.description,
    item?.ingramPartNumber,
    item?.vendorName,
    item?.vendorPartNumber,
    item?.productSnapshot?.name,
    item?.productSnapshot?.description,
  ].filter(Boolean).some((value) => String(value).toLowerCase().includes(normalizedQuery));
}

export function toggleSyncSelection(current, value) {
  const next = new Set(current);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

export function mergePendingChanges(current, incoming) {
  const bySku = new Map();
  for (const change of [...current, ...incoming]) {
    const sku = normalizeSyncSku(change?.ingramPartNumber);
    const key = sku || `id:${change?._id || "unknown"}`;
    if (key) bySku.set(key, change);
  }
  return [...bySku.values()];
}

export function removePendingChange(changes, change) {
  const id = change?._id;
  const sku = normalizeSyncSku(change?.ingramPartNumber);
  return changes.filter((item) => item?._id !== id && (!sku || normalizeSyncSku(item?.ingramPartNumber) !== sku));
}
