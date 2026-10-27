import { Card, Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <div className="space-y-5 sm:space-y-6">
      <Card className="overflow-hidden p-0">
        <div className="bg-surface-container-low/40 p-5 sm:p-7">
          <Skeleton className="h-8 w-64 max-w-full" />
          <Skeleton className="mt-2 h-4 w-full max-w-xl" />
          <div className="mt-6 grid gap-2 sm:grid-cols-3"><Skeleton className="h-20 w-full rounded-lg" /><Skeleton className="h-20 w-full rounded-lg" /><Skeleton className="h-20 w-full rounded-lg" /></div>
        </div>
        <div className="mt-5 flex items-center border-b border-outline-variant/80 px-0"><Skeleton className="mx-4 h-6 w-20" /><Skeleton className="h-6 w-24" /></div>
        <div className="pt-5"><div className="hidden grid-cols-[48px_minmax(0,1.2fr)_minmax(0,2fr)_170px_64px] gap-4 border-b border-outline-variant/60 px-6 py-3 sm:grid"><Skeleton className="h-3 w-5" /><Skeleton className="h-3 w-28" /><Skeleton className="h-3 w-20" /><Skeleton className="h-3 w-20" /><Skeleton className="h-3 w-14" /></div>{Array.from({ length: 6 }).map((_, index) => <div key={index} className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-3 border-b border-outline-variant/60 px-4 py-4 sm:grid-cols-[48px_minmax(0,1.2fr)_minmax(0,2fr)_170px_64px] sm:items-center sm:gap-4 sm:px-6"><Skeleton className="hidden h-4 w-5 sm:block" /><div className="flex min-w-0 items-center"><Skeleton className="h-4 w-36 max-w-full" /></div><Skeleton className="col-span-2 h-4 w-full max-w-md sm:col-span-1" /><Skeleton className="hidden h-4 w-28 sm:block" /><Skeleton className="col-span-2 ml-auto size-8 sm:col-span-1 sm:ml-0" /></div>)}</div>
      </Card>
    </div>
  );
}
