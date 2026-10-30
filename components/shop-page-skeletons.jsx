import { Card, Skeleton } from "@/components/ui";

export function ShopBannerSkeleton() {
  return <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-surface to-surface p-0 shadow-sm"><div className="flex min-h-[100px] sm:min-h-[110px] md:min-h-[120px] flex-col justify-center gap-2"><Skeleton className="h-3 w-28 rounded-sm" /><Skeleton className="h-9 w-64 max-w-full rounded-md" /><Skeleton className="h-4 w-full max-w-2xl rounded-sm" /></div></Card>;
}

export function FAQPageSkeleton() {
  return <section className="container-page py-4 sm:py-6 lg:py-8"><ShopBannerSkeleton /><div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]"><div className="grid gap-4">{Array.from({ length: 7 }).map((_, index) => <Card key={index} className="flex items-center gap-4 p-5"><Skeleton className="size-10 shrink-0 rounded-lg" /><Skeleton className="h-5 w-full max-w-md rounded-md" /><Skeleton className="ml-auto size-5 rounded-sm" /></Card>)}</div><div className="grid gap-4"><Card className="h-48 p-5"><Skeleton className="size-6" /><Skeleton className="mt-4 h-6 w-36" /><Skeleton className="mt-3 h-4 w-full" /><Skeleton className="mt-2 h-4 w-4/5" /></Card><Card className="h-32 p-5"><Skeleton className="size-5" /><Skeleton className="mt-3 h-5 w-28" /><Skeleton className="mt-2 h-4 w-full" /></Card></div></div></section>;
}

export function ContactPageSkeleton() {
  return <main className="contact-page mx-auto w-[calc(100%-1.25rem)] max-w-[1440px] py-7 sm:w-[calc(100%-2rem)] sm:py-10 lg:py-12"><ShopBannerSkeleton /><div className="mt-6 grid gap-6 lg:grid-cols-[.78fr_1.22fr]"><Card className="min-h-[520px] p-6"><Skeleton className="h-3 w-28" /><Skeleton className="mt-3 h-8 w-64 max-w-full" /><Skeleton className="mt-3 h-4 w-full" /><div className="mt-8 grid gap-4"><Skeleton className="h-20 w-full" /><Skeleton className="h-28 w-full" /><Skeleton className="h-28 w-full" /></div></Card><Card className="min-h-[520px] p-6"><Skeleton className="h-8 w-52" /><Skeleton className="mt-2 h-4 w-80 max-w-full" /><div className="mt-7 grid gap-5 sm:grid-cols-2"><Skeleton className="h-11 w-full" /><Skeleton className="h-11 w-full" /><Skeleton className="h-11 w-full" /><Skeleton className="h-11 w-full" /><Skeleton className="h-11 w-full sm:col-span-2" /><Skeleton className="h-28 w-full sm:col-span-2" /><Skeleton className="h-11 w-32" /></div></Card></div></main>;
}
