"use client";

import Link from "next/link";
import { Check, RefreshCw, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button, Card, Input } from "@/components/ui";
import Pagination from "@/components/pagination";
import { getIngramCategories, startProductSync } from "@/lib/api";
import { useAdminAuthStore } from "@/store/admin-auth-store";

const PAGE_SIZE = 10;
const MIN_SKELETON_MS = 650;

function minimumLoadingTime(startedAt) {
  return new Promise((resolve) => window.setTimeout(resolve, Math.max(0, MIN_SKELETON_MS - (Date.now() - startedAt))));
}

export default function AdminCategorySyncPage() {
  const token = useAdminAuthStore((state) => state.token);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const discoveryTimerRef = useRef(null);

  const loadCategories = useCallback(async () => {
    const startedAt = Date.now();
    setLoading(true);
    try {
      // Reuse the backend's short-lived Ingram catalog cache instead of
      // rescanning all catalog pages every time this page opens.
      const data = await getIngramCategories(token, { onlyNew: true, fast: true });
      setCategories(dedupeCategories(data.categories || []));
      setSelected(new Set());
      setPage(1);
      if (!data.discoveryComplete) {
        let attempts = 0;
        if (discoveryTimerRef.current) window.clearInterval(discoveryTimerRef.current);
        discoveryTimerRef.current = window.setInterval(async () => {
          attempts += 1;
          try {
            const latest = await getIngramCategories(token, { onlyNew: true });
            setCategories(dedupeCategories(latest.categories || []));
            if (latest.discoveryComplete || attempts >= 15) {
              window.clearInterval(discoveryTimerRef.current);
              discoveryTimerRef.current = null;
            }
          } catch {
            if (attempts >= 15) {
              window.clearInterval(discoveryTimerRef.current);
              discoveryTimerRef.current = null;
            }
          }
        }, 1000);
      }
    } catch (error) {
      toast.error(error.message || "Could not load categories from Ingram");
      setCategories([]);
    } finally {
      await minimumLoadingTime(startedAt);
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return undefined;
    const timeout = window.setTimeout(() => loadCategories(), 0);
    return () => {
      window.clearTimeout(timeout);
      if (discoveryTimerRef.current) window.clearInterval(discoveryTimerRef.current);
    };
  }, [loadCategories, token]);

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query ? categories.filter((category) => category.name.toLowerCase().includes(query)) : categories;
  }, [categories, search]);

  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / PAGE_SIZE));
  const visibleCategories = filteredCategories.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleCategory(category) {
    const key = categoryKey(category);
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function syncCategories(categoryList) {
    if (!categoryList.length || syncing) return;
    setSyncing(true);
    try {
      await startProductSync({
        categories: categoryList.map((category) => category.name),
        categoryIds: categoryList.map((category) => category.ingramCategoryId || category.id || category.name),
        categoryOnly: true,
      }, token);
      const savedKeys = new Set(categoryList.map(categoryKey));
      setCategories((current) => current.filter((category) => !savedKeys.has(categoryKey(category))));
      setSelected((current) => {
        const next = new Set(current);
        savedKeys.forEach((key) => next.delete(key));
        return next;
      });
      toast.success(`${categoryList.length} ${categoryList.length === 1 ? "category" : "categories"} saved to the database`);
    } catch (error) {
      toast.error(error.message || "Could not save categories");
    } finally {
      setSyncing(false);
    }
  }

  function syncSelected() {
    syncCategories(categories.filter((category) => selected.has(categoryKey(category))));
  }

  function syncAll() {
    syncCategories(categories);
  }

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden p-0">
          <div className="border-b border-outline-variant px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0 flex-1">
                <h1 className="font-heading text-lg font-semibold tracking-tight text-on-surface">Ingram Category Sync</h1>
                <p className="mt-1 text-sm text-on-surface-variant">Review categories available from Ingram and choose which ones to add to your database.</p>
              </div>
              <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 lg:w-auto lg:flex-nowrap">
                <div className="relative w-48 shrink-0">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                  <Input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search categories" className="h-9 w-full pl-9 text-sm" />
                </div>
                <Button onClick={syncSelected} disabled={syncing || selected.size === 0} size="sm" className="shrink-0 whitespace-nowrap"><RefreshCw className="size-3.5" /> Sync Selected ({selected.size})</Button>
                <Button onClick={syncAll} disabled={syncing || categories.length === 0} size="sm" className="shrink-0 whitespace-nowrap"><RefreshCw className="size-3.5" /> Sync All ({categories.length})</Button>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="overflow-hidden rounded-xl border border-outline-variant">
              {loading ? <LoadingState /> : filteredCategories.length ? (
                <div className="divide-y divide-outline-variant">
                  {visibleCategories.map((category) => <CategoryRow key={categoryKey(category)} category={category} checked={selected.has(categoryKey(category))} onToggle={() => toggleCategory(category)} />)}
                  <div className="flex flex-col gap-3 border-t border-outline-variant px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-on-surface-variant">Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filteredCategories.length)} of {filteredCategories.length} categories</p>
                    <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                  </div>
                </div>
              ) : <EmptyState hasSearch={Boolean(search.trim())} />}
            </div>
          </div>
      </Card>
    </div>
  );
}

function CategoryRow({ category, checked, onToggle }) {
  return (
    <button type="button" onClick={onToggle} aria-pressed={checked} className={`flex w-full items-center gap-3 px-4 py-4 text-left transition ${checked ? "bg-primary/5" : "bg-surface hover:bg-surface-container-low"}`}>
      <SelectionMark checked={checked} />
      <span className="min-w-0 flex-1 break-words text-sm font-semibold text-on-surface">{category.name}</span>
      <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">New</span>
    </button>
  );
}

function SelectionMark({ checked }) {
  return <span className={`flex size-5 shrink-0 items-center justify-center rounded border ${checked ? "border-primary bg-primary text-white" : "border-outline-variant bg-surface-container-lowest"}`}>{checked ? <Check className="size-3.5" /> : null}</span>;
}

function LoadingState() {
  return <div className="divide-y divide-outline-variant">{Array.from({ length: PAGE_SIZE }, (_, index) => <div key={index} className="flex items-center gap-3 px-4 py-4"><span className="size-5 shrink-0 animate-pulse rounded border border-outline-variant bg-surface-container-low" /><span className="min-w-0 flex-1"><span className="block h-4 w-3/5 animate-pulse rounded bg-surface-container-low" /><span className="mt-2 block h-3 w-44 animate-pulse rounded bg-surface-container-low" /></span><span className="h-5 w-12 animate-pulse rounded-full bg-surface-container-low" /></div>)}</div>;
}

function EmptyState({ hasSearch }) {
  return <div className="flex min-h-72 items-center justify-center px-6 text-center"><div><p className="text-sm font-semibold text-on-surface">{hasSearch ? "No categories match your search" : "No new categories found"}</p><p className="mt-1 text-xs text-on-surface-variant">{hasSearch ? "Try another search term." : "All Ingram categories are already saved, or Ingram returned no categories."}</p><Link href="/admin/categories" className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline">Back to Categories</Link></div></div>;
}

function categoryKey(category) {
  return String(category?.ingramCategoryId || category?.id || category?.name || "");
}

function dedupeCategories(categories) {
  const seen = new Set();
  return categories.filter((category) => {
    const key = categoryKey(category);
    if (!category.name || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
