"use client";

import { Check, Loader2, PackageSearch, RefreshCw, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button, Card, Input } from "@/components/ui";
import Pagination from "@/components/pagination";
import { getIngramCategories, startProductSync } from "@/lib/api";
import { useAdminAuthStore } from "@/store/admin-auth-store";

const PAGE_SIZE = 10;

export default function AdminCategorySyncPage() {
  const token = useAdminAuthStore((state) => state.token);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [discovering, setDiscovering] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const discoveryTimerRef = useRef(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setDiscovering(true);
    try {
      // Only categories that exist in Ingram but NOT in MongoDB are listed.
      // `refresh: true` forces a real Ingram call, so the button always
      // re-reads the supplier catalog instead of serving a cached answer.
      const data = await getIngramCategories(token, { onlyMissing: true, refresh: true });
      setCategories(dedupeCategories(data.categories || []));
      setSelected(new Set());
      setPage(1);
      if (!data.discoveryComplete) {
        // Ingram keeps scanning the catalog in the background. Poll until it
        // finishes so categories discovered later still show up.
        let attempts = 0;
        if (discoveryTimerRef.current) window.clearInterval(discoveryTimerRef.current);
        discoveryTimerRef.current = window.setInterval(async () => {
          attempts += 1;
          try {
            const latest = await getIngramCategories(token, { onlyMissing: true });
            setCategories(dedupeCategories(latest.categories || []));
            if (latest.discoveryComplete || attempts >= 30) {
              setDiscovering(false);
              setProgressPercent(100);
              window.clearInterval(discoveryTimerRef.current);
              discoveryTimerRef.current = null;
            } else {
              setProgressPercent(Math.min(100, 40 + (attempts * 5)));
            }
          } catch {
            if (attempts >= 30) {
              setDiscovering(false);
              window.clearInterval(discoveryTimerRef.current);
              discoveryTimerRef.current = null;
            }
          }
        }, 1200);
      }
    } catch (error) {
      toast.error(error.message || "Could not load categories from Ingram");
      setCategories([]);
    } finally {
      // When the first response arrives and background scanning is still in
      // progress, show the categories that have arrived so far — do not wait
      // for the full scan to complete.
      if (!discoveryTimerRef.current) {
        setDiscovering(false);
      }
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

  const addableCategories = categories;

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
      // Synced categories leave this list immediately, because the list only
      // ever contains categories that are missing from the database.
      const savedKeys = new Set(categoryList.map(categoryKey));
      setCategories((current) => current.filter((category) => !savedKeys.has(categoryKey(category))));
      setSelected((current) => {
        const next = new Set(current);
        savedKeys.forEach((key) => next.delete(key));
        return next;
      });
      setPage(1);
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
                <p className="mt-1 text-sm text-on-surface-variant">Only Ingram categories that are missing from your database are listed. Synced and deleted categories disappear from this list.</p>
              </div>
              <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 lg:w-auto lg:flex-nowrap">
                <div className="relative w-48 shrink-0">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                  <Input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search categories" className="h-9 w-full pl-9 text-sm" />
                </div>
                <Button onClick={syncSelected} disabled={syncing || selected.size === 0} size="sm" className="shrink-0 whitespace-nowrap"><RefreshCw className="size-3.5" /> Sync Selected ({selected.size})</Button>
                <Button onClick={syncAll} disabled={syncing || addableCategories.length === 0} size="sm" className="shrink-0 whitespace-nowrap"><RefreshCw className="size-3.5" /> Sync All ({addableCategories.length})</Button>
              </div>
            </div>
          </div>

          {discovering && (
            <div className="flex items-center gap-3 border-b border-outline-variant bg-primary/[0.03] px-5 py-3">
              <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
              <p className="min-w-0 flex-1 truncate text-sm text-on-surface-variant">
                Fetching from Ingram… found {categories.length} {categories.length === 1 ? "category" : "categories"} so far
              </p>
              <div className="hidden h-1.5 w-32 shrink-0 overflow-hidden rounded-full bg-primary/15 sm:block">
                <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${Math.max(6, progressPercent)}%` }} />
              </div>
            </div>
          )}
          <div className="p-5 sm:p-6">
            <div className="overflow-hidden rounded-lg border border-outline-variant">
              {loading && !categories.length ? (
                <LoadingState />
              ) : filteredCategories.length ? (
                <div className="divide-y divide-outline-variant">
                  {visibleCategories.map((category) => (
                    <CategoryRow
                      key={categoryKey(category)}
                      category={category}
                      checked={selected.has(categoryKey(category))}
                      onToggle={() => toggleCategory(category)}
                    />
                  ))}
                  <div className="flex flex-col gap-3 border-t border-outline-variant px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-on-surface-variant">
                      Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filteredCategories.length)} of {filteredCategories.length} categories
                    </p>
                    <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                  </div>
                </div>
              ) : (
                <EmptyState
                  hasSearch={Boolean(search.trim())}
                  discovering={discovering}
                  onReset={() => { setSearch(""); setPage(1); }}
                  onRefresh={loadCategories}
                />
              )}
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
      <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">Not in database</span>
    </button>
  );
}

function SelectionMark({ checked }) {
  return <span className={`flex size-5 shrink-0 items-center justify-center rounded border ${checked ? "border-primary bg-primary text-white" : "border-outline-variant bg-surface-container-lowest"}`}>{checked ? <Check className="size-3.5" /> : null}</span>;
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="size-5 animate-spin text-on-surface-variant" />
        <span className="text-body-sm font-semibold text-on-surface">Loading categories from Ingram…</span>
      </div>
      <p className="text-meta text-on-surface-variant">Fetching the latest catalog from Ingram. This can take a moment for larger catalogs.</p>
    </div>
  );
}

function EmptyState({ hasSearch, discovering, onReset, onRefresh }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      {discovering ? (
        <>
          <div className="flex size-9 items-center justify-center rounded-full border border-primary/20 border-t-primary">
            <Loader2 className="size-5 animate-spin text-primary" />
          </div>
          <p className="text-body-sm font-semibold text-on-surface">Discovering new categories from Ingram…</p>
          <p className="text-meta text-on-surface-variant">Categories appear here as soon as Ingram returns them. This page updates automatically.</p>
        </>
      ) : (
        <>
          <PackageSearch className="size-6 text-on-surface-variant" />
          <p className="text-body-sm font-semibold text-on-surface">No categories available</p>
          <p className="text-meta text-on-surface-variant">
            {hasSearch ? "No categories match your search term." : "Every Ingram category is already saved in your database."}
          </p>
          <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
            {hasSearch ? (
              <Button variant="outline" size="sm" onClick={onReset}><RefreshCw className="size-3.5" /> Clear search</Button>
            ) : null}
            <Button variant="outline" size="sm" onClick={onRefresh}><RefreshCw className="size-3.5" /> Check again</Button>
          </div>
        </>
      )}
    </div>
  );
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
