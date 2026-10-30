import { Card, Skeleton } from "@/components/ui";

export function ShopBannerSkeleton() {
  return <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-surface to-surface p-0 shadow-sm"><div className="flex min-h-[92px] flex-col justify-center gap-2 p-5 sm:min-h-[104px] sm:p-6"><Skeleton className="h-3 w-28 rounded-sm" /><Skeleton className="h-7 w-64 max-w-full rounded-md sm:h-8" /><Skeleton className="h-4 w-full max-w-2xl rounded-sm" /></div></Card>;
}

export function FAQPageSkeleton() {
  return <section className="container-page min-w-0 py-6 sm:py-10 lg:py-14">
    <div className="mb-6 lg:mb-8"><ShopBannerSkeleton /></div>
    <div className="grid min-w-0 gap-3 sm:grid-cols-3 sm:gap-4">
      {Array.from({ length: 3 }).map((_, index) => <Card key={index} className="flex min-w-0 items-start gap-3 p-4 shadow-sm sm:p-5"><Skeleton className="size-10 shrink-0 rounded-xl" /><div className="min-w-0 flex-1"><Skeleton className="h-5 w-36 max-w-full" /><Skeleton className="mt-2 h-4 w-full" /><Skeleton className="mt-1.5 h-4 w-4/5" /></div></Card>)}
    </div>
    <div className="mt-8 flex min-w-0 flex-col items-start justify-between gap-3 border-b border-outline-variant/70 pb-4 sm:mt-10 sm:flex-row sm:items-end sm:gap-4"><div><Skeleton className="h-3 w-28" /><Skeleton className="mt-2 h-8 w-72 max-w-full rounded-md" /></div><Skeleton className="hidden h-4 w-24 sm:block" /></div>
    <div className="mt-6 grid w-full gap-3 sm:mt-8 sm:gap-4">
      {Array.from({ length: 6 }).map((_, index) => <Card key={index} className="overflow-hidden rounded-2xl p-0 shadow-sm"><div className="flex items-center gap-4 p-5 sm:p-6"><Skeleton className="size-10 shrink-0 rounded-xl" /><Skeleton className="h-5 w-full max-w-lg" /><Skeleton className="ml-auto size-5 shrink-0 rounded-sm" /></div>{index === 0 ? <div className="px-5 pb-5 pl-[4.5rem] sm:px-6 sm:pb-6 sm:pl-20"><Skeleton className="h-4 w-full max-w-3xl" /><Skeleton className="mt-2 h-4 w-4/5 max-w-2xl" /></div> : null}</Card>)}
    </div>
    <Card className="mt-6 flex w-full min-w-0 flex-col gap-4 border-primary/20 bg-gradient-to-r from-primary to-primary-container p-4 shadow-sm sm:mt-8 sm:flex-row sm:items-center sm:justify-between sm:p-7"><div className="max-w-2xl"><Skeleton className="h-3 w-24 bg-white/30" /><Skeleton className="mt-2 h-6 w-72 max-w-full bg-white/30" /><Skeleton className="mt-2 h-4 w-full max-w-xl bg-white/30" /></div><Skeleton className="h-11 w-full rounded-xl bg-white/30 sm:w-40" /></Card>
  </section>;
}

export function ContactPageSkeleton() {
  return <main className="container-page min-w-0 py-6 sm:py-10 lg:py-14">
    <div className="mb-6 lg:mb-8"><ShopBannerSkeleton /></div>
    <div className="grid min-w-0 gap-5 sm:gap-6 lg:grid-cols-[.85fr_1.15fr]">
      <div className="grid content-start gap-3">
        <ContactInfoSkeleton lines={1} />
        <ContactInfoSkeleton lines={3} />
        <ContactInfoSkeleton lines={1} />
        <Card className="p-4 sm:p-4"><div className="flex items-start gap-3"><Skeleton className="mt-0.5 size-5 shrink-0 rounded-full" /><div className="min-w-0 flex-1"><Skeleton className="h-5 w-44 max-w-full" /><Skeleton className="mt-2 h-4 w-full max-w-sm" /><Skeleton className="mt-3 h-4 w-32" /></div></div></Card>
      </div>
      <Card className="min-w-0 p-4 sm:p-5"><div className="flex items-start gap-3"><Skeleton className="size-11 shrink-0 rounded-xl" /><div className="min-w-0 flex-1"><Skeleton className="h-7 w-52 max-w-full" /><Skeleton className="mt-2 h-4 w-full max-w-md" /></div></div><div className="mt-5 grid gap-4 md:grid-cols-2"><ContactFieldSkeleton /><ContactFieldSkeleton /><ContactFieldSkeleton /><ContactFieldSkeleton /><div className="md:col-span-2"><Skeleton className="h-4 w-20" /><Skeleton className="mt-2 h-28 w-full rounded-md" /></div><Skeleton className="h-9 w-full rounded-md sm:w-32" /></div></Card>
    </div>
    <div className="mt-8"><Skeleton className="h-3 w-20" /><Skeleton className="mt-2 h-6 w-64 max-w-full" /><div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2 sm:gap-4"><OfficeSkeleton /><OfficeSkeleton /></div></div>
  </main>;
}

function ContactInfoSkeleton({ lines }) {
  return <Card className="flex items-start gap-3 p-4 sm:p-4"><Skeleton className="size-10 shrink-0 rounded-xl" /><div className="min-w-0 flex-1"><Skeleton className="h-5 w-32" /><div className="mt-2 grid gap-1.5">{Array.from({ length: lines }).map((_, index) => <Skeleton key={index} className={`h-4 ${index === 0 ? "w-44" : "w-36"} max-w-full`} />)}</div></div></Card>;
}

function ContactFieldSkeleton() {
  return <div className="grid gap-1.5"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full rounded-md" /></div>;
}

function OfficeSkeleton() {
  return <Card className="flex min-w-0 items-start gap-3 p-4 shadow-sm sm:p-5"><Skeleton className="size-10 shrink-0 rounded-xl" /><div className="min-w-0 flex-1"><Skeleton className="h-4 w-24" /><Skeleton className="mt-2 h-4 w-full" /><Skeleton className="mt-1.5 h-4 w-48 max-w-full" /></div></Card>;
}
