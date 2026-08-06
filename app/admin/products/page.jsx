"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { AdminStatusBadge } from "@/components/admin-status-badge";
import { AdminTable } from "@/components/admin-table";
import { Button } from "@/components/ui";
import { adminProducts, categories } from "@/lib/admin-data";
import { money } from "@/lib/utils";

export default function AdminProductsPage() {
  const columns = [
    {
      key: "name",
      header: "Product",
      sortable: true,
      accessor: "name",
      render: (product) => <ProductCell product={product} />,
    },
    { key: "category", header: "Category", sortable: true, accessor: "category" },
    { key: "price", header: "Price", sortable: true, accessor: "price", cellClassName: "font-bold tabular-nums text-slate-950 dark:text-white", render: (product) => money(product.price) },
    { key: "stock", header: "Stock", sortable: true, accessor: "stock", cellClassName: "tabular-nums" },
    { key: "rating", header: "Rating", sortable: true, accessor: "rating", cellClassName: "tabular-nums" },
    { key: "status", header: "Status", accessor: "status", render: (product) => <AdminStatusBadge>{product.status}</AdminStatusBadge> },
  ];

  return (
    <div>
      <AdminTable
        action={<Button asChild href="/admin/products/new"><Plus className="size-4" />New product</Button>}
        columns={columns}
        data={adminProducts}
        searchPlaceholder="Search products or SKU"
        searchKeys={["name", "sku", "category", "status"]}
        filters={[
          { key: "category", label: "Filter products by category", allLabel: "All categories", options: categories.map((category) => category.name), value: (product) => product.category },
          { key: "stock", label: "Filter products by stock", allLabel: "All stock", options: ["In stock", "Low stock"], value: (product) => product.stock <= 10 ? "Low stock" : "In stock" },
        ]}
        rowActions={(product) => [
          { label: "View", href: `/products/${product.id}` },
          { label: "Edit", href: `/admin/products/${product.id}` },
          { label: "Delete", tone: "danger", onClick: () => console.info(`Delete product ${product.id}`) },
        ]}
      />
    </div>
  );
}

function ProductCell({ product }) {
  return (
    <div className="flex items-center gap-3">
      <Image src={product.image} alt={product.name} width={56} height={56} className="size-14 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-800" />
      <div>
        <p className="font-bold text-slate-950 dark:text-white">{product.name}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{product.sku}</p>
      </div>
    </div>
  );
}
