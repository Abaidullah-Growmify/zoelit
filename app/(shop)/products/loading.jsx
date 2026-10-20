import { ProductGridSkeleton } from "@/components/skeletons";
import { Card, Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
      <div className="mb-5 lg:mb-7">
        <div className="mb-4 flex items-center gap-2">
          <Skeleton className="h-3 w-12 rounded-sm" />
          <Skeleton className="h-3 w-2 rounded-sm" />
          <Skeleton className="h-3 w-24 rounded-sm" />
        </div>
        <Skeleton className="h-8 w-56 max-w-full rounded-sm" />
        <Skeleton className="mt-3 h-4 w-96 max-w-full rounded-sm" />
      </div>

      <div className="relative mb-5 w-full max-w-none lg:mb-7 lg:max-w-xl">
        <Skeleton className="h-11 w-full rounded-md sm:h-12" />
      </div>

      <div className="mb-4 flex items-center gap-2 lg:hidden">
        <Skeleton className="h-10 w-32 shrink-0 rounded-lg" />
        <Skeleton className="h-10 min-w-0 flex-1 rounded-md" />
      </div>

      <div className="mb-3 lg:hidden">
        <Skeleton className="h-4 w-24 rounded-sm" />
      </div>

      <div className="grid items-start gap-7 lg:grid-cols-[240px_minmax(0,1fr)]">
        <Card className="hidden rounded-[14px] p-5 lg:block">
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
          <div className="mb-5 hidden items-center justify-between gap-4 border-b border-outline-variant pb-4 lg:flex">
            <Skeleton className="h-4 w-24 rounded-sm" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-14 rounded-sm" />
              <Skeleton className="h-10 w-36 rounded-md" />
            </div>
          </div>
          <ProductGridSkeleton count={12} columns="product-grid grid-home grid-catalog grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:gap-5" />
        </div>
      </div>
    </section>
  );
}
