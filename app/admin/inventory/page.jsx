"use client";

import Image from "next/image";
import { AdminStatusBadge } from "@/components/admin-status-badge";
import { AdminTable } from "@/components/admin-table";
import { categories, inventory } from "@/lib/admin-data";
import { cn, shortDate } from "@/lib/utils";

export default function AdminInventoryPage() {
  const columns = [
    {
      key: "productName",
      header: "Product",
      sortable: true,
      accessor: "productName",
      render: (item) => <InventoryProductCell item={item} />,
    },
    { key: "sku", header: "SKU", sortable: true, accessor: "sku" },
    { key: "category", header: "Category", sortable: true, accessor: "category" },
    { key: "currentStock", header: "Stock", sortable: true, accessor: "currentStock", render: (item) => <StockLevel item={item} /> },
    { key: "threshold", header: "Threshold", sortable: true, accessor: "threshold", cellClassName: "tabular-nums" },
    { key: "status", header: "Status", accessor: "status", render: (item) => <AdminStatusBadge>{item.status}</AdminStatusBadge> },
    { key: "lastUpdated", header: "Updated", sortable: true, accessor: "lastUpdated", render: (item) => shortDate(item.lastUpdated) },
  ];

  return (
    <div>
      <AdminTable
        columns={columns}
        data={inventory}
        searchPlaceholder="Search SKU or product"
        searchKeys={["productName", "sku", "category", "status"]}
        filters={[
          { key: "status", label: "Filter inventory by stock state", allLabel: "All stock states", options: ["In Stock", "Low Stock", "Out of Stock"], value: (item) => item.status },
          { key: "category", label: "Filter inventory by category", allLabel: "All categories", options: categories.map((category) => category.name), value: (item) => item.category },
        ]}
        rowActions={(item) => [
          { label: "View", href: `/products/${item.productId}` },
          { label: "Edit", href: `/admin/products/${item.productId}` },
          { label: "Delete", tone: "danger", onClick: () => console.info(`Delete inventory item ${item.productId}`) },
        ]}
      />
    </div>
  );
}

function InventoryProductCell({ item }) {
  return (
    <div className="flex items-center gap-3">
      <Image src={item.image} alt={item.productName} width={48} height={48} className="size-12 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-800" />
      <p className="font-bold text-slate-950 dark:text-white">{item.productName}</p>
    </div>
  );
}

function StockLevel({ item }) {
  const ratio = Math.min(100, Math.round((item.currentStock / Math.max(item.threshold, 1)) * 100));
  const isOut = item.currentStock === 0;
  const isLow = item.currentStock <= item.threshold && !isOut;
  return (
    <div className="flex min-w-32 items-center gap-3">
      <span className={cn("h-8 w-1.5 overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-500/15", isLow && "bg-amber-100 dark:bg-amber-500/15", isOut && "bg-rose-100 dark:bg-rose-500/15")} aria-hidden="true">
        <span className={cn("block w-full rounded-full bg-emerald-500", isLow && "bg-amber-500", isOut && "bg-rose-500")} style={{ height: `${Math.max(ratio, item.currentStock ? 12 : 100)}%`, marginTop: `${100 - Math.max(ratio, item.currentStock ? 12 : 100)}%` }} />
      </span>
      <span className={cn("font-bold tabular-nums text-slate-950 dark:text-white", isLow && "text-amber-700 dark:text-amber-300", isOut && "text-rose-700 dark:text-rose-300")}>{item.currentStock}</span>
    </div>
  );
}
