"use client";

import { Plus } from "lucide-react";
import { AdminStatusBadge } from "@/components/admin-status-badge";
import { AdminTable } from "@/components/admin-table";
import { Button } from "@/components/ui";
import { categories } from "@/lib/admin-data";

export default function AdminCategoriesPage() {
  const columns = [
    { key: "name", header: "Name", sortable: true, accessor: "name", cellClassName: "font-semibold text-slate-950 dark:text-white" },
    { key: "slug", header: "Slug", sortable: true, accessor: "slug" },
    { key: "productCount", header: "Products", sortable: true, accessor: "productCount", cellClassName: "tabular-nums" },
    { key: "status", header: "Status", accessor: "status", render: (category) => <AdminStatusBadge>{category.status}</AdminStatusBadge> },
  ];

  return (
    <div>
      <AdminTable
        action={<Button asChild href="/admin/categories/new"><Plus className="size-4" />Add category</Button>}
        columns={columns}
        data={categories}
        searchPlaceholder="Search categories"
        searchKeys={["name", "slug", "status"]}
        filters={[{ key: "status", label: "Filter categories by status", allLabel: "All statuses", options: ["Active"], value: (category) => category.status }]}
        rowActions={(category) => [
          { label: "View", onClick: () => console.info(`View category ${category.id}`) },
          { label: "Edit", onClick: () => console.info(`Edit category ${category.id}`) },
          { label: "Delete", tone: "danger", onClick: () => console.info(`Delete category ${category.id}`) },
        ]}
      />
    </div>
  );
}
