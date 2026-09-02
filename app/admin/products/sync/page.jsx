"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, Loader2, RefreshCw, Search } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button, Card, Input } from "@/components/ui";
import { getCategoryProducts, getIngramCategories, getSyncStatus, startProductSync } from "@/lib/api";
import { FALLBACK_IMAGE } from "@/lib/product-mapper";
import { money } from "@/lib/utils";
import { useAdminAuthStore } from "@/store/admin-auth-store";

export default function AdminProductSyncPage() {
  const token = useAdminAuthStore((state) => state.token);
  const [categories, setCategories] = useState([]);
  const [categorySearch, setCategorySearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState({ percent: 0, label: "" });

  const loadCategoryProducts = useCallback(async (category) => {
    const categoryName = category.name || "";
    setSelectedCategory(category);
    setProductSearch("");
    setProducts([]);
    setLoadingProducts(true);

    try {
      const pageSize = 200;
      const allProducts = [];
      const seen = new Set();
      let page = 1;
      let total = Infinity;

      while (allProducts.length < total) {
        const data = await getCategoryProducts(categoryName, { page, limit: pageSize }, token);
        const nextProducts = data.products || [];

        for (const product of nextProducts) {
          const key = product.ingramPartNumber || `${product.description}-${product.vendorPartNumber}`;
          if (!key || seen.has(key)) continue;
          seen.add(key);
          allProducts.push(product);
        }

        setProducts([...allProducts]);
        total = data.pagination?.total ?? allProducts.length;
        if (nextProducts.length === 0 || nextProducts.length < pageSize) break;
        page += 1;
      }
    } catch (err) {
      toast.error(err.message || "Failed to load category products");
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, [token]);

  const loadCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const data = await getIngramCategories(token);
      const list = dedupeCategories(data.categories || []);
      setCategories(list);
      if (list.length > 0) {
        await loadCategoryProducts(list[0]);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load categories");
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  }, [token, loadCategoryProducts]);

  useEffect(() => {
    if (!token) return undefined;

    const timeout = window.setTimeout(() => {
      loadCategories();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [token, loadCategories]);

  const filteredCategories = useMemo(() => {
    const query = categorySearch.trim().toLowerCase();
    if (!query) return categories;
    return categories.filter((category) => (category.name || "").toLowerCase().includes(query));
  }, [categories, categorySearch]);

  const filteredProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase();
    if (!query) return products;
    return products.filter((product) => (
          product.name || product.description || product.ingramPartNumber || ""
    ).toLowerCase().includes(query));
  }, [products, productSearch]);

  function toggleProduct(ingramPartNumber) {
    setSelectedProducts((current) => {
      const next = new Set(current);
      if (next.has(ingramPartNumber)) next.delete(ingramPartNumber);
      else next.add(ingramPartNumber);
      return next;
    });
  }

  async function handleSyncAllCategories() {
    const isRunning = await checkSyncRunning(token);
    if (isRunning) {
      toast.error("Catalog sync already in progress");
      return;
    }

    setSyncing(true);
    setProgress({ percent: 0, label: "Syncing all categories..." });
    try {
      await startProductSync({}, token);
      toast.success("Full catalog sync started — all categories will be updated");
    } catch (err) {
      toast.error(err.message || "Could not start sync");
    } finally {
      setSyncing(false);
      window.setTimeout(() => setProgress({ percent: 0, label: "" }), 1500);
    }
  }

  async function handleSyncCategory() {
    if (!selectedCategory) return;

    const isRunning = await checkSyncRunning(token);
    if (isRunning) {
      toast.error("Catalog sync already in progress");
      return;
    }

    setSyncing(true);
    setProgress({ percent: 0, label: `Syncing ${selectedCategory.name}...` });
    try {
      await startProductSync({ category: selectedCategory.name }, token);
      toast.success(`Sync started for category "${selectedCategory.name}"`);
    } catch (err) {
      toast.error(err.message || "Could not start sync");
    } finally {
      setSyncing(false);
      window.setTimeout(() => setProgress({ percent: 0, label: "" }), 1500);
    }
  }

  async function handleSyncSelected(skus) {
    if (!skus.length) {
      toast.error("Please select at least one product");
      return;
    }

    const isRunning = await checkSyncRunning(token);
    if (isRunning) {
      toast.error("Catalog sync already in progress");
      return;
    }

    setSyncing(true);
    setProgress({ percent: 0, label: "Starting sync..." });
    try {
      for (let index = 0; index < skus.length; index += 1) {
        await startProductSync({ keyword: skus[index] }, token);
        const percent = Math.round(((index + 1) / skus.length) * 100);
        setProgress({ percent, label: `Syncing ${index + 1}/${skus.length}` });
      }
      toast.success(`Sync started for ${skus.length} products`);
    } catch (err) {
      toast.error(err.message || "Could not start sync");
    } finally {
      setSyncing(false);
      window.setTimeout(() => setProgress({ percent: 0, label: "" }), 1500);
    }
  }

  const selectedSkuList = [...selectedProducts];

  return (
    <div className="space-y-5">
      <Card className="p-0">
        <div className="border-b border-outline-variant px-5 py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <h1 className="font-heading text-lg font-semibold tracking-tight text-on-surface">Ingram Product Sync</h1>
              <p className="mt-1 text-sm text-on-surface-variant">Select a category from the left, then sync all or specific products.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={handleSyncAllCategories} disabled={syncing} size="sm">
                <RefreshCw className={`size-3.5 ${syncing ? "animate-spin" : ""}`} /> Sync All Categories
              </Button>
              <Button asChild href="/admin/products" variant="outline" size="sm">
                <ArrowLeft className="size-3.5" /> Back to Products
              </Button>
            </div>
          </div>
        </div>

        <div className="grid min-h-[calc(100vh-14rem)] gap-4 p-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <Card className="flex min-h-0 flex-col p-0">
          <div className="border-b border-outline-variant p-4">
              <h2 className="font-heading text-base font-semibold text-on-surface">Categories</h2>
            <p className="mt-1 text-xs text-on-surface-variant">Choose one category to view products.</p>
            <div className="mt-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                <Input
                  value={categorySearch}
                  onChange={(event) => setCategorySearch(event.target.value)}
                  placeholder="Search category"
                  className="h-10 pl-10"
                />
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {loadingCategories ? (
              <LoadingState label="Loading categories..." />
            ) : filteredCategories.length ? (
              filteredCategories.map((category, index) => {
                const active = selectedCategory?.name === category.name;
                return (
                  <button
                    key={`${category.name}-${index}`}
                    type="button"
                    onClick={() => loadCategoryProducts(category)}
                    className={`w-full rounded-lg px-3 py-2.5 text-left transition ${
                      active ? "bg-primary/10 text-primary" : "text-on-surface hover:bg-surface-container-low"
                    }`}
                  >
                    <p className="truncate text-label-md font-semibold">{category.name}</p>
                    <p className={`mt-0.5 truncate text-xs ${active ? "text-primary/70" : "text-on-surface-variant"}`}>
                      {category.productCount || category.count || 0} products{category.source ? ` · ${category.source}` : ""}
                    </p>
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center text-body-sm text-on-surface-variant">
                No categories found.
              </div>
            )}
          </div>
        </Card>

        <Card className="flex min-h-0 flex-col p-0">
          <div className="border-b border-outline-variant p-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0">
                <h2 className="truncate font-heading text-base font-semibold text-on-surface">
                  {selectedCategory?.name || "Select a category"}
                </h2>
                <p className="mt-1 text-xs text-on-surface-variant">
                  {selectedCategory ? `${products.length} products loaded · ${selectedProducts.size} selected` : "Products will appear here after selecting a category."}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {selectedCategory ? (
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                    <Input value={productSearch} onChange={(event) => setProductSearch(event.target.value)} placeholder="Search products" className="h-9 w-56 pl-9 text-sm" />
                  </div>
                ) : null}
                <Button variant="outline" onClick={handleSyncCategory} disabled={!selectedCategory || loadingProducts || syncing} size="sm">
                  <RefreshCw className={`size-3.5 ${syncing ? "animate-spin" : ""}`} /> Sync All
                </Button>
                <Button onClick={() => handleSyncSelected(selectedSkuList)} disabled={!selectedProducts.size || loadingProducts || syncing} size="sm">
                  <RefreshCw className={`size-3.5 ${syncing ? "animate-spin" : ""}`} /> Sync ({selectedProducts.size})
                </Button>
              </div>
            </div>
            {progress.label ? (
              <div className="mt-3 overflow-hidden rounded-full bg-primary/15">
                <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${progress.percent}%` }} />
              </div>
            ) : null}
          </div>

          <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-4">
            {!selectedCategory ? (
              <EmptyPanel label="Select any category from the left vertical list." />
            ) : loadingProducts ? (
              <LoadingState label={`Loading ${selectedCategory.name} products...`} />
            ) : filteredProducts.length ? (
              <div className="grid gap-3">
                {filteredProducts.map((product, index) => (
                  <ProductRow
                    key={`${product.ingramPartNumber || index}`}
                    product={product}
                    checked={selectedProducts.has(product.ingramPartNumber)}
                    categoryName={selectedCategory.name}
                    onToggle={toggleProduct}
                  />
                ))}
              </div>
            ) : (
              <EmptyPanel label="No products found in this category." />
            )}
          </div>
        </Card>
        </div>
      </Card>
    </div>
  );
}

const ProductRow = memo(function ProductRow({ product, checked, categoryName, onToggle }) {
  return (
    <label className="grid min-w-0 grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-2 rounded-lg border border-outline-variant bg-surface p-2.5 transition hover:bg-surface-container-low sm:gap-3 sm:p-3">
      <span className={`flex size-5 shrink-0 items-center justify-center rounded border ${checked ? "border-primary bg-primary text-white" : "border-outline-variant bg-surface-container-lowest"}`}>
        {checked ? <Check className="size-3.5" /> : null}
      </span>
      <input type="checkbox" checked={checked} onChange={() => onToggle(product.ingramPartNumber)} className="sr-only" />
      <Image src={product.imageUrl || FALLBACK_IMAGE} alt={product.name || product.description || product.ingramPartNumber} width={48} height={48} className="size-10 shrink-0 rounded-lg object-cover ring-1 ring-outline-variant sm:size-11" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-label-md font-semibold text-on-surface">{product.name || product.description || product.ingramPartNumber}</p>
        <p className="truncate text-meta text-on-surface-variant">{product.ingramPartNumber} · {product.vendorName || product.category || categoryName}</p>
      </div>
      <div className="min-w-[4.5rem] shrink-0 text-right">
        <p className="text-xs font-semibold tabular-nums text-on-surface sm:text-label-md">{money(product.price || 0)}</p>
        <p className="text-[11px] text-on-surface-variant sm:text-meta">Stock {product.stock || 0}</p>
      </div>
    </label>
  );
});

function dedupeCategories(categories) {
  const seen = new Set();
  const result = [];
  for (const category of categories) {
    const name = category.name || "";
    if (!name || seen.has(name)) continue;
    seen.add(name);
    result.push(category);
  }
  return result;
}

async function checkSyncRunning(token) {
  try {
    const data = await getSyncStatus(token);
    const catalog = data.sync?.catalog;
    return catalog?.status === "processing" || catalog?.status === "started";
  } catch {
    return false;
  }
}

function LoadingState({ label }) {
  return (
    <div className="flex items-center justify-center py-12 text-body-sm text-on-surface-variant">
      <Loader2 className="mr-2 size-5 animate-spin" /> {label}
    </div>
  );
}

function EmptyPanel({ label }) {
  return (
    <div className="flex min-h-72 items-center justify-center rounded-xl border border-dashed border-outline-variant text-center text-sm text-on-surface-variant">
      <div>
        <p>{label}</p>
        <Link href="/admin/categories" className="mt-2 inline-flex text-label-md font-semibold text-primary hover:underline">
          Manage categories
        </Link>
      </div>
    </div>
  );
}
