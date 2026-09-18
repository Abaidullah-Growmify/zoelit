import { ProductGridSkeleton } from "@/components/skeletons";
import { Card, Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <section className="container-page !max-w-[1200px] py-10 sm:py-14">
      <div className="mb-7">
        <div className="mb-4 flex items-center gap-2">
          <Skeleton className="h-3 w-12 rounded-sm" />
          <Skeleton className="h-3 w-2 rounded-sm" />
          <Skeleton className="h-3 w-24 rounded-sm" />
        </div>
        <Skeleton className="h-9 w-56 max-w-full rounded-sm" />
        <Skeleton className="mt-3 h-4 w-96 max-w-full rounded-sm" />
      </div>

      <div className="relative mb-7 max-w-xl">
        <Skeleton className="h-12 w-full rounded-md" />
      </div>

      <div className="grid items-start gap-7 lg:grid-cols-[240px_minmax(0,1fr)]">
        <Card className="rounded-[14px] p-5">
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

        <div>
          <div className="mb-5 flex items-center justify-between gap-4 border-b border-outline-variant pb-4">
            <Skeleton className="h-4 w-24 rounded-sm" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-14 rounded-sm" />
              <Skeleton className="h-10 w-36 rounded-md" />
            </div>
          </div>
          <ProductGridSkeleton count={6} />
        </div>
      </div>
    </section>
  );
}
