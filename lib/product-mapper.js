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

  return items.length ? items : ["In stock and ready to ship"];
}

export function buildDetails(db) {
  const details = {};

  if (db.vendorName) details["Vendor"] = db.vendorName;
  if (db.vendorPartNumber) details["Vendor part number"] = db.vendorPartNumber;
  if (db.upcCode) details["UPC"] = db.upcCode;
  if (db.category) details["Category"] = db.category;
  if (db.subCategory) details["Subcategory"] = db.subCategory;
  if (db.productType) details["Product type"] = db.productType;
  if (db.availability) details["Availability"] = db.availability;
  if (db.hasWarranty) details["Warranty"] = "Included";
  if (db.extraDescription) details["Details"] = db.extraDescription;

  return details;
}

export function mapProduct(db) {
  if (!db || !db.ingramPartNumber) return null;

  const name = db.description || db.ingramPartNumber;
  const description = db.extraDescription || db.description || "";

  return {
    id: db.ingramPartNumber,
    name,
    category: db.category || "General",
    price: Number(db.price) || 0,
    rating: 0,
    stock: db.stock || 0,
    image: db.imageUrl || FALLBACK_IMAGE,
    description,
    highlights: buildHighlights(db),
    details: buildDetails(db),
    reviews: [],
  };
}
