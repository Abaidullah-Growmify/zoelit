"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Ellipsis, Loader2, RefreshCw, Search } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { toast } from "sonner";
import { Button, Card, Input, Skeleton } from "@/components/ui";
import Pagination from "@/components/pagination";
import { applyIngramSyncChange, getIngramCategories, getIngramCategoryProducts, startProductSync, syncSelectedProducts } from "@/lib/api";
import { FALLBACK_IMAGE } from "@/lib/product-mapper";
import { money } from "@/lib/utils";
import { matchesSyncSearch, mergePendingChanges, removePendingChange, toggleSyncSelection } from "@/lib/ingram-sync-state.mjs";
import { useAdminAuthStore } from "@/store/admin-auth-store";

// Fewer remote requests keep the first-screen scan responsive while the UI
// still paginates the loaded products in groups of ten.
const REMOTE_PAGE_SIZE = 50;
const UI_PAGE_SIZE = 10;
const PENDING_PAGE_SIZE = 20;

export default function AdminProductSyncPage() {
  const token = useAdminAuthStore((state) => state.token);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") || "";
  const [categories, setCategories] = useState([]);
  const [categorySearch, setCategorySearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [pendingChanges, setPendingChanges] = useState([]);
  const [processingChangeIds, setProcessingChangeIds] = useState(new Set());
  const [selectedPendingChanges, setSelectedPendingChanges] = useState(new Set());
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState({ percent: 0, label: "" });
  const [productPage, setProductPage] = useState(1);
  const [pendingPage, setPendingPage] = useState(1);
  const [remotePage, setRemotePage] = useState(0);
  const [remoteHasMore, setRemoteHasMore] = useState(false);
  const [scanProgress, setScanProgress] = useState({ page: 0, totalPages: 0, complete: false });
  const [reconciliationPages, setReconciliationPages] = useState({});
  const selectedCategoryRef = useRef(null);
  const categoryRequestRef = useRef(0);
  const startedRef = useRef(false);
  const reconciliationPollsRef = useRef(new Map());
  const loadedRemotePagesRef = useRef(new Set());
  const remotePageRef = useRef(0);
  const loadRemotePageRef = useRef(null);

  const loadRemotePage = useCallback(async (category, page, replace = false) => {
    const requestId = categoryRequestRef.current;
    setLoadingProducts(true);
    try {
      const data = await getIngramCategoryProducts(
        category.ingramCategoryId || category.id || category.name,
        { categoryName: category.name, pageNumber: page, pageSize: REMOTE_PAGE_SIZE },
        token
      );
       if (requestId !== categoryRequestRef.current) return null;
      const incoming = data.products || [];
      setProducts((current) => {
        if (replace) return incoming;
        const seen = new Set(current.map((product) => product.ingramPartNumber));
        return [...current, ...incoming.filter((product) => !seen.has(product.ingramPartNumber))];
      });
       setPendingChanges((current) => replace
         ? mergePendingChanges([], data.changes || [])
         : mergePendingChanges(current, data.changes || []));
       loadedRemotePagesRef.current.add(page);
       setReconciliationPages((current) => ({
         ...current,
         [page]: data.reconciliation?.status || "complete",
       }));
       remotePageRef.current = Math.max(remotePageRef.current, page);
       setRemotePage(remotePageRef.current);
       setRemoteHasMore((current) => page < remotePageRef.current ? current : Boolean(data.hasMore));
       setScanProgress((current) => ({
         page: Math.max(current.page, page),
         totalPages: Math.max(current.totalPages, data.pagination?.totalPages || page),
         complete: current.complete || !data.hasMore,
       }));
       if (data.reconciliation?.status === "queued") {
         const previousPoll = reconciliationPollsRef.current.get(page);
         if (previousPoll) window.clearTimeout(previousPoll);
         const poll = window.setTimeout(() => {
           reconciliationPollsRef.current.delete(page);
           if (selectedCategoryRef.current === category) loadRemotePageRef.current?.(category, page);
         }, 1200);
         reconciliationPollsRef.current.set(page, poll);
       }
      return data;
    } catch (error) {
       if (requestId === categoryRequestRef.current) toast.error(error.message || "Could not fetch products from Ingram");
      return null;
    } finally {
       if (requestId === categoryRequestRef.current) setLoadingProducts(false);
    }
  }, [token]);

  useEffect(() => {
    loadRemotePageRef.current = loadRemotePage;
  }, [loadRemotePage]);

  const selectCategory = useCallback(async (category, updateUrl = true) => {
    if (updateUrl) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("category", categoryRouteKey(category));
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
    selectedCategoryRef.current = category;
    setSelectedCategory(category);
    setProductSearch("");
    setSelectedProducts(new Set());
    setSelectedPendingChanges(new Set());
    setProducts([]);
    setPendingChanges([]);
    setProductPage(1);
    setPendingPage(1);
    setRemotePage(0);
    remotePageRef.current = 0;
    setRemoteHasMore(false);
    setScanProgress({ page: 0, totalPages: 0, complete: false });
    categoryRequestRef.current += 1;
    for (const poll of reconciliationPollsRef.current.values()) window.clearTimeout(poll);
    reconciliationPollsRef.current.clear();
    loadedRemotePagesRef.current.clear();
    setReconciliationPages({});
    const firstPage = await loadRemotePage(category, 1, true);
    if (!firstPage) return;

    // Render page one immediately, then append each fixed ten-item page as it
    // arrives so the full category scan never blocks the admin UI.
    void (async () => {
      let data = firstPage;
      let nextRemotePage = 2;
      while (data?.hasMore && selectedCategoryRef.current === category) {
        data = await loadRemotePage(category, nextRemotePage);
        nextRemotePage += 1;
      }
      if (selectedCategoryRef.current === category) {
        setScanProgress((current) => ({ ...current, complete: true }));
      }
    })();
  }, [loadRemotePage, pathname, router, searchParams]);

  async function handlePendingChange(change, action) {
    const categoryAtAction = selectedCategoryRef.current;
    if (!change?._id || processingChangeIds.has(change._id)) return;
    setProcessingChangeIds((current) => new Set(current).add(change._id));
    try {
      if (action !== "apply") return;
      await applyIngramSyncChange(change._id, token);
      if (selectedCategoryRef.current !== categoryAtAction) return;
      setPendingChanges((current) => removePendingChange(current, change));
      const category = categoryAtAction;
      if (category) {
        await Promise.all([...loadedRemotePagesRef.current].map((page) => loadRemotePage(category, page)));
      }
      toast.success(action === "apply" ? "Ingram update applied" : "Ingram change ignored");
    } catch (error) {
      toast.error(error.message || "Could not update Ingram change");
    } finally {
      setProcessingChangeIds((current) => {
        const next = new Set(current);
        next.delete(change._id);
        return next;
      });
    }
  }

  function togglePendingChange(changeId) {
    setSelectedPendingChanges((current) => toggleSyncSelection(current, changeId));
  }

  const loadCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      // This endpoint reads MongoDB only. Ingram category discovery is kept
      // separate and must not block Product Sync.
      const data = await getIngramCategories(token, { onlySaved: true });
      const list = dedupeCategories(data.categories || []);
      setCategories(list);
      const current = selectedCategoryRef.current;
       const next = list.find((category) => categoryRouteKey(category) === categoryParam)
         || list.find((category) => categoryKey(category) === categoryKey(current))
         || list[0];
       // Do not hold the category list behind the first Ingram request. The
       // selected category starts loading immediately while the sidebar stays usable.
        if (next) void selectCategory(next, false);
    } catch (error) {
      toast.error(error.message || "Failed to load saved Ingram categories");
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  }, [categoryParam, selectCategory, token]);

  useEffect(() => {
    if (!token || startedRef.current) return undefined;
    startedRef.current = true;
    loadCategories();
    return undefined;
  }, [loadCategories, token]);

  useEffect(() => {
    if (!categories.length) return;
    if (!categoryParam) {
      const clearSelection = window.setTimeout(() => {
        setSelectedProducts(new Set());
        setSelectedPendingChanges(new Set());
      }, 0);
      return () => window.clearTimeout(clearSelection);
    }
    const category = categories.find((item) => categoryRouteKey(item) === categoryParam);
    if (category && categoryRouteKey(selectedCategoryRef.current) !== categoryParam) {
      void selectCategory(category, false);
    }
  }, [categories, categoryParam, selectCategory]);

  const filteredCategories = useMemo(() => {
    const query = categorySearch.trim().toLowerCase();
    return query ? categories.filter((category) => category.name.toLowerCase().includes(query)) : categories;
  }, [categories, categorySearch]);

  const visibleProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase();
    const filtered = query
      ? products.filter((product) => matchesSyncSearch(product, query))
      : products;
    return { filtered, page: filtered.slice((productPage - 1) * UI_PAGE_SIZE, productPage * UI_PAGE_SIZE) };
  }, [productPage, productSearch, products]);

  const filteredPendingChanges = useMemo(() => {
    const query = productSearch.trim().toLowerCase();
    if (!query) return pendingChanges;
    return pendingChanges.filter((change) => matchesSyncSearch(change, query));
  }, [pendingChanges, productSearch]);

  const visibleProductSkus = visibleProducts.page.map((product) => product.ingramPartNumber);
  const allVisibleProductsSelected = visibleProductSkus.length > 0 && visibleProductSkus.every((sku) => selectedProducts.has(sku));

  async function changeProductPage(nextPage) {
    if (!selectedCategory || nextPage < 1) return;
    const requiredCount = nextPage * UI_PAGE_SIZE;
    if (requiredCount > products.length && remoteHasMore && !loadingProducts) {
      await loadRemotePage(selectedCategory, remotePage + 1);
    }
    setProductPage(nextPage);
  }

  function toggleProduct(ingramPartNumber) {
    setSelectedProducts((current) => toggleSyncSelection(current, ingramPartNumber));
  }

  function toggleVisibleProducts() {
    setSelectedProducts((current) => {
      const next = new Set(current);
      if (allVisibleProductsSelected) visibleProductSkus.forEach((sku) => next.delete(sku));
      else visibleProductSkus.forEach((sku) => next.add(sku));
      return next;
    });
  }

  async function handleSyncSelected() {
    const skus = [...selectedProducts];
    const changeIds = [...selectedPendingChanges];
    if (!skus.length && !changeIds.length) return toast.error("Please select at least one product or pending change");
    setSyncing(true);
    try {
      let saved = new Set();
      if (skus.length) {
        const data = await syncSelectedProducts(skus, token);
        saved = new Set(data.saved || skus);
        setProducts((current) => current.filter((product) => !saved.has(product.ingramPartNumber)));
      }

      const pendingResults = await Promise.allSettled(
        changeIds.map((changeId) => applyIngramSyncChange(changeId, token))
      );
      const appliedIds = new Set(changeIds.filter((_, index) => pendingResults[index].status === "fulfilled"));
      setPendingChanges((current) => current.filter((change) => !appliedIds.has(change._id)));
      setSelectedPendingChanges(new Set());
      setSelectedProducts(new Set());
      setProductPage(1);
      const failedChanges = pendingResults.filter((result) => result.status === "rejected").length;
      if (failedChanges) toast.error(`${failedChanges} pending change(s) could not be applied`);
      else toast.success(`${saved.size + appliedIds.size} selected item(s) synced`);
    } catch (error) {
      toast.error(error.message || "Could not sync selected products");
    } finally {
      setSyncing(false);
    }
  }

  async function startFullSync(payload, message, addOnly = true) {
    if (syncing) return;
    setSyncing(true);
    setProgress({ percent: 10, label: message });
    try {
      await startProductSync({ ...payload, addOnly }, token);
      toast.success(`${message} started`);
    } catch (error) {
      toast.error(error.message || "Could not start sync");
    } finally {
      setSyncing(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(visibleProducts.filtered.length / UI_PAGE_SIZE) + (remoteHasMore ? 1 : 0));
  const mobilePendingPages = Math.max(1, Math.ceil(filteredPendingChanges.length / PENDING_PAGE_SIZE));
  const mobilePendingChanges = filteredPendingChanges.slice(
    (pendingPage - 1) * PENDING_PAGE_SIZE,
    pendingPage * PENDING_PAGE_SIZE
  );
  const mobileCategory = categories.find((category) => categoryRouteKey(category) === categoryParam) || null;
  const mobileAllPendingSelected = mobilePendingChanges.length > 0
    && mobilePendingChanges.every((change) => selectedPendingChanges.has(change._id));
  const reconciliationStatus = useMemo(() => {
    const statuses = Object.values(reconciliationPages);
    if (!scanProgress.complete || statuses.some((status) => status === "queued")) return "running";
    if (statuses.some((status) => status === "failed")) return "failed";
    return "complete";
  }, [reconciliationPages, scanProgress.complete]);

  if (loadingCategories && !categories.length) return <><div className="hidden md:block"><ProductSyncSkeleton /></div><div className="md:hidden"><MobileCategoryList categories={categories} filteredCategories={filteredCategories} loadingCategories={loadingCategories} categorySearch={categorySearch} setCategorySearch={setCategorySearch} selectedCategory={selectedCategory} onSelectCategory={selectCategory} onSyncAll={() => {}} syncing={syncing} /></div></>;

  return (
    <div className="space-y-5">
       <div className="hidden lg:block"><Card className="p-0">
        <div className="border-b border-outline-variant px-5 py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div><h1 className="font-heading text-lg font-semibold tracking-tight text-on-surface">Ingram Product Sync</h1><p className="mt-1 text-sm text-on-surface-variant">Select one saved Ingram category to view and sync its products.</p></div>
            <div className="flex flex-wrap gap-2"><Button onClick={() => startFullSync({ categories: categories.map((category) => category.name), categoryIds: categories.map((category) => category.ingramCategoryId || category.name), savedCategoriesOnly: true }, "Saved category product sync")} disabled={syncing || loadingCategories || !categories.length} variant="outline" size="sm"><RefreshCw className="size-3.5" /> Sync All</Button></div>
          </div>
        </div>

          <div className="grid min-w-0 gap-4 p-3 sm:p-4 md:grid-cols-[250px_minmax(0,1fr)] md:items-start lg:grid-cols-[300px_minmax(0,1fr)]">
           <Card className="flex min-w-0 flex-col p-0 md:sticky md:top-4 md:max-h-[calc(100vh-7rem)]">
            <div className="border-b border-outline-variant p-4"><h2 className="font-heading text-base font-semibold text-on-surface">Ingram Categories</h2><p className="mt-1 text-xs text-on-surface-variant">Saved Ingram categories from the database.</p><div className="relative mt-4"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" /><Input value={categorySearch} onChange={(event) => setCategorySearch(event.target.value)} placeholder="Search category" className="h-10 pl-10" /></div></div>
             <div className="min-h-0 flex-1 overflow-y-auto p-2">{loadingCategories && !categories.length ? <LoadingState label="Loading saved categories..." /> : filteredCategories.length ? filteredCategories.map((category) => { const active = selectedCategory && categoryKey(selectedCategory) === categoryKey(category); return <button key={categoryKey(category)} type="button" onClick={() => selectCategory(category)} className={`w-full rounded-lg px-3 py-2.5 text-left transition ${active ? "bg-primary/10 text-primary" : "text-on-surface hover:bg-surface-container-low"}`}><div className="flex flex-wrap items-center gap-2"><p className="truncate text-label-md font-semibold">{category.name}</p>{category.source === "manual" ? <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700" title="This Ingram category also contains manually added products">Manual products</span> : null}</div></button>; }) : <div className="px-4 py-8 text-center text-body-sm text-on-surface-variant">No saved Ingram categories found.</div>}</div>
          </Card>

           <Card className="flex min-w-0 flex-col p-0">
              <div className="border-b border-outline-variant p-4"><div className="flex flex-col gap-3"><h2 className="min-w-0 truncate font-heading text-base font-semibold text-on-surface">{selectedCategory?.name || "Select a category"}</h2><div className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2 lg:grid-cols-[minmax(150px,1fr)_auto_auto]"><div className="relative col-span-2 min-w-0 lg:col-span-1"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" /><Input value={productSearch} onChange={(event) => { setProductSearch(event.target.value); setProductPage(1); }} placeholder="Search products or SKU" className="h-9 w-full pl-9 text-sm" /></div><Button variant="outline" onClick={() => startFullSync({ category: selectedCategory?.name || "" }, "Category sync", false)} disabled={!selectedCategory || syncing} size="sm" className="h-9 w-full min-w-0 overflow-hidden px-1.5 text-[10px] sm:px-2 sm:text-xs lg:w-auto lg:whitespace-nowrap lg:px-3 lg:text-sm"><RefreshCw className="size-3.5 shrink-0" /> <span className="min-w-0 truncate">Sync Category</span></Button><Button onClick={handleSyncSelected} disabled={(!selectedProducts.size && !selectedPendingChanges.size) || syncing} size="sm" className="h-9 w-full min-w-0 overflow-hidden px-1.5 text-[10px] sm:px-2 sm:text-xs lg:w-auto lg:whitespace-nowrap lg:px-3 lg:text-sm"><RefreshCw className="size-3.5 shrink-0" /> <span className="min-w-0 truncate">Sync Selected ({selectedProducts.size + selectedPendingChanges.size})</span></Button></div></div>{progress.label ? <div className="mt-3 overflow-hidden rounded-full bg-primary/15"><div className="h-2 rounded-full bg-primary" style={{ width: `${progress.percent}%` }} /></div> : null}</div>
                <div className="min-w-0 overflow-y-auto p-3 sm:p-4"><ProductResultsPanel selectedCategory={selectedCategory} loadingProducts={loadingProducts} products={products} pendingChanges={pendingChanges} filteredPendingChanges={filteredPendingChanges} visibleProducts={visibleProducts} productPage={productPage} totalPages={totalPages} remoteHasMore={remoteHasMore} scanProgress={scanProgress} reconciliationStatus={reconciliationStatus} selectedProducts={selectedProducts} selectedPendingChanges={selectedPendingChanges} processingChangeIds={processingChangeIds} allVisibleProductsSelected={allVisibleProductsSelected} onToggle={toggleProduct} onTogglePending={togglePendingChange} onToggleVisible={toggleVisibleProducts} onPageChange={changeProductPage} onChange={handlePendingChange} /></div>
             </Card>
           </div>
        </Card></div>
       <div className="hidden px-4 py-3 md:block lg:hidden">
         <TabletSyncLayout
           categories={categories}
           filteredCategories={filteredCategories}
           selectedCategory={selectedCategory}
           loadingCategories={loadingCategories}
           categorySearch={categorySearch}
           setCategorySearch={setCategorySearch}
           onSelectCategory={selectCategory}
            onSyncAll={() => startFullSync({ categories: categories.map((category) => category.name), categoryIds: categories.map((category) => category.ingramCategoryId || category.name), savedCategoriesOnly: true }, "Saved category product sync")}
            loadingProducts={loadingProducts}
            products={products}
            productSearch={productSearch}
            setProductSearch={setProductSearch}
            filteredPendingChanges={filteredPendingChanges}
           pendingPageChanges={mobilePendingChanges}
           pendingPage={pendingPage}
            pendingPages={mobilePendingPages}
            visibleProducts={visibleProducts}
            productPage={productPage}
            totalPages={totalPages}
            remoteHasMore={remoteHasMore}
            scanProgress={scanProgress}
           reconciliationStatus={reconciliationStatus}
           selectedProducts={selectedProducts}
           selectedPendingChanges={selectedPendingChanges}
           processingChangeIds={processingChangeIds}
           allVisibleProductsSelected={allVisibleProductsSelected}
           onToggle={toggleProduct}
           onTogglePending={togglePendingChange}
           onToggleVisible={toggleVisibleProducts}
           onPageChange={changeProductPage}
           onPendingPageChange={setPendingPage}
           onChange={handlePendingChange}
            onSyncCategory={() => startFullSync({ category: selectedCategory?.name || "" }, "Category sync", false)}
           onSyncSelected={handleSyncSelected}
           syncing={syncing}
         />
       </div>
       <div className="md:hidden">
         {mobileCategory && categoryParam ? (
           <MobileCategoryDetail
             category={mobileCategory}
             loadingProducts={loadingProducts}
             products={products}
             pendingChanges={pendingChanges}
             pendingPageChanges={mobilePendingChanges}
             filteredPendingChanges={filteredPendingChanges}
             pendingPage={pendingPage}
             pendingPages={mobilePendingPages}
             productSearch={productSearch}
             setProductSearch={(value) => { setProductSearch(value); setProductPage(1); setPendingPage(1); }}
             selectedProducts={selectedProducts}
             selectedPendingChanges={selectedPendingChanges}
             processingChangeIds={processingChangeIds}
             scanProgress={scanProgress}
             reconciliationStatus={reconciliationStatus}
             visibleProducts={visibleProducts}
             productPage={productPage}
             totalPages={totalPages}
             remoteHasMore={remoteHasMore}
             allPendingSelected={mobileAllPendingSelected}
             allVisibleProductsSelected={allVisibleProductsSelected}
              onBack={() => router.push(pathname, { scroll: false })}
              onSyncCategory={() => startFullSync({ category: selectedCategory?.name || "" }, "Category sync", false)}
             onSyncSelected={handleSyncSelected}
             onToggle={toggleProduct}
             onTogglePending={togglePendingChange}
             onToggleAllPending={() => {
               setSelectedPendingChanges((current) => {
                 const next = new Set(current);
                 if (mobileAllPendingSelected) mobilePendingChanges.forEach((change) => next.delete(change._id));
                 else mobilePendingChanges.forEach((change) => next.add(change._id));
                 return next;
               });
             }}
             onToggleVisible={toggleVisibleProducts}
             onPendingPageChange={setPendingPage}
             onProductPageChange={changeProductPage}
             onChange={handlePendingChange}
             syncing={syncing}
           />
         ) : (
           <MobileCategoryList
             categories={categories}
             filteredCategories={filteredCategories}
             loadingCategories={loadingCategories}
             categorySearch={categorySearch}
             setCategorySearch={setCategorySearch}
             selectedCategory={selectedCategory}
             onSelectCategory={selectCategory}
             onSyncAll={() => startFullSync({ categories: categories.map((category) => category.name), categoryIds: categories.map((category) => category.ingramCategoryId || category.name), savedCategoriesOnly: true }, "Saved category product sync")}
             syncing={syncing}
           />
         )}
        </div>
       </div>
  );
}

function categoryRouteKey(category) {
  return String(category?.ingramCategoryId || category?.id || category?.name || "").trim();
}

function MobileCategoryList({ categories, filteredCategories, loadingCategories, categorySearch, setCategorySearch, selectedCategory, onSelectCategory, onSyncAll, syncing }) {
  return <div className="min-h-screen bg-background px-4 py-3">
    <div className="mx-auto max-w-2xl overflow-hidden rounded-xl border border-outline-variant/80 bg-surface">
    <div className="space-y-1 px-4 pb-3 pt-4">
      <h1 className="truncate text-lg font-semibold text-on-surface">Ingram Product Sync</h1>
      <p className="truncate text-sm text-on-surface-variant">Choose a category.</p>
    </div>
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-2 px-4 pb-3"><div className="relative min-w-0"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" /><Input value={categorySearch} onChange={(event) => setCategorySearch(event.target.value)} placeholder="Search category" className="h-11 w-full pl-10 text-base" /></div><Button onClick={onSyncAll} disabled={syncing || loadingCategories || !categories.length} className="h-11 w-32 shrink-0 px-2">{syncing ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />} <span className="hidden min-[480px]:inline">{syncing ? "Syncing..." : "Sync All"}</span><span className="min-[480px]:hidden">Sync</span></Button></div>
    <div className="overflow-hidden border-t border-outline-variant/70">
      {loadingCategories && !categories.length ? <LoadingState label="Loading saved categories..." /> : filteredCategories.length ? filteredCategories.map((category, index) => {
        const active = selectedCategory && categoryKey(selectedCategory) === categoryKey(category);
        return <button key={categoryRouteKey(category) || index} type="button" onClick={() => onSelectCategory(category)} className={`flex min-h-[52px] w-full min-w-0 items-center gap-3 border-b border-outline-variant px-4 text-left last:border-b-0 active:bg-slate-50 ${active ? "text-primary" : "text-on-surface"}`}><span className={`min-w-0 flex-1 truncate text-sm ${active ? "font-medium" : "font-normal"}`}>{category.name}</span><ChevronRight className="size-4 shrink-0 text-on-surface-variant" /></button>;
      }) : <div className="px-4 py-12 text-center text-sm text-on-surface-variant">No categories found</div>}
    </div>
    </div>
  </div>;
}

function MobileCategoryDetail({ category, loadingProducts, products, pendingPageChanges, filteredPendingChanges, pendingPage, pendingPages, productSearch, setProductSearch, selectedProducts, selectedPendingChanges, processingChangeIds, scanProgress, reconciliationStatus, visibleProducts, productPage, totalPages, allPendingSelected, allVisibleProductsSelected, onBack, onSyncCategory, onSyncSelected, onToggle, onTogglePending, onToggleAllPending, onToggleVisible, onPendingPageChange, onProductPageChange, onChange, syncing }) {
  const scanLabel = scanProgress.totalPages ? `${scanProgress.complete ? "Scanned" : "Scanning"} page ${Math.min(scanProgress.page || 1, scanProgress.totalPages)} of ${scanProgress.totalPages}` : "Loading first Ingram page...";
  const pendingLoading = !scanProgress.complete || reconciliationStatus === "running";
  return <div className="min-h-screen bg-background pb-28">
    <div className="sticky top-0 z-20 flex h-12 min-w-0 items-center gap-2 border-b border-outline-variant bg-surface px-4">
      <button type="button" aria-label="Back to categories" onClick={onBack} className="flex size-11 shrink-0 items-center justify-center rounded-md text-on-surface hover:bg-surface-container-low"><ArrowLeft className="size-5" /></button>
      <h1 className="min-w-0 flex-1 truncate text-base font-semibold text-on-surface">{category.name}</h1>
      <button type="button" aria-label="Sync category" onClick={onSyncCategory} disabled={syncing} className="flex size-11 shrink-0 items-center justify-center rounded-md text-on-surface hover:bg-surface-container-low"><Ellipsis className="size-5" /></button>
    </div>
    <main className="space-y-3 px-4 py-3">
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-2"><div className="relative min-w-0"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" /><Input value={productSearch} onChange={(event) => setProductSearch(event.target.value)} placeholder="Search products or SKU" className="h-11 w-full pl-10 text-base" /></div><Button variant="outline" onClick={onSyncCategory} disabled={syncing} className="h-11 w-32 shrink-0 px-2">{syncing ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />} <span className="hidden min-[480px]:inline">Sync Category</span><span className="min-[480px]:hidden">Sync</span></Button></div>
      {!scanProgress.complete ? <p className="text-xs text-on-surface-variant">{scanLabel}. New products and pending changes appear as each page is checked.</p> : null}
      {reconciliationStatus === "failed" ? <p className="rounded-lg border border-red-300/70 bg-red-50 p-3 text-xs text-red-800">Some pages failed reconciliation. Retry the category to check them again.</p> : null}
      <section className="rounded-xl border border-amber-300/70 bg-amber-50/60 p-3 dark:bg-amber-500/10">
         <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-sm font-semibold text-on-surface">Pending changes</h2><span className="text-xs text-on-surface-variant">{pendingLoading ? "Checking..." : `${filteredPendingChanges.length} awaiting approval`}</span></div>
        {filteredPendingChanges.length ? <>
          <label className="mt-3 flex min-h-11 items-center gap-3 border-b border-amber-200 pb-2 text-sm text-on-surface"><input type="checkbox" checked={allPendingSelected} onChange={onToggleAllPending} className="size-4 accent-primary" /> Select all</label>
          <div className="mt-2 space-y-2">{pendingPageChanges.map((change) => <MobilePendingChangeRow key={change._id || change.ingramPartNumber} change={change} checked={selectedPendingChanges.has(change._id)} processing={processingChangeIds.has(change._id)} onToggle={() => onTogglePending(change._id)} onChange={onChange} />)}</div>
          {pendingPages > 1 ? <MobilePager page={pendingPage} totalPages={pendingPages} onPageChange={onPendingPageChange} /> : null}
         </> : pendingLoading ? <LoadingState label="Checking pending changes..." /> : <div className="px-2 py-10 text-center text-sm text-on-surface-variant">No pending changes</div>}
      </section>
      {loadingProducts && !products.length ? <MobileLoadingCards /> : visibleProducts.page.length ? <section className="space-y-3"><div className="flex flex-wrap items-center justify-between gap-2 text-xs text-on-surface-variant"><span>{products.length} new products loaded</span><button type="button" onClick={onToggleVisible} className="font-semibold text-primary">{allVisibleProductsSelected ? "Clear visible selection" : "Select visible products"}</button></div>{visibleProducts.page.map((product) => <ProductRow key={product.ingramPartNumber} product={product} categoryName={category.name} checked={selectedProducts.has(product.ingramPartNumber)} onToggle={onToggle} />)}<Pagination page={productPage} totalPages={totalPages} onPageChange={onProductPageChange} className="flex flex-wrap justify-center" /></section> : null}
    </main>
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-outline-variant bg-surface p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:hidden"><Button onClick={onSyncSelected} disabled={syncing || (!selectedProducts.size && !selectedPendingChanges.size)} className="h-11 w-full">{syncing ? <Loader2 className="size-4 animate-spin" /> : null}Sync selected ({selectedProducts.size + selectedPendingChanges.size})</Button></div>
  </div>;
}

function MobilePendingChangeRow({ change, checked, processing, onToggle, onChange }) {
  const productName = change.productSnapshot?.name || change.productSnapshot?.description || "Ingram product";
  const stockText = change.stockChanged ? `Stock ${change.oldStock ?? 0} to ${change.newStock ?? 0}` : null;
  const priceText = change.priceChanged ? `Price ${money(change.oldPrice)} to ${money(change.newPrice)}` : null;
  return <div className="rounded-lg border border-amber-200 bg-surface p-3"><label className="flex min-h-11 min-w-0 items-start gap-3"><input type="checkbox" checked={checked} disabled={processing} onChange={onToggle} aria-label={`Select pending change ${change.ingramPartNumber}`} className="mt-1 size-4 shrink-0 accent-primary" /><span className="min-w-0 flex-1"><span className="line-clamp-2 text-sm font-medium text-on-surface">{productName}</span><span className="mt-1 flex flex-wrap gap-x-2 text-xs text-on-surface-variant"><span>SKU: {change.ingramPartNumber}</span>{stockText ? <span>• {stockText}</span> : null}{priceText ? <span>• {priceText}</span> : null}</span></span></label><div className="flex justify-end"><Button onClick={() => onChange(change, "apply")} disabled={processing} size="sm" className="h-9 px-4">{processing ? "Working..." : "Update"}</Button></div></div>;
}

function MobilePager({ page, totalPages, onPageChange }) {
  return <div className="flex flex-wrap items-center justify-center gap-2 pt-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="h-11">Previous</Button><span className="px-2 text-xs text-on-surface-variant">Page {page} of {totalPages}</span><Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} className="h-11">Next</Button></div>;
}

function MobileLoadingCards() {
  return <div className="space-y-2">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-24 animate-pulse rounded-lg border border-outline-variant bg-surface" />)}</div>;
}

function TabletSyncLayout({ categories, filteredCategories, selectedCategory, loadingCategories, categorySearch, setCategorySearch, onSelectCategory, onSyncAll, loadingProducts, products, productSearch, setProductSearch, filteredPendingChanges, pendingPageChanges, pendingPage, pendingPages, onPendingPageChange, visibleProducts, productPage, totalPages, remoteHasMore, scanProgress, reconciliationStatus, selectedProducts, selectedPendingChanges, processingChangeIds, allVisibleProductsSelected, onToggle, onTogglePending, onToggleVisible, onPageChange, onChange, onSyncCategory, onSyncSelected, syncing }) {
  return <div className="space-y-4">
    <div className="flex items-center justify-between gap-4"><div className="min-w-0"><h1 className="truncate text-lg font-semibold text-on-surface">Ingram Product Sync</h1><p className="mt-1 truncate text-sm text-on-surface-variant">Select one saved Ingram category to view and sync its products.</p></div><Button onClick={onSyncAll} disabled={syncing || loadingCategories || !categories.length} variant="outline" size="sm" className="h-10 shrink-0">{syncing ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />} Sync All</Button></div>
    <div className="grid min-w-0 grid-cols-[220px_minmax(0,1fr)] gap-4">
      <Card className="flex min-w-0 flex-col p-0 md:sticky md:top-4 md:self-start"><div className="border-b border-outline-variant p-3"><h2 className="text-sm font-semibold text-on-surface">Ingram Categories</h2><div className="relative mt-3"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" /><Input value={categorySearch} onChange={(event) => setCategorySearch(event.target.value)} placeholder="Search category" className="h-10 pl-9 text-sm" /></div></div><div className="max-h-[calc(100vh-14rem)] min-h-0 overflow-y-auto p-2">{loadingCategories && !categories.length ? <LoadingState label="Loading saved categories..." /> : filteredCategories.length ? filteredCategories.map((category, index) => <button key={categoryRouteKey(category) || index} type="button" onClick={() => onSelectCategory(category)} className={`flex min-h-10 w-full min-w-0 items-center rounded-md px-2 py-2 text-left text-sm transition ${selectedCategory && categoryKey(selectedCategory) === categoryKey(category) ? "bg-primary/10 font-medium text-primary" : "text-on-surface hover:bg-surface-container-low"}`}><span className="min-w-0 truncate">{category.name}</span></button>) : <div className="px-2 py-8 text-center text-sm text-on-surface-variant">No categories found</div>}</div></Card>
      <Card className="min-w-0 p-3"><div className="flex min-w-0 flex-col gap-3"><h2 className="truncate text-base font-semibold text-on-surface">{selectedCategory?.name || "Select a category"}</h2><div className="grid grid-cols-2 gap-2"><Input value={productSearch} onChange={(event) => { setProductSearch(event.target.value); setProductPage(1); setPendingPage(1); }} placeholder="Search products or SKU" className="col-span-2 h-10 text-base" /><Button variant="outline" onClick={onSyncCategory} disabled={!selectedCategory || syncing} className="h-10 w-full">{syncing ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />} Sync Category</Button><Button onClick={onSyncSelected} disabled={(!selectedProducts.size && !selectedPendingChanges.size) || syncing} className="h-10 w-full"><RefreshCw className="size-4" /> Sync Selected ({selectedProducts.size + selectedPendingChanges.size})</Button></div>{!scanProgress.complete ? <p className="text-xs text-on-surface-variant">{scanProgress.totalPages ? `Scanning page ${scanProgress.page} of ${scanProgress.totalPages}.` : "Loading products..."}</p> : null}<section className="rounded-lg border border-amber-300/70 bg-amber-50/60 p-3 dark:bg-amber-500/10"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-semibold text-on-surface">Pending changes</h3><span className="text-xs text-on-surface-variant">{filteredPendingChanges.length} awaiting approval</span></div>{filteredPendingChanges.length ? <div className="mt-2 space-y-2">{pendingPageChanges.map((change) => <TabletPendingChangeRow key={change._id || change.ingramPartNumber} change={change} checked={selectedPendingChanges.has(change._id)} processing={processingChangeIds.has(change._id)} onToggle={() => onTogglePending(change._id)} onChange={onChange} />)}{pendingPages > 1 ? <MobilePager page={pendingPage} totalPages={pendingPages} onPageChange={onPendingPageChange} /> : null}</div> : <div className="py-8 text-center text-sm text-on-surface-variant">No pending changes</div>}</section>{loadingProducts && !products.length ? <MobileLoadingCards /> : visibleProducts.page.length ? <><div className="flex items-center justify-between text-xs text-on-surface-variant"><span>{products.length} new products loaded</span><button type="button" onClick={onToggleVisible} className="font-semibold text-primary">{allVisibleProductsSelected ? "Clear visible selection" : "Select visible products"}</button></div><div className="grid gap-2">{visibleProducts.page.map((product) => <ProductRow key={product.ingramPartNumber} product={product} categoryName={selectedCategory?.name || ""} checked={selectedProducts.has(product.ingramPartNumber)} onToggle={onToggle} />)}</div><Pagination page={productPage} totalPages={totalPages} onPageChange={onPageChange} /></> : reconciliationStatus === "complete" ? <EmptyPanel label="No new products or pending changes found in this category." /> : null}{remoteHasMore && products.length ? <p className="text-center text-xs text-on-surface-variant">Continuing to scan Ingram pages...</p> : null}</div></Card>
    </div>
  </div>;
}

function TabletPendingChangeRow({ change, checked, processing, onToggle, onChange }) {
  const productName = change.productSnapshot?.name || change.productSnapshot?.description || "Ingram product";
  const changeText = change.stockChanged ? `Stock ${change.oldStock ?? 0} to ${change.newStock ?? 0}` : change.priceChanged ? `Price ${money(change.oldPrice)} to ${money(change.newPrice)}` : "Updated";
  return <div className="flex min-w-0 items-center gap-3 rounded-md border border-amber-200 bg-surface p-2.5"><input type="checkbox" aria-label={`Select pending change ${change.ingramPartNumber}`} checked={checked} disabled={processing} onChange={onToggle} className="size-4 shrink-0 accent-primary" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-on-surface">{productName}</p><p className="truncate text-xs text-on-surface-variant">SKU: {change.ingramPartNumber} • {changeText}</p></div><Button size="sm" className="h-9 shrink-0 px-3" disabled={processing} onClick={() => onChange(change, "apply")}>{processing ? "..." : "Update"}</Button></div>;
}

function ProductSyncSkeleton() {
  return <>
    <div className="hidden lg:block space-y-5">
      <Card className="overflow-hidden p-0 shadow-sm">
        <div className="flex items-center justify-between border-b border-outline-variant px-5 py-4"><div><Skeleton className="h-6 w-40 rounded-md" /><Skeleton className="mt-2 h-4 w-80 rounded-md" /></div><Skeleton className="h-9 w-24 rounded-md" /></div>
        <div className="grid gap-4 p-4 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start"><Card className="overflow-hidden p-0"><div className="border-b border-outline-variant p-4"><Skeleton className="h-5 w-36 rounded-md" /><Skeleton className="mt-2 h-3 w-48 rounded-md" /><Skeleton className="mt-4 h-10 w-full rounded-md" /></div><div className="space-y-2 p-3">{Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-10 w-full rounded-lg" />)}</div></Card><Card className="overflow-hidden p-0"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant p-4"><Skeleton className="h-5 w-32 rounded-md" /><div className="flex gap-2"><Skeleton className="h-9 w-48 rounded-md" /><Skeleton className="h-9 w-32 rounded-md" /><Skeleton className="h-9 w-40 rounded-md" /></div></div><div className="space-y-3 p-4">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="flex items-center gap-3 rounded-lg border border-outline-variant p-3"><Skeleton className="size-5 rounded" /><Skeleton className="size-11 rounded-lg" /><div className="min-w-0 flex-1"><Skeleton className="h-4 w-3/4 rounded-md" /><Skeleton className="mt-2 h-3 w-1/2 rounded-md" /></div><div className="space-y-2"><Skeleton className="ml-auto h-4 w-16 rounded-md" /><Skeleton className="ml-auto h-3 w-20 rounded-md" /></div></div>)}<div className="flex justify-center gap-2 pt-1"><Skeleton className="h-9 w-24 rounded-md" /><Skeleton className="h-9 w-9 rounded-md" /><Skeleton className="h-9 w-24 rounded-md" /></div></div></Card></div>
      </Card>
    </div>
    <div className="hidden space-y-4 px-4 py-3 md:block lg:hidden"><div className="flex items-center justify-between gap-4"><div><Skeleton className="h-6 w-48 rounded-md" /><Skeleton className="mt-2 h-4 w-64 rounded-md" /></div><Skeleton className="h-10 w-24 rounded-md" /></div><div className="grid grid-cols-[220px_minmax(0,1fr)] gap-4"><Card className="overflow-hidden p-0"><div className="border-b border-outline-variant p-3"><Skeleton className="h-5 w-32 rounded-md" /><Skeleton className="mt-3 h-10 w-full rounded-md" /></div><div className="space-y-2 p-2">{Array.from({ length: 8 }).map((_, index) => <Skeleton key={index} className="h-10 w-full rounded-md" />)}</div></Card><Card className="space-y-3 p-3"><Skeleton className="h-6 w-40 rounded-md" /><div className="grid grid-cols-2 gap-2"><Skeleton className="col-span-2 h-10 rounded-md" /><Skeleton className="h-10 rounded-md" /><Skeleton className="h-10 rounded-md" /></div><Skeleton className="h-32 w-full rounded-lg" />{Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-16 w-full rounded-md" />)}</Card></div></div>
    <div className="min-h-screen bg-background px-4 py-3 md:hidden"><div className="mx-auto max-w-2xl overflow-hidden rounded-xl border border-outline-variant/80 bg-surface"><div className="px-4 pb-3 pt-4"><Skeleton className="h-6 w-48 max-w-full rounded-md" /><Skeleton className="mt-2 h-4 w-32 max-w-full rounded-md" /></div><div className="grid min-w-0 grid-cols-[minmax(0,1fr)_8rem] gap-2 px-4 pb-3"><Skeleton className="h-11 w-full rounded-md" /><Skeleton className="h-11 w-32 rounded-md" /></div><div className="overflow-hidden border-t border-outline-variant/70">{Array.from({ length: 8 }).map((_, index) => <Skeleton key={index} className="h-[52px] w-full rounded-none border-b border-outline-variant last:border-b-0" />)}</div></div></div>
  </>;
}

function categoryKey(category) {
  return String(category?.name || "").trim().replace(/\s+/g, " ").toLowerCase();
}

function dedupeCategories(categories) {
  const seen = new Set();
  return categories.filter((category) => { const key = categoryKey(category); if (!category.name || seen.has(key)) return false; seen.add(key); return true; });
}

const ProductRow = memo(function ProductRow({ product, checked, categoryName, onToggle }) {
  return <label className="grid min-w-0 grid-cols-[auto_auto_minmax(0,1fr)] items-center gap-2 rounded-lg border border-outline-variant bg-surface p-2.5 transition hover:bg-surface-container-low sm:grid-cols-[auto_auto_minmax(0,1fr)_auto] sm:gap-3 sm:p-3"><input type="checkbox" aria-label={`Select ${product.ingramPartNumber}`} checked={checked} onChange={() => onToggle(product.ingramPartNumber)} className="size-4 shrink-0 accent-primary" /><Image src={product.imageUrl || FALLBACK_IMAGE} alt={product.name || product.description || product.ingramPartNumber} width={48} height={48} className="size-10 shrink-0 rounded-lg object-cover ring-1 ring-outline-variant sm:size-11" /><div className="min-w-0"><div className="flex min-w-0 items-center gap-2"><p className="truncate text-label-md font-semibold text-on-surface">{product.name || product.description || product.ingramPartNumber}</p><span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">NEW</span></div><p className="truncate text-meta text-on-surface-variant">{product.ingramPartNumber} · {product.vendorName || categoryName} · Category: {categoryName}</p></div><div className="col-start-3 min-w-[4.5rem] shrink-0 text-right sm:col-start-auto"><p className="text-xs font-semibold tabular-nums text-on-surface sm:text-label-md">{money(product.price || 0)}</p><p className="text-[11px] text-on-surface-variant sm:text-meta">Stock {product.stock || 0}</p></div></label>;
});

function ProductResultsPanel({ selectedCategory, loadingProducts, products, pendingChanges, filteredPendingChanges, visibleProducts, productPage, totalPages, remoteHasMore, scanProgress, reconciliationStatus, selectedProducts, selectedPendingChanges, processingChangeIds, allVisibleProductsSelected, onToggle, onTogglePending, onToggleVisible, onPageChange, onChange }) {
  if (!selectedCategory) return <EmptyPanel label="Select a saved Ingram category from the left." />;

  const scanLabel = scanProgress.totalPages
    ? `${scanProgress.complete ? "Scanned" : "Scanning"} page ${Math.min(scanProgress.page || 1, scanProgress.totalPages)} of ${scanProgress.totalPages}`
    : "Loading first Ingram page...";

  return (
    <div className="space-y-4">
      {!scanProgress.complete ? <p className="text-xs text-on-surface-variant">{scanLabel}. New products and pending changes appear as each page is checked.</p> : null}
      {reconciliationStatus === "running" && scanProgress.complete ? <p className="text-xs text-on-surface-variant">Reconciliation is still running. Pending changes will continue to appear as Ingram pages finish.</p> : null}
      {reconciliationStatus === "failed" ? <p className="rounded-md border border-red-300/70 bg-red-50/70 p-3 text-xs text-red-800">Some Ingram pages failed reconciliation. Existing pending changes are shown below; retry the category to check failed pages again.</p> : null}
      {filteredPendingChanges.length ? (
        <div className="rounded-lg border border-amber-300/70 bg-amber-50/60 p-3 dark:bg-amber-500/10">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-semibold text-on-surface">Pending Ingram Changes</h3><span className="text-xs text-on-surface-variant">{productSearchLabel(filteredPendingChanges.length, pendingChanges.length)} awaiting approval</span></div>
          <div className="space-y-2">{filteredPendingChanges.map((change) => <PendingChangeRow key={change._id || change.ingramPartNumber} change={change} checked={selectedPendingChanges.has(change._id)} processing={processingChangeIds.has(change._id)} onToggle={() => onTogglePending(change._id)} onChange={onChange} />)}</div>
        </div>
      ) : null}
      {loadingProducts && !products.length && !filteredPendingChanges.length ? <LoadingState label={scanLabel} /> : visibleProducts.page.length ? <>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-on-surface-variant"><span>{products.length} new products loaded from Ingram</span><button type="button" onClick={onToggleVisible} className="font-semibold text-primary hover:underline">{allVisibleProductsSelected ? "Clear visible selection" : "Select visible products"}</button><span>Showing {UI_PAGE_SIZE} per page</span></div>
        <div className="grid gap-3">{visibleProducts.page.map((product) => <ProductRow key={product.ingramPartNumber} product={product} categoryName={selectedCategory.name} checked={selectedProducts.has(product.ingramPartNumber)} onToggle={onToggle} />)}</div>
        <Pagination page={productPage} totalPages={totalPages} onPageChange={onPageChange} className="mt-4" />
      </> : filteredPendingChanges.length ? null : reconciliationStatus === "complete" ? <EmptyPanel label="No new products or pending changes found in this category." /> : null}
      {remoteHasMore && products.length ? <p className="text-center text-xs text-on-surface-variant">Continuing to scan Ingram pages...</p> : null}
    </div>
  );
}

function productSearchLabel(visibleCount, totalCount) {
  return visibleCount === totalCount ? String(totalCount) : `${visibleCount} of ${totalCount}`;
}

function PendingChangeRow({ change, checked, processing, onToggle, onChange }) {
  const priceText = change.priceChanged ? `${money(change.oldPrice)} -> ${money(change.newPrice)}` : null;
  const stockText = change.stockChanged ? `${change.oldStock ?? 0} -> ${change.newStock ?? 0}` : null;
  const productName = change.productSnapshot?.name || change.productSnapshot?.description || "Ingram product";
  return <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-2 rounded-md border border-amber-200 bg-surface p-3 text-xs"><input type="checkbox" aria-label={`Select pending change ${change.ingramPartNumber}`} checked={checked} disabled={processing} onChange={onToggle} className="mt-1 size-4 shrink-0 accent-primary" /><div className="min-w-0"><p className="break-words font-semibold leading-5 text-on-surface" title={productName}>{productName}</p><p className="mt-0.5 break-all text-[10px] font-medium text-on-surface-variant" title={change.ingramPartNumber}>SKU: {change.ingramPartNumber}</p><div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-on-surface-variant">{priceText ? <span>Price {priceText}</span> : null}{stockText ? <span>Stock {stockText}</span> : null}</div></div><div className="col-start-2 flex justify-end"><Button size="sm" className="h-8 px-3 text-xs" disabled={processing} onClick={() => onChange(change, "apply")}>{processing ? "Working..." : "Update"}</Button></div></div>;
}

function LoadingState({ label }) { return <div className="flex items-center justify-center py-12 text-body-sm text-on-surface-variant"><Loader2 className="mr-2 size-5 animate-spin" /> {label}</div>; }
function EmptyPanel({ label }) { return <div className="flex min-h-72 items-center justify-center rounded-lg border border-dashed border-outline-variant text-center text-sm text-on-surface-variant"><div><p>{label}</p><Link href="/admin/categories" className="mt-2 inline-flex text-label-md font-semibold text-primary hover:underline">Manage categories</Link></div></div>; }
