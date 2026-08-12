"use client";

import { useDeferredValue, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { getProductCategories, getPublicProducts } from "@/lib/api";
import { mapProduct } from "@/lib/product-mapper";
import { ProductCard } from "@/components/product-card";
import { Button, EmptyState, Input, PageHeader, Select } from "@/components/ui";
import { ProductGridSkeleton } from "@/components/skeletons";

const SORT_QUERY = {
  featured: "newest",
  "price-low": "priceLow",
  "price-high": "priceHigh",
};

const PAGE_SIZE = 12;

export default function ProductsPage() {
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");
  const [categories, setCategories] = useState(["All"]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [keyword, setKeyword] = useState("");
  const deferredCategory = useDeferredValue(category);
  const deferredKeyword = useDeferredValue(keyword);

  useEffect(() => {
    let active = true;

    getProductCategories()
      .then((data) => {
        if (!active) return;
        const names = (data.categories || []).map((item) => item.name).filter(Boolean);
        setCategories(["All", ...names]);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);

    getPublicProducts({
      category: deferredCategory === "All" ? undefined : deferredCategory,
      keyword: deferredKeyword.trim() || undefined,
      sort: SORT_QUERY[sort] || "newest",
      page,
      limit: PAGE_SIZE,
    })
      .then((data) => {
        if (!active) return;
        setProducts((data.products || []).map(mapProduct).filter(Boolean));
        setTotalPages(Math.max(1, data.pagination?.totalPages || 1));
        setTotalProducts(data.pagination?.total || 0);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setProducts([]);
        setTotalPages(1);
        setTotalProducts(0);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [deferredCategory, deferredKeyword, sort, page]);

  function changeCategory(value) {
    setPage(1);
    setCategory(value);
  }

  function changeSort(value) {
    setPage(1);
    setSort(value);
  }

  return (
    <section className="container-page py-12 sm:py-16">
      <PageHeader eyebrow="Collection" title="Shop products" description={`${totalProducts} products available — filter, sort, and build your cart with confidence.`} action={<div className="flex gap-3"><Select value={category} onChange={(e) => changeCategory(e.target.value)} aria-label="Filter by category">{categories.map((item) => <option key={item}>{item}</option>)}</Select><Select value={sort} onChange={(e) => changeSort(e.target.value)} aria-label="Sort products"><option value="featured">Top rated</option><option value="price-low">Price low</option><option value="price-high">Price high</option></Select></div>} />
      <div className="relative mt-6 max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input value={keyword} onChange={(event) => { setKeyword(event.target.value); setPage(1); }} placeholder="Search products by name, SKU or keyword..." aria-label="Search products" className="h-12 pl-10" />
      </div>
      <div className="mt-8 rounded-lg border border-slate-200 bg-white/60 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">{loading ? <ProductGridSkeleton count={8} /> : products.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <EmptyState title="No products found" description="No products match your search. Try a different keyword or category." />}</div>
      {!loading && products.length ? (
        <div className="mt-10 flex items-center justify-center gap-4">
          <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</Button>
          <span className="text-body font-semibold text-slate-600 dark:text-slate-300">Page {page} of {totalPages}</span>
          <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>Next</Button>
        </div>
      ) : null}
    </section>
  );
}

export function ProductsLoadingPreview() {
  return <ProductGridSkeleton count={8} />;
}
