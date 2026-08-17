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
      {/* Previous Button */}
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className={cn(
          "inline-flex h-10 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition",
          page <= 1
            ? "cursor-not-allowed border-slate-200 bg-white text-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-600"
            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-white"
        )}
      >
        <ChevronLeft className="size-3.5" />

        <span className="hidden sm:inline">
          Previous
        </span>
      </button>

      {/* Page Numbers */}
      {pages.map((item, index) => {
        // Dots
        if (item === "...") {
          return (
            <span
              key={`ellipsis-${index}`}
              className="inline-flex h-10 w-8 items-center justify-center text-sm text-slate-400"
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
              // Rounded rectangle
              "inline-flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm font-medium transition",

              // Active page
              isActive
                ? "border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-600/20"

                // Normal pages
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-white"
            )}
          >
            {item}
          </button>
        );
      })}

      {/* Next Button */}
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className={cn(
          "inline-flex h-10 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition",
          page >= totalPages
            ? "cursor-not-allowed border-slate-200 bg-white text-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-600"
            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-white"
        )}
      >
        <span className="hidden sm:inline">
          Next
        </span>

        <ChevronRight className="size-3.5" />
      </button>
    </nav>
  );
}