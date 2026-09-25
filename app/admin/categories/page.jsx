"use client";

import Image from "next/image";
import { RefreshCw, Search, ChevronDown, Plus, ArrowLeft, Eye, Pencil, Trash2, Save } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { toast } from "sonner";
import { AdminTable, AdminTableActions } from "@/components/admin-table";
import { ConfirmActionDialog, TransparentActionLoader } from "@/components/action-feedback";
import { Button, Card, FilterTabs, Input, Textarea, Label, SourceBadge, Badge } from "@/components/ui";
import { AddItemModal } from "@/components/add-item-modal";
import { AdminCategoriesSkeleton } from "@/components/skeletons";
import { getAdminCategories, getCategoryProducts, startProductSync, createManualCategory, toggleCategoryActive, setCategoryPriority, updateAdminCategory, deleteAdminCategory, getSyncStatus } from "@/lib/api";
import { FALLBACK_IMAGE } from "@/lib/product-mapper";
import { money } from "@/lib/utils";
import { useAdminAuthStore } from "@/store/admin-auth-store";
import { PriorityToggle } from "@/components/priority-toggle";

const PAGE_SIZE = 10;
const MIN_SKELETON_MS = 650;

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
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sourceFilter, setSourceFilter] = useState("all");
  const [selectedProducts, setSelectedProducts] = useState(new Set());
const [actionLoading, setActionLoading] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
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
    Promise.all([
      getAdminCategories(token),
      new Promise((resolve) => window.setTimeout(resolve, MIN_SKELETON_MS)),
    ])
      .then(([data]) => {
        if (!active) return;
setRows((data.categories || []).map((category) => ({
           name: category.name,
          description: category.description || "",
          slug: category.name.toLowerCase().replaceAll(" ", "-"),
          count: category.count,
          status: category.isActive ? "Active" : "Inactive",
          isActive: category.isActive,
          icon: category.icon || "",
          source: category.source || "manual",
           lastSyncedAt: category.lastSyncedAt,
           ingramCategoryId: category.ingramCategoryId || "",
           createdAt: category.createdAt,
           isPriority: Boolean(category.isPriority),
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

  function handleOpenAddModal() {
    setAddModalOpen(true);
  }

  async function handleViewCategory(category) {
    setActionLoading("Loading category products...");
    try {
      await loadCategoryProducts(category.name);
      setSelectedCategory(category);
      setView("products");
    } finally {
      setActionLoading("");
    }
  }

  function handleBackToList() {
    setView("list");
    setSelectedCategory(null);
    setCategoryProducts(null);
    setSelectedProducts(new Set());
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
        await startProductSync({
          ingramPartNumber: skus[i],
          category: selectedCategory?.name || "",
          categoryId: selectedCategory?.ingramCategoryId || selectedCategory?.id || "",
          addOnly: true,
        }, token);
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
    setActionLoading("Updating category...");
    try {
      const data = await toggleCategoryActive(categoryName, token);
      toast.success(data.message);
      loadCategories();
    } catch (err) {
      toast.error(err.message || "Could not toggle category");
    } finally {
      setActionLoading("");
    }
  }

async function handlePriorityChange(category, isPriority = true) {
    setActionLoading("Updating category priority...");
    try {
      await setCategoryPriority(category.name, isPriority, token);
      toast.success(isPriority ? "Priority category updated" : "Category priority removed");
      loadCategories();
    } catch (err) {
      toast.error(err.message || "Could not update category priority");
    } finally {
      setActionLoading("");
    }
  }

  function handleEditCategory(category) {
    setEditTarget(category);
  }

  async function confirmSaveCategory(payload) {
    if (!editTarget) return;
    setActionLoading("Saving category...");
    try {
      const data = await updateAdminCategory(editTarget.name, payload, token);
      toast.success(data.message || "Category updated");
      setEditTarget(null);
      loadCategories();
    } catch (err) {
      toast.error(err.message || "Could not update category");
    } finally {
      setActionLoading("");
    }
  }

  function handleDeleteCategory(category) {
    setDeleteTarget(category);
  }

  async function confirmDeleteCategory() {
    if (!deleteTarget) return;
    setActionLoading("Deleting category...");
    try {
      const data = await deleteAdminCategory(deleteTarget.name, token);
      toast.success(data.message || "Category permanently deleted from the database");
      setDeleteTarget(null);
      loadCategories();
    } catch (err) {
      toast.error(err.message || "Could not delete category");
    } finally {
      setActionLoading("");
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
         <p title={category.name} className="line-clamp-2 whitespace-normal text-base font-bold text-on-surface">{category.name}</p>
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
    { key: "priority", header: "Priority", accessor: "isPriority", render: (category) => <PriorityToggle checked={Boolean(category.isPriority)} onChange={(value) => handlePriorityChange(category, value)} label={`${category.isPriority ? "Remove priority from" : "Prioritize"} ${category.name}`} /> },
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
        <AdminTableActions
          label={`Actions for ${category.name}`}
          actions={[
            { label: "View", ariaLabel: `View ${category.name}`, icon: Eye, onClick: () => handleViewCategory(category) },
            {
              label: "Edit",
              ariaLabel: `Edit ${category.name}`,
              icon: Pencil,
              onClick: () => handleEditCategory(category),
              disabled: category.source === "ingram",
              disabledTitle: "Ingram categories cannot be edited (read-only)",
            },
            { label: "Delete", ariaLabel: `Delete ${category.name}`, icon: Trash2, tone: "danger", onClick: () => handleDeleteCategory(category) },
          ]}
        />
      ),
    },
  ];

  if (view === "products" && selectedCategory) {
    const productColumns = [
      {
        key: "select",
        header: "Select",
        render: (product) => (
          <input
            type="checkbox"
            checked={selectedProducts.has(product.ingramPartNumber)}
            onChange={() => toggleProductSelection(product.ingramPartNumber)}
            aria-label={`Select ${product.ingramPartNumber}`}
            className="size-4 rounded border-outline-variant text-primary focus:ring-primary"
          />
        ),
      },
      {
        key: "name",
        header: "Product",
        sortable: true,
        accessor: "name",
        cellClassName: "font-semibold text-on-surface",
        render: (product) => (
          <div className="flex max-w-72 items-center gap-3">
            <Image
              src={product.imageUrl || FALLBACK_IMAGE}
              alt={product.name || product.description || product.ingramPartNumber}
              width={40}
              height={40}
              className="size-10 shrink-0 rounded-xl object-cover ring-1 ring-outline-variant"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-on-surface">{product.name || product.description || product.ingramPartNumber}</p>
              <p className="truncate text-meta font-normal text-on-surface-variant">{product.ingramPartNumber}</p>
            </div>
          </div>
        ),
      },
      { key: "price", header: "Price", sortable: true, accessor: "price", render: (product) => <span className="font-semibold tabular-nums text-on-surface">{money(product.price)}</span> },
      { key: "stock", header: "Stock", sortable: true, accessor: "stock", render: (product) => <StockCell stock={product.stock} /> },
      {
        key: "source",
        header: "Source",
        accessor: "source",
        render: (product) => <SourceBadge source={product.source || "manual"} />,
      },
    ];

    return (
      <Card className="overflow-hidden p-0">
        <div className="flex flex-col gap-4 border-b border-outline-variant px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1 lg:order-first">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-heading text-lg font-semibold text-on-surface">{selectedCategory.name}</h2>
              <SourceBadge source={selectedCategory.source} />
            </div>
            <p className="text-sm text-on-surface-variant">{selectedCategory.count} products in this category</p>
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
            <AdminTable
              title="Products"
              description="Review pricing and stock, or select products to sync."
              columns={productColumns}
              data={categoryProducts}
              pageSize={PAGE_SIZE}
              toolbar={(
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={categoryProducts.length > 0 && selectedProducts.size === categoryProducts.length}
                    onChange={toggleAllProducts}
                    className="size-4 rounded border-outline-variant text-primary focus:ring-primary"
                  />
                  <span className="text-label-sm font-semibold text-on-surface">Select All ({categoryProducts.length})</span>
                </label>
              )}
              hideSearch
            />
          )}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <TransparentActionLoader open={Boolean(actionLoading)} label={actionLoading} />
      {rows === null && !error ? (
        <AdminCategoriesSkeleton />
      ) : error ? (
        <Card className="p-8 text-center text-body font-regular text-rose-600">{error}</Card>
      ) : (
        <>
          <AdminTable
            title="Categories"
             description="Manage product categories and synced products."
            columns={categoryColumns}
            data={pageItems}
            pageSize={PAGE_SIZE}
            page={safePage}
            onPageChange={setPage}
            totalPages={totalPages}
            totalItems={filteredRows.length}
            toolbar={(
               <div className="flex flex-wrap items-center justify-end gap-3">
                  <div className="relative min-w-[14rem] flex-1 sm:max-w-md lg:max-w-md">
                   <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                   <Input value={keyword} onChange={(event) => handleSearchChange(event.target.value)} placeholder="Search categories" aria-label="Search categories" className="h-10 pl-10 shadow-sm" />
                 </div>
              <Button variant="outline" onClick={handleOpenAddModal} className="shrink-0 gap-1.5"><Plus className="size-4" /> Add Category</Button>
                 <div className="relative shrink-0">
                   <Button asChild href="/admin/categories/sync" className="min-w-[160px] whitespace-nowrap"><RefreshCw className="size-4" /> Sync from Ingram</Button>
                   {syncing && syncProgress.percent > 0 ? <div className="absolute bottom-0 left-0 h-1 w-full overflow-hidden rounded-b-md bg-primary/20"><div className="h-full bg-primary transition-all duration-300" style={{ width: `${syncProgress.percent}%` }} /></div> : null}
                 </div>
               </div>
             )}
             inlineToolbar
             toolbarInHeader
             secondaryToolbar={(
               <FilterTabs
                 value={sourceFilter}
                 onChange={(value) => { setSourceFilter(value); setPage(1); }}
                 tabs={[
                   { value: "all", label: "All" },
                   { value: "manual", label: "Manual" },
                   { value: "ingram", label: "Ingram" },
                 ]}
               />
             )}
             hideSearch
          />
        </>
      )}

      <AddItemModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        type="category"
        categories={[]}
        onSubmit={handleCreateCategory}
        submitting={submitting}
      />

      <CategoryEditModal
        key={editTarget ? editTarget.name : "closed"}
        open={Boolean(editTarget)}
        category={editTarget}
        onClose={() => setEditTarget(null)}
        onSubmit={confirmSaveCategory}
      />

      <ConfirmActionDialog
        open={Boolean(deleteTarget)}
        title="Delete category"
        message="Are you sure you want to delete this category?"
        confirmLabel="Delete"
        loading={Boolean(actionLoading)}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDeleteCategory}
      />
    </div>
  );
}

function StockCell({ stock }) {
  const qty = Number(stock) || 0;
  const tone = qty === 0 ? "Out of Stock" : qty <= 10 ? "Low Stock" : "In Stock";
  return (
    <div className="flex items-center gap-2">
      <span className="font-semibold tabular-nums text-on-surface">{qty}</span>
      <Badge tone={tone}>{tone}</Badge>
    </div>
  );
}

function CategoryEditModal({ open, category, onClose, onSubmit }) {
  const [name, setName] = useState(category?.name || "");
  const [description, setDescription] = useState(category?.description || "");
  const [icon, setIcon] = useState(category?.icon || "");
  const [isActive, setIsActive] = useState(category?.isActive ?? category?.status === "Active");
  const [submitting, setSubmitting] = useState(false);

  if (!open || !category) return null;

  function handleSubmit(event) {
    if (event) event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Category name is required");
      return;
    }
    setSubmitting(true);
    onSubmit({
      name: trimmedName,
      description: description.trim(),
      icon,
      isActive,
    }).finally(() => setSubmitting(false));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={`Edit category ${category.name}`}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <Card className="relative w-full max-w-md p-0">
        <div className="border-b border-outline-variant px-5 py-4">
          <h2 className="font-heading text-lg font-semibold text-on-surface">Edit Category</h2>
          <p className="text-sm text-on-surface-variant">Update category details below.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-category-name">Name</Label>
            <Input id="edit-category-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Category name" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-category-description">Description</Label>
            <Textarea id="edit-category-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Short description" rows={3} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-category-icon">Icon (emoji)</Label>
            <Input id="edit-category-icon" value={icon} onChange={(event) => setIcon(event.target.value)} placeholder="e.g. 🔧" />
          </div>
          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} className="size-4 rounded border-outline-variant text-primary focus:ring-primary" />
            <span className="text-body font-medium text-on-surface">Active (visible on website)</span>
          </label>
          <div className="flex justify-end gap-3 border-t border-outline-variant pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={submitting} className="gap-1.5"><Save className="size-4" /> {submitting ? "Saving..." : "Save Changes"}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
