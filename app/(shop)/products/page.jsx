"use client";

import { useDeferredValue, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { getProductCategories, getPublicProducts } from "@/lib/api";
import { mapProduct } from "@/lib/product-mapper";
import { ProductCard } from "@/components/product-card";
import Pagination from "@/components/pagination";
import { EmptyState, Input, Select } from "@/components/ui";
import { ProductGridSkeleton } from "@/components/skeletons";

const SORT_QUERY = {
  featured: "newest",
  "price-low": "priceLow",
  "price-high": "priceHigh",
};

const PAGE_SIZE = 12;

export default function ProductsPage() {
  const params = useSearchParams();
  const initialCategory = params.get("category");
  const [sort, setSort] = useState("featured");
  const [categories, setCategories] = useState(["All"]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [priceRange, setPriceRange] = useState("all");
  const [minRating, setMinRating] = useState(0);
  const deferredKeyword = useDeferredValue(keyword);
  const [selectedCategories, setSelectedCategories] = useState(initialCategory ? [initialCategory] : []);

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

    const request = selectedCategories.length > 1
      ? Promise.all(selectedCategories.map((selectedCategory) => getPublicProducts({ category: selectedCategory, keyword: deferredKeyword.trim() || undefined, sort: SORT_QUERY[sort] || "newest", page: 1, limit: 100 }))).then((results) => ({ products: results.flatMap((result) => result.products || []), pagination: { totalPages: 1 } }))
      : getPublicProducts({ category: selectedCategories[0], keyword: deferredKeyword.trim() || undefined, sort: SORT_QUERY[sort] || "newest", page, limit: PAGE_SIZE });
    request.then((data) => {
        if (!active) return;
        setProducts((data.products || []).map(mapProduct).filter(Boolean));
        setTotalPages(selectedCategories.length > 1 ? Math.max(1, Math.ceil((data.products || []).length / PAGE_SIZE)) : Math.max(1, data.pagination?.totalPages || 1));
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setProducts([]);
        setTotalPages(1);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedCategories, deferredKeyword, sort, page]);

  function toggleCategory(value) {
    const next = selectedCategories.includes(value) ? selectedCategories.filter((item) => item !== value) : [...selectedCategories, value];
    setLoading(true);
    setPage(1);
    setSelectedCategories(next);
  }

  function changeSort(value) {
    setLoading(true);
    setPage(1);
    setSort(value);
  }

  const visibleProducts = products.filter((product) => {
    const price = Number(product.price) || 0;
    const rating = Number(product.rating) || 0;
    const priceMatch = priceRange === "all" || (priceRange === "under-2000" && price < 2000) || (priceRange === "2000-10000" && price >= 2000 && price <= 10000) || (priceRange === "over-10000" && price > 10000);
    const categoryMatch = !selectedCategories.length || selectedCategories.includes(product.category);
    return priceMatch && rating >= minRating && categoryMatch;
  });
  const displayProducts = selectedCategories.length > 1 ? visibleProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) : visibleProducts;
  const effectiveTotalPages = selectedCategories.length > 1 ? Math.max(1, Math.ceil(visibleProducts.length / PAGE_SIZE)) : totalPages;

  return (
    <section className="container-page !max-w-[1200px] py-10 sm:py-14">
      <div className="mb-7"><div className="mb-4 flex items-center gap-2 text-xs text-on-surface-variant"><Link href="/" className="hover:text-on-surface">Home</Link><span>/</span><strong className="text-on-surface">All Products</strong></div><h1 className="font-heading text-3xl font-bold tracking-[-0.03em] text-on-surface">All Products</h1><p className="mt-2 text-sm text-on-surface-variant">Explore the complete collection - filter by category, price or rating.</p></div>
      <div className="relative mb-7 max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
        <Input value={keyword} onChange={(event) => { setKeyword(event.target.value); setLoading(true); setPage(1); }} placeholder="Search products by name, SKU or keyword..." aria-label="Search products" className="h-12 pl-10" />
      </div>
      <div className="grid items-start gap-7 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="rounded-[14px] border border-outline-variant bg-surface p-5">
          <div className="mb-1 flex items-center justify-between"><h2 className="text-sm font-semibold text-on-surface">Filters</h2><button type="button" onClick={() => { setPriceRange("all"); setMinRating(0); setSelectedCategories([]); setPage(1); setLoading(true); }} className="text-xs font-semibold text-on-surface-variant underline hover:text-on-surface">Clear all</button></div>
          <div className="mt-5 max-h-[330px] overflow-y-auto border-t border-outline-variant pt-5 pr-2"><h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">Category</h3>{categories.filter((item) => item !== "All").map((item) => <label key={item} className="mb-3 flex cursor-pointer items-center gap-2 text-sm text-on-surface-variant"><input type="checkbox" checked={selectedCategories.includes(item)} onChange={() => toggleCategory(item)} className="size-4 accent-primary" /><span>{item}</span></label>)}</div>
          <div className="mt-5 border-t border-outline-variant pt-5"><h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">Price</h3>{[["all", "Any price"], ["under-2000", "Under Rs 2,000"], ["2000-10000", "Rs 2,000 - 10,000"], ["over-10000", "Rs 10,000 +"]].map(([value, label]) => <label key={value} className="mb-3 flex cursor-pointer items-center gap-2 text-sm text-on-surface-variant"><input type="radio" name="price" value={value} checked={priceRange === value} onChange={() => { setPriceRange(value); setPage(1); }} className="size-4 accent-primary" /><span>{label}</span></label>)}</div>
          <div className="mt-5 border-t border-outline-variant pt-5"><h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">Rating</h3>{[[0, "Any rating"], [4, "4.0 & up"], [4.5, "4.5 & up"]].map(([value, label]) => <label key={value} className="mb-3 flex cursor-pointer items-center gap-2 text-sm text-on-surface-variant"><input type="radio" name="rating" value={value} checked={minRating === value} onChange={() => { setMinRating(value); setPage(1); }} className="size-4 accent-primary" /><span>{value > 0 ? "★ " : ""}{label}</span></label>)}</div>
        </aside>
        <div>
          <div className="mb-5 flex items-center justify-between gap-4 border-b border-outline-variant pb-4"><span className="text-sm text-on-surface-variant"><strong className="text-on-surface">{visibleProducts.length}</strong> products</span><div className="flex shrink-0 items-center gap-2"><label htmlFor="sort" className="whitespace-nowrap text-sm text-on-surface-variant">Sort by</label><Select id="sort" value={sort} onChange={(e) => changeSort(e.target.value)} aria-label="Sort products" className="h-10"><option value="featured">Featured</option><option value="price-low">Price: Low to High</option><option value="price-high">Price: High to Low</option></Select></div></div>
          {loading ? <ProductGridSkeleton count={3} /> : displayProducts.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{displayProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <EmptyState title="No products found" description="No products match your search. Try a different filter." />}
        {!loading && displayProducts.length ? (
          <div className="mt-6 border-t border-outline-variant/70 pt-5">
            <Pagination
              page={page}
              totalPages={effectiveTotalPages}
              onPageChange={(p) => {
                setLoading(true);
                setPage(p);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </div>
        ) : null}
        </div>
      </div>
    </section>
  );
}

export function ProductsLoadingPreview() {
  return <ProductGridSkeleton count={3} />;
}
