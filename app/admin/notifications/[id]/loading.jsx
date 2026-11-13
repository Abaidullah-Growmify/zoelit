import { Card, Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <Card className="overflow-hidden p-0">
        <div className="px-4 py-6 sm:px-8 sm:py-9">
          <div className="min-w-0 space-y-3">
            <Skeleton className="h-3 w-24 rounded-sm" />
            <Skeleton className="h-7 w-64 max-w-full rounded-sm sm:h-8 sm:w-80" />
            <Skeleton className="h-4 w-40 max-w-full rounded-sm" />
          </div>
        </div>
        <div className="space-y-5 px-4 py-5 sm:space-y-6 sm:px-8 sm:py-8">
          <div className="rounded-xl border border-outline-variant/70 bg-surface-container-low/45 p-4 sm:p-6">
            <Skeleton className="h-4 w-full rounded-sm" />
            <Skeleton className="mt-2 h-4 w-11/12 rounded-sm" />
            <Skeleton className="mt-2 h-4 w-3/4 rounded-sm" />
          </div>
          <div className="border-t border-outline-variant/70 pt-6 sm:pt-8">
            <div className="grid gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
              <Card className="min-w-0 p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 space-y-2">
                    <Skeleton className="h-5 w-28 max-w-full rounded-sm sm:h-6" />
                    <Skeleton className="h-4 w-40 max-w-full rounded-sm" />
                  </div>
                  <Skeleton className="size-5 shrink-0 rounded-sm" />
                </div>
                <div className="mt-5 divide-y divide-outline-variant/60">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <div key={index} className="flex gap-3 py-4 first:pt-0 last:pb-0">
                      <Skeleton className="size-16 shrink-0 rounded-lg" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <Skeleton className="h-4 w-2/3 max-w-full rounded-sm" />
                        <Skeleton className="h-3 w-24 max-w-full rounded-sm" />
                      </div>
                      <Skeleton className="h-4 w-16 shrink-0 rounded-sm" />
                    </div>
                  ))}
                </div>
                <div className="mt-5 space-y-2 border-t border-outline-variant/70 pt-5">
                  <Skeleton className="h-4 w-full rounded-sm" />
                  <Skeleton className="h-4 w-full rounded-sm" />
                  <Skeleton className="h-5 w-full rounded-sm" />
                </div>
              </Card>
              <div className="space-y-4 sm:space-y-5">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index} className="p-4 sm:p-5">
                    <Skeleton className="h-4 w-24 max-w-full rounded-sm" />
                    <Skeleton className="mt-3 h-4 w-full rounded-sm" />
                    <Skeleton className="mt-2 h-4 w-3/4 rounded-sm" />
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
