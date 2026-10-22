"use client";

import { useId } from "react";
import { Card } from "@/components/ui";
import { cn } from "@/lib/utils";

export function ProductTabs({ product }) {
  const baseId = useId();

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-outline-variant/80 px-5 py-4 text-label-md font-semibold text-on-surface">
        Details &amp; care
      </div>

      <div className="p-5 sm:p-6">
        <div id={`${baseId}-details-panel`} className="tab-reveal">
          <dl className="divide-y divide-outline-variant/40">
            {Object.entries(product.details).map(([key, value]) => (
              <div key={key} className={cn("min-w-0 gap-3 py-3", key === "Details" ? "block" : "grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] items-start sm:flex sm:items-center sm:justify-between sm:gap-6")}>
                <dt className={cn("min-w-0 text-xs font-semibold text-on-surface-variant sm:text-label-sm", key === "Details" && "block")}>{key}</dt>
                <dd className={cn("min-w-0 break-words text-xs font-semibold text-on-surface [overflow-wrap:anywhere] sm:text-label-sm", key === "Details" ? "mt-1.5 text-left leading-5 sm:mt-2" : "text-right")}>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Card>
  );
}
