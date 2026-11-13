import { API_URL } from "@/lib/api";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://zoelit-frontend.vercel.app").replace(/\/$/, "");

const publicRoutes = [
  "/",
  "/products",
  "/about-us",
  "/contact",
  "/faq",
  "/news-updates",
  "/privacy-policy",
  "/careers",
];

export default async function sitemap() {
  const lastModified = new Date();
  const products = [];

  try {
    for (let page = 1; ; page += 1) {
      const response = await fetch(`${API_URL}/api/products/sitemap?page=${page}&limit=5000`, {
        next: { revalidate: 300 },
      });
      if (!response.ok) break;
      const data = await response.json();
      if (Array.isArray(data?.products)) products.push(...data.products);
      if (!data?.pagination?.hasMore) break;
    }
  } catch {
    // Keep the static sitemap available if the backend is temporarily down.
  }

  const routes = publicRoutes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified,
    changeFrequency: route === "/" || route === "/products" ? "daily" : "monthly",
    priority: route === "/" ? 1 : route === "/products" ? 0.9 : 0.6,
  }));

  return routes
    .concat(products.map((product) => ({
    url: `${SITE_URL}/products/${encodeURIComponent(product.id)}`,
    lastModified: product.lastModified ? new Date(product.lastModified) : lastModified,
    changeFrequency: "weekly",
    priority: 0.8,
    })));
}
