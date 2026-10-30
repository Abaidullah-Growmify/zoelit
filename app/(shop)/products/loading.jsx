"use client";

import { usePathname } from "next/navigation";
import { ProductGridSkeleton } from "@/components/skeletons";
import { ProductDetailSkeleton } from "@/components/skeletons";
import { Card, Skeleton } from "@/components/ui";
import { ShopBannerSkeleton } from "@/components/shop-page-skeletons";

export default function Loading() {
  const pathname = usePathname();

  if (/^\/products\/[^/]+/.test(pathname || "")) {
    return <section className="container-page py-12"><ProductDetailSkeleton /></section>;
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
      <div className="mb-5 lg:mb-7">
        <ShopBannerSkeleton />
      </div>

      <div className="mb-6 rounded-2xl border border-outline-variant/70 bg-surface p-3 shadow-sm sm:p-4 lg:mb-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><Skeleton className="h-11 w-full max-w-2xl rounded-md sm:h-12" /><div className="hidden shrink-0 items-center gap-2 lg:flex"><Skeleton className="h-4 w-14 rounded-sm" /><Skeleton className="h-10 w-48 rounded-md" /></div></div>
        <div className="mt-3 flex flex-wrap gap-3 border-t border-outline-variant/50 pt-3"><Skeleton className="h-3 w-28" /><Skeleton className="h-3 w-32" /><Skeleton className="h-3 w-24" /></div>
      </div>

      <div className="mb-4 flex items-center gap-2 lg:hidden">
        <Skeleton className="h-10 w-32 shrink-0 rounded-lg" />
        <Skeleton className="h-10 min-w-0 flex-1 rounded-md" />
      </div>

      <div className="mb-3 lg:hidden">
        <Skeleton className="h-4 w-24 rounded-sm" />
      </div>

      <div className="grid items-start gap-7 lg:grid-cols-[248px_minmax(0,1fr)]">
        <Card className="hidden rounded-2xl p-5 lg:block">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-16 rounded-sm" />
            <Skeleton className="h-3 w-14 rounded-sm" />
          </div>
          <div className="mt-5 border-t border-outline-variant pt-5">
            <Skeleton className="h-3 w-20 rounded-sm" />
            <div className="mt-4 space-y-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Skeleton className="size-4 rounded-sm" />
                  <Skeleton className={index % 3 === 0 ? "h-4 w-28 rounded-sm" : "h-4 w-36 rounded-sm"} />
                </div>
              ))}
            </div>
          </div>
          <div className="mt-5 border-t border-outline-variant pt-5">
            <Skeleton className="h-3 w-12 rounded-sm" />
            <div className="mt-4 space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Skeleton className="size-4 rounded-full" />
                  <Skeleton className="h-4 w-28 rounded-sm" />
                </div>
              ))}
            </div>
          </div>
          <div className="mt-5 border-t border-outline-variant pt-5">
            <Skeleton className="h-3 w-14 rounded-sm" />
            <div className="mt-4 space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Skeleton className="size-4 rounded-full" />
                  <Skeleton className="h-4 w-24 rounded-sm" />
                </div>
              ))}
            </div>
          </div>
        </Card>

        <div className="min-w-0">
          <ProductGridSkeleton count={12} columns="product-grid grid-home grid-catalog grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:gap-5" />
        </div>
      </div>
    </section>
  );
}
