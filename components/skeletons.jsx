import { Card, Skeleton } from "@/components/ui";

export function ProductGridSkeleton({ count = 8 }) {
  return <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: count }).map((_, i) => <Card key={i} className="p-3"><Skeleton className="aspect-square w-full" /><Skeleton className="mt-5 h-4 w-24" /><Skeleton className="mt-3 h-5 w-3/4" /><div className="mt-5 flex items-center justify-between"><Skeleton className="h-7 w-20" /><Skeleton className="size-10 rounded-full" /></div></Card>)}</div>;
}

export function ProductDetailSkeleton() {
  return <div className="grid gap-10 lg:grid-cols-2"><Skeleton className="aspect-square w-full rounded-3xl" /><div><Skeleton className="h-5 w-28" /><Skeleton className="mt-4 h-12 w-3/4" /><Skeleton className="mt-4 h-8 w-32" /><Skeleton className="mt-8 h-24 w-full" /><Skeleton className="mt-8 h-12 w-48 rounded-full" /></div></div>;
}

export function CartSkeleton() {
  return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="flex gap-4"><Skeleton className="size-20" /><div className="flex-1"><Skeleton className="h-5 w-2/3" /><Skeleton className="mt-3 h-4 w-24" /><Skeleton className="mt-4 h-9 w-28" /></div></div>)}</div>;
}

export function DashboardSkeleton() {
  return <div><Skeleton className="h-10 w-72" /><div className="mt-8 grid gap-4 md:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <Card key={i}><Skeleton className="h-4 w-24" /><Skeleton className="mt-5 h-9 w-28" /></Card>)}</div><Card className="mt-8"><Skeleton className="h-7 w-40" /><div className="mt-6 space-y-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div></Card></div>;
}

export function OrdersSkeleton() {
  return <Card><div className="space-y-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div></Card>;
}

export function ProfileSkeleton() {
  return <Card><Skeleton className="size-24 rounded-full" /><div className="mt-8 grid gap-5 md:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-11 w-full" />)}</div><Skeleton className="mt-8 h-11 w-40 rounded-full" /></Card>;
}

export function AddressSkeleton() {
  return <div className="grid gap-4 md:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <Card key={i}><Skeleton className="h-6 w-32" /><Skeleton className="mt-5 h-4 w-5/6" /><Skeleton className="mt-3 h-4 w-2/3" /><Skeleton className="mt-6 h-9 w-32 rounded-full" /></Card>)}</div>;
}
