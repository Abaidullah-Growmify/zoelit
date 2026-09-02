"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function getPageNumbers(current, total) {
  // Agar total pages 7 ya us se kam hain
  // to saare pages show kar do
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = [];

  // First page hamesha show hogi
  pages.push(1);

  // Agar current page 4 ya us se aage hai
  // to first page ke baad dots show honge
  if (current > 4) {
    pages.push("...");
  }

  let start;
  let end;

  // Starting pages
  if (current <= 4) {
    start = 2;
    end = 5;
  }
  // Ending pages
  else if (current >= total - 3) {
    start = total - 4;
    end = total - 1;
  }
  // Middle pages
  else {
    start = current - 2;
    end = current + 2;
  }

  // 5 page numbers add karna
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  // Agar last pages ke qareeb nahi hain
  // to dots show honge
  if (current < total - 3) {
    pages.push("...");
  }

  // Last page hamesha show hogi
  pages.push(total);

  return pages;
}

export default function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
}) {
  // Agar sirf 1 page hai to pagination ki zaroorat nahi
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(page, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        "flex items-center justify-center gap-1.5",
        className
      )}
    >
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className={cn(
           "inline-flex h-10 items-center gap-1.5 rounded-md border border-outline-variant bg-surface px-4 text-sm font-medium transition",
           page <= 1
             ? "cursor-not-allowed text-on-surface-variant opacity-40"
             : "text-on-surface-variant hover:border-primary/40 hover:bg-surface-container-low hover:text-primary"
        )}
      >
        <ChevronLeft className="size-3.5" />
        <span className="hidden sm:inline">Previous</span>
      </button>

      {pages.map((item, index) => {
        if (item === "...") {
          return (
            <span
              key={`ellipsis-${index}`}
              className="inline-flex h-10 w-8 items-center justify-center text-label-sm text-on-surface-variant"
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
            className={cn(
              "inline-flex h-10 min-w-10 items-center justify-center rounded-md border border-outline-variant bg-surface px-3.5 text-sm font-medium transition",
              isActive
                ? "border-primary bg-primary text-white"
                : "text-on-surface-variant hover:border-primary/40 hover:bg-surface-container-low hover:text-primary"
            )}
          >
            {item}
          </button>
        );
      })}

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className={cn(
           "inline-flex h-10 items-center gap-1.5 rounded-md border border-outline-variant bg-surface px-4 text-sm font-medium transition",
           page >= totalPages
             ? "cursor-not-allowed text-on-surface-variant opacity-40"
             : "text-on-surface-variant hover:border-primary/40 hover:bg-surface-container-low hover:text-primary"
        )}
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="size-3.5" />
      </button>
    </nav>
  );
}
