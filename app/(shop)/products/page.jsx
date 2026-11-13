import { getProductCategories, getStoreProducts } from "@/lib/server-catalog";
import ProductsContent from "./products-content";

export const metadata = {
  title: "Shop Products",
  description: "Browse available technology, accessories, connectivity products, and business equipment from ZoeLit.",
  alternates: { canonical: "/products" },
  openGraph: { title: "Shop Products | ZoeLit", description: "Browse available technology, accessories, connectivity products, and business equipment from ZoeLit.", url: "/products" },
};

// The store page depends on search params, so it renders per request. Its
// backend queries are still cached through the revalidate window in
// lib/server-catalog.js, which removes repeated catalogue calls.
export const dynamic = "force-dynamic";
export const revalidate = 60;

export default async function ProductsPage({ searchParams }) {
  const params = await searchParams;
  const category = String(params?.category || "");
  const keyword = String(params?.keyword || "");
  const sort = String(params?.sort || "newest");
  const priceRange = String(params?.price || "all");
  const priceBounds = priceRange === "under-100" ? { priceMin: 0.01, priceMax: 99.99 } : priceRange === "100-500" ? { priceMin: 100, priceMax: 500 } : priceRange === "over-500" ? { priceMin: 500.01 } : priceRange === "on-request" ? { onRequest: true } : {};
  const page = Math.max(1, Number(params?.page) || 1);

  const [catalog, categoryData] = await Promise.all([
    getStoreProducts({ category, keyword, sort, page, limit: 12, ...priceBounds }),
    getProductCategories(),
  ]);

  return (
    <ProductsContent
      initialProducts={catalog.products}
      initialPagination={catalog.pagination}
      initialCategories={["All", ...categoryData.map((item) => item.name).filter(Boolean)]}
      initialState={{ category, keyword, sort, page, priceRange }}
    />
  );
}
