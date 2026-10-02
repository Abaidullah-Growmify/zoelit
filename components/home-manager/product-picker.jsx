"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, Loader2, Search, X } from "lucide-react";
import { getAdminProducts, getAdminProductsByIds } from "@/lib/api";
import { FALLBACK_IMAGE } from "@/lib/product-mapper";
import { cn } from "@/lib/utils";

export function ProductPicker({
  token,
  value = [],
  onChange,
  max = 0,
  buttonLabel = "Select products",
  placeholder = "Search products...",
  activeOnly = true,
}) {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [known, setKnown] = useState({});
  const rootRef = useRef(null);
  const scrollRef = useRef(null);

  const addKnown = useCallback((products = []) => {
    setKnown((previous) => {
      const next = { ...previous };
      for (const product of products) {
        if (product?.ingramPartNumber) {
          next[product.ingramPartNumber] = {
            name: product.name || product.description || product.ingramPartNumber,
            image: product.imageUrl || product.image || "",
          };
        }
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (!token) return undefined;
    const missing = value.filter((id) => id && !known[id]);
    if (!missing.length) return undefined;
    let active = true;
    getAdminProductsByIds(missing, token)
      .then((data) => {
        if (active) addKnown(data.products || []);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [token, value, known, addKnown]);

  useEffect(() => {
    if (!token || !open) return undefined;
    const searchingTimer = window.setTimeout(() => setSearching(true), 0);
    const timer = window.setTimeout(() => {
      getAdminProducts({ keyword: keyword.trim(), page: 1, limit: 20, activeOnly }, token)
        .then((data) => {
          const fetched = data?.products || [];
          setResults(fetched);
          setPage(1);
          setHasMore((data?.pagination?.totalPages || 1) > 1);
          setTotal(data?.pagination?.total ?? fetched.length);
          addKnown(fetched);
        })
        .catch(() => {
          setResults([]);
          setHasMore(false);
          setTotal(0);
        })
        .finally(() => {
          setSearching(false);
        });
    }, 300);
    return () => {
      window.clearTimeout(searchingTimer);
      window.clearTimeout(timer);
    };
  }, [token, keyword, open, addKnown, activeOnly]);

  const loadMore = useCallback(() => {
    if (!token || !open || loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    getAdminProducts({ keyword: keyword.trim(), page: nextPage, limit: 20, activeOnly }, token)
      .then((data) => {
        const fetched = data?.products || [];
        setResults((current) => {
          const seen = new Set(current.map((product) => product.ingramPartNumber));
          return [...current, ...fetched.filter((product) => !seen.has(product.ingramPartNumber))];
        });
        setPage(nextPage);
        setHasMore(nextPage < (data?.pagination?.totalPages || 1));
        setTotal(data?.pagination?.total ?? total);
        addKnown(fetched);
      })
      .catch(() => setHasMore(false))
      .finally(() => setLoadingMore(false));
  }, [token, open, loadingMore, hasMore, page, keyword, addKnown, total, activeOnly]);

  const handleScroll = useCallback((event) => {
    const element = event.currentTarget;
    if (element.scrollTop + element.clientHeight >= element.scrollHeight - 48) loadMore();
  }, [loadMore]);

  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  const isSelected = (id) => value.includes(id);
  const atMax = max > 0 && value.length >= max;

  const toggle = (id) => {
    if (isSelected(id)) {
      onChange(value.filter((item) => item !== id));
    } else if (!atMax) {
      onChange([...value, id]);
    }
  };

  const move = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-10 w-full items-center justify-between gap-2 rounded-md border border-outline-variant bg-surface px-3 text-sm text-on-surface transition hover:border-primary focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
        aria-expanded={open}
      >
        <span className="truncate">
          {value.length ? `${value.length}/${max || 0} selected` : buttonLabel}
        </span>
        <ChevronDown className={cn("size-4 shrink-0 text-on-surface-variant transition-transform", open && "rotate-180")} />
      </button>

      {max > 0 ? (
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs text-on-surface-variant">
            <span className="font-semibold tabular-nums">{value.length} of {max} picked</span>
            <span>{value.length >= max ? "Full — remove one to add more" : `${max - value.length} more available`}</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-container-low">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, (value.length / max) * 100)}%` }} />
          </div>
        </div>
      ) : value.length ? (
        <p className="mt-1 text-xs text-on-surface-variant">{value.length} picked</p>
      ) : null}

      {value.length ? (
        <ul className="mt-2 space-y-2">
          {value.map((id, index) => (
            <li key={id} className="flex items-center gap-2 rounded-md border border-outline-variant bg-surface px-2 py-2">
              <div className="relative size-9 shrink-0 overflow-hidden rounded-lg bg-surface-container-low">
                <Image src={known[id]?.image || FALLBACK_IMAGE} alt="" fill sizes="36px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-on-surface">{known[id]?.name || id}</p>
                <p className="truncate text-xs text-on-surface-variant">{id}</p>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" className="icon-btn" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Move ${known[id]?.name || id} up`}>
                  <ArrowUp className="size-3.5" />
                </button>
                <button type="button" className="icon-btn" onClick={() => move(index, 1)} disabled={index === value.length - 1} aria-label={`Move ${known[id]?.name || id} down`}>
                  <ArrowDown className="size-3.5" />
                </button>
                <button type="button" className="icon-btn text-error hover:bg-error-container" onClick={() => toggle(id)} aria-label={`Remove ${known[id]?.name || id}`}>
                  <X className="size-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {open ? (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-lg border border-outline-variant bg-surface shadow-xl">
          <div className="border-b border-outline-variant/70 p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
              <input
                type="text"
                autoFocus
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder={placeholder}
                className="h-9 w-full rounded-lg border border-outline-variant bg-surface pl-9 pr-3 text-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
              />
            </div>
          </div>
          <div className="max-h-64 divide-y divide-outline-variant overflow-y-auto" onScroll={handleScroll} ref={scrollRef}>
            {results.map((product) => {
              const id = product.ingramPartNumber;
              const selected = isSelected(id);
              const disabled = !selected && atMax;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggle(id)}
                  disabled={disabled}
                  className={cn(
                    "flex w-full items-center gap-3 px-3 py-2 text-left transition hover:bg-surface-container-low",
                    disabled && "cursor-not-allowed opacity-50"
                  )}
                >
                  <span
                    role="checkbox"
                    aria-checked={selected}
                    className={cn(
                      "grid size-5 shrink-0 place-items-center rounded-md border transition",
                      selected ? "border-primary bg-primary text-white" : "border-outline-variant bg-surface-container-low text-transparent"
                    )}
                  >
                    ✓
                  </span>
                  <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-surface-container-low">
                    <Image src={product.imageUrl || product.image || FALLBACK_IMAGE} alt="" fill sizes="40px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-on-surface">{product.name || product.description || id}</p>
                    <p className="truncate text-xs text-on-surface-variant">{id} {product.category ? `· ${product.category}` : ""}</p>
                  </div>
                  {selected ? <span className="shrink-0 text-xs font-semibold text-primary">Picked</span> : null}
                </button>
              );
            })}
            {searching ? (
              <div className="flex items-center justify-center gap-2 px-3 py-4 text-sm text-on-surface-variant">
                <Loader2 className="size-4 animate-spin" /> Searching products...
              </div>
            ) : null}
            {loadingMore ? (
              <div className="flex items-center justify-center gap-2 px-3 py-4 text-sm text-on-surface-variant">
                <Loader2 className="size-4 animate-spin" /> Loading more products...
              </div>
            ) : null}
            {!searching && !loadingMore && results.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-on-surface-variant">
                {keyword.trim() ? "No products match your search." : "No products in this catalog yet."}
              </div>
            ) : null}
          </div>
          <div className="border-t border-outline-variant/70 bg-surface-container-low/40 px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-on-surface-variant">
                {max > 0 ? `Pick up to ${max} products.` : "Pick as many products as you want."} Order shown on the storefront.
              </p>
              {total > 0 ? <p className="shrink-0 text-xs font-semibold tabular-nums text-on-surface-variant">{results.length} of {total} shown</p> : null}
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-8 shrink-0 items-center justify-center rounded-lg border border-outline-variant bg-surface px-3 text-sm font-semibold text-on-surface transition hover:border-primary hover:text-primary"
            >
              Done
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
