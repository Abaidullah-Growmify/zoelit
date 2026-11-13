"use client";

import Image from "next/image";
import { Search, Plus, Eye, Pencil, Trash2, RefreshCw, Save, ChevronDown } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminTable } from "@/components/admin-table";
import { AddItemModal } from "@/components/add-item-modal";
import { ConfirmActionDialog, TransparentActionLoader } from "@/components/action-feedback";
import { Button, Card, FilterTabs, Input, SourceBadge } from "@/components/ui";
import { AdminCategoriesSkeleton } from "@/components/skeletons";
import { createManualCategory, getAdminCategories, getCategoryProducts, startCategoryDiscovery, getSyncStatus, toggleCategoryActive, toggleProductActive, updateAdminCategory } from "@/lib/api";
import { safeImageSrc } from "@/components/clean-product-image";
import { money } from "@/lib/utils";
import { useAdminAuthStore } from "@/store/admin-auth-store";

const PAGE_SIZE = 10;

function buildCategoryColumns(handleToggleCategory) {
  return [
  { 
    key: "serial", 
    header: "#", 
    sortable: true, 
    accessor: "serial", 
    cellClassName: "font-semibold tabular-nums text-on-surface" 
  },
  {
    key: "name",
    header: "Name",
    sortable: true,
    accessor: "name",
    render: (category) => (
      <div className="min-w-0 max-w-64">
        <p
          title={category.name}
          className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold text-on-surface sm:text-base sm:font-bold"
        >
          {category.name}
        </p>
        {category.slug && (
          <p className="mt-0.5 truncate text-[11px] font-medium text-on-surface-variant sm:text-xs sm:font-bold">{category.slug}</p>
        )}
      </div>
    ),
  },
  {
    key: "source",
    header: "Source",
    accessor: "source",
    render: (category) => (
      <SourceBadge source={category.source || "manual"} />
    ),
  },
  {
    key: "count",
    header: "Products",
    sortable: true,
    accessor: "count",
    cellClassName: "text-xs sm:text-sm tabular-nums font-semibold",
    render: (category) => (
      <span className="font-semibold text-on-surface">{category.count || 0}</span>
    ),
  },
  {
    key: "lastSynced",
    header: "Last Synced",
    accessor: "lastSynced",
    render: (category) => (
      <span className="text-xs text-on-surface-variant sm:text-sm">
        {category.lastSynced ? new Date(category.lastSynced).toLocaleDateString() : "—"}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    accessor: "isActive",
    render: (category) => (
      <div className="relative inline-flex">
        <select
          value={category.isActive ? "active" : "inactive"}
          onChange={() => handleToggleCategory(category)}
          className={`h-8 appearance-none rounded-lg border px-3 pr-7 text-xs font-medium transition-colors ${
            category.isActive
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
              : "border-rose-200 bg-rose-50 text-rose-700 focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
          }`}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <ChevronDown className={`pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 ${category.isActive ? "text-emerald-600" : "text-rose-600"}`} />
      </div>
    ),
  },
  ];
}

export default function AdminCategoriesPage() {
  const token = useAdminAuthStore((state) => state.token);
  const [rows, setRows] = useState(null);
  const [filteredRows, setFilteredRows] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [view, setView] = useState("list"); // "list" for categories list, "products" for category products
  const [sourceFilter, setSourceFilter] = useState("all"); // For Manual/Ingram filter
  const [statusFilter, setStatusFilter] = useState("all"); // For Active/Inactive filter
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState(null);
  const [actionLoading, setActionLoading] = useState("");
  const [filterLoading, setFilterLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ percent: 0, label: "" });
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [savingCategory, setSavingCategory] = useState(false);

  // Apply all filters (search, source, status). Defined before the data
  // loader so the callback can safely use it without stale initialization.
  const applyFilters = useCallback((categories, searchTerm, source, status) => {
    if (!categories) {
      setFilteredRows([]);
      return;
    }

    let filtered = categories;
    if (searchTerm) {
      const normalized = searchTerm.toLowerCase();
      filtered = filtered.filter((category) =>
        category.name.toLowerCase().includes(normalized) ||
        (category.slug && category.slug.toLowerCase().includes(normalized)) ||
        (category.description && category.description.toLowerCase().includes(normalized))
      );
    }
    if (source !== "all") filtered = filtered.filter((category) => category.source === source);
    if (status !== "all") filtered = filtered.filter((category) => status === "active" ? category.isActive : !category.isActive);

    setFilteredRows(filtered.map((category, index) => ({ ...category, serial: index + 1 })));
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const data = await getAdminCategories(token);
       const categories = Array.isArray(data?.categories) ? data.categories : Array.isArray(data) ? data : [];
      
      // Newest categories first, then number the visible rows 1, 2, 3...
      const sortedCategories = [...categories].sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });

      const categoriesWithSerial = sortedCategories.map((category, index) => ({
        ...category,
        serial: index + 1,
        slug: category.slug || category.name.toLowerCase().replace(/\s+/g, '-')
      }));
      
      setRows(categoriesWithSerial);
      applyFilters(categoriesWithSerial, search, sourceFilter, statusFilter);
      setError(null);
    } catch (err) {
      setError(err.message || "Could not load categories");
      setRows([]);
      setFilteredRows([]);
    }
  }, [token, search, sourceFilter, statusFilter, applyFilters]);

  const loadCategoryProducts = useCallback(async (category) => {
    try {
      setSelectedCategory(category);
      setView("products");
      setCategoryProducts(null); // Reset to loading state
      
      // API expects categoryName, not categoryId
      const categoryName = category.name;
      if (!categoryName) {
        throw new Error("Category name not found");
      }
      
      // Call API with category name
      const data = await getCategoryProducts(categoryName, {}, token);
      setCategoryProducts(data.products || data.data || []);
    } catch (err) {
      toast.error(err.message || "Could not load category products");
      setCategoryProducts([]);
    }
  }, [token]);

  useEffect(() => {
    function resetToCategoriesList() {
      setView("list");
      setSelectedCategory(null);
      setCategoryProducts(null);
    }
    window.addEventListener("admin:categories-reset", resetToCategoriesList);
    return () => window.removeEventListener("admin:categories-reset", resetToCategoriesList);
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    setPage(1);
    
    if (rows) {
      applyFilters(rows, value, sourceFilter, statusFilter);
    }
  };

  const handleSourceFilterChange = (value) => {
    setFilterLoading(true);
    setSourceFilter(value);
    setPage(1);
    
    if (rows) {
      applyFilters(rows, search, value, statusFilter);
    }
    
    setTimeout(() => setFilterLoading(false), 300);
  };

  const handleStatusFilterChange = (value) => {
    setFilterLoading(true);
    setStatusFilter(value);
    setPage(1);
    
    if (rows) {
      applyFilters(rows, search, sourceFilter, value);
    }
    
    setTimeout(() => setFilterLoading(false), 300);
  };

  const handleToggleCategory = useCallback(async (category) => {
    if (!category?.name || !token) return;
    // Close the dialog immediately; the list refreshes once the API finishes.
    setDeleteTarget(null);
    try {
      const data = await toggleCategoryActive(category.name, token);
      toast.success(
        data.message ||
          `Category ${category.isActive ? "deactivated" : "activated"} successfully`
      );
      await loadCategories();
    } catch (err) {
      toast.error(err.message || "Could not update category status");
    }
  }, [loadCategories, token]);

  const categoryColumns = useMemo(
    () => buildCategoryColumns(handleToggleCategory),
    [handleToggleCategory]
  );

  const handleToggleProductStatus = useCallback(async (product) => {
    const partNumber = product?.ingramPartNumber;
    if (!partNumber || !token) return;
    try {
      const data = await toggleProductActive(partNumber, token);
      toast.success(data.message || "Product status updated");
      if (selectedCategory?.name) {
        const refreshed = await getCategoryProducts(selectedCategory.name, {}, token);
        setCategoryProducts(refreshed.products || refreshed.data || []);
      }
    } catch (err) {
      toast.error(err.message || "Could not update product status");
    }
  }, [selectedCategory, token]);

  const productColumns = useMemo(() => [
    {
      key: "name",
      header: "Product",
      sortable: true,
      accessor: "name",
      render: (product) => (
        <div className="flex min-w-0 max-w-64 items-center gap-3">
          <Image
            src={safeImageSrc(product.imageUrl)}
            alt={product.name || product.description || product.ingramPartNumber}
            width={48}
            height={48}
            className="size-8 shrink-0 rounded-lg object-cover ring-1 ring-outline-variant sm:size-10"
          />
          <div className="min-w-0">
            <p
              title={product.name || product.description || product.ingramPartNumber}
              className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-xs font-medium text-on-surface sm:text-sm"
            >
              {product.name || product.description || product.ingramPartNumber}
            </p>
            <p className="mt-0.5 truncate text-[10px] font-normal text-on-surface-variant sm:text-xs">
              {product.ingramPartNumber || product.sku}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "subCategory",
      header: "Sub-Category",
      sortable: true,
      accessor: "subCategory",
      render: (product) => (
        <span className="text-xs text-on-surface sm:text-sm">{product.subCategory || "—"}</span>
      ),
    },
    {
      key: "price",
      header: "Price",
      sortable: true,
      accessor: "price",
      cellClassName: "text-xs sm:text-sm font-semibold tabular-nums text-on-surface",
      render: (product) => <span>{money(product.price)}</span>,
    },
    {
      key: "stock",
      header: "Stock",
      sortable: true,
      accessor: "stock",
      cellClassName: "text-xs sm:text-sm tabular-nums",
      render: (product) => <StockCell stock={product.stock} />,
    },
    {
      key: "status",
      header: "Status",
      accessor: "isActive",
      render: (product) => (
        <span className="relative inline-flex">
          <select
            value={product.isActive ? "active" : "inactive"}
            onChange={() => handleToggleProductStatus(product)}
            className={`h-8 appearance-none rounded-lg border px-3 pr-7 text-xs font-medium transition-colors ${
              product.isActive
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                : "border-rose-200 bg-rose-50 text-rose-700 focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
            }`}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <ChevronDown className={`pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 ${product.isActive ? "text-emerald-600" : "text-rose-600"}`} />
        </span>
      ),
    },
    {
      key: "source",
      header: "Source",
      accessor: "source",
      render: (product) => <SourceBadge source={product.source || "manual"} />,
    },
  ], [handleToggleProductStatus]);

  const handleSaveCategory = async (payload) => {
    if (!token) return;
    setSavingCategory(true);
    try {
      if (editingCategory) {
        await updateAdminCategory(editingCategory.name, payload, token);
        toast.success("Category updated successfully");
      } else {
        await createManualCategory(payload, token);
        toast.success("Category created successfully");
      }
      setAddModalOpen(false);
      setEditingCategory(null);
      setPage(1);
      await loadCategories();
    } catch (err) {
      toast.error(err.message || "Could not create category");
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteTarget) return;
    
    try {
      setDeleting(true);
      // In real implementation, call deleteAdminCategory API
      toast.success("Category deleted successfully");
      setDeleteTarget(null);
      
      // Refresh categories
      await loadCategories();
    } catch (err) {
      toast.error(err.message || "Could not delete category");
    } finally {
      setDeleting(false);
    }
  };

  // Handle categories sync from Ingram
  const handleCategoriesSync = async () => {
    try {
      setSyncing(true);
      setSyncProgress({ percent: 0, label: "Starting categories sync..." });
      
      const data = await startCategoryDiscovery(token);
      toast.success(data.message || "Categories discovery/sync started");
      
      // Start polling for sync progress
      pollSyncProgress();
    } catch (err) {
      toast.error(err.message || "Could not start categories sync");
      setSyncing(false);
      setSyncProgress({ percent: 0, label: "" });
    }
  };

  // Poll sync progress
  const pollSyncProgress = () => {
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max
    
    const checkProgress = async () => {
      attempts++;
      try {
        const data = await getSyncStatus(token);
        const sync = data.sync?.categories || data.sync?.catalog;
        
        if (sync?.status === "completed" || sync?.status === "failed" || attempts >= maxAttempts) {
          setSyncing(false);
          setSyncProgress({ percent: 100, label: sync?.status === "completed" ? "Sync completed!" : "Sync ended" });
          
          // Refresh categories after sync
          await loadCategories();
          
          setTimeout(() => setSyncProgress({ percent: 0, label: "" }), 2000);
        } else if (sync?.status === "processing" || sync?.status === "started") {
          const processed = sync.totalProcessed || sync.processed || 0;
          const total = sync.total || sync.totalToProcess || 100;
          const percent = Math.min(95, Math.round((processed / Math.max(total, 1)) * 100));
          
          setSyncProgress({ 
            percent, 
            label: `Synced ${processed} of ${total} categories` 
          });
          
          // Continue polling
          setTimeout(checkProgress, 3000);
        } else {
          // Continue polling
          setTimeout(checkProgress, 3000);
        }
      } catch (err) {
        if (attempts >= maxAttempts) {
          setSyncing(false);
          setSyncProgress({ percent: 0, label: "" });
        } else {
          setTimeout(checkProgress, 3000);
        }
      }
    };
    
    // Start polling
    setTimeout(checkProgress, 2000);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCategories();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadCategories]);

  // -------------------------------------------------
  //  CATEGORY LIST VIEW
  // -------------------------------------------------
  if (view === "list") {
    return (
      <div className="space-y-6">
        <TransparentActionLoader open={Boolean(actionLoading)} label={actionLoading} />
        <TransparentActionLoader open={filterLoading} label="Switching filter..." />
        <TransparentActionLoader open={syncing} label={syncProgress.label} />
        
        {rows === null && !error ? (
           <AdminCategoriesSkeleton rows={PAGE_SIZE} />
        ) : error ? (
          <Card className="p-8 text-center text-body font-regular text-rose-600">{error}</Card>
        ) : (
          <>
            <AdminTable
              title="Categories"
              description="Manage product categories and synced products."
              columns={categoryColumns}
              data={filteredRows}
              pageSize={PAGE_SIZE}
              page={page}
              onPageChange={setPage}
              totalPages={Math.ceil(filteredRows.length / PAGE_SIZE)}
              totalItems={filteredRows.length}
              toolbar={(
                <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                  <div className="relative min-w-0 w-full sm:max-w-md lg:max-w-sm">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                    <Input 
                      placeholder="Search categories..." 
                      value={search}
                      onChange={handleSearch}
                      aria-label="Search categories" 
                      className="h-10 pl-10 shadow-sm" 
                    />
                  </div>
                  <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:shrink-0">
                    <Button 
                       onClick={() => { setEditingCategory(null); setAddModalOpen(true); }}
                      className="h-10 w-full min-w-0 gap-1 px-2 text-xs sm:w-auto sm:px-3 sm:text-sm"
                    >
                      <Plus className="size-3.5 shrink-0 sm:size-4" /> 
                      <span className="truncate">Add Category</span>
                    </Button>
                    <Button 
                      asChild 
                      href="/admin/categories/sync" 
                      className="h-10 w-full min-w-0 gap-1 whitespace-nowrap px-2 text-xs sm:w-auto sm:px-3 sm:text-sm"
                    >
                      <RefreshCw className="size-3.5 shrink-0 sm:size-4" />
                      <span className="truncate sm:hidden">Sync</span>
                      <span className="hidden truncate sm:inline">Sync from Ingram</span>
                    </Button>
                  </div>
                </div>
              )}
              hideSearch
              disableInitialSort
              inlineToolbar
              toolbarInHeader
              secondaryToolbar={(
                <div className="w-full overflow-x-auto whitespace-nowrap">
                  <FilterTabs
                    value={sourceFilter}
                    onChange={handleSourceFilterChange}
                    tabs={[
                      { value: "all", label: "All" },
                      { value: "manual", label: "Manual" },
                      { value: "ingram", label: "Ingram" },
                    ]}
                  />
                </div>
              )}
              rowActions={(category) => {
                // Common actions for both Manual and Ingram categories
                const categorySource = String(category.source || "").toLowerCase();
                const isIngramCategory = categorySource === "ingram" || category.isIngram === true;
                const commonActions = [
                  {
                    label: "View",
                    ariaLabel: `View ${category.name}`,
                    icon: Eye,
                    onClick: () => loadCategoryProducts(category),
                  },
                  {
                    label: "Edit",
                    ariaLabel: `Edit ${category.name}`,
                    icon: Pencil,
                    disabled: isIngramCategory,
                    disabledTitle: isIngramCategory 
                      ? "Ingram categories cannot be edited (read-only)" 
                      : "",
                    onClick: isIngramCategory ? () => {} : () => { setEditingCategory(category); setAddModalOpen(true); },
                  },
                  {
                    label: "Deactivate",
                    ariaLabel: `Deactivate ${category.name}`,
                    icon: Trash2,
                    tone: "danger",
                    onClick: () => setDeleteTarget(category),
                  },
                ];
                
                return commonActions;
              }}
            />
          </>
        )}

        {/* Deactivate Confirmation Dialog */}
        <ConfirmActionDialog
          open={Boolean(deleteTarget)}
          title={deleteTarget?.source === "ingram" ? "Deactivate Ingram category?" : "Deactivate manual category?"}
          message={
            deleteTarget?.source === "ingram"
              ? `${deleteTarget?.name || "This category"} will be deactivated and kept in the database.`
              : `${deleteTarget?.name || "This category"} will be deactivated and kept in the database.`
          }
          confirmLabel="Deactivate"
          cancelLabel="Cancel"
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => handleToggleCategory(deleteTarget)}
        />

        <AddItemModal
          open={addModalOpen}
          onClose={() => { setAddModalOpen(false); setEditingCategory(null); }}
          type="category"
          onSubmit={handleSaveCategory}
          submitting={savingCategory}
          initialData={editingCategory}
          editing={Boolean(editingCategory)}
        />
      </div>
    );
  }

  // -------------------------------------------------
  //  CATEGORY PRODUCTS VIEW
  // -------------------------------------------------
  if (view === "products") {
    return (
      <Card className="overflow-hidden p-0">
        <div className="flex flex-col gap-2 border-b border-outline-variant px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5">
          <div className="min-w-0 flex-1">
            <h2 className="break-words font-heading text-sm font-bold tracking-tight text-on-surface sm:text-base md:text-lg">
              {selectedCategory.name}
            </h2>
            <p className="mt-1 text-xs text-on-surface-variant sm:text-sm">
              {selectedCategory.count || categoryProducts?.length || 0} products in this category
            </p>
            {selectedCategory.description ? (
              <p className="mt-1 max-w-2xl text-xs text-on-surface-variant sm:text-sm">{selectedCategory.description}</p>
            ) : null}
          </div>
        </div>

        <div className="min-w-0 p-3 sm:p-5">
          {categoryProducts === null ? (
            <AdminCategoriesSkeleton variant="products" />
          ) : (
            <AdminTable
              title="Products"
              description="Review pricing, stock, and sub-category status."
              columns={productColumns}
              data={categoryProducts}
              pageSize={PAGE_SIZE}
              hideSearch
            />
          )}
        </div>
      </Card>
    );
  }

  return null;
}

function StockCell({ stock }) {
  const qty = Number(stock) || 0;
  return (
    <div className="flex items-center gap-2">
      <span className="font-semibold tabular-nums text-on-surface">{qty}</span>
      {qty === 0 ? (
        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
          Out of Stock
        </span>
      ) : null}
    </div>
  );
}
