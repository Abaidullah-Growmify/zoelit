"use client";

import { startTransition, useDeferredValue, useEffect, useRef, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { getProductCategories, getPublicProducts } from "@/lib/api";
import { mapProduct } from "@/lib/product-mapper";
import { ProductCard } from "@/components/product-card";
import { ProductFilters } from "@/components/product-filters";
import Pagination from "@/components/pagination";
import { EmptyState, Input, Select } from "@/components/ui";
import { ProductGridSkeleton } from "@/components/skeletons";
import { DashboardSectionBanner } from "@/components/dashboard-section-banner";

const SORT_QUERY = {
  newest: "newest",
  "price-low": "priceLow",
  "price-high": "priceHigh",
};

const PRICE_LABELS = {
  "under-100": "Under $100",
  "100-500": "$100-500",
  "over-500": "$500+",
  "on-request": "On request",
};

const PAGE_SIZE = 12;

function priceBounds(range) {
  if (range === "under-100") return { priceMin: 0.01, priceMax: 99.99 };
  if (range === "100-500") return { priceMin: 100, priceMax: 500 };
  if (range === "over-500") return { priceMin: 500.01 };
  if (range === "on-request") return { onRequest: true };
  return {};
}

const GRID_CLASSES = "product-grid grid-home grid-catalog grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:gap-5";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
];

function sortProducts(products, sortKey) {
  const sorted = [...products];
  if (sortKey === "price-low") sorted.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
  else if (sortKey === "price-high") sorted.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
  // The backend owns relevance and newest ordering. Re-sorting the default
  // result here would move exact SKU matches away from the top.
  return sorted;
}

function dedupeProducts(products) {
  const seen = new Set();
  return products.filter((product) => {
    const key = String(product?.id || product?.sku || "").trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default function ProductsContent({ initialProducts = [], initialPagination = {}, initialCategories = ["All"], initialState = {} }) {
  const urlCategory = initialState.category || "";
  const urlKeyword = initialState.keyword || "";
  const [sort, setSort] = useState(initialState.sort || "newest");
  const [categories, setCategories] = useState(initialCategories);
  const [products, setProducts] = useState(() => dedupeProducts(initialProducts));
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(initialState.page || 1);
  const [totalPages, setTotalPages] = useState(initialPagination.totalPages || 1);
  const [keyword, setKeyword] = useState(urlKeyword);
  const [priceRange, setPriceRange] = useState(initialState.priceRange || "all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const deferredKeyword = useDeferredValue(keyword);
  const [debouncedKeyword, setDebouncedKeyword] = useState(urlKeyword);
  const [selectedCategories, setSelectedCategories] = useState(urlCategory ? urlCategory.split(",").filter(Boolean) : []);
  const previousUrlRef = useRef({ category: urlCategory, keyword: urlKeyword });
  const productRequestRef = useRef(null);
  const categoriesRequestRef = useRef(null);
  const skipUrlWriteRef = useRef(false);

  // The navbar navigates to this same page with a query string. Keep the
  // controls in sync when that happens without a full page remount.
  useEffect(() => {
    const previous = previousUrlRef.current;
    if (previous.category === urlCategory && previous.keyword === urlKeyword) return;
    previousUrlRef.current = { category: urlCategory, keyword: urlKeyword };
    startTransition(() => {
      setKeyword(urlKeyword);
      setDebouncedKeyword(urlKeyword);
       setSelectedCategories(urlCategory ? urlCategory.split(",").filter(Boolean) : []);
       setSort(initialState.sort || "newest");
       setPriceRange(initialState.priceRange || "all");
       setPage(Math.max(1, Number(initialState.page) || 1));
       setLoading(true);
    });
  }, [urlKeyword, urlCategory, initialState.page, initialState.priceRange, initialState.sort]);

  useEffect(() => {
    const syncFromLocation = () => {
      const params = new URLSearchParams(window.location.search);
      skipUrlWriteRef.current = true;
      const nextCategory = params.get("category") || "";
      const nextKeyword = params.get("keyword") || "";
      setSelectedCategories(nextCategory ? nextCategory.split(",").filter(Boolean) : []);
      setKeyword(nextKeyword);
      setDebouncedKeyword(nextKeyword);
      setSort(params.get("sort") || "newest");
      setPriceRange(params.get("price") || "all");
      setPage(Math.max(1, Number(params.get("page")) || 1));
      setLoading(true);
      previousUrlRef.current = { category: nextCategory, keyword: nextKeyword };
    };
    window.addEventListener("popstate", syncFromLocation);
    return () => window.removeEventListener("popstate", syncFromLocation);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedKeyword(deferredKeyword), 500);
    return () => window.clearTimeout(timer);
  }, [deferredKeyword]);

  useEffect(() => {
    let active = true;

    if (initialCategories.length > 1) return undefined;
    if (!categoriesRequestRef.current) categoriesRequestRef.current = getProductCategories();
    categoriesRequestRef.current
      .then((data) => {
        if (!active) return;
        const names = (data.categories || []).map((item) => item.name).filter(Boolean);
        setCategories(["All", ...names]);
        // Drop any category from the URL that no longer exists in the database,
        // otherwise the page would filter to an empty result with no visible
        // control to clear it.
        setSelectedCategories((current) => {
          const known = new Set(names.map((name) => String(name).trim().toLowerCase()));
          const valid = current.filter((name) => known.has(String(name).trim().toLowerCase()));
          return valid.length === current.length ? current : valid;
        });
      })
      .catch(() => {
        categoriesRequestRef.current = null;
      });

    return () => {
      active = false;
    };
  }, [initialCategories.length]);

  useEffect(() => {
    let active = true;

    const requestKey = JSON.stringify([selectedCategories, debouncedKeyword, sort, priceRange, page]);
    const initialKey = JSON.stringify([urlCategory ? urlCategory.split(",").filter(Boolean) : [], urlKeyword, sort, initialState.priceRange || "all", page]);
    if (!productRequestRef.current && requestKey === initialKey) {
      productRequestRef.current = { key: requestKey, promise: Promise.resolve({ products: initialProducts, pagination: initialPagination }) };
      setLoading(false);
      return undefined;
    }
    if (requestKey === initialKey && productRequestRef.current?.key === requestKey) {
      setLoading(false);
      return undefined;
    }
    let request = productRequestRef.current?.key === requestKey ? productRequestRef.current.promise : null;
    if (!request) {
      request = getPublicProducts({
        category: selectedCategories.join(",") || undefined,
        keyword: debouncedKeyword.trim() || undefined,
        sort: SORT_QUERY[sort] || "newest",
        page,
        limit: PAGE_SIZE,
        mix: selectedCategories.length > 1,
        ...priceBounds(priceRange),
      });
      productRequestRef.current = { key: requestKey, promise: request };
    }
    request.then((data) => {
        if (!active) return;
        setProducts(sortProducts(dedupeProducts((data.products || []).map(mapProduct).filter(Boolean)), sort));
        setTotalPages(Math.max(1, data.pagination?.totalPages || 1));
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setProducts([]);
        setTotalPages(1);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedCategories, debouncedKeyword, sort, priceRange, page, initialPagination, initialProducts, initialState.priceRange, urlCategory, urlKeyword]);

  useEffect(() => {
    if (skipUrlWriteRef.current) {
      skipUrlWriteRef.current = false;
      return;
    }
    const url = new URL(window.location.href);
    if (selectedCategories.length) url.searchParams.set("category", selectedCategories.join(","));
    else url.searchParams.delete("category");
    if (debouncedKeyword.trim()) url.searchParams.set("keyword", debouncedKeyword.trim());
    else url.searchParams.delete("keyword");
    if (sort !== "newest") url.searchParams.set("sort", sort);
    else url.searchParams.delete("sort");
    if (priceRange !== "all") url.searchParams.set("price", priceRange);
    else url.searchParams.delete("price");
    if (page > 1) url.searchParams.set("page", String(page));
    else url.searchParams.delete("page");
    if (url.toString() !== window.location.href) window.history.pushState({}, "", url);
  }, [selectedCategories, debouncedKeyword, sort, priceRange, page]);

  // Mobile filter sheet: lock body scroll, close on Escape and when the viewport
  // crosses into the lg layout where the sidebar takes over.
  useEffect(() => {
    if (!filtersOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") setFiltersOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);

    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    const onViewportChange = (event) => {
      if (event.matches) setFiltersOpen(false);
    };
    desktopQuery.addEventListener("change", onViewportChange);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      desktopQuery.removeEventListener("change", onViewportChange);
    };
  }, [filtersOpen]);

  function toggleCategory(value) {
    setSelectedCategories((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]));
    setLoading(true);
    setPage(1);
  }

  function clearCategories() {
    setSelectedCategories([]);
    setLoading(true);
    setPage(1);
  }

  function clearAllFilters() {
    setPriceRange("all");
    setSelectedCategories([]);
    setPage(1);
    setLoading(true);
  }

  function changeSort(value) {
    setLoading(true);
    setPage(1);
    setSort(value);
  }

  const visibleProducts = products.filter((product) => {
    const price = Number(product.price) || 0;
    const priceMatch = priceRange === "all" || (priceRange === "under-100" && price > 0 && price < 100) || (priceRange === "100-500" && price >= 100 && price <= 500) || (priceRange === "over-500" && price > 500) || (priceRange === "on-request" && price <= 0);
    // Category filtering is already applied by the API. Do not apply a second
    // exact-name match here because taxonomy aliases (for example Accessories
    // and its mapped catalog categories) can have different display names and
    // would incorrectly hide valid products from multi-select results.
    return priceMatch;
  });
  const displayProducts = dedupeProducts(visibleProducts);
  const effectiveTotalPages = totalPages;

  const activeChips = [
    ...selectedCategories.map((name) => ({
      key: `category-${name}`,
      label: name,
      onRemove: () => toggleCategory(name),
    })),
    ...(priceRange !== "all"
      ? [{
          key: "price",
          label: PRICE_LABELS[priceRange] || "Price",
          onRemove: () => {
            setPriceRange("all");
            setPage(1);
          },
        }]
      : []),
  ];

  const filterPanelProps = {
    categories,
    selectedCategories,
    onToggleCategory: toggleCategory,
    onClearCategories: clearCategories,
    priceRange,
      onPriceChange: (value) => {
        setPriceRange(value);
        setPage(1);
        const url = new URL(window.location.href);
        if (value === "all") url.searchParams.delete("price");
        else url.searchParams.set("price", value);
        url.searchParams.delete("page");
        window.history.replaceState({}, "", url);
      },
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
      <div className="mb-5 lg:mb-7">
        <DashboardSectionBanner eyebrow="Store / Products" title="All Products" description="Explore the complete collection and filter by category, price, keyword, or SKU." />
      </div>

      <div className="mb-6 rounded-2xl border border-outline-variant/70 bg-surface p-3 shadow-sm sm:p-4 lg:mb-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative min-w-0 flex-1 lg:max-w-2xl">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
            <Input id="product-search" value={keyword} onChange={(event) => { setKeyword(event.target.value); setLoading(true); setPage(1); }} placeholder="Search products by name, SKU or keyword..." aria-label="Search products" className="h-11 w-full border-transparent bg-surface-container-low pl-10 focus:border-primary sm:h-12" />
          </div>
          <div className="hidden shrink-0 items-center gap-2 lg:flex">
            <label htmlFor="sort" className="whitespace-nowrap text-sm font-medium text-on-surface-variant">Sort by</label>
            <Select id="sort" value={sort} onChange={(e) => changeSort(e.target.value)} aria-label="Sort products" className="h-10 w-48">
              {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </Select>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-outline-variant/50 pt-3 text-xs text-on-surface-variant">
          <span className="font-semibold text-on-surface">Find the right fit</span>
          <span>Browse by category</span><span aria-hidden="true" className="text-primary">•</span>
          <span>Compare prices</span><span aria-hidden="true" className="text-primary">•</span>
          <span>Search by SKU</span>
        </div>
      </div>

      {/* Mobile toolbar: filter drawer trigger + compact sort. */}
      <div className="mb-4 flex items-center gap-2 lg:hidden">
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={filtersOpen}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-outline-variant bg-surface px-3 text-sm font-semibold text-on-surface transition hover:border-primary/40 hover:text-primary active:scale-[0.98]"
        >
          <SlidersHorizontal className="size-4" />
          Filters{activeChips.length ? ` (${activeChips.length})` : ""}
        </button>
        <div className="min-w-0 flex-1">
           <Select id="sort-mobile" value={sort} onChange={(e) => changeSort(e.target.value)} aria-label="Sort products" className="h-10">
            {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </Select>
        </div>
      </div>

      {/* Active filter chips: horizontally scrollable, mobile only. */}
      {activeChips.length > 0 ? (
        <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:hidden">
          {activeChips.map((chip) => (
            <span key={chip.key} className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 pl-3.5 pr-2 text-xs font-semibold text-primary">
              <span className="max-w-[45vw] truncate">{chip.label}</span>
              <button type="button" onClick={chip.onRemove} aria-label={`Remove ${chip.label} filter`} className="grid size-6 shrink-0 place-items-center rounded-full transition hover:bg-primary/15">
                <X className="size-3.5" />
              </button>
            </span>
          ))}
          <button type="button" onClick={clearAllFilters} className="h-9 shrink-0 rounded-full border border-outline-variant bg-surface px-3.5 text-xs font-semibold text-on-surface-variant transition hover:text-on-surface">
            Clear
          </button>
        </div>
      ) : null}

      <div className="grid items-start gap-7 lg:grid-cols-[248px_minmax(0,1fr)]">
        {/* Desktop filter sidebar — unchanged from the original lg design. */}
        <aside className="min-w-0 rounded-2xl border border-outline-variant/70 bg-surface p-5 shadow-sm lg:block hidden">
          <div className="mb-1 flex items-center justify-between"><h2 className="text-sm font-bold text-on-surface">Refine results</h2><button type="button" onClick={clearAllFilters} className="text-xs font-semibold text-on-surface-variant underline hover:text-on-surface">Clear all</button></div>
          <ProductFilters variant="sidebar" {...filterPanelProps} />
        </aside>

        <div className="min-w-0">
          {loading ? <ProductGridSkeleton count={PAGE_SIZE} columns={GRID_CLASSES} /> : displayProducts.length ? <div className={GRID_CLASSES}>{displayProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <EmptyState title="No products found" description="No products match your search. Try a different filter." />}
        {!loading && displayProducts.length ? (
          <div className="mt-6 border-t border-outline-variant/70 pt-5">
            <Pagination
              page={page}
              totalPages={effectiveTotalPages}
              onPageChange={(p) => {
                setLoading(true);
                setPage(p);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </div>
        ) : null}
        </div>
      </div>

      {/* Mobile filter bottom sheet — same shared filter component/state as the sidebar. */}
      <div className={`fixed inset-0 z-[70] lg:hidden ${filtersOpen ? "" : "pointer-events-none"}`} aria-hidden={!filtersOpen} inert={!filtersOpen}>
        <div
          aria-hidden="true"
          onClick={() => setFiltersOpen(false)}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ease-out ${filtersOpen ? "opacity-100" : "opacity-0"}`}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Filters"
          className={`fixed inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-2xl bg-surface shadow-2xl transition-transform duration-300 ease-out ${filtersOpen ? "translate-y-0" : "translate-y-full"}`}
        >
          <div className="flex items-center justify-between gap-3 border-b border-outline-variant px-4 py-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-on-surface">Filters</h2>
              {activeChips.length ? <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-white">{activeChips.length}</span> : null}
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={clearAllFilters} className="px-2 py-2 text-xs font-semibold text-on-surface-variant underline-offset-2 hover:underline">Clear all</button>
              <button type="button" onClick={() => setFiltersOpen(false)} aria-label="Close filters" className="grid h-9 w-9 place-items-center rounded-full text-on-surface-variant transition hover:bg-surface-container-low hover:text-primary">
                <X className="size-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-2">
            <ProductFilters variant="sheet" {...filterPanelProps} />
          </div>
          <div className="border-t border-outline-variant px-4 py-3">
            <button type="button" onClick={() => setFiltersOpen(false)} className="h-11 w-full rounded-lg bg-primary text-sm font-semibold text-white transition hover:bg-primary-container">
              Show {visibleProducts.length} products
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProductsLoadingPreview() {
  return <ProductGridSkeleton count={PAGE_SIZE} columns={GRID_CLASSES} />;
}
