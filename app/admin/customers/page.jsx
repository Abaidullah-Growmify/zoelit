"use client";

import { Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminStatusBadge } from "@/components/admin-status-badge";
import { AdminTable } from "@/components/admin-table";
import Pagination from "@/components/pagination";
import { Button, Card, Input } from "@/components/ui";
import { AdminCustomersSkeleton } from "@/components/skeletons";
import { getAdminCustomers } from "@/lib/api";
import { money, shortDate } from "@/lib/utils";
import { useAdminAuthStore } from "@/store/admin-auth-store";

const PAGE_SIZE = 20;

export default function AdminCustomersPage() {
  const token = useAdminAuthStore((state) => state.token);
  const [rows, setRows] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword.trim()), 400);
    return () => clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    let active = true;
    if (!token) return;
    getAdminCustomers({ page, limit: PAGE_SIZE, keyword: debouncedKeyword || undefined }, token)
      .then((data) => {
        if (!active) return;
        setRows(data.customers || []);
        setTotalPages(data.pagination?.totalPages ?? 1);
        setError("");
      })
      .catch((loadError) => {
        if (!active) return;
        setError(loadError.message || "Could not load customers.");
        setRows([]);
      });
    return () => {
      active = false;
    };
  }, [token, page, debouncedKeyword]);

  function handleSearchChange(value) {
    setKeyword(value);
    setPage(1);
  }

  const columns = [
    { key: "name", header: "Customer", sortable: true, accessor: "name", cellClassName: "font-semibold text-on-surface", render: (customer) => <CustomerCell customer={customer} /> },
    { key: "phone", header: "Phone", accessor: "phone", render: (customer) => customer.phone || "—" },
    { key: "orders", header: "Orders", sortable: true, accessor: "orders", cellClassName: "tabular-nums" },
    { key: "totalSpent", header: "Spent", sortable: true, accessor: "totalSpent", cellClassName: "font-semibold tabular-nums text-on-surface", render: (customer) => money(customer.totalSpent) },
    { key: "status", header: "Status", accessor: "status", render: (customer) => <AdminStatusBadge className="text-label-md font-normal text-on-surface-variant">{customer.status}</AdminStatusBadge> },
    { key: "joined", header: "Joined", sortable: true, accessor: "joined", render: (customer) => shortDate(customer.joined) },
  ];

  return (
    <div className="space-y-6">
      {rows === null && !error ? (
        <AdminCustomersSkeleton />
      ) : error ? (
        <Card className="p-8 text-center text-body font-regular text-rose-600">{error}</Card>
      ) : (
        <>
          <AdminTable
            title="Customers"
            description="All registered customers with their order history and lifetime spend."
            columns={columns}
            data={rows}
            pageSize={PAGE_SIZE}
            toolbar={(
              <div className="relative min-w-[16rem] flex-1 sm:max-w-md lg:max-w-xl">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                <Input value={keyword} onChange={(event) => handleSearchChange(event.target.value)} placeholder="Search customers" aria-label="Search customers" className="h-10 pl-10 shadow-sm" />
              </div>
            )}
            action={(
              <Button asChild href="/admin/customers/new">
                <Plus className="size-4" /> New customer
              </Button>
            )}
            hideSearch
            hidePagination
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
            className="mt-6"
          />
        </>
      )}
    </div>
  );
}

function CustomerCell({ customer }) {
  return (
    <div>
      <p className="font-semibold text-on-surface">{customer.name}</p>
      <p className="text-meta font-normal text-on-surface-variant">{customer.email}</p>
    </div>
  );
}
