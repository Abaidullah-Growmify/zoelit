import { resolveAvailability, isSellable } from "./product-availability";

export const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=900&q=80";

export function buildHighlights(db) {
  const items = [];

  if (db.vendorName) items.push(`Sourced from ${db.vendorName}`);
  if (db.hasWarranty) items.push("Manufacturer warranty included");
  if (db.directShip) items.push("Ships directly from distributor");
  if (db.newProduct) items.push("New release");
  if (db.upcCode) items.push(`UPC ${db.upcCode}`);
  if (db.skuAvailableInFeed) items.push("Available in catalog feed");

  return items.length ? items : [isSellable(db) ? "In stock and ready to ship" : "Currently unavailable"];
}

export function buildDetails(db) {
  const details = {};

  if (db.vendorName) details["Vendor"] = db.vendorName;
  if (db.vendorPartNumber) details["Vendor part number"] = db.vendorPartNumber;
  if (db.upcCode) details["UPC"] = db.upcCode;
  if (db.category) details["Category"] = db.category;
  if (db.subCategory) details["Subcategory"] = db.subCategory;
  if (db.productType) details["Product type"] = db.productType;
  details["Availability"] = resolveAvailability(db);
  if (db.hasWarranty) details["Warranty"] = "Included";
  if (db.extraDescription) details["Details"] = db.extraDescription;

  return details;
}

export function mapProduct(db) {
  const productId = db?.ingramPartNumber || db?.id;
  if (!db || !productId) return null;

  const name = db.name || db.description || productId;
  const rawDescription = db.extraDescription || db.description || "";
  const normalizedName = String(name).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const normalizedDescription = String(rawDescription).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const description = normalizedDescription && normalizedDescription !== normalizedName
    ? rawDescription
    : `Explore ${name} specifications, availability, and pricing at ZoeLit.`;
  const originalPrice = Number(db.originalPrice ?? db.price) || 0;
  const commissionValue = Number(db.commissionValue) || 0;
  const commissionIsActive = Boolean(db.commissionIsActive);
  const commissionAmount = commissionIsActive
    ? db.commissionValueType === "fixed"
      ? commissionValue
      : originalPrice * commissionValue / 100
    : 0;
  const finalPrice = originalPrice + commissionAmount;
  const availability = resolveAvailability(db);

  return {
    id: productId,
    name,
    category: db.category || "General",
    price: finalPrice,
    originalPrice,
    commissionPrice: finalPrice,
    commissionAmount,
    commissionRuleId: db.commissionRuleId || "",
    commissionRuleType: db.commissionRuleType || "none",
    commissionValueType: db.commissionValueType || "percentage",
    commissionValue,
    commissionIsActive,
    stock: db.stock || 0,
    source: db.source || "ingram",
    availability,
    badge: db.badge || "",
    isSellable: isSellable(db),
    createdAt: db.createdAt || null,
    image: db.image || db.imageUrl || FALLBACK_IMAGE,
    description,
    highlights: buildHighlights(db),
    details: buildDetails(db),
    sku: productId || db.sku || "",
  };
}
