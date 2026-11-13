"use client";

import Image from "next/image";
import { RefreshCw, Search, ChevronDown, Plus, ArrowLeft, Eye, Pencil, Save, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminTable, AdminTableActions } from "@/components/admin-table";
import { ConfirmActionDialog, TransparentActionLoader } from "@/components/action-feedback";
import { Button, Card, FilterTabs, Input, Textarea, Label, SourceBadge, Badge } from "@/components/ui";
import { AddItemModal } from "@/components/add-item-modal";
import { AdminCategoriesSkeleton } from "@/components/skeletons";
import { getAdminCategories, getCategoryProducts, createManualCategory, toggleCategoryActive, updateAdminCategory, deleteAdminCategory } from "@/lib/api";
import { FALLBACK_IMAGE } from "@/lib/product-mapper";
import { money } from "@/lib/utils";
import { useAdminAuthStore } from "@/store/admin-auth-store";

const PAGE_SIZE = 10;

const categoryColumns = [
  { key: "name", header: "Name", sortable: true, accessor: "name", cellClassName: "font-semibold text-on-surface" },
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
    cellClassName: "tabular-nums font-semibold",
    render: (category) => (
      <span className="font-medium text-on-surface">{category.count || 0}</span>
    ),
  },
  {
    key: "lastSynced",
    header: "Last Synced",
    accessor: "lastSynced",
    render: (category) => (
      <span className="text-sm text-on-surface-variant">
        {category.lastSynced ? new Date(category.lastSynced).toLocaleDateString() : "—"}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    accessor: "isActive",
    render: (category) => (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${category.isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" : "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"}`}>
        {category.isActive ? "Active" : "Inactive"}
      </span>
    ),
  },
];

const productColumns = [
  { key: "serial", header: "#", sortable: true, accessor: "serial", cellClassName: "font-semibold tabular-nums text-on-surface" },
  {
    key: "name",
    header: "Product",
    sortable: true,
    accessor: "name",
    render: (product) => (
      <div className="flex min-w-0 max-w-64 items-center gap-3">
        <Image src={product.image || FALLBACK_IMAGE} alt={product.name} width={48} height={48} className="size-10 shrink-0 rounded-lg object-cover ring-1 ring-outline-variant" />
        <div className="min-w-0">
          <p title={product.name} className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-base font-bold text-on-surface">{product.name}</p>
          <p className="mt-0.5 truncate text-xs font-bold text-on-surface-variant">SKU: {product.sku}</p>
        </div>
      </div>
    ),
  },
  {
    key: "source",
    header: "Source",
    accessor: "source",
    render: (product) => <SourceBadge source={product.source} />,
  },
  {
    key: "price",
    header: "Price",
    sortable: true,
    accessor: "price",
    cellClassName: "font-semibold tabular-nums text-on-surface",
    render: (product) => <span>{money(product.price)}</span>,
  },
  {
    key: "stock",
    header: "Stock",
    sortable: true,
    accessor: "stock",
    cellClassName: "tabular-nums",
    render: (product) => <span>{product.stock}</span>,
  },
  {
    key: "status",
    header: "Status",
    accessor: "isActive",
    render: (product) => (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${product.isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" : "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"}`}>
        {product.isActive ? "Active" : "Inactive"}
      </span>
    ),
  },
];

export default function AdminCategoriesPage() {
  const token = useAdminAuthStore((state) => state.token);
  const [rows, setRows] = useState(null);
  const [pageItems, setPageItems] = useState(null);
  const [filteredRows, setFilteredRows] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filteredRowsLength, setFilteredRowsLength] = useState(0);
  const [search, setSearch] = useState("");
  const [view, setView] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState(null);
  const [actionLoading, setActionLoading] = useState("");
  const [filterLoading, setFilterLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadCategories = useCallback(async () => {
    try {
      const data = await getAdminCategories(token);
      const categories = data.categories || [];
      setPageItems(categories);
      setFilteredRows(categories);
      setRows(categories);
      setTotalPages(1);
      setFilteredRowsLength(categories.length);
      setError(null);
    } catch (err) {
      setError(err.message || "Could not load categories");
      setRows([]);
      setPageItems([]);
      setFilteredRows([]);
    }
  }, [token]);

  const loadCategoryProducts = useCallback(async (category) => {
    try {
      setSelectedCategory(category);
      setView("products");
      const data = await getCategoryProducts(category.id, token);
      setCategoryProducts(data.products || []);
    } catch (err) {
      toast.error(err.message || "Could not load category products");
      setCategoryProducts([]);
    }
  }, [token]);

  const handleBackToList = () => {
    setView("list");
    setSelectedCategory(null);
    setCategoryProducts(null);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (!value) {
      setFilteredRows(rows || []);
      setFilteredRowsLength(rows ? rows.length : 0);
    } else {
      const filtered = rows?.filter(
        (c) =>
          c.name.toLowerCase().includes(value.toLowerCase()) ||
          (c.description && c.description.toLowerCase().includes(value.toLowerCase()))
      ) || [];
      setFilteredRows(filtered);
      setFilteredRowsLength(filtered.length);
    }
  };

  const handleViewFilterChange = useCallback((value) => {
    setFilterLoading(true);
    setView(value);
    setPage(1);
    
    // Simple filtering logic
    if (value === "all") {
      setFilteredRows(rows || []);
      setFilteredRowsLength(rows ? rows.length : 0);
    } else if (value === "active") {
      const activeRows = rows?.filter(c => c.isActive) || [];
      setFilteredRows(activeRows);
      setFilteredRowsLength(activeRows.length);
    } else if (value === "inactive") {
      const inactiveRows = rows?.filter(c => !c.isActive) || [];
      setFilteredRows(inactiveRows);
      setFilteredRowsLength(inactiveRows.length);
    }
    
    setTimeout(() => setFilterLoading(false), 300);
  }, [rows]);

  const handleToggleCategory = useCallback(async (category) => {
    try {
      setActionLoading(`${category.isActive ? "Deactivating" : "Activating"}...`);
      // Call toggleCategoryActive API
      await toggleCategoryActive(category.id, token);
      toast.success(`Category ${category.isActive ? "deactivated" : "activated"} successfully`);
      
      // Refresh categories
      await loadCategories();
    } catch (err) {
      toast.error(err.message || "Could not update category status");
    } finally {
      setActionLoading("");
    }
  }, [token, loadCategories]);

  useEffect(() => {
    loadCategories();
  }, [token]);

  // -------------------------------------------------
  //  CATEGORY LIST VIEW
  // -------------------------------------------------
  if (view === "list" || view === "all" || view === "active" || view === "inactive") {
    return (
      <div className="space-y-6">
        <TransparentActionLoader open={Boolean(actionLoading)} label={actionLoading} />
        <TransparentActionLoader open={filterLoading} label="Switching filter..." />
        
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
              data={filteredRows}
              pageSize={PAGE_SIZE}
              page={page}
              onPageChange={setPage}
              totalPages={totalPages}
              totalItems={filteredRowsLength}
              toolbar={(
                <>
                  <div className="relative min-w-0 w-full flex-1 sm:max-w-md lg:max-w-sm">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                    <Input 
                      placeholder="Search categories..." 
                      value={search}
                      onChange={handleSearch}
                      aria-label="Search categories" 
                      className="h-10 pl-10 shadow-sm" 
                    />
                  </div>
                  <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 md:contents">
                    <Button 
                      onClick={() => setView("add")}
                      className="h-10 w-full min-w-0 gap-1 px-1 text-xs sm:px-3 sm:text-sm md:w-auto"
                    >
                      <Plus className="size-3.5 shrink-0 sm:size-4" /> 
                      <span className="truncate">Add Category</span>
                    </Button>
                  </div>
                </>
              )}
              hideSearch
              disableInitialSort
              inlineToolbar
              toolbarInHeader
              secondaryToolbar={(
                <div className="w-full overflow-x-auto whitespace-nowrap">
                  <FilterTabs
                    value={view}
                    onChange={handleViewFilterChange}
                    tabs={[
                      { value: "all", label: "All" },
                      { value: "active", label: "Active" },
                      { value: "inactive", label: "Inactive" },
                    ]}
                  />
                </div>
              )}
              rowActions={(category) => [
                {
                  label: "View Products",
                  ariaLabel: `View products in ${category.name}`,
                  icon: Eye,
                  onClick: () => loadCategoryProducts(category),
                },
                {
                  label: "Edit",
                  ariaLabel: `Edit ${category.name}`,
                  icon: Pencil,
                  href: `/admin/categories/${category.id}`,
                  disabled: category.source === "ingram",
                  disabledTitle: "Ingram categories cannot be edited (read-only)",
                },
                {
                  label: category.isActive ? "Deactivate" : "Activate",
                  ariaLabel: `${category.isActive ? "Deactivate" : "Activate"} ${category.name}`,
                  icon: category.isActive ? Save : RefreshCw,
                  onClick: () => handleToggleCategory(category),
                },
                {
                  label: "Delete",
                  ariaLabel: `Delete ${category.name}`,
                  icon: Trash2,
                  tone: "danger",
                  onClick: () => {
                    // Simple delete handler
                    if (category.source === "ingram") {
                      toast.error("Ingram categories cannot be deleted");
                    } else {
                      toast.info("Delete functionality to be implemented");
                    }
                  },
                },
              ]}
            />
          </>
        )}
      </div>
    );
  }

  // -------------------------------------------------
  //  CATEGORY PRODUCTS VIEW
  // -------------------------------------------------
  if (view === "products") {
    return (
      <Card className="overflow-hidden p-0">
        <div className="flex flex-col gap-3 border-b border-outline-variant px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-on-surface">{selectedCategory.name}</h2>
            <p className="mt-1 text-sm text-on-surface-variant">{selectedCategory.count} products in this category</p>
            {selectedCategory.description ? <p className="mt-1 max-w-2xl text-sm text-on-surface-variant">{selectedCategory.description}</p> : null}
          </div>
          <Button variant="outline" onClick={handleBackToList} className="shrink-0 gap-1.5 self-start">
            <ArrowLeft className="size-4" /> Back to Categories
          </Button>
        </div>

        <div className="p-4 sm:p-5">
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