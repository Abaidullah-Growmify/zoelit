"use client";

import Image from "next/image";
import { RefreshCw, Search, ChevronDown, Plus, ArrowLeft, Eye } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { toast } from "sonner";
import { AdminTable } from "@/components/admin-table";
import { Button, Card, FilterTabs, Input, SourceBadge } from "@/components/ui";
import { SyncModal } from "@/components/sync-modal";
import { AddItemModal } from "@/components/add-item-modal";
import { AdminCategoriesSkeleton } from "@/components/skeletons";
import { getAdminCategories, getCategoryProducts, startProductSync, createManualCategory, toggleCategoryActive, getSyncStatus } from "@/lib/api";
import { FALLBACK_IMAGE } from "@/lib/product-mapper";
import { money } from "@/lib/utils";
import { useAdminAuthStore } from "@/store/admin-auth-store";

const PAGE_SIZE = 10;

export default function AdminCategoriesPage() {
  const token = useAdminAuthStore((state) => state.token);
  const [view, setView] = useState("list");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState(null);

  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ percent: 0, label: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [sourceFilter, setSourceFilter] = useState("all");
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const pollRef = useRef(null);

  const checkSyncStatus = useCallback(async () => {
    if (!token) return false;
    try {
      const data = await getSyncStatus(token);
      const catalog = data.sync?.catalog;
      if (catalog?.status === "processing" || catalog?.status === "started") {
        setSyncing(true);
        const processed = catalog.totalProcessed || 0;
        const percent = Math.min(95, Math.round((processed / Math.max(processed, 10)) * 100));
        setSyncProgress({ percent, label: `Processed ${processed} products` });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [token]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      checkSyncStatus();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [checkSyncStatus]);

  const loadCategories = useCallback(() => {
    let active = true;
    if (!token) return () => { active = false; };
    getAdminCategories(token)
      .then((data) => {
        if (!active) return;
         setRows((data.categories || []).map((category) => ({
           name: category.name,
          description: category.description || "",
          slug: category.name.toLowerCase().replaceAll(" ", "-"),
          count: category.count,
          status: category.isActive ? "Active" : "Inactive",
          source: category.source || "manual",
          lastSyncedAt: category.lastSyncedAt,
          ingramCategoryId: category.ingramCategoryId || "",
        })));
        setError("");
      })
      .catch((loadError) => {
        if (!active) return;
        setError(loadError.message || "Could not load categories.");
        setRows([]);
      });
    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    const cleanup = loadCategories();
    return cleanup;
  }, [loadCategories]);

  const loadCategoryProducts = useCallback(async (categoryName) => {
    if (!token) return;
    try {
      const data = await getCategoryProducts(categoryName, { page: 1, limit: 50 }, token);
      setCategoryProducts(data.products || []);
      setSelectedProducts(new Set());
    } catch (err) {
      toast.error(err.message || "Could not load category products");
      setCategoryProducts([]);
    }
  }, [token]);

  function handleSearchChange(value) {
    setKeyword(value);
    setPage(1);
  }

  async function handleOpenModal() {
    const isRunning = await checkSyncStatus();
    if (isRunning) return;
    try {
      const data = await getAdminCategories(token);
      setCategories(data.categories || []);
    } catch {
      setCategories([]);
    }
    setModalOpen(true);
  }

  function handleOpenAddModal() {
    setAddModalOpen(true);
  }

  async function handleViewCategory(category) {
    setSelectedCategory(category);
    setView("products");
    await loadCategoryProducts(category.name);
  }

  function handleBackToList() {
    setView("list");
    setSelectedCategory(null);
    setCategoryProducts(null);
    setSelectedProducts(new Set());
  }

  async function handleSyncSubmit(selectedNames) {
    const isRunning = await checkSyncStatus();
    if (isRunning) {
      setModalOpen(false);
      return;
    }
    setModalOpen(false);
    setSyncing(true);
    setSyncProgress({ percent: 0, label: "Starting sync..." });
    try {
      for (let i = 0; i < selectedNames.length; i++) {
      await startProductSync({ category: selectedNames[i] }, token);
        const percent = Math.round(((i + 1) / selectedNames.length) * 100);
        setSyncProgress({ percent, label: `Syncing ${i + 1}/${selectedNames.length}` });
      }
      toast.success(`Sync started for ${selectedNames.length} categories`);
      pollSyncProgress();
    } catch (syncError) {
      toast.error(syncError.message || "Could not start sync");
      setSyncing(false);
      setSyncProgress({ percent: 0, label: "" });
    }
  }

  async function handleSyncCategoryProducts() {
    if (!selectedCategory) return;
    const isRunning = await checkSyncStatus();
    if (isRunning) return;

    setSyncing(true);
    setSyncProgress({ percent: 0, label: `Syncing ${selectedCategory.name}...` });
    try {
    await startProductSync({ category: selectedCategory.name }, token);
      toast.success(`Sync started for ${selectedCategory.name}`);
      pollSyncProgress();
    } catch (syncError) {
      toast.error(syncError.message || "Could not start sync");
      setSyncing(false);
      setSyncProgress({ percent: 0, label: "" });
    }
  }

  async function handleSyncSelectedProducts() {
    if (selectedProducts.size === 0) return;
    const isRunning = await checkSyncStatus();
    if (isRunning) return;

    setSyncing(true);
    setSyncProgress({ percent: 0, label: `Syncing ${selectedProducts.size} products...` });
    try {
      const skus = [...selectedProducts];
      for (let i = 0; i < skus.length; i++) {
      await startProductSync({ keyword: skus[i] }, token);
        const percent = Math.round(((i + 1) / skus.length) * 100);
        setSyncProgress({ percent, label: `Syncing ${i + 1}/${skus.length}` });
      }
      toast.success(`Sync started for ${selectedProducts.size} products`);
      pollSyncProgress();
    } catch (syncError) {
      toast.error(syncError.message || "Could not start sync");
      setSyncing(false);
      setSyncProgress({ percent: 0, label: "" });
    }
  }

  function toggleProductSelection(ingramPartNumber) {
    setSelectedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(ingramPartNumber)) next.delete(ingramPartNumber);
      else next.add(ingramPartNumber);
      return next;
    });
  }

  function toggleAllProducts() {
    if (!categoryProducts) return;
    if (selectedProducts.size === categoryProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(categoryProducts.map((p) => p.ingramPartNumber)));
    }
  }

  function pollSyncProgress() {
    if (pollRef.current) clearInterval(pollRef.current);
    let attempts = 0;
    const maxAttempts = 120;
    pollRef.current = setInterval(async () => {
      attempts++;
      try {
      const data = await getSyncStatus(token);
        const catalog = data.sync?.catalog;
        if (catalog?.status === "completed" || catalog?.status === "failed" || attempts >= maxAttempts) {
          clearInterval(pollRef.current);
          pollRef.current = null;
          setSyncing(false);
          setSyncProgress({ percent: 100, label: catalog?.status === "completed" ? "Done!" : "Sync ended" });
          loadCategories();
          if (selectedCategory) loadCategoryProducts(selectedCategory.name);
          setTimeout(() => setSyncProgress({ percent: 0, label: "" }), 2000);
        } else if (catalog?.status === "processing") {
          const processed = catalog.totalProcessed || 0;
          const percent = Math.min(95, Math.round((processed / Math.max(processed, 10)) * 100));
          setSyncProgress({ percent, label: `Processed ${processed} products` });
        }
      } catch {
        if (attempts >= maxAttempts) {
          clearInterval(pollRef.current);
          pollRef.current = null;
          setSyncing(false);
          setSyncProgress({ percent: 0, label: "" });
        }
      }
    }, 3000);
  }

  async function handleCreateCategory(payload) {
    setSubmitting(true);
    try {
      await createManualCategory(payload, token);
      toast.success("Category created successfully");
      setAddModalOpen(false);
      loadCategories();
    } catch (err) {
      toast.error(err.message || "Failed to create category");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleCategory(categoryName) {
    try {
      const data = await toggleCategoryActive(categoryName, token);
      toast.success(data.message);
      loadCategories();
    } catch (err) {
      toast.error(err.message || "Could not toggle category");
    }
  }

  const filteredRows = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    let result = rows || [];
    if (sourceFilter !== "all") {
      result = result.filter((category) => category.source === sourceFilter || category.source === "mixed");
    }
    if (query) {
      result = result.filter(
        (category) => category.name.toLowerCase().includes(query) || category.slug.toLowerCase().includes(query)
      );
    }
    return result;
  }, [rows, keyword, sourceFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = filteredRows.length ? (safePage - 1) * PAGE_SIZE : 0;
   const pageItems = filteredRows.slice(pageStart, pageStart + PAGE_SIZE).map((category, index) => ({
     ...category,
     serial: pageStart + index + 1,
   }));

  const categoryColumns = [
    { key: "serial", header: "#", sortable: true, accessor: "serial", cellClassName: "font-semibold tabular-nums text-on-surface" },
    { key: "name", header: "Name", sortable: true, accessor: "name", cellClassName: "font-semibold text-on-surface", render: (category) => (
      <div className="max-w-72">
        <p title={category.name} className="line-clamp-2 whitespace-normal font-semibold text-on-surface">{category.name}</p>
        <p className="truncate text-meta font-normal text-on-surface-variant">{category.description || category.slug}</p>
      </div>
    ) },
    {
      key: "source",
      header: "Source",
      accessor: "source",
      render: (category) => <SourceBadge source={category.source} />,
    },
    { key: "count", header: "Products", sortable: true, accessor: "count", cellClassName: "tabular-nums" },
    {
      key: "lastSyncedAt",
      header: "Last Synced",
      accessor: "lastSyncedAt",
      render: (category) => (
        <span className="text-meta text-on-surface-variant">
          {category.lastSyncedAt
            ? new Date(category.lastSyncedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            : "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      accessor: "status",
      render: (category) => (
        <span className="relative inline-flex">
          <select
            value={category.status === "Active" ? "active" : "inactive"}
            onChange={() => handleToggleCategory(category.name)}
            className={`h-8 appearance-none rounded-lg border px-3 pr-7 text-xs font-medium transition-colors ${
              category.status === "Active"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                : "border-rose-200 bg-rose-50 text-rose-700 focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
            }`}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <ChevronDown className={`pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 ${category.status === "Active" ? "text-emerald-600" : "text-rose-600"}`} />
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (category) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewCategory(category)}
          className="size-9 p-0"
          aria-label={`View products in ${category.name}`}
          title="View products"
        >
          <Eye className="size-4" />
        </Button>
      ),
    },
  ];

  if (view === "products" && selectedCategory) {
    return (
      <Card className="overflow-hidden p-0">
        <div className="flex flex-col gap-4 border-b border-outline-variant px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1 lg:order-first">
            <h2 className="font-heading text-lg font-semibold text-on-surface">{selectedCategory.name}</h2>
            <p className="text-sm text-on-surface-variant">
              {selectedCategory.count} products · Source: {selectedCategory.source}
            </p>
            {selectedCategory.description ? <p className="mt-1 max-w-2xl text-sm text-on-surface-variant">{selectedCategory.description}</p> : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleSyncCategoryProducts} disabled={syncing} className="gap-1.5">
              <RefreshCw className={`size-4 ${syncing ? "animate-spin" : ""}`} /> Sync All Products
            </Button>
            {selectedProducts.size > 0 ? (
              <Button onClick={handleSyncSelectedProducts} disabled={syncing} className="gap-1.5">
                <RefreshCw className={`size-4 ${syncing ? "animate-spin" : ""}`} /> Sync Selected ({selectedProducts.size})
              </Button>
            ) : null}
            <Button variant="outline" onClick={handleBackToList} className="gap-1.5">
              <ArrowLeft className="size-4" /> Back to Categories
            </Button>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          {categoryProducts === null ? (
          <AdminCategoriesSkeleton />
          ) : (
          <Card className="overflow-hidden">
            <div className="border-b border-outline-variant px-4 py-3">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedProducts.size === categoryProducts.length && categoryProducts.length > 0}
                  onChange={toggleAllProducts}
                  className="size-4 rounded border-outline-variant text-primary focus:ring-primary"
                />
                <span className="text-label-sm font-semibold text-on-surface">Select All ({categoryProducts.length})</span>
              </label>
            </div>
            <div className="divide-y divide-outline-variant">
              {categoryProducts.map((product, index) => (
                <label
                  key={`${product.ingramPartNumber}-${index}`}
                  className="flex cursor-pointer items-center gap-4 px-4 py-3 transition hover:bg-surface-container-low/80"
                >
                  <input
                    type="checkbox"
                    checked={selectedProducts.has(product.ingramPartNumber)}
                    onChange={() => toggleProductSelection(product.ingramPartNumber)}
                    className="size-4 rounded border-outline-variant text-primary focus:ring-primary"
                  />
                  <div className="flex flex-1 items-center gap-3">
                    <Image
                      src={product.imageUrl || FALLBACK_IMAGE}
                      alt={product.name || product.description || product.ingramPartNumber}
                      width={40}
                      height={40}
                  className="size-10 shrink-0 rounded-xl object-cover ring-1 ring-outline-variant"
                />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-on-surface">{product.name || product.description || product.ingramPartNumber}</p>
                      <p className="truncate text-meta text-on-surface-variant">{product.ingramPartNumber}</p>
                    </div>
                  </div>
                  <div className="min-w-[4.5rem] shrink-0 text-right">
                    <p className="text-xs font-semibold tabular-nums text-on-surface sm:text-label-md">{money(product.price)}</p>
                    <p className="text-[11px] text-on-surface-variant sm:text-meta">Stock {product.stock || 0}</p>
                  </div>
                </label>
              ))}
              {categoryProducts.length === 0 && (
                <p className="py-8 text-center text-body-sm text-on-surface-variant">No products in this category</p>
              )}
            </div>
          </Card>
          )}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {rows === null && !error ? (
        <AdminCategoriesSkeleton />
      ) : error ? (
        <Card className="p-8 text-center text-body font-regular text-rose-600">{error}</Card>
      ) : (
        <>
          <AdminTable
            title="Categories"
            description="Manage your product categories. Click 'View Products' to see and sync products within a category."
            columns={categoryColumns}
            data={pageItems}
            pageSize={PAGE_SIZE}
            page={safePage}
            onPageChange={setPage}
            totalPages={totalPages}
            totalItems={filteredRows.length}
            toolbar={(
              <>
                <FilterTabs
                  value={sourceFilter}
                  onChange={(value) => { setSourceFilter(value); setPage(1); }}
                  tabs={[
                    { value: "all", label: "All" },
                    { value: "manual", label: "Manual" },
                    { value: "ingram", label: "Ingram" },
                  ]}
                />
                <div className="relative min-w-[16rem] flex-1 sm:max-w-md lg:max-w-xl">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                  <Input value={keyword} onChange={(event) => handleSearchChange(event.target.value)} placeholder="Search categories" aria-label="Search categories" className="h-10 pl-10 shadow-sm" />
                </div>
              </>
            )}
            action={(
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleOpenAddModal} className="gap-1.5">
                  <Plus className="size-4" /> Add Category
                </Button>
                <div className="relative">
                  <Button onClick={handleOpenModal} disabled={syncing} className="min-w-[160px]">
                    {syncing ? (
                      <span className="flex items-center gap-2">
                        <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        {syncProgress.percent > 0 ? `${syncProgress.percent}%` : "Syncing..."}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="size-4" /> Sync from Ingram
                      </span>
                    )}
                  </Button>
                  {syncing && syncProgress.percent > 0 && (
                    <div className="absolute bottom-0 left-0 h-1 w-full overflow-hidden rounded-b-md bg-primary/20">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${syncProgress.percent}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
            hideSearch
          />
        </>
      )}

      <SyncModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Sync from Ingram"
        type="category"
        items={categories}
        onSync={handleSyncSubmit}
        syncing={syncing}
        syncProgress={syncProgress}
      />

      <AddItemModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        type="category"
        categories={[]}
        onSubmit={handleCreateCategory}
        submitting={submitting}
      />
    </div>
  );
}
