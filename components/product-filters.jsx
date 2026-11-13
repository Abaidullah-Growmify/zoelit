"use client";

import { useState } from "react";

const PRICE_OPTIONS = [
  ["all", "Any price"],
  ["under-100", "Under $100"],
  ["100-500", "$100-500"],
  ["over-500", "$500+"],
  ["on-request", "On request"],
];

const HEADING_CLASS = "mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-on-surface-variant";
const SHEET_VISIBLE_CATEGORIES = 6;

export function ProductFilters({
  categories,
  selectedCategories = [],
  onToggleCategory,
  onClearCategories,
  priceRange,
  onPriceChange,
  variant = "sidebar",
}) {
  const isSheet = variant === "sheet";
  const [showAllCategories, setShowAllCategories] = useState(false);

  const categoryOptions = categories.filter((item) => item !== "All");
  const visibleCategories = isSheet && !showAllCategories ? categoryOptions.slice(0, SHEET_VISIBLE_CATEGORIES) : categoryOptions;

  // The sheet needs comfortable 44px tap targets; the desktop sidebar keeps its
  // original compact rows so the lg layout stays unchanged.
  const rowClass = isSheet
    ? "flex min-h-[44px] cursor-pointer items-center gap-3 py-2.5 text-sm text-on-surface-variant"
    : "mb-3 flex cursor-pointer items-center gap-2 text-sm text-on-surface-variant";

  const categorySectionClass = isSheet
    ? "py-4"
    : "mt-5 max-h-[330px] overflow-y-auto border-t border-outline-variant pt-5 pr-2";
  const sectionClass = isSheet ? "py-4" : "mt-5 border-t border-outline-variant pt-5";

  return (
    <div className={isSheet ? "divide-y divide-outline-variant/60" : undefined}>
      <fieldset className={categorySectionClass}>
        {isSheet ? (
          <div className="mb-1 flex items-center justify-between gap-3">
            <legend className={HEADING_CLASS}>Category</legend>
            {selectedCategories.length > 0 ? (
              <button type="button" onClick={onClearCategories} className="shrink-0 text-xs font-semibold text-primary underline-offset-2 hover:underline">
                Clear
              </button>
            ) : null}
          </div>
        ) : (
          <legend className={HEADING_CLASS}>Category</legend>
        )}
        {visibleCategories.map((item) => (
          <label key={item} className={rowClass}>
            <input type="checkbox" checked={selectedCategories.includes(item)} onChange={() => onToggleCategory(item)} className="size-4 shrink-0 accent-primary" />
            <span className={isSheet ? "min-w-0 truncate" : ""}>{item}</span>
          </label>
        ))}
        {isSheet && categoryOptions.length > SHEET_VISIBLE_CATEGORIES ? (
          <button
            type="button"
            onClick={() => setShowAllCategories((open) => !open)}
            className="mt-1 min-h-[44px] w-full rounded-lg px-2 text-left text-sm font-semibold text-primary hover:bg-primary/5"
          >
            {showAllCategories ? "Show less" : `Show more (${categoryOptions.length - SHEET_VISIBLE_CATEGORIES})`}
          </button>
        ) : null}
      </fieldset>

      <fieldset className={sectionClass}>
        <legend className={HEADING_CLASS}>Price</legend>
        {PRICE_OPTIONS.map(([value, label]) => (
          <label key={value} className={rowClass}>
            <input
              type="radio"
              name={isSheet ? "price-sheet" : "price-sidebar"}
              value={value}
              checked={priceRange === value}
              onChange={() => onPriceChange(value)}
              className="size-4 shrink-0 accent-primary"
            />
            <span className="min-w-0">{label}</span>
          </label>
        ))}
      </fieldset>

    </div>
  );
}
