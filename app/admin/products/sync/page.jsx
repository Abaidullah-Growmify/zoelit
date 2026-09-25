"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, Loader2, RefreshCw, Search } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button, Card, Input, Skeleton } from "@/components/ui";
import Pagination from "@/components/pagination";
import { getIngramCategories, getIngramCategoryProducts, startProductSync, syncSelectedProducts } from "@/lib/api";
import { FALLBACK_IMAGE } from "@/lib/product-mapper";
import { money } from "@/lib/utils";
import { useAdminAuthStore } from "@/store/admin-auth-store";

const REMOTE_PAGE_SIZE = 10;
const UI_PAGE_SIZE = 10;

export default function AdminProductSyncPage() {
  const token = useAdminAuthStore((state) => state.token);
  const [categories, setCategories] = useState([]);
  const [categorySearch, setCategorySearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState({ percent: 0, label: "" });
  const [productPage, setProductPage] = useState(1);
  const [remotePage, setRemotePage] = useState(0);
  const [remoteHasMore, setRemoteHasMore] = useState(false);
  const selectedCategoryRef = useRef(null);
  const requestRef = useRef(0);
  const startedRef = useRef(false);

  const loadRemotePage = useCallback(async (category, page, replace = false) => {
    const requestId = ++requestRef.current;
    setLoadingProducts(true);
    try {
      const data = await getIngramCategoryProducts(
        category.ingramCategoryId || category.id || category.name,
        { categoryName: category.name, pageNumber: page, pageSize: REMOTE_PAGE_SIZE },
        token
      );
      if (requestId !== requestRef.current) return null;
      const incoming = data.products || [];
      setProducts((current) => {
        if (replace) return incoming;
        const seen = new Set(current.map((product) => product.ingramPartNumber));
        return [...current, ...incoming.filter((product) => !seen.has(product.ingramPartNumber))];
      });
      setRemotePage(page);
      setRemoteHasMore(Boolean(data.hasMore));
      return data;
    } catch (error) {
      if (requestId === requestRef.current) toast.error(error.message || "Could not fetch products from Ingram");
      return null;
    } finally {
      if (requestId === requestRef.current) setLoadingProducts(false);
    }
  }, [token]);

  const selectCategory = useCallback(async (category) => {
    selectedCategoryRef.current = category;
    setSelectedCategory(category);
    setProductSearch("");
    setSelectedProducts(new Set());
    setProducts([]);
    setProductPage(1);
    setRemotePage(0);
    setRemoteHasMore(false);
    let data = await loadRemotePage(category, 1, true);
    // If a remote page contains no new SKUs, advance only until the first
    // useful page is found. A page with products is never skipped or filled.
    let nextRemotePage = 2;
    while (data && !(data.products || []).length && data.hasMore) {
      data = await loadRemotePage(category, nextRemotePage);
      nextRemotePage += 1;
    }
  }, [loadRemotePage]);

  const loadCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      // This endpoint reads MongoDB only. Ingram category discovery is kept
      // separate and must not block Product Sync.
      const data = await getIngramCategories(token, { onlySaved: true });
      const list = dedupeCategories(data.categories || []);
      setCategories(list);
      const current = selectedCategoryRef.current;
      const next = list.find((category) => categoryKey(category) === categoryKey(current)) || list[0];
      if (next) await selectCategory(next);
    } catch (error) {
      toast.error(error.message || "Failed to load saved Ingram categories");
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  }, [selectCategory, token]);

  useEffect(() => {
    if (!token || startedRef.current) return undefined;
    startedRef.current = true;
    loadCategories();
    return undefined;
  }, [loadCategories, token]);

  const filteredCategories = useMemo(() => {
    const query = categorySearch.trim().toLowerCase();
    return query ? categories.filter((category) => category.name.toLowerCase().includes(query)) : categories;
  }, [categories, categorySearch]);

  const visibleProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase();
    const filtered = query
      ? products.filter((product) => (product.name || product.description || product.ingramPartNumber || "").toLowerCase().includes(query))
      : products;
    return { filtered, page: filtered.slice((productPage - 1) * UI_PAGE_SIZE, productPage * UI_PAGE_SIZE) };
  }, [productPage, productSearch, products]);

  async function changeProductPage(nextPage) {
    if (!selectedCategory || nextPage < 1) return;
    const requiredCount = nextPage * UI_PAGE_SIZE;
    if (requiredCount > products.length && remoteHasMore && !loadingProducts) {
      await loadRemotePage(selectedCategory, remotePage + 1);
    }
    setProductPage(nextPage);
  }

  function toggleProduct(ingramPartNumber) {
    setSelectedProducts((current) => {
      const next = new Set(current);
      if (next.has(ingramPartNumber)) next.delete(ingramPartNumber);
      else next.add(ingramPartNumber);
      return next;
    });
  }

  async function handleSyncSelected() {
    const skus = [...selectedProducts];
    if (!skus.length) return toast.error("Please select at least one product");
    setSyncing(true);
    try {
      const data = await syncSelectedProducts(skus, token);
      const saved = new Set(data.saved || skus);
      setProducts((current) => current.filter((product) => !saved.has(product.ingramPartNumber)));
      setSelectedProducts(new Set());
      setProductPage(1);
      toast.success(`${data.count || 0} products added to the database`);
    } catch (error) {
      toast.error(error.message || "Could not sync selected products");
    } finally {
      setSyncing(false);
    }
  }

  async function startFullSync(payload, message) {
    if (syncing) return;
    setSyncing(true);
    setProgress({ percent: 10, label: message });
    try {
      await startProductSync({ ...payload, addOnly: true }, token);
      toast.success(`${message} started`);
    } catch (error) {
      toast.error(error.message || "Could not start sync");
    } finally {
      setSyncing(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(visibleProducts.filtered.length / UI_PAGE_SIZE) + (remoteHasMore ? 1 : 0));

  if (loadingCategories && !categories.length) return <ProductSyncSkeleton />;

  return (
    <div className="space-y-5">
      <Card className="p-0">
        <div className="border-b border-outline-variant px-5 py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div><h1 className="font-heading text-lg font-semibold tracking-tight text-on-surface">Ingram Product Sync</h1><p className="mt-1 text-sm text-on-surface-variant">Select one saved Ingram category to view and sync its products.</p></div>
            <div className="flex flex-wrap gap-2"><Button onClick={() => startFullSync({ categories: categories.map((category) => category.name), categoryIds: categories.map((category) => category.ingramCategoryId || category.name), savedCategoriesOnly: true }, "Saved category product sync")} disabled={syncing || loadingCategories || !categories.length} variant="outline" size="sm"><RefreshCw className="size-3.5" /> Sync All</Button></div>
          </div>
        </div>

        <div className="grid gap-4 p-4 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
          <Card className="flex flex-col p-0">
            <div className="border-b border-outline-variant p-4"><h2 className="font-heading text-base font-semibold text-on-surface">Ingram Categories</h2><p className="mt-1 text-xs text-on-surface-variant">Only saved Ingram categories are shown.</p><div className="relative mt-4"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" /><Input value={categorySearch} onChange={(event) => setCategorySearch(event.target.value)} placeholder="Search category" className="h-10 pl-10" /></div></div>
            <div className="overflow-y-auto p-2">{loadingCategories && !categories.length ? <LoadingState label="Loading saved categories..." /> : filteredCategories.length ? filteredCategories.map((category) => { const active = selectedCategory && categoryKey(selectedCategory) === categoryKey(category); return <button key={categoryKey(category)} type="button" onClick={() => selectCategory(category)} className={`w-full rounded-lg px-3 py-2.5 text-left transition ${active ? "bg-primary/10 text-primary" : "text-on-surface hover:bg-surface-container-low"}`}><p className="truncate text-label-md font-semibold">{category.name}</p></button>; }) : <div className="px-4 py-8 text-center text-body-sm text-on-surface-variant">No saved Ingram categories found.</div>}</div>
          </Card>

          <Card className="flex flex-col p-0">
            <div className="border-b border-outline-variant p-4"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-heading text-base font-semibold text-on-surface">{selectedCategory?.name || "Select a category"}</h2><div className="flex flex-wrap items-center justify-end gap-2"><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" /><Input value={productSearch} onChange={(event) => { setProductSearch(event.target.value); setProductPage(1); }} placeholder="Search products" className="h-9 w-48 pl-9 text-sm" /></div><Button variant="outline" onClick={() => startFullSync({ category: selectedCategory?.name || "" }, "Category sync")} disabled={!selectedCategory || syncing} size="sm"><RefreshCw className="size-3.5" /> Sync Category</Button><Button onClick={handleSyncSelected} disabled={!selectedProducts.size || syncing} size="sm"><RefreshCw className="size-3.5" /> Sync Selected ({selectedProducts.size})</Button></div></div>{progress.label ? <div className="mt-3 overflow-hidden rounded-full bg-primary/15"><div className="h-2 rounded-full bg-primary" style={{ width: `${progress.percent}%` }} /></div> : null}</div>
            <div className="overflow-y-auto p-4">{!selectedCategory ? <EmptyPanel label="Select a saved Ingram category from the left." /> : loadingProducts && !products.length ? <LoadingState label={`Loading ${selectedCategory.name} products...`} /> : visibleProducts.page.length ? <><div className="mb-3 flex items-center justify-between text-xs text-on-surface-variant"><span>{products.length} new products loaded from Ingram</span><span>Showing {UI_PAGE_SIZE} per page</span></div><div className="grid gap-3">{visibleProducts.page.map((product) => <ProductRow key={product.ingramPartNumber} product={product} categoryName={selectedCategory.name} checked={selectedProducts.has(product.ingramPartNumber)} onToggle={toggleProduct} />)}</div><Pagination page={productPage} totalPages={totalPages} onPageChange={changeProductPage} className="mt-4" /></> : <EmptyPanel label="No new products found in this category." />}</div>
          </Card>
        </div>
      </Card>
    </div>
  );
}

function ProductSyncSkeleton() {
  return (
    <div className="space-y-5">
      <Card className="overflow-hidden p-0 shadow-sm">
        <div className="flex items-center justify-between border-b border-outline-variant px-5 py-4"><div><Skeleton className="h-6 w-40 rounded-sm" /><Skeleton className="mt-2 h-4 w-80 rounded-sm" /></div><Skeleton className="h-9 w-24 rounded-md" /></div>
        <div className="grid gap-4 p-4 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
          <Card className="overflow-hidden p-0"><div className="border-b border-outline-variant p-4"><Skeleton className="h-5 w-36 rounded-sm" /><Skeleton className="mt-2 h-3 w-48 rounded-sm" /><Skeleton className="mt-4 h-10 w-full rounded-md" /></div><div className="space-y-2 p-3">{Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-10 w-full rounded-lg" />)}</div></Card>
          <Card className="overflow-hidden p-0"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant p-4"><Skeleton className="h-5 w-32 rounded-sm" /><div className="flex gap-2"><Skeleton className="h-9 w-48 rounded-md" /><Skeleton className="h-9 w-32 rounded-md" /><Skeleton className="h-9 w-40 rounded-md" /></div></div><div className="space-y-3 p-4">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="flex items-center gap-3 rounded-lg border border-outline-variant p-3"><Skeleton className="size-5 rounded" /><Skeleton className="size-11 rounded-lg" /><div className="min-w-0 flex-1"><Skeleton className="h-4 w-3/4 rounded-sm" /><Skeleton className="mt-2 h-3 w-1/2 rounded-sm" /></div><div className="space-y-2"><Skeleton className="ml-auto h-4 w-16 rounded-sm" /><Skeleton className="ml-auto h-3 w-20 rounded-sm" /></div></div>)}<div className="flex justify-center gap-2 pt-1"><Skeleton className="h-9 w-24 rounded-md" /><Skeleton className="h-9 w-9 rounded-md" /><Skeleton className="h-9 w-24 rounded-md" /></div></div></Card>
        </div>
      </Card>
    </div>
  );
}

function categoryKey(category) {
  return String(category?.name || "").trim().replace(/\s+/g, " ").toLowerCase();
}

function dedupeCategories(categories) {
  const seen = new Set();
  return categories.filter((category) => { const key = categoryKey(category); if (!category.name || seen.has(key)) return false; seen.add(key); return true; });
}

const ProductRow = memo(function ProductRow({ product, checked, categoryName, onToggle }) {
  return <label className="grid min-w-0 grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-2 rounded-lg border border-outline-variant bg-surface p-2.5 transition hover:bg-surface-container-low sm:gap-3 sm:p-3"><span className={`flex size-5 shrink-0 items-center justify-center rounded border ${checked ? "border-primary bg-primary text-white" : "border-outline-variant bg-surface-container-lowest"}`}>{checked ? <Check className="size-3.5" /> : null}</span><input type="checkbox" checked={checked} onChange={() => onToggle(product.ingramPartNumber)} className="sr-only" /><Image src={product.imageUrl || FALLBACK_IMAGE} alt={product.name || product.description || product.ingramPartNumber} width={48} height={48} className="size-10 shrink-0 rounded-lg object-cover ring-1 ring-outline-variant sm:size-11" /><div className="min-w-0"><div className="flex min-w-0 items-center gap-2"><p className="truncate text-label-md font-semibold text-on-surface">{product.name || product.description || product.ingramPartNumber}</p><span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">NEW</span></div><p className="truncate text-meta text-on-surface-variant">{product.ingramPartNumber} · {product.vendorName || categoryName} · Category: {categoryName}</p></div><div className="min-w-[4.5rem] shrink-0 text-right"><p className="text-xs font-semibold tabular-nums text-on-surface sm:text-label-md">{money(product.price || 0)}</p><p className="text-[11px] text-on-surface-variant sm:text-meta">Stock {product.stock || 0}</p></div></label>;
});

function LoadingState({ label }) { return <div className="flex items-center justify-center py-12 text-body-sm text-on-surface-variant"><Loader2 className="mr-2 size-5 animate-spin" /> {label}</div>; }
function EmptyPanel({ label }) { return <div className="flex min-h-72 items-center justify-center rounded-xl border border-dashed border-outline-variant text-center text-sm text-on-surface-variant"><div><p>{label}</p><Link href="/admin/categories" className="mt-2 inline-flex text-label-md font-semibold text-primary hover:underline">Manage categories</Link></div></div>; }
