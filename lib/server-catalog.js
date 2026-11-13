import { API_URL } from "@/lib/api";
import { mapProduct } from "@/lib/product-mapper";

// Server-rendered pages reuse backend responses for a short window instead of
// calling the API on every render. Prices and stock still refresh within a
// minute, and the value can be tuned per deployment without a code change.
const CATALOG_REVALIDATE_SECONDS = Math.max(5, Number(process.env.CATALOG_REVALIDATE_SECONDS) || 60);

async function serverFetch(path, { revalidate = CATALOG_REVALIDATE_SECONDS } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    // An explicit revalidate opts this request into the Next.js Data Cache,
    // even when the surrounding route is rendered dynamically.
    next: { revalidate },
  });
  if (!response.ok) return null;
  return response.json();
}

// Home page sections only ever advertise products that can actually be bought
// and actually show a picture: the backend drops anything out of stock, and
// hasImage=1 drops the placeholder images left behind when a catalog image
// could not be resolved.
export async function getFeaturedProducts() {
  try {
    const data = await serverFetch("/api/products?limit=4&hasImage=1");
    if (data?.products?.length) {
      return data.products.map(mapProduct).filter(Boolean);
    }
  } catch {
    // No catalog available yet.
  }

  return [];
}

export async function getProductCount() {
  try {
    const data = await serverFetch("/api/products/count");
    return Number(data?.count) || 0;
  } catch {
    return 0;
  }
}

export async function getStoreProducts({ category = "", keyword = "", sort = "newest", page = 1, limit = 12, priceMin, priceMax, onRequest } = {}) {
  try {
    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      sort: sort === "price-low" ? "priceLow" : sort === "price-high" ? "priceHigh" : "newest",
    });
    if (category) query.set("category", category);
    if (keyword.trim()) query.set("keyword", keyword.trim());
    if (priceMin !== undefined && priceMin !== null) query.set("priceMin", String(priceMin));
    if (priceMax !== undefined && priceMax !== null) query.set("priceMax", String(priceMax));
    if (onRequest) query.set("onRequest", "1");
    const data = await serverFetch(`/api/products?${query.toString()}`);
    return {
      products: Array.isArray(data?.products) ? data.products.map(mapProduct).filter(Boolean) : [],
      pagination: data?.pagination || { page, limit, totalPages: 1 },
    };
  } catch {
    return { products: [], pagination: { page, limit, totalPages: 1 } };
  }
}

export async function getUserCount() {
  try {
    const data = await serverFetch("/api/public/user-count");
    return Number(data?.count) || 0;
  } catch {
    return 0;
  }
}

export async function getProductCategories() {
  try {
    const data = await serverFetch("/api/products/categories");
    if (Array.isArray(data?.categories)) {
      return data.categories;
    }
  } catch {
    // No categories available yet.
  }

  return [];
}

export async function getStoreConfig() {
  try {
    const data = await serverFetch("/api/public/config");
    if (data?.store) {
      return {
        name: data.store.name || "ZoeLit",
        email: data.store.email || "",
        phone: data.store.phone || "",
        address: data.store.address || "",
      };
    }
  } catch {
    // Store config unavailable yet.
  }

  return { name: "ZoeLit", email: "", phone: "", address: "" };
}

export async function getServerProduct(id) {
  try {
    const data = await serverFetch(`/api/products/${encodeURIComponent(id)}`);
    if (data?.product) {
      return mapProduct(data.product);
    }
  } catch {
    return null;
  }

  return null;
}

export async function getHomepageConfig() {
  try {
    const data = await serverFetch("/api/public/homepage");
    if (data?.homepage) return data.homepage;
  } catch {
    // Homepage config unavailable yet.
  }

  return null;
}

export async function getHomepageCatalog() {
  try {
    const data = await serverFetch("/api/public/homepage-catalog", { revalidate: 30 });
    if (data?.homepage) return data;
  } catch {
    // The homepage can fall back to its older individual requests.
  }
  return null;
}

function pickedId(item) {
  if (typeof item === "string") return item.trim();
  if (item && typeof item === "object" && item.productId) return String(item.productId).trim();
  return "";
}

// Resolves every product the homepage config manually picks with a single
// catalog lookup. The loading skeleton and the real page both work from this
// result, so the number of cards a section promises is the number it renders
// even when a picked product has since been removed.
export async function resolvePickedProducts(homepage) {
  const home = homepage || {};
  const groups = {};
  const collect = (key, list, limit = 4) => {
    const ids = [...new Set((Array.isArray(list) ? list : []).map(pickedId).filter(Boolean))];
    if (ids.length) groups[key] = ids.slice(0, limit);
  };

  collect("hero", home.hero?.productIds, 3);
  for (const key of ["bestDeals", "newArrivals", "trending"]) collect(key, home[key]?.productIds, 4);
  (Array.isArray(home.customSections) ? home.customSections : []).forEach((section, index) =>
    collect(`custom:${index}`, section?.productIds, 4)
  );

  const keys = Object.keys(groups);
  const resolved = {};
  for (const key of keys) resolved[key] = [];
  if (!keys.length) return resolved;

  const allIds = keys.flatMap((key) => groups[key]);
  const byId = new Map((await getProductsByIds(allIds, { skip: true })).map((product) => [product.id, product]));
  for (const key of keys) {
    resolved[key] = groups[key].map((id) => byId.get(id)).filter(Boolean);
  }

  return resolved;
}

export async function getProductsByIds(ids = [], { skip } = {}) {
  const uniqueIds = [...new Set(ids.map((id) => String(id).trim()).filter(Boolean))];
  if (!uniqueIds.length) return [];

  try {
    const query = new URLSearchParams({ ids: uniqueIds.join(",") });
    if (skip) query.set("skip", "1");
    const data = await serverFetch(`/api/products/by-ids?${query.toString()}`);
    if (Array.isArray(data?.products)) {
      return data.products.map(mapProduct).filter(Boolean);
    }
  } catch {
    // Products not resolved yet.
  }

  return [];
}

export async function getAutoSectionProducts(type = "custom", limit = 4) {
  try {
    // Automatic homepage sections must reflect catalogue syncs quickly. Keep
    // the page itself ISR-rendered, but do not hold an empty/old section in the
    // data cache for the full catalogue window.
    const data = await serverFetch(
      `/api/products/auto-section?type=${encodeURIComponent(type)}&limit=${Number(limit) || 4}`,
      { revalidate: 5 }
    );
    if (Array.isArray(data?.products)) {
      return data.products.map(mapProduct).filter(Boolean);
    }
  } catch {
    // Auto products not resolved yet.
  }

  return [];
}
