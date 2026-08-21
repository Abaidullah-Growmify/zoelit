"use client";

import { useId, useState } from "react";
import { Star } from "lucide-react";
import { Card } from "@/components/ui";
import { cn } from "@/lib/utils";

function Stars({ rating }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`Rated ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((step) => (
        <Star
          key={step}
          className={cn("size-4", step <= Math.round(rating) ? "fill-secondary text-secondary" : "text-on-surface-variant")}
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
  const visibleTabs = product.reviews.length ? tabs : tabs.filter((tab) => tab.id !== "reviews");

  function activate(id) {
    setActive(id);
  }

  function handleKeyDown(event) {
    const index = visibleTabs.findIndex((tab) => tab.id === active);
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % visibleTabs.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + visibleTabs.length) % visibleTabs.length;
    else return;
    event.preventDefault();
    activate(visibleTabs[next].id);
  }

  return (
    <Card className="overflow-hidden p-0">
      <div role="tablist" aria-label="Product information" onKeyDown={handleKeyDown} className="flex border-b border-outline-variant/80">
        {visibleTabs.map((tab) => {
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
                "relative flex-1 px-5 py-4 text-label-md font-semibold transition",
                isActive ? "text-on-surface" : "text-on-surface-variant hover:text-primary"
              )}
            >
              {tab.id === "reviews" ? `${tab.label} (${product.reviews.length})` : tab.label}
              <span className={cn("absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-primary transition-opacity duration-200", isActive ? "opacity-100" : "opacity-0")} />
            </button>
          );
        })}
      </div>

      <div className="p-5 sm:p-6">
        {active === "details" ? (
          <div id={`${baseId}-details-panel`} role="tabpanel" aria-labelledby={`${baseId}-details-tab`} className="tab-reveal" key="details">
            <dl className="divide-y divide-outline-variant/40">
              {Object.entries(product.details).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between gap-6 py-3">
                  <dt className="text-label-sm font-semibold text-on-surface-variant">{key}</dt>
                  <dd className="text-right text-label-sm font-semibold text-on-surface">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : (
          <div id={`${baseId}-reviews-panel`} role="tabpanel" aria-labelledby={`${baseId}-reviews-tab`} className="tab-reveal" key="reviews">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/40 pb-4">
              <span className="font-heading text-headline-lg font-extrabold tabular-nums text-on-surface">{product.rating}</span>
              <div className="text-right">
                <Stars rating={product.rating} />
                <p className="mt-1 text-label-sm font-semibold text-on-surface-variant">{product.reviews.length} verified {product.reviews.length === 1 ? "review" : "reviews"}</p>
              </div>
            </div>
            <div className="mt-4 space-y-4">
              {product.reviews.map((review) => (
                <article key={`${review.name}-${review.title}`} className="rounded-xl border border-outline-variant/70 bg-surface-container-lowest p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-label-md font-semibold text-on-surface">{review.name}</span>
                    <Stars rating={review.rating} />
                  </div>
                  <p className="mt-2 text-label-md font-semibold leading-5 text-on-surface">{review.title}</p>
                  <p className="mt-1 text-body-md leading-6 text-on-surface-variant">{review.comment}</p>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
