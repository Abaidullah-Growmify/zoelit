"use client";

import { X, Search, RefreshCw, Check, Loader2 } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Button, Input } from "@/components/ui";
import { getCategoryProducts, getIngramCategories, searchIngramCategories, getIngramCategoryProducts } from "@/lib/api";
import { useAdminAuthStore } from "@/store/admin-auth-store";

export function SyncModal({ open, onClose, title, type, items, onSync, syncing, syncProgress, loading = false }) {
  const token = useAdminAuthStore((state) => state.token);
  const [selected, setSelected] = useState(new Set());
  const [search, setSearch] = useState("");
  const [ingramCategories, setIngramCategories] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState("");
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchMode, setSearchMode] = useState("local");
  const [ingramSearchResults, setIngramSearchResults] = useState([]);
  const [searchingIngram, setSearchingIngram] = useState(false);

  useEffect(() => {
    if (!open) return undefined;

    const timeout = window.setTimeout(() => {
      setSelected(new Set());
      setSearch("");
      setExpandedCategory("");
      setCategoryProducts([]);
      setSearchMode("local");
      setIngramSearchResults([]);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [open]);

  const loadIngramCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const data = await getIngramCategories(token);
      setIngramCategories((data.categories || []).filter((category) => category.source === "ingram"));
    } catch (err) {
      toast.error(err.message || "Failed to load categories");
      setIngramCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  }, [token]);

  useEffect(() => {
    if (!open || type !== "product") return undefined;

    const timeout = window.setTimeout(() => {
      loadIngramCategories();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [open, type, loadIngramCategories]);

  const handleSearchIngram = useCallback(async () => {
    if (!search.trim()) return;
    setSearchingIngram(true);
    try {
      const data = await searchIngramCategories(search.trim(), token);
      setIngramSearchResults(data.categories || []);
      setSearchMode("ingram");
      setExpandedCategory("");
      setCategoryProducts([]);
    } catch (err) {
      toast.error(err.message || "Failed to search Ingram");
      setIngramSearchResults([]);
    } finally {
      setSearchingIngram(false);
    }
  }, [search, token]);

  const loadCategoryProducts = useCallback(async (category) => {
    const categoryName = category.name || "";
    const categoryId = category.ingramCategoryId || category.id || categoryName;
    if (expandedCategory === categoryName) {
      setExpandedCategory("");
      setCategoryProducts([]);
      return;
    }

    setLoadingProducts(true);
    setExpandedCategory(categoryName);
    setCategoryProducts([]);
    try {
      const isLocalOnly = searchMode === "local" && category.source === "manual";
      const pageSize = isLocalOnly ? 200 : 100;
      const allProducts = [];
      const seenProductKeys = new Set();
      let page = 1;
      let total = Infinity;

      while (allProducts.length < total) {
        const data = isLocalOnly
          ? await getCategoryProducts(categoryName, { page, limit: pageSize })
           : await getIngramCategoryProducts(categoryId, { page, pageSize, categoryName }, token);
        const products = data.products || [];
        for (const product of products) {
          const productKey = product.ingramPartNumber || `${product.description}-${product.vendorPartNumber}`;
          if (!productKey || seenProductKeys.has(productKey)) continue;
          seenProductKeys.add(productKey);
          allProducts.push(product);
        }
        setCategoryProducts([...allProducts]);

        total = data.pagination?.total ?? data.total ?? allProducts.length;
         if (products.length === 0 || page * pageSize >= (data.pagination?.total ?? 0)) break;
        page += 1;
      }
    } catch (err) {
      toast.error(err.message || "Failed to load category products");
      setCategoryProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, [expandedCategory, searchMode, token]);

  const displayCategories = searchMode === "ingram" ? ingramSearchResults : ingramCategories;

  const filteredCategories = displayCategories.filter((cat, index, arr) => {
    const name = cat.name || "";
    return name.toLowerCase().includes(search.toLowerCase()) && arr.findIndex((item) => item.name === name) === index;
  });
  const emptyCategoryState = type === "category" && (loading || (!displayCategories.length && !search.trim()));

  const selectableExpandedProducts = categoryProducts.filter((product) => !product.alreadyAdded);
  const allExpandedProductsSelected = selectableExpandedProducts.length > 0 && selectableExpandedProducts.every((p) => selected.has(p.ingramPartNumber));

  function handleToggleAllExpandedProducts() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allExpandedProductsSelected) {
        selectableExpandedProducts.forEach((p) => next.delete(p.ingramPartNumber));
      } else {
        selectableExpandedProducts.forEach((p) => next.add(p.ingramPartNumber));
      }
      return next;
    });
  }

  function handleToggleItem(key) {
    const normalizedKey = String(key);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(normalizedKey)) next.delete(normalizedKey);
      else next.add(normalizedKey);
      return next;
    });
  }

  function handleSync() {
    if (selected.size === 0) {
      toast.error(type === "product" ? "Please select at least one product" : "Please select at least one item");
      return;
    }
    onSync([...selected]);
  }

  if (!open) return null;

  const progressPercent = syncProgress?.percent || 0;

  if (type === "product") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm" onClick={onClose} />
        <div className="relative z-10 flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-2xl" style={{ height: "85vh" }}>
          <div className="flex items-center justify-between border-b border-outline-variant px-5 py-4">
            <h2 className="font-heading text-lg font-semibold text-on-surface">{title}</h2>
            <button onClick={onClose} className="icon-btn size-8">
              <X className="size-5" />
            </button>
          </div>

          <div className="flex items-center gap-3 border-b border-outline-variant px-6 py-3">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
              <Input
                value={search}
                onChange={(e) => { setSearch(e.target.value); if (searchMode === "ingram") setSearchMode("local"); }}
                onKeyDown={(e) => { if (e.key === "Enter") handleSearchIngram(); }}
                placeholder="Search categories or type to search Ingram..."
                className="h-11 pl-10"
              />
            </div>
            <Button variant="outline" onClick={handleSearchIngram} disabled={searchingIngram || !search.trim()} className="h-11">
              {searchingIngram ? <Loader2 className="size-4 animate-spin" /> : "Search Ingram"}
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-2" style={{ minHeight: 0 }}>
            {loadingCategories ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="size-6 animate-spin text-on-surface-variant" />
                <span className="ml-2 text-body-sm text-on-surface-variant">Loading categories...</span>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-body-sm text-on-surface-variant">No new categories are available in Ingram.</p>
                <p className="mt-1 text-meta text-on-surface-variant">All available Ingram categories are already added or none are currently available.</p>
              </div>
            ) : (
              <>
                <p className="mb-2 text-meta text-on-surface-variant">
                  {searchMode === "ingram" ? "Ingram search results" : "Local categories"}
                </p>
                {filteredCategories.map((cat, index) => {
                  const catName = cat.name || "";
                  const expanded = expandedCategory === catName;
                  const alreadyAdded = Boolean(cat.alreadyAdded);
                  return (
                    <div key={`${catName}-${index}`} className="rounded-sm">
                      <div className="flex items-start gap-2 px-3 py-3 hover:bg-surface-container-low">
                        <button
                          type="button"
                        onClick={() => loadCategoryProducts(cat)}
                          className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded border border-outline-variant bg-surface-container-lowest text-label-md font-semibold text-on-surface-variant hover:border-primary hover:text-primary"
                          aria-label={expanded ? `Collapse ${catName}` : `Expand ${catName}`}
                        >
                          {expanded ? "-" : "+"}
                        </button>
                        <button type="button" onClick={() => loadCategoryProducts(cat)} className="min-w-0 flex-1 text-left">
                          <div className="flex items-center gap-2"><p className="truncate text-label-md font-semibold text-on-surface">{catName}</p><span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${alreadyAdded ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>{alreadyAdded ? "Already added" : "New"}</span></div>
                        </button>
                      </div>

                      {expanded && (
                        <div className="ml-11 border-l border-outline-variant pb-2 pl-3">
                          {loadingProducts ? (
                            <div className="flex items-center py-4 text-body-sm text-on-surface-variant">
                              <Loader2 className="mr-2 size-4 animate-spin" /> Loading products...
                            </div>
                          ) : categoryProducts.length === 0 ? (
                            <p className="py-4 text-body-sm text-on-surface-variant">No products found in this category</p>
                          ) : (
                            <>
                              <label className="flex cursor-pointer items-center gap-3 rounded-sm py-2 pr-3 hover:bg-surface-container-low" onClick={handleToggleAllExpandedProducts}>
                                <span className={`flex size-5 shrink-0 items-center justify-center rounded border ${allExpandedProductsSelected ? "border-primary bg-primary text-white" : "border-outline-variant bg-surface-container-lowest"}`}>
                                  {allExpandedProductsSelected && <Check className="size-3.5" />}
                                </span>
                               <span className="text-label-md font-semibold text-on-surface">Select All ({selectableExpandedProducts.length})</span>
                              </label>
                              <div className="my-1 border-t border-outline-variant" />
                              {categoryProducts.map((product, index) => {
                                 const key = product.ingramPartNumber;
                                 const alreadyAdded = Boolean(product.alreadyAdded);
                                 const checked = selected.has(key);
                                 return (
                                   <label key={`${expandedCategory}-${key}-${index}`} className={`flex items-center gap-3 rounded-sm py-2 pr-3 ${alreadyAdded ? "cursor-not-allowed opacity-65" : "cursor-pointer hover:bg-surface-container-low"}`} onClick={() => { if (!alreadyAdded) handleToggleItem(key); }}>
                                    <span className={`flex size-5 shrink-0 items-center justify-center rounded border ${checked ? "border-primary bg-primary text-white" : "border-outline-variant bg-surface-container-lowest"}`}>
                                      {checked && <Check className="size-3.5" />}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                       <div className="flex items-center gap-2"><p className="truncate text-label-md font-semibold text-on-surface">{product.description || product.ingramPartNumber}</p><span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${alreadyAdded ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>{alreadyAdded ? "Already added" : "New"}</span></div>
                                       <p className="truncate text-meta text-on-surface-variant">{product.ingramPartNumber}</p>
                                       <p className="truncate text-meta text-on-surface-variant">Price ${Number(product.price || 0).toFixed(2)} · Stock {product.stock ?? 0}</p>
                                    </div>
                                  </label>
                                );
                              })}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-outline-variant px-6 py-4">
            <p className="text-label-sm text-on-surface-variant">{selected.size} selected</p>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={onClose} className="h-11 px-5">Cancel</Button>
              <div className="relative">
                <Button onClick={handleSync} disabled={syncing || selected.size === 0} className="min-w-[150px] h-11 px-5">
                  {syncing ? (
                    <span className="flex items-center gap-2">
                      <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {progressPercent > 0 ? `${progressPercent}%` : "Syncing..."}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="size-4" /> Sync {selected.size > 0 ? `(${selected.size})` : ""}
                    </span>
                  )}
                </Button>
                {syncing && progressPercent > 0 && (
                  <div className="absolute bottom-0 left-0 h-1 w-full overflow-hidden rounded-b-md bg-primary/20">
                    <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progressPercent}%` }} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filtered = items.filter((item) => {
    const label = type === "category" ? item.name : (item.description || item.ingramPartNumber || "");
    return label.toLowerCase().includes(search.toLowerCase());
  });

  const selectableItems = filtered.filter((item) => !item.alreadyAdded);
  const allSelected = selectableItems.length > 0 && selectableItems.every((item) => {
    const key = type === "category" ? String(item.ingramCategoryId || item.id || item.name) : item.ingramPartNumber;
    return selected.has(String(key));
  });

  function handleToggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(selectableItems.map((item) => String(type === "category" ? (item.ingramCategoryId || item.id || item.name) : item.ingramPartNumber))));
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex h-[min(85vh,760px)] max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-4xl flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-outline-variant px-5 py-4">
          <h2 className="font-heading text-lg font-semibold text-on-surface">{title}</h2>
          <button onClick={onClose} className="icon-btn size-8">
            <X className="size-5" />
          </button>
        </div>

        {!emptyCategoryState && <div className="flex items-center gap-3 border-b border-outline-variant px-6 py-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${type === "category" ? "categories" : "products"}...`}
              className="h-11 pl-10"
            />
          </div>
        </div>}

        <div className={`min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-3 sm:px-6 ${emptyCategoryState ? "flex items-center justify-center" : ""}`}>
          {!emptyCategoryState && <label className="flex cursor-pointer items-center gap-3 rounded-sm px-3 py-2.5 hover:bg-surface-container-low" onClick={handleToggleAll}>
            <span className={`flex size-5 shrink-0 items-center justify-center rounded border ${allSelected ? "border-primary bg-primary text-white" : "border-outline-variant bg-surface-container-lowest"}`}>
              {allSelected && <Check className="size-3.5" />}
            </span>
            <span className="text-label-md font-semibold text-on-surface">Select All ({selectableItems.length})</span>
          </label>}
          {!emptyCategoryState && <div className="my-1 border-t border-outline-variant" />}
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-body-sm text-on-surface-variant">
              <Loader2 className="size-5 animate-spin" />
              Loading categories from Ingram...
            </div>
          ) : filtered.length === 0 ? (
            <div className="w-full max-w-xl px-6 py-10 text-center">
              <p className="text-body-sm font-semibold text-on-surface">
                {search.trim()
                  ? `No ${type === "category" ? "categories" : "products"} match your search.`
                  : type === "category"
                    ? "No new Ingram categories are available right now."
                    : "No new Ingram products are available right now."}
              </p>
              <p className="mt-2 text-meta text-on-surface-variant">
                {type === "category"
                  ? "All currently available Ingram categories are already saved, or Ingram has not added a new category yet."
                  : "New products will appear here after Ingram adds them to your saved categories."}
              </p>
            </div>
          ) : (
            type === "category" ? (
              <div className="w-full py-2">
                <div className="mb-4 rounded-xl border border-primary/15 bg-primary/5 px-4 py-4">
                  <p className="text-base font-semibold text-on-surface">Ingram categories</p>
                  <p className="mt-1 text-sm text-on-surface-variant">These categories are available from Ingram and are not saved in your database yet. Select the categories you want to add.</p>
                  <p className="mt-2 text-xs font-semibold text-primary">{filtered.length} unsaved {filtered.length === 1 ? "category" : "categories"}</p>
                </div>
                {filtered.map((item) => {
                  const key = String(item.ingramCategoryId || item.id || item.name);
                  const label = item.name;
                  const sub = `${item.productCount ?? item.count ?? 0} products`;
                  const checked = selected.has(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      aria-pressed={checked}
                      onClick={() => handleToggleItem(key)}
                      className={`mb-3 flex w-full min-w-0 items-start gap-3 rounded-xl border px-4 py-3 text-left transition ${checked ? "border-primary bg-primary/10 shadow-sm" : "border-outline-variant bg-surface hover:border-primary/60 hover:bg-surface-container-low"}`}
                    >
                      <span className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border ${checked ? "border-primary bg-primary text-white" : "border-outline-variant bg-surface-container-lowest"}`}>
                        {checked && <Check className="size-3.5" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="break-words text-label-md font-semibold text-on-surface">{label}</span>
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">New</span>
                        </span>
                        <span className="mt-1 block text-meta text-on-surface-variant">{sub}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : filtered.map((item) => {
              const key = item.ingramPartNumber;
              const label = type === "category" ? item.name : (item.description || item.ingramPartNumber);
              const sub = type === "category" ? `${item.count || 0} products` : (item.category || "");
              const alreadyAdded = Boolean(item.alreadyAdded);
              const checked = selected.has(key);
              return (
                <label key={key} className={`flex w-full shrink-0 items-center gap-3 rounded-lg border border-outline-variant px-3 py-3 ${alreadyAdded ? "cursor-not-allowed opacity-65" : "cursor-pointer hover:bg-surface-container-low"}`} onClick={() => { if (!alreadyAdded) handleToggleItem(key); }}>
                  <span className={`flex size-5 shrink-0 items-center justify-center rounded border ${checked ? "border-primary bg-primary text-white" : "border-outline-variant bg-surface-container-lowest"}`}>
                    {checked && <Check className="size-3.5" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2"><p className="truncate text-label-md font-semibold text-on-surface">{label}</p><span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${alreadyAdded ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>{alreadyAdded ? "Already added" : "New"}</span></div>
                    {sub && <p className="truncate text-meta text-on-surface-variant">{sub}</p>}
                  </div>
                </label>
              );
            })
          )}
        </div>

        {!emptyCategoryState && <div className="flex items-center justify-between border-t border-outline-variant px-6 py-4">
          <p className="text-label-sm text-on-surface-variant">{selected.size} selected</p>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose} className="h-11 px-5">Cancel</Button>
            <div className="relative">
              <Button onClick={handleSync} disabled={syncing || selected.size === 0} className="min-w-[150px] h-11 px-5">
                {syncing ? (
                  <span className="flex items-center gap-2">
                    <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {progressPercent > 0 ? `${progressPercent}%` : "Syncing..."}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                     <RefreshCw className="size-4" /> {type === "category" ? "Save categories" : "Sync"} {selected.size > 0 ? `(${selected.size})` : ""}
                  </span>
                )}
              </Button>
              {syncing && progressPercent > 0 && (
                <div className="absolute bottom-0 left-0 h-1 w-full overflow-hidden rounded-b-md bg-primary/20">
                  <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progressPercent}%` }} />
                </div>
              )}
            </div>
          </div>
        </div>}
      </div>
    </div>
  );
}
