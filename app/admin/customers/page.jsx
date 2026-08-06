"use client";

import { AdminStatusBadge } from "@/components/admin-status-badge";
import { AdminTable } from "@/components/admin-table";
import { customers } from "@/lib/admin-data";
import { money, shortDate } from "@/lib/utils";

export default function AdminCustomersPage() {
  const columns = [
    { key: "name", header: "Customer", sortable: true, accessor: "name", cellClassName: "font-bold text-slate-950 dark:text-white" },
    { key: "email", header: "Email", sortable: true, accessor: "email" },
    { key: "phone", header: "Phone", accessor: "phone" },
    { key: "orders", header: "Orders", sortable: true, accessor: "orders", cellClassName: "tabular-nums" },
    { key: "totalSpent", header: "Spent", sortable: true, accessor: "totalSpent", cellClassName: "font-bold tabular-nums text-slate-950 dark:text-white", render: (customer) => money(customer.totalSpent) },
    { key: "status", header: "Status", accessor: "status", render: (customer) => <AdminStatusBadge>{customer.status}</AdminStatusBadge> },
    { key: "joined", header: "Joined", sortable: true, accessor: "joined", render: (customer) => shortDate(customer.joined) },
  ];

  return (
    <div>
      <AdminTable
        columns={columns}
        data={customers}
        searchPlaceholder="Search customers"
        searchKeys={["name", "email", "phone", "status"]}
        filters={[{ key: "status", label: "Filter customers by status", allLabel: "All statuses", options: ["Active", "Blocked"], value: (customer) => customer.status }]}
        rowActions={(customer) => [
          { label: "View", href: `/admin/customers/${customer.id}` },
          { label: "Edit", href: `/admin/customers/${customer.id}` },
          { label: "Delete", tone: "danger", onClick: () => console.info(`Delete customer ${customer.id}`) },
        ]}
      />
    </div>
  );
}
