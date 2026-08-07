"use client";

import { useId, useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

function Stars({ rating }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`Rated ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((step) => (
        <Star
          key={step}
          className={cn("size-4", step <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-600")}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

const tabs = [
  { id: "details", label: "Details & care" },
  { id: "reviews", label: "Reviews" },
];

export function ProductTabs({ product }) {
  const baseId = useId();
  const [active, setActive] = useState("details");

  function activate(id) {
    setActive(id);
  }

  function handleKeyDown(event) {
    const index = tabs.findIndex((tab) => tab.id === active);
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    else return;
    event.preventDefault();
    activate(tabs[next].id);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200/90 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-900/95">
      <div role="tablist" aria-label="Product information" onKeyDown={handleKeyDown} className="flex border-b border-slate-200 dark:border-slate-800">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`${baseId}-${tab.id}-tab`}
              aria-selected={isActive}
              aria-controls={`${baseId}-${tab.id}-panel`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => activate(tab.id)}
              className={cn(
                "relative flex-1 px-5 py-4 text-sm font-bold transition dark:text-slate-400",
                isActive ? "text-slate-950 dark:text-white" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              )}
            >
              {tab.id === "reviews" ? `${tab.label} (${product.reviews.length})` : tab.label}
              <span className={cn("absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-blue-600 transition-opacity duration-200", isActive ? "opacity-100" : "opacity-0")} />
            </button>
          );
        })}
      </div>

      <div className="p-5 sm:p-6">
        {active === "details" ? (
          <div id={`${baseId}-details-panel`} role="tabpanel" aria-labelledby={`${baseId}-details-tab`} className="tab-reveal" key="details">
            <dl className="divide-y divide-slate-100 dark:divide-slate-800">
              {Object.entries(product.details).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between gap-6 py-3">
                  <dt className="text-sm font-bold text-slate-500 dark:text-slate-400">{key}</dt>
                  <dd className="text-right text-sm font-bold text-slate-950 dark:text-white">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : (
          <div id={`${baseId}-reviews-panel`} role="tabpanel" aria-labelledby={`${baseId}-reviews-tab`} className="tab-reveal" key="reviews">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
              <span className="font-heading text-3xl font-extrabold tabular-nums text-slate-950 dark:text-white">{product.rating}</span>
              <div className="text-right">
                <Stars rating={product.rating} />
                <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{product.reviews.length} verified {product.reviews.length === 1 ? "review" : "reviews"}</p>
              </div>
            </div>
            <div className="mt-4 space-y-4">
              {product.reviews.map((review) => (
                <article key={`${review.name}-${review.title}`} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-bold text-slate-950 dark:text-white">{review.name}</span>
                    <Stars rating={review.rating} />
                  </div>
                  <p className="mt-2 text-sm font-bold leading-5 text-slate-900 dark:text-slate-100">{review.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{review.comment}</p>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}