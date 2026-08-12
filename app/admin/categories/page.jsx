"use client";

import { Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminTable } from "@/components/admin-table";
import { Card, Input, Skeleton } from "@/components/ui";
import { getProductCategories } from "@/lib/api";

export default function AdminCategoriesPage() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await getProductCategories();
      setRows((data.categories || []).map((category) => ({
        name: category.name,
        slug: category.name.toLowerCase().replaceAll(" ", "-"),
        count: category.count,
      })));
      setError("");
    } catch (loadError) {
      setError(loadError.message || "Could not load categories.");
      setRows([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const total = rows?.reduce((sum, category) => sum + category.count, 0) ?? 0;

  const filteredRows = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    if (!query) return rows || [];
    return (rows || []).filter(
      (category) => category.name.toLowerCase().includes(query) || category.slug.toLowerCase().includes(query)
    );
  }, [rows, keyword]);

  const columns = [
    { key: "name", header: "Name", sortable: true, accessor: "name", cellClassName: "font-semibold text-slate-950 dark:text-white", render: (category) => (
      <div className="max-w-72">
        <p title={category.name} className="line-clamp-2 whitespace-normal font-semibold text-slate-950 dark:text-white">{category.name}</p>
        <p className="truncate text-meta font-regular text-slate-500 dark:text-slate-400">{category.slug}</p>
      </div>
    ) },
    { key: "count", header: "Products", sortable: true, accessor: "count", cellClassName: "tabular-nums" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-body font-regular text-slate-600 dark:text-slate-300">Categories are grouped automatically from your product catalog, with live product counts.</p>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Search categories" aria-label="Search categories" className="w-64 pl-10" />
        </div>
      </div>

      {rows === null && !error ? (
        <Card className="p-5">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="mt-2 h-4 w-72" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-14 w-full" />
            ))}
          </div>
        </Card>
      ) : error ? (
        <Card className="p-8 text-center text-body font-regular text-rose-600">{error}</Card>
      ) : (
        <AdminTable
          columns={columns}
          data={filteredRows}
          pageSize={100}
          hideSearch
          hidePagination
        />
      )}
    </div>
  );
}