"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Loader2, RefreshCw, Search } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { toast } from "sonner";
import { Button, Card, Input, Skeleton } from "@/components/ui";
import { TransparentActionLoader } from "@/components/action-feedback";
import Pagination from "@/components/pagination";
import { applyIngramSyncChange, getIngramCategories, getIngramCategoryProducts, startProductSync, syncSelectedProducts } from "@/lib/api";
import { safeImageSrc } from "@/components/clean-product-image";
import { money } from "@/lib/utils";
import { matchesSyncSearch, mergePendingChanges, normalizeSyncSku, removePendingChange, toggleSyncSelection } from "@/lib/ingram-sync-state.mjs";
import { useAdminAuthStore } from "@/store/admin-auth-store";

// Fewer remote requests keep the first-screen scan responsive while the UI
// still paginates the loaded products in groups of ten.
// Ingram supports up to 100 records per request. Keep the UI page size at ten,
// but fetch larger remote pages so the existing page-by-page experience needs
// fewer rate-limited API calls.
const REMOTE_PAGE_SIZE = 100;
const UI_PAGE_SIZE = 10;

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
  const [processingProductSkus, setProcessingProductSkus] = useState(new Set());
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
  const reconciliationPollBusyRef = useRef(false);
  const loadedRemotePagesRef = useRef(new Set());
  const remotePageRef = useRef(0);
  const loadRemotePageRef = useRef(null);

  // Reconciliation status for every loaded page is initially "queued", so each
  // page used to schedule its own reload every 1.2s. A large category created
  // dozens of simultaneous requests, which saturated the browser connection
  // pool and made actions like a single-row sync wait many seconds. Only one
  // reconciliation reload may run at a time; the rest retry shortly after.
  const scheduleReconciliationPoll = useCallback((category, page, delay = 1800) => {
    if (selectedCategoryRef.current !== category) return;
    const previousPoll = reconciliationPollsRef.current.get(page);
    if (previousPoll) window.clearTimeout(previousPoll);
    const poll = window.setTimeout(() => {
      reconciliationPollsRef.current.delete(page);
      if (selectedCategoryRef.current !== category) return;
      if (reconciliationPollBusyRef.current) {
        const waitForPoll = async () => {
          while (reconciliationPollBusyRef.current && selectedCategoryRef.current === category) {
            await new Promise((resolve) => window.setTimeout(resolve, 1000));
          }
          if (selectedCategoryRef.current !== category) return;
          reconciliationPollBusyRef.current = true;
          try {
            await loadRemotePageRef.current?.(category, page, false, true);
          } finally {
            reconciliationPollBusyRef.current = false;
          }
        };
        void waitForPoll();
        return;
      }
      reconciliationPollBusyRef.current = true;
      Promise.resolve(loadRemotePageRef.current?.(category, page, false, true))
        .finally(() => {
          reconciliationPollBusyRef.current = false;
        });
    }, delay);
    reconciliationPollsRef.current.set(page, poll);
  }, []);

  const loadRemotePage = useCallback(async (category, page, replace = false, silent = false) => {
    const requestId = categoryRequestRef.current;
    if (!silent) setLoadingProducts(true);
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
        // A reconciliation poll returns the same rows with refreshed price and
        // stock, so merge those values instead of ignoring the re-fetched row.
        const incomingBySku = new Map(incoming.map((product) => [product.ingramPartNumber, product]));
        const merged = current.map((product) => {
          const fresh = incomingBySku.get(product.ingramPartNumber);
          if (!fresh) return product;
          incomingBySku.delete(product.ingramPartNumber);
          const changed = fresh.price !== product.price
            || fresh.stock !== product.stock
            || fresh.availability !== product.availability;
          return changed
            ? { ...product, price: fresh.price, stock: fresh.stock, availability: fresh.availability }
            : product;
        });
        return [...merged, ...incomingBySku.values()];
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
         scheduleReconciliationPoll(category, page);
       }
      return data;
    } catch (error) {
       if (requestId === categoryRequestRef.current) toast.error(error.message || "Could not fetch products from Ingram");
      return null;
    } finally {
       if (!silent && requestId === categoryRequestRef.current) setLoadingProducts(false);
    }
  }, [scheduleReconciliationPoll, token]);

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
      const changeKey = normalizeSyncSku(change.ingramPartNumber);
      setPendingChanges((current) => removePendingChange(current, change));
      // Drop the applied item from both selections right away so the toolbar
      // counter never keeps counting a row that no longer exists.
      setSelectedPendingChanges((current) => {
        if (!current.has(changeKey)) return current;
        const next = new Set(current);
        next.delete(changeKey);
        return next;
      });
      setSelectedProducts((current) => {
        if (!current.has(change.ingramPartNumber)) return current;
        const next = new Set(current);
        next.delete(change.ingramPartNumber);
        return next;
      });
      // The backend already wrote the new price/stock, so patch the loaded rows
      // locally. Re-fetching every scanned Ingram page here made a single row
      // sync take many seconds.
      setProducts((current) => current.map((product) => (
        product.ingramPartNumber === change.ingramPartNumber
          ? {
              ...product,
              price: change.newPrice != null ? change.newPrice : product.price,
              stock: change.newStock != null ? change.newStock : product.stock,
              availability: change.availability || product.availability,
            }
          : product
      )));
      toast.success("Product synced from Ingram");
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

  function togglePendingChange(changeKey) {
    setSelectedPendingChanges((current) => toggleSyncSelection(current, changeKey));
  }

  // Individual sync for a new product row. The backend reuses the catalog
  // record it already returned for this page, so one row no longer waits for a
  // fresh Ingram keyword search.
  async function handleSyncProduct(product) {
    const sku = product?.ingramPartNumber;
    if (!sku || processingProductSkus.has(sku)) return;
    setProcessingProductSkus((current) => new Set(current).add(sku));
    try {
      const data = await syncSelectedProducts([sku], token);
      const saved = new Set(data.saved || []);
      if (!saved.size) {
        toast.error("Ingram did not return this product");
        return;
      }
      setProducts((current) => current.filter((item) => item.ingramPartNumber !== sku));
      setSelectedProducts((current) => {
        if (!current.has(sku)) return current;
        const next = new Set(current);
        next.delete(sku);
        return next;
      });
      toast.success("Product synced from Ingram");
    } catch (error) {
      toast.error(error.message || "Could not sync product");
    } finally {
      setProcessingProductSkus((current) => {
        const next = new Set(current);
        next.delete(sku);
        return next;
      });
    }
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
    if (!categoryParam) return;
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

  // Pending changes and new products share one ten-item UI page. Keep the
  // remote scan independent so syncing and reconciliation continue unchanged.
  const syncItems = useMemo(() => [
    ...filteredPendingChanges.map((change) => ({ type: "pending", value: change })),
    ...visibleProducts.filtered.map((product) => ({ type: "product", value: product })),
  ], [filteredPendingChanges, visibleProducts.filtered]);
  const syncPageItems = useMemo(
    () => syncItems.slice((productPage - 1) * UI_PAGE_SIZE, productPage * UI_PAGE_SIZE),
    [productPage, syncItems]
  );

  // Keep the selection aligned with the rows that actually exist. Applying a
  // pending change (individually or through the toolbar) removes it from the
  // list, so its key must disappear from the selection and the counter too.
  useEffect(() => {
    // This is intentional state reconciliation after an async server refresh.
    // The update is guarded below and only creates a new Set when a key vanished.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedPendingChanges((current) => {
      if (!current.size) return current;
      const available = new Set(pendingChanges.map((change) => normalizeSyncSku(change.ingramPartNumber)));
      const next = new Set([...current].filter((changeKey) => available.has(changeKey)));
      return next.size === current.size ? current : next;
    });
  }, [pendingChanges]);

  const pageProductSkus = syncPageItems.filter((item) => item.type === "product").map((item) => item.value.ingramPartNumber);
  const allVisibleProductsSelected = pageProductSkus.length > 0 && pageProductSkus.every((sku) => selectedProducts.has(sku));

  async function changeProductPage(nextPage) {
    if (!selectedCategory || nextPage < 1) return;
    const requiredProducts = Math.max(0, nextPage * UI_PAGE_SIZE - filteredPendingChanges.length);
    while (requiredProducts > products.length && remoteHasMore && !loadingProducts) {
      const previousCount = products.length;
      await loadRemotePage(selectedCategory, remotePageRef.current + 1);
      if (products.length === previousCount) break;
    }
    setProductPage(nextPage);
  }

  function toggleProduct(ingramPartNumber) {
    setSelectedProducts((current) => toggleSyncSelection(current, ingramPartNumber));
  }

  function toggleVisibleProducts() {
    setSelectedProducts((current) => {
      const next = new Set(current);
      if (allVisibleProductsSelected) pageProductSkus.forEach((sku) => next.delete(sku));
      else pageProductSkus.forEach((sku) => next.add(sku));
      return next;
    });
  }

  async function handleSyncSelected() {
    const skus = [...selectedProducts];
    // Pending selection is stored by SKU so it survives scan refreshes.
    // Resolve the current DB ids right before applying.
    const changesToApply = pendingChanges.filter((change) => change._id && selectedPendingChanges.has(normalizeSyncSku(change.ingramPartNumber)));
    const changeIds = changesToApply.map((change) => change._id);
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

  const totalPages = Math.max(1, Math.ceil(syncItems.length / UI_PAGE_SIZE) + (remoteHasMore ? 1 : 0));
  const mobileCategory = categories.find((category) => categoryRouteKey(category) === categoryParam) || null;
  const reconciliationStatus = useMemo(() => {
    const statuses = Object.values(reconciliationPages);
    if (!scanProgress.complete || statuses.some((status) => status === "queued")) return "running";
    if (statuses.some((status) => status === "failed")) return "failed";
    return "complete";
  }, [reconciliationPages, scanProgress.complete]);
  const rowSyncing = processingChangeIds.size > 0 || processingProductSkus.size > 0;

  if (loadingCategories && !categories.length) return <><div className="hidden md:block"><ProductSyncSkeleton /></div><div className="md:hidden"><MobileCategoryList categories={categories} filteredCategories={filteredCategories} loadingCategories={loadingCategories} categorySearch={categorySearch} setCategorySearch={setCategorySearch} selectedCategory={selectedCategory} onSelectCategory={selectCategory} onSyncAll={() => {}} syncing={syncing} /></div></>;

  return (
    <div className="space-y-5">
      <TransparentActionLoader
        open={syncing || rowSyncing}
        label={syncing
          ? (progress.label ? `${progress.label}… Please wait.` : "Syncing products from Ingram… Please wait.")
          : "Syncing product from Ingram… Please wait."}
      />
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
                 <div className="min-w-0 overflow-y-auto p-3 sm:p-4"><ProductResultsPanel selectedCategory={selectedCategory} loadingProducts={loadingProducts} products={products} pendingChanges={pendingChanges} filteredPendingChanges={filteredPendingChanges} syncPageItems={syncPageItems} productPage={productPage} totalPages={totalPages} remoteHasMore={remoteHasMore} scanProgress={scanProgress} reconciliationStatus={reconciliationStatus} selectedProducts={selectedProducts} selectedPendingChanges={selectedPendingChanges} processingChangeIds={processingChangeIds} processingProductSkus={processingProductSkus} allVisibleProductsSelected={allVisibleProductsSelected} onToggle={toggleProduct} onTogglePending={togglePendingChange} onToggleVisible={toggleVisibleProducts} onPageChange={changeProductPage} onChange={handlePendingChange} onSyncProduct={handleSyncProduct} /></div>
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
            syncPageItems={syncPageItems}
            productPage={productPage}
            totalPages={totalPages}
            remoteHasMore={remoteHasMore}
            scanProgress={scanProgress}
           reconciliationStatus={reconciliationStatus}
           selectedProducts={selectedProducts}
           selectedPendingChanges={selectedPendingChanges}
           processingChangeIds={processingChangeIds}
           processingProductSkus={processingProductSkus}
           allVisibleProductsSelected={allVisibleProductsSelected}
           onToggle={toggleProduct}
           onTogglePending={togglePendingChange}
           onToggleVisible={toggleVisibleProducts}
           onPageChange={changeProductPage}
           onPendingPageChange={setPendingPage}
           onChange={handlePendingChange}
           onSyncProduct={handleSyncProduct}
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
              filteredPendingChanges={filteredPendingChanges}
               syncPageItems={syncPageItems}
             productSearch={productSearch}
             setProductSearch={(value) => { setProductSearch(value); setProductPage(1); setPendingPage(1); }}
             selectedProducts={selectedProducts}
             selectedPendingChanges={selectedPendingChanges}
             processingChangeIds={processingChangeIds}
             processingProductSkus={processingProductSkus}
             scanProgress={scanProgress}
             reconciliationStatus={reconciliationStatus}
             productPage={productPage}
             totalPages={totalPages}
             remoteHasMore={remoteHasMore}
             allVisibleProductsSelected={allVisibleProductsSelected}
              onBack={() => router.push(pathname, { scroll: false })}
              onSyncCategory={() => startFullSync({ category: selectedCategory?.name || "" }, "Category sync", false)}
             onSyncSelected={handleSyncSelected}
             onToggle={toggleProduct}
             onTogglePending={togglePendingChange}
             onToggleVisible={toggleVisibleProducts}
             onPendingPageChange={setPendingPage}
             onProductPageChange={changeProductPage}
             onChange={handlePendingChange}
             onSyncProduct={handleSyncProduct}
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

function MobileCategoryDetail({ category, loadingProducts, products, syncPageItems, filteredPendingChanges, productSearch, setProductSearch, productPage, totalPages, selectedProducts, selectedPendingChanges, processingChangeIds, processingProductSkus, scanProgress, reconciliationStatus, allVisibleProductsSelected, onBack, onSyncCategory, onSyncSelected, onToggle, onTogglePending, onToggleVisible, onProductPageChange, onChange, onSyncProduct, syncing }) {
  const scanLabel = scanProgress.totalPages ? `${scanProgress.complete ? "Scanned" : "Scanning"} page ${Math.min(scanProgress.page || 1, scanProgress.totalPages)} of ${scanProgress.totalPages}` : "Loading first Ingram page...";
  const pendingLoading = !scanProgress.complete || reconciliationStatus === "running";
  return <div className="min-h-screen bg-background pb-28">
     <div className="sticky top-0 z-20 flex min-h-12 min-w-0 items-center gap-2 border-b border-outline-variant bg-surface px-4 py-2">
       <button type="button" aria-label="Back to categories" onClick={onBack} className="flex size-11 shrink-0 items-center justify-center rounded-md text-on-surface hover:bg-surface-container-low"><ArrowLeft className="size-5" /></button>
       <h1 className="min-w-0 flex-1 break-words text-base font-semibold leading-5 text-on-surface">{category.name}</h1>
    </div>
    <main className="space-y-3 px-4 py-3">
       <div className="grid min-w-0 grid-cols-1 gap-2 min-[380px]:grid-cols-[minmax(0,1fr)_auto]"><div className="relative min-w-0"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" /><Input value={productSearch} onChange={(event) => setProductSearch(event.target.value)} placeholder="Search products or SKU" className="h-11 w-full pl-10 text-base" /></div><Button variant="outline" onClick={onSyncCategory} disabled={syncing} className="h-11 w-full min-w-0 px-3 min-[380px]:w-auto">{syncing ? <Loader2 className="size-4 shrink-0 animate-spin" /> : <RefreshCw className="size-4 shrink-0" />} <span className="truncate">Sync Category</span></Button></div>
      {!scanProgress.complete ? <p className="text-xs text-on-surface-variant">{scanLabel}. New products and pending changes appear as each page is checked.</p> : null}
      {reconciliationStatus === "failed" ? <p className="rounded-lg border border-red-300/70 bg-red-50 p-3 text-xs text-red-800">Some pages failed reconciliation. Retry the category to check them again.</p> : null}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-on-surface-variant">
          <span>{pendingLoading ? "Checking..." : `${filteredPendingChanges.length} pending · ${products.length} new products loaded`}</span>
          <button type="button" onClick={onToggleVisible} className="font-semibold text-primary">{allVisibleProductsSelected ? "Clear visible selection" : "Select visible products"}</button>
        </div>
        {loadingProducts && !products.length && !filteredPendingChanges.length ? <MobileLoadingCards /> : syncPageItems.length ? <div className="grid gap-2">{syncPageItems.map((item) => <SyncListItem key={item.type === "pending" ? item.value._id || item.value.ingramPartNumber : item.value.ingramPartNumber} item={item} categoryName={category.name} selectedProducts={selectedProducts} selectedPendingChanges={selectedPendingChanges} processingChangeIds={processingChangeIds} processingProductSkus={processingProductSkus} onToggle={onToggle} onTogglePending={onTogglePending} onChange={onChange} onSyncProduct={onSyncProduct} />)}</div> : pendingLoading ? <LoadingState label="Checking products..." /> : <div className="px-2 py-10 text-center text-sm text-on-surface-variant">No pending changes or new products</div>}
        {totalPages > 1 ? <Pagination page={productPage} totalPages={totalPages} onPageChange={onProductPageChange} className="flex flex-wrap justify-center" /> : null}
      </section>
    </main>
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-outline-variant bg-surface p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:hidden"><Button onClick={onSyncSelected} disabled={syncing || (!selectedProducts.size && !selectedPendingChanges.size)} className="h-11 w-full">{syncing ? <Loader2 className="size-4 animate-spin" /> : null}Sync selected ({selectedProducts.size + selectedPendingChanges.size})</Button></div>
  </div>;
}

function MobilePendingChangeRow(props) {
  return <PendingChangeRow {...props} />;
}

function MobilePager({ page, totalPages, onPageChange }) {
  return <div className="flex flex-wrap items-center justify-center gap-2 pt-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="h-11">Previous</Button><span className="px-2 text-xs text-on-surface-variant">Page {page} of {totalPages}</span><Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} className="h-11">Next</Button></div>;
}

function MobileLoadingCards() {
  return <div className="space-y-2">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-24 animate-pulse rounded-lg border border-outline-variant bg-surface" />)}</div>;
}

function TabletSyncLayout({ categories, filteredCategories, selectedCategory, loadingCategories, categorySearch, setCategorySearch, onSelectCategory, onSyncAll, loadingProducts, products, productSearch, setProductSearch, filteredPendingChanges, syncPageItems, productPage, totalPages, remoteHasMore, scanProgress, reconciliationStatus, selectedProducts, selectedPendingChanges, processingChangeIds, processingProductSkus, allVisibleProductsSelected, onToggle, onTogglePending, onToggleVisible, onPageChange, onChange, onSyncProduct, onSyncCategory, onSyncSelected, syncing }) {
  return <div className="space-y-4">
    <div className="flex items-center justify-between gap-4"><div className="min-w-0"><h1 className="truncate text-lg font-semibold text-on-surface">Ingram Product Sync</h1><p className="mt-1 truncate text-sm text-on-surface-variant">Select one saved Ingram category to view and sync its products.</p></div><Button onClick={onSyncAll} disabled={syncing || loadingCategories || !categories.length} variant="outline" size="sm" className="h-10 shrink-0">{syncing ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />} Sync All</Button></div>
    <div className="grid min-w-0 grid-cols-[220px_minmax(0,1fr)] gap-4">
      <Card className="flex min-w-0 flex-col p-0 md:sticky md:top-4 md:self-start"><div className="border-b border-outline-variant p-3"><h2 className="text-sm font-semibold text-on-surface">Ingram Categories</h2><div className="relative mt-3"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" /><Input value={categorySearch} onChange={(event) => setCategorySearch(event.target.value)} placeholder="Search category" className="h-10 pl-9 text-sm" /></div></div><div className="max-h-[calc(100vh-14rem)] min-h-0 overflow-y-auto p-2">{loadingCategories && !categories.length ? <LoadingState label="Loading saved categories..." /> : filteredCategories.length ? filteredCategories.map((category, index) => <button key={categoryRouteKey(category) || index} type="button" onClick={() => onSelectCategory(category)} className={`flex min-h-10 w-full min-w-0 items-center rounded-md px-2 py-2 text-left text-sm transition ${selectedCategory && categoryKey(selectedCategory) === categoryKey(category) ? "bg-primary/10 font-medium text-primary" : "text-on-surface hover:bg-surface-container-low"}`}><span className="min-w-0 truncate">{category.name}</span></button>) : <div className="px-2 py-8 text-center text-sm text-on-surface-variant">No categories found</div>}</div></Card>
      <Card className="min-w-0 p-3"><div className="flex min-w-0 flex-col gap-3"><h2 className="truncate text-base font-semibold text-on-surface">{selectedCategory?.name || "Select a category"}</h2><div className="grid grid-cols-2 gap-2"><Input value={productSearch} onChange={(event) => { setProductSearch(event.target.value); setProductPage(1); setPendingPage(1); }} placeholder="Search products or SKU" className="col-span-2 h-10 text-base" /><Button variant="outline" onClick={onSyncCategory} disabled={!selectedCategory || syncing} className="h-10 w-full">{syncing ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />} Sync Category</Button><Button onClick={onSyncSelected} disabled={(!selectedProducts.size && !selectedPendingChanges.size) || syncing} className="h-10 w-full"><RefreshCw className="size-4" /> Sync Selected ({selectedProducts.size + selectedPendingChanges.size})</Button></div>{!scanProgress.complete ? <p className="text-xs text-on-surface-variant">{scanProgress.totalPages ? `Scanning page ${scanProgress.page} of ${scanProgress.totalPages}.` : "Loading products..."}</p> : null}<div className="space-y-2"><div className="flex flex-wrap items-center justify-between gap-2 text-xs text-on-surface-variant"><span>{filteredPendingChanges.length} pending · {products.length} new products loaded</span><button type="button" onClick={onToggleVisible} className="font-semibold text-primary">{allVisibleProductsSelected ? "Clear visible selection" : "Select visible products"}</button></div>{loadingProducts && !products.length && !filteredPendingChanges.length ? <MobileLoadingCards /> : syncPageItems.length ? <div className="grid gap-2">{syncPageItems.map((item) => <SyncListItem key={item.type === "pending" ? item.value._id || item.value.ingramPartNumber : item.value.ingramPartNumber} item={item} categoryName={selectedCategory?.name || ""} selectedProducts={selectedProducts} selectedPendingChanges={selectedPendingChanges} processingChangeIds={processingChangeIds} processingProductSkus={processingProductSkus} onToggle={onToggle} onTogglePending={onTogglePending} onChange={onChange} onSyncProduct={onSyncProduct} />)}</div> : reconciliationStatus === "complete" ? <EmptyPanel label="No new products or pending changes found in this category." /> : null}{totalPages > 1 ? <Pagination page={productPage} totalPages={totalPages} onPageChange={onPageChange} /> : null}{remoteHasMore && products.length ? <p className="text-center text-xs text-on-surface-variant">Continuing to scan Ingram pages...</p> : null}</div></div></Card>
    </div>
  </div>;
}

function TabletPendingChangeRow(props) {
  return <PendingChangeRow {...props} />;
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

/* Shared row shell so pending changes and new products read as one list. */
const SYNC_ROW_CLASS = "grid min-w-0 grid-cols-[auto_auto_minmax(0,1fr)_auto] items-stretch gap-2 rounded-lg border p-2.5 transition sm:gap-3 sm:p-3";
const SYNC_ROW_IMAGE_CLASS = "mt-0.5 size-10 shrink-0 self-start rounded-lg object-cover ring-1 ring-outline-variant sm:size-11";
const syncRowStateClass = (checked) => (checked ? "border-primary/50 bg-primary/[0.04]" : "border-outline-variant bg-surface hover:bg-surface-container-low");
const SYNC_BADGE_CLASS = "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide";
const SYNC_ACTION_BUTTON_CLASS = "h-8 shrink-0 gap-1 px-2 text-xs sm:px-3";
const SYNC_ROW_ACTION_CLASS = "flex shrink-0 flex-col items-end justify-between gap-2 self-stretch";

function SyncRowButton({ processing, label, onSync }) {
  return (
    <Button type="button" size="sm" aria-label={`Sync ${label}`} className={SYNC_ACTION_BUTTON_CLASS} disabled={processing} onClick={(event) => { event.preventDefault(); event.stopPropagation(); onSync(); }}>
      {processing ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
      <span>{processing ? "Syncing..." : "Sync"}</span>
    </Button>
  );
}

const ProductRow = memo(function ProductRow({ product, checked, categoryName, processing, onToggle, onSync }) {
  const name = product.name || product.description || product.ingramPartNumber;
  return <label className={`${SYNC_ROW_CLASS} cursor-pointer ${syncRowStateClass(checked)}`}>
    <input type="checkbox" aria-label={`Select ${product.ingramPartNumber}`} checked={checked} onChange={() => onToggle(product.ingramPartNumber)} className="mt-1 size-4 shrink-0 accent-primary" />
    <Image src={safeImageSrc(product.imageUrl)} alt={name} width={48} height={48} className={SYNC_ROW_IMAGE_CLASS} />
    <div className="min-w-0">
      <p className="break-words text-label-md font-semibold leading-4 text-on-surface" title={name}>{name}</p>
      <p className="break-all text-meta text-on-surface-variant">SKU {product.ingramPartNumber}{product.vendorName || categoryName ? ` · ${product.vendorName || categoryName}` : ""}</p>
      <p className="mt-1 whitespace-normal break-words text-[11px] font-semibold leading-4 tabular-nums text-on-surface sm:text-xs">Price {money(product.price || 0)}</p>
      <p className="whitespace-normal break-words text-[11px] leading-4 text-on-surface-variant sm:text-meta">Stock {product.stock ?? 0}</p>
    </div>
    <div className={SYNC_ROW_ACTION_CLASS}>
      <span className={`${SYNC_BADGE_CLASS} bg-emerald-100 text-emerald-700`}>NEW</span>
      <SyncRowButton processing={processing} label={name} onSync={() => onSync?.(product)} />
    </div>
  </label>;
});

function ProductResultsPanel({ selectedCategory, loadingProducts, products, pendingChanges, filteredPendingChanges, syncPageItems, productPage, totalPages, remoteHasMore, scanProgress, reconciliationStatus, selectedProducts, selectedPendingChanges, processingChangeIds, processingProductSkus, allVisibleProductsSelected, onToggle, onTogglePending, onToggleVisible, onPageChange, onChange, onSyncProduct }) {
  if (!selectedCategory) return <EmptyPanel label="Select a saved Ingram category from the left." />;

  const scanLabel = scanProgress.totalPages
    ? `${scanProgress.complete ? "Scanned" : "Scanning"} page ${Math.min(scanProgress.page || 1, scanProgress.totalPages)} of ${scanProgress.totalPages}`
    : "Loading first Ingram page...";

  return (
    <div className="space-y-4">
      {!scanProgress.complete ? <p className="text-xs text-on-surface-variant">{scanLabel}. New products and pending changes appear as each page is checked.</p> : null}
      {reconciliationStatus === "running" && scanProgress.complete ? <p className="text-xs text-on-surface-variant">Reconciliation is still running. Pending changes will continue to appear as Ingram pages finish.</p> : null}
      {reconciliationStatus === "failed" ? <p className="rounded-md border border-red-300/70 bg-red-50/70 p-3 text-xs text-red-800">Some Ingram pages failed reconciliation. Existing pending changes are shown below; retry the category to check failed pages again.</p> : null}
      {loadingProducts && !products.length && !filteredPendingChanges.length ? <LoadingState label={scanLabel} /> : syncPageItems.length ? <>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-on-surface-variant">
          <span>{filteredPendingChanges.length} pending · {products.length} new products loaded from Ingram</span>
          <button type="button" onClick={onToggleVisible} className="font-semibold text-primary hover:underline">{allVisibleProductsSelected ? "Clear visible selection" : "Select visible products"}</button>
          <span>Showing {UI_PAGE_SIZE} per page</span>
        </div>
        <div className="grid gap-3">{syncPageItems.map((item) => <SyncListItem key={item.type === "pending" ? item.value._id || item.value.ingramPartNumber : item.value.ingramPartNumber} item={item} categoryName={selectedCategory.name} selectedProducts={selectedProducts} selectedPendingChanges={selectedPendingChanges} processingChangeIds={processingChangeIds} processingProductSkus={processingProductSkus} onToggle={onToggle} onTogglePending={onTogglePending} onChange={onChange} onSyncProduct={onSyncProduct} />)}</div>
        <Pagination page={productPage} totalPages={totalPages} onPageChange={onPageChange} className="mt-4" />
      </> : reconciliationStatus === "complete" ? <EmptyPanel label="No new products or pending changes found in this category." /> : null}
      {remoteHasMore && products.length ? <p className="text-center text-xs text-on-surface-variant">Continuing to scan Ingram pages...</p> : null}
    </div>
  );
}

function PendingChangeRow({ change, checked, processing, onToggle, onChange }) {
  const productName = change.productSnapshot?.name || change.productSnapshot?.description || "Ingram product";
  const priceChanged = Boolean(change.priceChanged || (change.newPrice != null && Number(change.newPrice) !== Number(change.oldPrice ?? 0)));
  const stockChanged = Boolean(change.stockChanged || (change.newStock != null && Number(change.newStock) !== Number(change.oldStock ?? 0)));
  const priceText = priceChanged ? `${money(change.oldPrice)} → ${money(change.newPrice)}` : null;
  const stockText = stockChanged ? `${change.oldStock ?? 0} → ${change.newStock ?? 0}` : null;
  const nextPrice = priceChanged ? change.newPrice : change.oldPrice;
  const nextStock = stockChanged ? change.newStock : change.oldStock;
  const priceLine = priceText || (nextPrice == null ? "—" : money(nextPrice));
  const stockLine = stockText || String(nextStock ?? 0);
  return (
    <div className={`${SYNC_ROW_CLASS} ${syncRowStateClass(checked)}`}>
      <input type="checkbox" aria-label={`Select pending change ${change.ingramPartNumber}`} checked={checked} disabled={processing} onChange={onToggle} className="mt-1 size-4 shrink-0 accent-primary" />
      <Image src={safeImageSrc(change.productSnapshot?.imageUrl)} alt={productName} width={48} height={48} className={SYNC_ROW_IMAGE_CLASS} />
      <div className="min-w-0">
        <p className="break-words text-label-md font-semibold leading-4 text-on-surface" title={productName}>{productName}</p>
        <p className="break-all text-meta text-on-surface-variant" title={`${change.ingramPartNumber}${change.productSnapshot?.vendorName ? ` · ${change.productSnapshot.vendorName}` : ""}`}>
          SKU {change.ingramPartNumber}{change.productSnapshot?.vendorName ? ` · ${change.productSnapshot.vendorName}` : ""}
        </p>
        <p className="mt-1 whitespace-normal break-words text-[11px] font-semibold leading-4 tabular-nums text-on-surface sm:text-xs">Price {priceLine}</p>
        <p className="whitespace-normal break-words text-[11px] leading-4 text-on-surface-variant sm:text-meta">Stock {stockLine}</p>
      </div>
      <div className={SYNC_ROW_ACTION_CLASS}>
        <span className={`${SYNC_BADGE_CLASS} bg-amber-100 text-amber-700`}>PENDING</span>
        <SyncRowButton processing={processing} label={productName} onSync={() => onChange(change, "apply")} />
      </div>
    </div>
  );
}

function SyncListItem({ item, categoryName, selectedProducts, selectedPendingChanges, processingChangeIds, processingProductSkus, onToggle, onTogglePending, onChange, onSyncProduct }) {
  if (item.type === "pending") {
    const change = item.value;
    return <PendingChangeRow change={change} checked={selectedPendingChanges.has(normalizeSyncSku(change.ingramPartNumber))} processing={processingChangeIds.has(change._id)} onToggle={() => onTogglePending(normalizeSyncSku(change.ingramPartNumber))} onChange={onChange} />;
  }
  const product = item.value;
  return <ProductRow product={product} categoryName={categoryName} checked={selectedProducts.has(product.ingramPartNumber)} processing={processingProductSkus.has(product.ingramPartNumber)} onToggle={onToggle} onSync={onSyncProduct} />;
}

function LoadingState({ label }) { return <div className="flex items-center justify-center py-12 text-body-sm text-on-surface-variant"><Loader2 className="mr-2 size-5 animate-spin" /> {label}</div>; }
function EmptyPanel({ label }) { return <div className="flex min-h-72 items-center justify-center rounded-lg border border-dashed border-outline-variant text-center text-sm text-on-surface-variant"><div><p>{label}</p><Link href="/admin/categories" className="mt-2 inline-flex text-label-md font-semibold text-primary hover:underline">Manage categories</Link></div></div>; }

