import { API_URL } from "@/lib/api";
import { mapProduct } from "@/lib/product-mapper";

async function serverFetch(path) {
  const response = await fetch(`${API_URL}${path}`, { cache: "no-store" });
  if (!response.ok) return null;
  return response.json();
}

export async function getFeaturedProducts() {
  try {
    const data = await serverFetch("/api/products?limit=32&image=synced");
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
