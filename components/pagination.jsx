"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function getPageNumbers(current, total) {
  // Chhoti pagination ho to saare pages show kar do
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  // Hamesha first aur last page dikhega, beech me current ke aas-paas
  // ka window slide karta rahega: 1 2 3 ... 24 25 26 ... 60
  if (current <= 3) {
    return [1, 2, 3, 4, "...", total];
  }

  if (current >= total - 2) {
    return [1, "...", total - 3, total - 2, total - 1, total];
  }

  return [1, "...", current - 1, current, current + 1, "...", total];
}

function getCompactPageNumbers(current, total) {
  // Mobile par compact window: 1 2 3 ... 40 | 1 ... 12 ... 40 | 1 ... 38 39 40
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 2) {
    return [1, 2, 3, "...", total];
  }

  if (current >= total - 1) {
    return [1, "...", total - 2, total - 1, total];
  }

  return [1, "...", current, "...", total];
}

function ArrowButton({ direction, page, totalPages, onPageChange, compact = false }) {
  const isPrevious = direction === "previous";
  const disabled = isPrevious ? page <= 1 : page >= totalPages;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onPageChange(isPrevious ? page - 1 : page + 1)}
      aria-label={isPrevious ? "Previous page" : "Next page"}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md border border-outline-variant bg-surface font-medium transition",
        compact ? "size-8" : "h-9 gap-1.5 px-2.5 text-sm sm:h-10 sm:px-4",
        disabled
          ? "cursor-not-allowed text-on-surface-variant opacity-40"
          : "text-on-surface-variant hover:border-primary/40 hover:bg-surface-container-low hover:text-primary"
      )}
    >
      {isPrevious ? <ChevronLeft className="size-3.5" /> : null}
      {compact ? null : <span className="hidden sm:inline">{isPrevious ? "Previous" : "Next"}</span>}
      {isPrevious ? null : <ChevronRight className="size-3.5" />}
    </button>
  );
}

function PageList({ pages, page, onPageChange, compact = false }) {
  return pages.map((item, index) => {
    if (item === "...") {
      return (
        <span
          key={`ellipsis-${index}`}
          className={cn(
            "inline-flex items-center justify-center text-label-sm text-on-surface-variant",
            compact ? "h-8 w-4" : "h-9 w-6 sm:h-10 sm:w-8"
          )}
        >
          ...
        </span>
      );
    }

    const isActive = item === page;

    return (
      <button
        key={item}
        type="button"
        onClick={() => onPageChange(item)}
        aria-current={isActive ? "page" : undefined}
        aria-label={`Page ${item}`}
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-md border border-outline-variant bg-surface font-medium transition",
          compact ? "size-8 text-xs" : "h-9 min-w-9 px-2 text-sm sm:h-10 sm:min-w-10 sm:px-3.5",
          isActive
            ? "border-primary bg-primary text-white"
            : "text-on-surface-variant hover:border-primary/40 hover:bg-surface-container-low hover:text-primary"
        )}
      >
        {item}
      </button>
    );
  });
}

export default function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
}) {
  // Agar sirf 1 page hai to pagination ki zaroorat nahi
  if (totalPages <= 1) return null;

  return (
    <div className={cn("flex min-w-0 justify-center", className)}>
      {/* Mobile: compact first / current / last pagination, ek hi line me fit */}
      <nav
        aria-label="Pagination"
        className="flex items-center justify-center gap-1 sm:hidden"
      >
        <ArrowButton direction="previous" page={page} totalPages={totalPages} onPageChange={onPageChange} compact />
        <PageList pages={getCompactPageNumbers(page, totalPages)} page={page} onPageChange={onPageChange} compact />
        <ArrowButton direction="next" page={page} totalPages={totalPages} onPageChange={onPageChange} compact />
      </nav>

      {/* Desktop / tablet: sliding window pagination */}
      <nav
        aria-label="Pagination"
        className="hidden flex-wrap items-center justify-center gap-1.5 sm:flex"
      >
        <ArrowButton direction="previous" page={page} totalPages={totalPages} onPageChange={onPageChange} />
        <PageList pages={getPageNumbers(page, totalPages)} page={page} onPageChange={onPageChange} />
        <ArrowButton direction="next" page={page} totalPages={totalPages} onPageChange={onPageChange} />
      </nav>
    </div>
  );
}
