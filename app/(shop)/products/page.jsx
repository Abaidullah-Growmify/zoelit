"use client";

import { useDeferredValue, useState } from "react";
import { products } from "@/lib/data";
import { ProductCard } from "@/components/product-card";
import { EmptyState, Select } from "@/components/ui";
import { ProductGridSkeleton } from "@/components/skeletons";

export default function ProductsPage() {
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");
  const deferredCategory = useDeferredValue(category);
  const categories = ["All", ...new Set(products.map((product) => product.category))];
  const filtered = products.filter((product) => deferredCategory === "All" || product.category === deferredCategory).sort((a, b) => sort === "price-low" ? a.price - b.price : sort === "price-high" ? b.price - a.price : b.rating - a.rating);
  return (
    <section className="container-page py-12">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="font-bold text-blue-600">Collection</p><h1 className="text-4xl font-black">Shop products</h1><p className="mt-3 text-slate-500 dark:text-slate-400">Filter, sort, and build your cart with confidence.</p></div><div className="flex gap-3"><Select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category">{categories.map((item) => <option key={item}>{item}</option>)}</Select><Select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort products"><option value="featured">Top rated</option><option value="price-low">Price low</option><option value="price-high">Price high</option></Select></div></div>
      <div className="mt-8">{filtered.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{filtered.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <EmptyState title="No products found" description="Try a different category or sorting option." />}</div>
    </section>
  );
}

export function ProductsLoadingPreview() {
  return <ProductGridSkeleton count={8} />;
}
