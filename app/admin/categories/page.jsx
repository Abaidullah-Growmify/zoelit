"use client";

import { RefreshCw, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminTable } from "@/components/admin-table";
import Pagination from "@/components/pagination";
import { Button, Card, Input } from "@/components/ui";
import { AdminCategoriesSkeleton } from "@/components/skeletons";
import { getProductCategories } from "@/lib/api";

const PAGE_SIZE = 10;

export default function AdminCategoriesPage() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [syncing, setSyncing] = useState(false);

  const loadCategories = useCallback(() => {
    let active = true;
    getProductCategories()
      .then((data) => {
        if (!active) return;
        setRows((data.categories || []).map((category) => ({
          name: category.name,
          slug: category.name.toLowerCase().replaceAll(" ", "-"),
          count: category.count,
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
  }, []);

  useEffect(() => {
    const cleanup = loadCategories();
    return cleanup;
  }, [loadCategories]);

  function handleSearchChange(value) {
    setKeyword(value);
    setPage(1);
  }

  async function handleSync() {
    setSyncing(true);
    try {
      const data = await getProductCategories();
      setRows((data.categories || []).map((category) => ({
        name: category.name,
        slug: category.name.toLowerCase().replaceAll(" ", "-"),
        count: category.count,
      })));
      setError("");
      toast.success("Categories refreshed");
    } catch (loadError) {
      toast.error(loadError.message || "Could not refresh categories.");
    } finally {
      setSyncing(false);
    }
  }

  const filteredRows = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    if (!query) return rows || [];
    return (rows || []).filter(
      (category) => category.name.toLowerCase().includes(query) || category.slug.toLowerCase().includes(query)
    );
  }, [rows, keyword]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = filteredRows.length ? (safePage - 1) * PAGE_SIZE : 0;
  const pageItems = filteredRows.slice(pageStart, pageStart + PAGE_SIZE);

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
      {rows === null && !error ? (
        <AdminCategoriesSkeleton />
      ) : error ? (
        <Card className="p-8 text-center text-body font-regular text-rose-600">{error}</Card>
      ) : (
        <>
          <AdminTable
            title="Categories"
            description="Categories are grouped automatically from your product catalog, with live product counts."
            columns={columns}
            data={pageItems}
            pageSize={PAGE_SIZE}
            toolbar={(
              <div className="relative min-w-[16rem] flex-1 sm:max-w-md lg:max-w-xl">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input value={keyword} onChange={(event) => handleSearchChange(event.target.value)} placeholder="Search categories" aria-label="Search categories" className="h-10 border-slate-200 bg-white pl-10 shadow-sm dark:border-slate-700 dark:bg-slate-950" />
              </div>
            )}
            action={(
              <Button onClick={handleSync} disabled={syncing}>
                <RefreshCw className={`size-4 ${syncing ? "animate-spin" : ""}`} /> Sync categories
              </Button>
            )}
            hideSearch
            hidePagination
          />
          <Pagination
            page={safePage}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
            className="mt-6"
          />
        </>
      )}
    </div>
  );
}
