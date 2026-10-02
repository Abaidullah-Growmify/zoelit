"use client";

import Image from "next/image";
import { Eye, Pencil, RefreshCw, Search, ChevronDown, Plus } from "lucide-react";
import { useCallback, useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { AdminTable } from "@/components/admin-table";
import { Button, Card, FilterTabs, Input, SourceBadge } from "@/components/ui";
import { AddItemModal } from "@/components/add-item-modal";
import { AdminProductsSkeleton } from "@/components/skeletons";
import { InfoActionDialog } from "@/components/action-feedback";
import {
   getAdminProducts,
   getAdminCategories,
   startPriceSync,
  createManualProduct,
  toggleProductActive,
  getSyncStatus,
} from "@/lib/api";
import { FALLBACK_IMAGE } from "@/lib/product-mapper";
import { money } from "@/lib/utils";
import { useAdminAuthStore } from "@/store/admin-auth-store";

const PAGE_SIZE = 10;
const MIN_SKELETON_MS = 650;

export default function AdminProductsPage() {
  const token = useAdminAuthStore((state) => state.token);
  const [rows, setRows] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
const [syncing, setSyncing] = useState(false);
  const [, setSyncProgress] = useState({ percent: 0, label: "" });
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sourceFilter, setSourceFilter] = useState("all");
  const [categoryError, setCategoryError] = useState("");
  const pollRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword.trim()), 400);
    return () => clearTimeout(timer);
  }, [keyword]);

  const productQuery = useCallback(() => ({
    page,
    limit: PAGE_SIZE,
    keyword: debouncedKeyword || undefined,
    source: sourceFilter !== "all" ? sourceFilter : undefined,
  }), [page, debouncedKeyword, sourceFilter]);

  useEffect(() => {
    let active = true;
    if (!token) return;
    Promise.all([
      getAdminProducts(productQuery(), token),
      new Promise((resolve) => window.setTimeout(resolve, MIN_SKELETON_MS)),
    ])
      .then(([data]) => {
        if (!active) return;
        setRows(toRows(data.products, page, PAGE_SIZE));
        setTotalPages(data.pagination?.totalPages ?? 1);
        setTotalItems(data.pagination?.total ?? 0);
        setError("");
      })
      .catch((loadError) => {
        if (!active) return;
        setError(loadError.message || "Could not load products.");
        setRows([]);
      });
    return () => { active = false; };
  }, [token, page, productQuery]);


  function handleSearchChange(value) {
    setKeyword(value);
    setPage(1);
  }

  async function handleOpenAddModal() {
    try {
      const data = await getAdminCategories(token);
      setCategories(data.categories || []);
    } catch {
      setCategories([]);
    }
    setAddModalOpen(true);
  }

async function handlePriceSync() {
    setSyncing(true);
    setSyncProgress({ percent: 0, label: "Starting price sync..." });
    try {
      const data = await startPriceSync(token);
      toast.success(data.message || "Price synchronization started");
      pollSyncProgress("price");
    } catch (syncError) {
      toast.error(syncError.message || "Could not start price sync");
      setSyncing(false);
      setSyncProgress({ percent: 0, label: "" });
    }
  }

  function pollSyncProgress(syncType = "price") {
    if (pollRef.current) clearInterval(pollRef.current);
    let attempts = 0;
    const maxAttempts = 120;
    pollRef.current = setInterval(async () => {
      attempts++;
      try {
        const data = await getSyncStatus(token);
         const sync = data.sync?.[syncType];
         if (sync?.status === "completed" || sync?.status === "failed" || attempts >= maxAttempts) {
          clearInterval(pollRef.current);
          pollRef.current = null;
          setSyncing(false);
           setSyncProgress({ percent: 100, label: sync?.status === "completed" ? "Done!" : "Sync ended" });
          refreshProducts();
          setTimeout(() => setSyncProgress({ percent: 0, label: "" }), 2000);
         } else if (sync?.status === "processing" || sync?.status === "started") {
           const processed = sync.totalProcessed || 0;
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

  async function handleCreateProduct(payload) {
    setSubmitting(true);
    try {
      await createManualProduct(payload, token);
      toast.success("Product created successfully");
      setAddModalOpen(false);
      refreshProducts();
    } catch (err) {
      toast.error(err.message || "Failed to create product");
    } finally {
      setSubmitting(false);
    }
  }

  function refreshProducts() {
    if (!token) return;
    getAdminProducts(productQuery(), token)
      .then((data) => {
        setRows(toRows(data.products, page, PAGE_SIZE));
        setTotalPages(data.pagination?.totalPages ?? 1);
        setTotalItems(data.pagination?.total ?? 0);
      })
      .catch(() => {});
  }

async function handleToggleProduct(ingramPartNumber) {
    try {
      const data = await toggleProductActive(ingramPartNumber, token);
      toast.success(data.message);
      refreshProducts();
    } catch (err) {
      if (err.status === 409 && err.message) {
        setCategoryError(err.message);
      } else {
        toast.error(err.message || "Could not toggle product");
      }
    }
  }

  const columns = [
    { key: "serial", header: "#", sortable: true, accessor: "serial", cellClassName: "font-semibold tabular-nums text-on-surface" },
    {
      key: "name",
      header: "Product",
      sortable: true,
      accessor: "name",
      render: (product) => <ProductCell product={product} />,
    },
    {
      key: "source",
      header: "Source",
      accessor: "source",
      render: (product) => <SourceBadge source={product.source} />,
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      accessor: "category",
      render: (product) => (
        <span className="flex flex-wrap items-center gap-1.5">
          <span>{product.category}</span>
          {product.categorySynced === false ? (
            <span
              title="This category is not saved in the database. Sync it from Ingram to link these products."
              className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
            >
              Not synced
            </span>
          ) : null}
        </span>
      ),
    },
    { key: "price", header: "Price", sortable: true, accessor: "price", cellClassName: "font-semibold tabular-nums text-on-surface", render: (product) => money(product.price) },
{ key: "stock", header: "Stock", sortable: true, accessor: "stock", cellClassName: "tabular-nums" },
    {
      key: "status",
      header: "Status",
      accessor: "status",
      render: (product) => (
        <span className="relative inline-flex">
          <select
            value={product.isActive ? "active" : "inactive"}
            onChange={() => handleToggleProduct(product.sku)}
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
  ];

  return (
    <div className="space-y-6">
      {rows === null && !error ? (
        <AdminProductsSkeleton />
      ) : error ? (
        <Card className="p-8 text-center text-body font-regular text-rose-600">{error}</Card>
      ) : (
        <>
          <AdminTable
            title="Products"
             description="Manage products from manual and Ingram sources."
            columns={columns}
            data={rows}
            pageSize={PAGE_SIZE}
            page={page}
            onPageChange={setPage}
            totalPages={totalPages}
            totalItems={totalItems}
            toolbar={(
              <>
                 <div className="relative min-w-[14rem] flex-1 sm:max-w-md lg:max-w-sm">
                   <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                   <Input value={keyword} onChange={(event) => handleSearchChange(event.target.value)} placeholder="Search products, SKU or category" aria-label="Search products" className="h-10 pl-10 shadow-sm" />
                 </div>
                 <Button onClick={handleOpenAddModal} className="shrink-0 gap-1.5"><Plus className="size-4" /> Add Product</Button>
                 <Button asChild href="/admin/products/sync" className="shrink-0 whitespace-nowrap"><RefreshCw className="size-4" /> Sync from Ingram</Button>
                 <Button onClick={handlePriceSync} disabled={syncing} className="shrink-0 gap-2 whitespace-nowrap"><RefreshCw className={`size-4 ${syncing ? "animate-spin" : ""}`} /> Sync prices</Button>
               </>
            )}
             hideSearch
             disableInitialSort
             inlineToolbar
             toolbarInHeader
             secondaryToolbar={(
               <div className="flex flex-wrap items-center gap-3">
                  <FilterTabs
                    value={sourceFilter}
                    onChange={(value) => { setSourceFilter(value); setPage(1); }}
                    tabs={[
                      { value: "all", label: "All" },
                      { value: "manual", label: "Manual" },
                      { value: "ingram", label: "Ingram" },
                    ]}
                  />
                </div>
             )}
rowActions={(product) => [
              { label: "View", ariaLabel: `View ${product.name}`, href: `/admin/products/${encodeURIComponent(product.id)}`, icon: Eye },
              {
                label: "Edit",
                ariaLabel: `Edit ${product.name}`,
                href: `/admin/products/${encodeURIComponent(product.id)}`,
                icon: Pencil,
                disabled: product.source === "ingram",
                disabledTitle: "Ingram products cannot be edited (read-only)",
              },
            ]}
          />
        </>
      )}


      <AddItemModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        type="product"
        categories={categories}
        onSubmit={handleCreateProduct}
        submitting={submitting}
      />

      <InfoActionDialog
        open={Boolean(categoryError)}
        title="Cannot activate product"
        message={categoryError}
        onClose={() => setCategoryError("")}
      />
    </div>
  );
}

// Row numbers are always the real position in the paginated list. Building them
// in one place keeps a freshly created product from showing a placeholder 0
// until the page is reloaded.
function toRows(products, pageNumber, pageSize) {
  return (Array.isArray(products) ? products : []).map(
    (product, index) => toRow(product, (Number(pageNumber) - 1) * pageSize + index + 1)
  );
}

function toRow(product, serial) {
  return {
    id: product.ingramPartNumber,
    serial,
    name: product.name || product.description || product.ingramPartNumber || "Unnamed product",
    sku: product.ingramPartNumber || "—",
    category: product.category || "Uncategorized",
    categorySynced: product.categorySynced !== false,
    price: product.price || 0,
    stock: product.stock || 0,
    image: product.imageUrl || FALLBACK_IMAGE,
isActive: product.isActive,
    source: product.source || "manual",
    status: !product.isActive
      ? "Paused"
      : product.imageStatus === "failed"
        ? "Rejected"
        : product.imageStatus === "pending"
          ? "Pending"
          : product.imageStatus === "not_found"
            ? "No image"
            : "Active",
  };
}

function ProductCell({ product }) {
  return (
    <div className="flex max-w-64 items-center gap-3">
      <Image src={product.image} alt={product.name} width={48} height={48} className="size-10 shrink-0 rounded-lg object-cover ring-1 ring-outline-variant" />
       <div className="min-w-0">
         <p title={product.name} className="truncate text-base font-bold text-on-surface">{product.name}</p>
        <p className="mt-0.5 truncate text-meta font-normal text-on-surface-variant">{product.sku}</p>
      </div>
    </div>
  );
}
